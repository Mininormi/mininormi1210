<?php

namespace addons\r2;

use addons\r2\library\Auth;
use addons\r2\library\S3\S3Client;
use think\Addons;
use think\App;
use think\Config;

/**
 * Cloudflare R2上传插件 (S3兼容)
 */
class R2 extends Addons
{

    /**
     * 插件安装方法
     * @return bool
     */
    public function install()
    {
        return true;
    }

    /**
     * 插件卸载方法
     * @return bool
     */
    public function uninstall()
    {
        return true;
    }

    /**
     * 判断是否来源于API上传
     */
    public function moduleInit($request)
    {
        $config = $this->getConfig();
        $module = strtolower($request->module());
        // 判断api/common/upload 是否使用云存储上传
        if ($module == 'api' && ($config['apiupload'] ?? 0) &&
            strtolower($request->controller()) == 'common' &&
            strtolower($request->action()) == 'upload') {
            request()->param('isApi', true);
            App::invokeMethod(["\\addons\\r2\\controller\\Index", "upload"], ['isApi' => true]);
        }
    }

    /**
     * 加载配置
     */
    public function uploadConfigInit(&$upload)
    {
        $config = $this->getConfig();

        $data = ['deadline' => time() + $config['expire']];
        $signature = hash_hmac('sha256', json_encode($data), $config['secretAccessKey'], true);

        $token = '';
        if (Auth::isModuleAllow()) {
            $token = $config['accessKeyId'] . ':' . base64_encode($signature) . ':' . base64_encode(json_encode($data));
        }
        $multipart = [
            'r2token' => $token
        ];
        // R2 endpoint格式: https://<account-id>.r2.cloudflarestorage.com 或自定义域名
        $config['uploadurl'] = rtrim($config['endpoint'], '/');
        $upload = array_merge($upload, [
            'cdnurl'     => $config['cdnurl'],
            'uploadurl'  => $config['uploadmode'] == 'client' ? $config['uploadurl'] : addon_url('r2/index/upload', [], false, true),
            'uploadmode' => $config['uploadmode'],
            'bucket'     => $config['bucket'],
            'maxsize'    => $config['maxsize'],
            'mimetype'   => $config['mimetype'],
            'savekey'    => $config['savekey'],
            'chunking'   => (bool)($config['chunking'] ?? $upload['chunking']),
            'chunksize'  => (int)($config['chunksize'] ?? $upload['chunksize']),
            'multipart'  => $multipart,
            'storage'    => $this->getName(),
            'multiple'   => (bool)$config['multiple'],
        ]);
    }

    /**
     * 附件删除后
     */
    public function uploadDelete($attachment)
    {
        $config = $this->getConfig();
        if ($attachment['storage'] == 'r2' && isset($config['syncdelete']) && $config['syncdelete']) {
            // 删除云存储端文件
            try {
                $s3Client = new S3Client($config['accessKeyId'], $config['secretAccessKey'], $config['endpoint'], $config['region']);
                $s3Client->deleteObject($config['bucket'], ltrim($attachment->url, '/'));
            } catch (\Exception $e) {
                return false;
            }

            //如果是服务端中转，还需要删除本地文件
            //if ($config['uploadmode'] == 'server') {
            //    $filePath = ROOT_PATH . 'public' . str_replace('/', DS, $attachment->url);
            //    if ($filePath) {
            //        @unlink($filePath);
            //    }
            //}
        }
        return true;
    }

}

