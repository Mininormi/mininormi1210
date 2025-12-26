<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\exception\UploadException;
use app\common\library\Upload;
use app\common\model\Area;
use app\common\model\Version;
use fast\Random;
use think\captcha\Captcha;
use think\Config;
use think\Hook;

/**
 * 公共接口
 */
class Common extends Api
{
    protected $noNeedLogin = ['init', 'captcha'];
    protected $noNeedRight = '*';

    public function _initialize()
    {

        if (isset($_SERVER['HTTP_ORIGIN'])) {
            header('Access-Control-Expose-Headers: __token__');//跨域让客户端获取到
        }
        //跨域检测
        check_cors_request();

        if (!isset($_COOKIE['PHPSESSID'])) {
            Config::set('session.id', $this->request->server("HTTP_SID"));
        }
        parent::_initialize();
    }

    /**
     * 加载初始化
     *
     * @ApiParams (name="version", type="string", required=true, description="版本号")
     * @ApiParams (name="lng", type="string", required=true, description="经度")
     * @ApiParams (name="lat", type="string", required=true, description="纬度")
     */
    public function init()
    {
        if ($version = $this->request->request('version')) {
            $lng = $this->request->request('lng');
            $lat = $this->request->request('lat');

            //配置信息
            $upload = Config::get('upload');
            
            // 合并后台配置的策略项（如果存在）
            $siteConfig = Config::get('site');
            if (!empty($siteConfig)) {
                // 特殊处理 r2_upload_storage：如果是 select 类型，需要将索引转换为实际值
                if (isset($siteConfig['r2_upload_storage']) && $siteConfig['r2_upload_storage'] !== '') {
                    $storageValue = $siteConfig['r2_upload_storage'];
                    $configModel = \app\common\model\Config::get(['name' => 'r2_upload_storage']);
                    if ($configModel && $configModel->type === 'select') {
                        $content = json_decode($configModel->content, true);
                        if (is_array($content)) {
                            $index = (int)$storageValue;
                            if (isset($content[$index])) {
                                $storageValue = $content[$index];
                            }
                        }
                    }
                    $upload['storage'] = $storageValue;
                }
                
                $configMap = [
                    'r2_upload_maxsize' => 'maxsize',
                    'r2_upload_mimetype' => 'mimetype',
                    'r2_upload_multiple' => 'multiple',
                    'r2_upload_chunking' => 'chunking',
                    'r2_upload_chunksize' => 'chunksize',
                    'r2_upload_timeout' => 'timeout',
                    'r2_upload_savekey' => 'savekey',
                    'r2_upload_fullmode' => 'fullmode',
                    'r2_upload_thumbstyle' => 'thumbstyle',
                ];
                foreach ($configMap as $siteKey => $uploadKey) {
                    if (isset($siteConfig[$siteKey]) && $siteConfig[$siteKey] !== '') {
                        if (in_array($siteKey, ['r2_upload_multiple', 'r2_upload_chunking', 'r2_upload_fullmode'])) {
                            $upload[$uploadKey] = (bool)$siteConfig[$siteKey];
                        } else {
                            $upload[$uploadKey] = $siteConfig[$siteKey];
                        }
                    }
                }
                Config::set('upload', $upload);
            }
            
            //如果非服务端中转模式需要修改为中转（排除 r2，因为 r2 是内置存储不是插件）
            if ($upload['storage'] != 'local' && $upload['storage'] != 'r2' && isset($upload['uploadmode']) && $upload['uploadmode'] != 'server') {
                //临时修改上传模式为服务端中转（仅针对插件）
                set_addon_config($upload['storage'], ["uploadmode" => "server"], false);

                $upload = \app\common\model\Config::upload();
                // 上传信息配置后
                Hook::listen("upload_config_init", $upload);

                $upload = Config::set('upload', array_merge(Config::get('upload'), $upload));
            } elseif ($upload['storage'] == 'r2') {
                // R2 存储直接使用服务器中转模式，不需要调用 addon_config
                $upload = \app\common\model\Config::upload();
                // 上传信息配置后
                Hook::listen("upload_config_init", $upload);
                $upload = Config::set('upload', array_merge(Config::get('upload'), $upload));
            }

            $upload['cdnurl'] = $upload['cdnurl'] ? $upload['cdnurl'] : cdnurl('', true);
            $upload['uploadurl'] = preg_match("/^((?:[a-z]+:)?\/\/)(.*)/i", $upload['uploadurl']) ? $upload['uploadurl'] : url($upload['storage'] == 'local' ? '/api/common/upload' : $upload['uploadurl'], '', false, true);

            $content = [
                'citydata'    => Area::getCityFromLngLat($lng, $lat),
                'versiondata' => Version::check($version),
                'uploaddata'  => $upload,
                'coverdata'   => Config::get("cover"),
            ];
            $this->success('', $content);
        } else {
            $this->error(__('Invalid parameters'));
        }
    }

    /**
     * 上传文件
     * @ApiMethod (POST)
     * @ApiParams (name="file", type="file", required=true, description="文件流")
     */
    public function upload()
    {
        Config::set('default_return_type', 'json');
        //必须设定cdnurl为空,否则cdnurl函数计算错误
        Config::set('upload.cdnurl', '');
        
        // 合并后台配置的策略项（如果存在）
        $siteConfig = Config::get('site');
        if (!empty($siteConfig)) {
            $uploadConfig = Config::get('upload', []);
            
            // 特殊处理 r2_upload_storage：如果是 select 类型，需要将索引转换为实际值
            if (isset($siteConfig['r2_upload_storage']) && $siteConfig['r2_upload_storage'] !== '') {
                $storageValue = $siteConfig['r2_upload_storage'];
                $configModel = \app\common\model\Config::get(['name' => 'r2_upload_storage']);
                if ($configModel && $configModel->type === 'select') {
                    $content = json_decode($configModel->content, true);
                    if (is_array($content)) {
                        $index = (int)$storageValue;
                        if (isset($content[$index])) {
                            $storageValue = $content[$index];
                        }
                    }
                }
                $uploadConfig['storage'] = $storageValue;
            }
            
            $configMap = [
                'r2_upload_maxsize' => 'maxsize',
                'r2_upload_mimetype' => 'mimetype',
                'r2_upload_multiple' => 'multiple',
                'r2_upload_chunking' => 'chunking',
                'r2_upload_chunksize' => 'chunksize',
                'r2_upload_timeout' => 'timeout',
                'r2_upload_savekey' => 'savekey',
                'r2_upload_fullmode' => 'fullmode',
                'r2_upload_thumbstyle' => 'thumbstyle',
            ];
            foreach ($configMap as $siteKey => $uploadKey) {
                if (isset($siteConfig[$siteKey]) && $siteConfig[$siteKey] !== '') {
                    if (in_array($siteKey, ['r2_upload_multiple', 'r2_upload_chunking', 'r2_upload_fullmode'])) {
                        $uploadConfig[$uploadKey] = (bool)$siteConfig[$siteKey];
                    } else {
                        $uploadConfig[$uploadKey] = $siteConfig[$siteKey];
                    }
                }
            }
            Config::set('upload', $uploadConfig);
        }
        $chunkid = $this->request->post("chunkid");
        if ($chunkid) {
            if (!Config::get('upload.chunking')) {
                $this->error(__('Chunk file disabled'));
            }
            $action = $this->request->post("action");
            $chunkindex = $this->request->post("chunkindex/d");
            $chunkcount = $this->request->post("chunkcount/d");
            $filename = $this->request->post("filename");
            $method = $this->request->method(true);
            if ($action == 'merge') {
                $attachment = null;
                //合并分片文件
                try {
                    $upload = new Upload();
                    $attachment = $upload->merge($chunkid, $chunkcount, $filename);
                } catch (UploadException $e) {
                    $this->error($e->getMessage());
                }
                $this->success(__('Uploaded successful'), ['url' => $attachment->url, 'fullurl' => cdnurl($attachment->url, true)]);
            } elseif ($method == 'clean') {
                //删除冗余的分片文件
                try {
                    $upload = new Upload();
                    $upload->clean($chunkid);
                } catch (UploadException $e) {
                    $this->error($e->getMessage());
                }
                $this->success();
            } else {
                //上传分片文件
                //默认普通上传文件
                $file = $this->request->file('file');
                try {
                    $upload = new Upload($file);
                    $upload->chunk($chunkid, $chunkindex, $chunkcount);
                } catch (UploadException $e) {
                    $this->error($e->getMessage());
                }
                $this->success();
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
            } catch (\Exception $e) {
                $this->error($e->getMessage());
            }

            $this->success(__('Uploaded successful'), ['url' => $attachment->url, 'fullurl' => cdnurl($attachment->url, true)]);
        }

    }

    /**
     * 验证码
     * @ApiParams (name="id", type="string", required=true, description="要生成验证码的标识")
     * @return \think\Response
     */
    public function captcha($id = "")
    {
        \think\Config::set([
            'captcha' => array_merge(config('captcha'), [
                'fontSize' => 44,
                'imageH'   => 150,
                'imageW'   => 350,
            ])
        ]);
        $captcha = new Captcha((array)Config::get('captcha'));
        return $captcha->entry($id);
    }
}
