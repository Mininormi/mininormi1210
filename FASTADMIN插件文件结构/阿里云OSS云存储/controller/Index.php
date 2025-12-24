<?php

namespace addons\r2\controller;

use addons\r2\library\Auth;
use addons\r2\library\S3\S3Client;
use app\common\exception\UploadException;
use app\common\library\Upload;
use app\common\model\Attachment;
use think\addons\Controller;
use think\Config;

/**
 * Cloudflare R2云储存 (S3兼容)
 *
 */
class Index extends Controller
{

    public function _initialize()
    {
        //跨域检测
        check_cors_request();

        parent::_initialize();
        Config::set('default_return_type', 'json');
    }

    public function index()
    {
        Config::set('default_return_type', 'html');
        $this->error("当前插件暂无前台页面");
    }

    /**
     * 获取签名和presigned URL
     */
    public function params()
    {
        $this->check();

        $config = get_addon_config('r2');
        $name = $this->request->post('name');
        $md5 = $this->request->post('md5');
        $chunk = $this->request->post('chunk');
        $name = xss_clean($name);

        // 检查文件后缀
        $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $allowedExtensions = explode(',', strtolower($config['mimetype']));
        if (!in_array($extension, $allowedExtensions) || in_array($extension, ['php', 'html', 'htm', 'phar', 'phtml']) || preg_match("/^php(.*)/i", $extension)) {
            $this->error('不允许的文件类型');
        }

        $auth = new Auth();
        $params = $auth->params($name, $md5);
        
        if ($chunk) {
            // 分片上传：初始化multipart upload并生成每个分片的presigned URL
            $s3Client = new S3Client($config['accessKeyId'], $config['secretAccessKey'], $config['endpoint'], $config['region']);
            
            $fileSize = $this->request->post('size');
            $chunkSize = $this->request->post('chunksize');
            
            // 初始化multipart upload
            $contentType = mime_content_type($name) ?: 'application/octet-stream';
            $uploadId = $s3Client->initiateMultipartUpload($config['bucket'], $params['key'], ['Content-Type' => $contentType]);
            $params['uploadId'] = $uploadId;
            
            // 计算分片数量
            $partCount = ceil($fileSize / $chunkSize);
            $params['parts'] = [];
            $params['partUrls'] = [];
            $expires = time() + $config['expire'];
            
            // 为每个分片生成presigned URL
            for ($i = 0; $i < $partCount; $i++) {
                $partNumber = $i + 1;
                $partUrl = $auth->generatePresignedPartUrl(
                    $config['bucket'],
                    $params['key'],
                    $uploadId,
                    $partNumber,
                    $expires,
                    $config['accessKeyId'],
                    $config['secretAccessKey'],
                    $config['endpoint'],
                    $config['region']
                );
                $params['parts'][] = ['PartNumber' => $partNumber];
                $params['partUrls'][$i] = $partUrl;
            }
        }

        $this->success('', null, $params);
    }

    /**
     * 服务器中转上传文件
     * 上传分片
     * 合并分片
     * @param bool $isApi
     */
    public function upload($isApi = false)
    {
        $config = get_addon_config('r2');
        if ($isApi === true) {
            if (!Auth::isModuleAllow()) {
                $this->error("请登录后再进行操作");
            }
        } else {
            $this->check();
        }
        $s3Client = new S3Client($config['accessKeyId'], $config['secretAccessKey'], $config['endpoint'], $config['region']);

        //检测删除文件或附件
        $checkDeleteFile = function ($attachment, $upload, $force = false) use ($config) {
            //如果设定为不备份则删除文件和记录 或 强制删除
            if ((isset($config['serverbackup']) && !$config['serverbackup']) || $force) {
                if ($attachment && !empty($attachment['id'])) {
                    $attachment->delete();
                }
                if ($upload) {
                    //文件绝对路径
                    $filePath = $upload->getFile()->getRealPath() ?: $upload->getFile()->getPathname();
                    @unlink($filePath);
                }
            }
        };

        $chunkid = $this->request->post("chunkid");
        if ($chunkid) {
            $action = $this->request->post("action");
            $chunkindex = $this->request->post("chunkindex/d");
            $chunkcount = $this->request->post("chunkcount/d");
            $filesize = $this->request->post("filesize");
            $filename = $this->request->post("filename");
            $key = $this->request->post("key");
            $uploadId = $this->request->post("uploadId");

            if ($action == 'merge') {
                $attachment = null;
                $upload = null;
                //合并分片
                if ($config['uploadmode'] == 'server') {
                    //合并分片文件
                    try {
                        $upload = new Upload();
                        $attachment = $upload->merge($chunkid, $chunkcount, $filename);
                    } catch (UploadException $e) {
                        $this->error($e->getMessage());
                    }
                }

                $etags = $this->request->post("etags/a", []);
                if (count($etags) != $chunkcount) {
                    $checkDeleteFile($attachment, $upload, true);
                    $this->error("分片数据错误");
                }
                $listParts = [];
                for ($i = 0; $i < $chunkcount; $i++) {
                    $listParts[] = array("PartNumber" => $i + 1, "ETag" => $etags[$i]);
                }
                try {
                    $ret = $s3Client->completeMultipartUpload($config['bucket'], $key, $uploadId, $listParts);
                } catch (\Exception $e) {
                    $checkDeleteFile($attachment, $upload, true);
                    $this->error($e->getMessage());
                }

                $result = json_decode(json_encode(simplexml_load_string($ret['body'], "SimpleXMLElement", LIBXML_NOCDATA)), true);
                if (!isset($result['Key'])) {
                    $checkDeleteFile($attachment, $upload, true);
                    $this->error("上传失败(1001)");
                } else {
                    $checkDeleteFile($attachment, $upload);
                    $this->success("上传成功", '', ['url' => "/" . $key, 'fullurl' => cdnurl("/" . $key, true)]);
                }
            } else {
                //上传分片
                $file = $this->request->file('file');
                try {
                    $upload = new Upload($file);
                    $file = $upload->chunk($chunkid, $chunkindex, $chunkcount);
                } catch (UploadException $e) {
                    $this->error($e->getMessage());
                }
                try {
                    //上传分片到R2
                    $etag = $s3Client->uploadPart($config['bucket'], $key, $uploadId, $chunkindex + 1, $file->getRealPath());
                } catch (\Exception $e) {
                    $this->error($e->getMessage());
                }

                $this->success("上传成功", "", [], 3, ['ETag' => $etag]);
            }
        } else {
            $attachment = null;
            //默认普通上传文件
            $file = $this->request->file('file');
            try {
                $upload = new Upload($file);
                $attachment = $upload->upload();
            } catch (UploadException $e) {
                $this->error($e->getMessage());
            }

            //文件绝对路径
            $filePath = $upload->getFile()->getRealPath() ?: $upload->getFile()->getPathname();

            $url = $attachment->url;

            try {
                $ret = $s3Client->putObject($config['bucket'], ltrim($attachment->url, "/"), $filePath);
                //成功不做任何操作
            } catch (\Exception $e) {
                $checkDeleteFile($attachment, $upload, true);
                \think\Log::write($e->getMessage());
                $this->error("上传失败(1002)");
            }
            $checkDeleteFile($attachment, $upload);

            // 记录云存储记录
            $data = $attachment->toArray();
            unset($data['id']);
            $data['storage'] = 'r2';
            Attachment::create($data, true);

            $this->success("上传成功", '', ['url' => $url, 'fullurl' => cdnurl($url, true)]);
        }
        return;
    }

    /**
     * 回调
     */
    public function notify()
    {
        $this->check();
        $config = get_addon_config('r2');
        if ($config['uploadmode'] != 'client') {
            $this->error("无需执行该操作");
        }
        $this->request->filter('trim,strip_tags,htmlspecialchars,xss_clean');
        $size = $this->request->post('size/d');
        $name = $this->request->post('name', '');
        $md5 = $this->request->post('md5', '');
        $type = $this->request->post('type', '');
        $url = $this->request->post('url', '');
        $width = $this->request->post('width/d');
        $height = $this->request->post('height/d');
        $category = $this->request->post('category', '');
        $category = array_key_exists($category, config('site.attachmentcategory') ?? []) ? $category : '';
        $suffix = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $suffix = $suffix && preg_match("/^[a-zA-Z0-9]+$/", $suffix) ? $suffix : 'file';
        $attachment = Attachment::where('url', $url)->where('storage', 'r2')->find();
        if (!$attachment) {
            $params = array(
                'category'    => $category,
                'admin_id'    => (int)session('admin.id'),
                'user_id'     => (int)$this->auth->id,
                'filesize'    => $size,
                'filename'    => $name,
                'imagewidth'  => $width,
                'imageheight' => $height,
                'imagetype'   => $suffix,
                'imageframes' => 0,
                'mimetype'    => $type,
                'url'         => $url,
                'uploadtime'  => time(),
                'storage'     => 'r2',
                'sha1'        => $md5,
            );
            Attachment::create($params, true);
        }
        $this->success();
    }

    /**
     * 检查签名是否正确或过期
     */
    protected function check()
    {
        $r2token = $this->request->post('r2token', '', 'trim');
        if (!$r2token) {
            $this->error("参数不正确(code:1)");
        }
        $config = get_addon_config('r2');
        list($accessKeyId, $sign, $data) = explode(':', $r2token);
        if (!$accessKeyId || !$sign || !$data) {
            $this->error("参数不能为空(code:2)");
        }
        if ($accessKeyId !== $config['accessKeyId']) {
            $this->error("参数不正确(code:3)");
        }
        if ($sign !== base64_encode(hash_hmac('sha256', base64_decode($data), $config['secretAccessKey'], true))) {
            $this->error("签名不正确");
        }
        $json = json_decode(base64_decode($data), true);
        if ($json['deadline'] < time()) {
            $this->error("请求已经超时");
        }
    }

}
