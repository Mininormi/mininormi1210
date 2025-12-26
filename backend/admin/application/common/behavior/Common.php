<?php

namespace app\common\behavior;

use think\Config;
use think\Lang;
use think\Loader;

class Common
{

    public function appInit()
    {
        $allowLangList = Config::get('allow_lang_list') ?? ['zh-cn', 'en'];
        Lang::setAllowLangList($allowLangList);
    }

    public function appDispatch(&$dispatch)
    {
        $pathinfoArr = explode('/', request()->pathinfo());
        if (!Config::get('url_domain_deploy') && $pathinfoArr && in_array($pathinfoArr[0], ['index', 'api'])) {
            //如果是以index或api开始的URL则关闭路由检测
            \think\App::route(false);
        }
    }

    public function moduleInit(&$request)
    {
        // 设置mbstring字符编码
        mb_internal_encoding("UTF-8");

        // 如果修改了index.php入口地址，则需要手动修改cdnurl的值
        $url = preg_replace("/\/(\w+)\.php$/i", '', $request->root());
        // 如果未设置__CDN__则自动匹配得出
        if (!Config::get('view_replace_str.__CDN__')) {
            Config::set('view_replace_str.__CDN__', $url);
        }
        // 如果未设置__PUBLIC__则自动匹配得出
        if (!Config::get('view_replace_str.__PUBLIC__')) {
            Config::set('view_replace_str.__PUBLIC__', $url . '/');
        }
        // 如果未设置__ROOT__则自动匹配得出
        if (!Config::get('view_replace_str.__ROOT__')) {
            Config::set('view_replace_str.__ROOT__', preg_replace("/\/public\/$/", '', $url . '/'));
        }
        // 如果未设置cdnurl则自动匹配得出
        if (!Config::get('site.cdnurl')) {
            Config::set('site.cdnurl', $url);
        }
        // 如果未设置cdnurl则自动匹配得出
        if (!Config::get('upload.cdnurl')) {
            Config::set('upload.cdnurl', $url);
        }
        
        // 合并后台 R2 配置的策略项到 upload 配置（统一生效）
        $siteConfig = Config::get('site');
        \think\Log::write('[R2 Debug] Common::moduleInit - siteConfig r2_upload_storage=' . (isset($siteConfig['r2_upload_storage']) ? $siteConfig['r2_upload_storage'] : 'NOT_SET'), 'info');
        
        if (!empty($siteConfig)) {
            $uploadConfig = Config::get('upload', []);
            
            // 特殊处理 r2_upload_storage：如果是 select 类型，需要将索引转换为实际值
            if (isset($siteConfig['r2_upload_storage']) && $siteConfig['r2_upload_storage'] !== '') {
                $storageValue = $siteConfig['r2_upload_storage'];
                \think\Log::write('[R2 Debug] Common::moduleInit - Raw storageValue=' . $storageValue . ' (type: ' . gettype($storageValue) . ')', 'info');
                
                // 查询数据库获取配置项类型和 content
                $configModel = \app\common\model\Config::get(['name' => 'r2_upload_storage']);
                if ($configModel && $configModel->type === 'select') {
                    $content = json_decode($configModel->content, true);
                    \think\Log::write('[R2 Debug] Common::moduleInit - Config model found, type=' . $configModel->type . ', content=' . json_encode($content), 'info');
                    
                    if (is_array($content)) {
                        // 将索引转换为实际值
                        $index = (int)$storageValue;
                        \think\Log::write('[R2 Debug] Common::moduleInit - Converted index=' . $index . ', content count=' . count($content) . ', has index=' . (isset($content[$index]) ? 'YES' : 'NO'), 'info');
                        
                        if (isset($content[$index])) {
                            $storageValue = $content[$index];
                            \think\Log::write('[R2 Debug] Common::moduleInit - Converted storageValue=' . $storageValue, 'info');
                        } else {
                            \think\Log::write('[R2 Debug] Common::moduleInit - ERROR: Index ' . $index . ' not found in content array!', 'error');
                        }
                    }
                } else {
                    \think\Log::write('[R2 Debug] Common::moduleInit - Config model not found or not select type', 'warning');
                }
                $uploadConfig['storage'] = $storageValue;
                \think\Log::write('[R2 Debug] Common::moduleInit - Set uploadConfig[storage]=' . $storageValue, 'info');
            } else {
                \think\Log::write('[R2 Debug] Common::moduleInit - r2_upload_storage not set in siteConfig', 'warning');
            }
            
            // 映射后台配置到 upload 配置
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
                    // switch 类型需要转换为布尔值
                    if (in_array($siteKey, ['r2_upload_multiple', 'r2_upload_chunking', 'r2_upload_fullmode'])) {
                        $uploadConfig[$uploadKey] = (bool)$siteConfig[$siteKey];
                    } else {
                        $uploadConfig[$uploadKey] = $siteConfig[$siteKey];
                    }
                }
            }
            Config::set('upload', $uploadConfig);
            // 同时设置 upload.storage 以便 Config::get('upload.storage') 能正确读取
            if (isset($uploadConfig['storage'])) {
                Config::set('upload.storage', $uploadConfig['storage']);
            }
            \think\Log::write('[R2 Debug] Common::moduleInit - Final uploadConfig[storage]=' . (isset($uploadConfig['storage']) ? $uploadConfig['storage'] : 'NOT_SET'), 'info');
            \think\Log::write('[R2 Debug] Common::moduleInit - Config::get(upload.storage)=' . Config::get('upload.storage', 'NOT_SET'), 'info');
            
            // 如果存储类型是 r2，设置 cdnurl（从 r2 配置读取）
            if (isset($uploadConfig['storage']) && $uploadConfig['storage'] === 'r2') {
                $r2Config = Config::get('r2');
                \think\Log::write('[R2 Debug] Common::moduleInit - R2 config found, cdnurl=' . (isset($r2Config['cdnurl']) ? $r2Config['cdnurl'] : 'NOT_SET'), 'info');
                if (!empty($r2Config['cdnurl'])) {
                    Config::set('upload.cdnurl', $r2Config['cdnurl']);
                }
            }
        } else {
            \think\Log::write('[R2 Debug] Common::moduleInit - siteConfig is empty', 'warning');
        }
        
        if (Config::get('app_debug')) {
            // 如果是调试模式将version置为当前的时间戳可避免缓存
            Config::set('site.version', time());
            // 如果是开发模式那么将异常模板修改成官方的
            Config::set('exception_tmpl', THINK_PATH . 'tpl' . DS . 'think_exception.tpl');
        }
        // 如果是trace模式且Ajax的情况下关闭trace
        if (Config::get('app_trace') && $request->isAjax()) {
            Config::set('app_trace', false);
        }
        // 切换多语言
        if (Config::get('lang_switch_on')) {
            $lang = $request->get('lang', '');
            if (preg_match("/^([a-zA-Z\-_]{2,10})\$/i", $lang)) {
                \think\Cookie::set('think_var', $lang);
            }
        }
        // Form别名
        if (!class_exists('Form')) {
            class_alias('fast\\Form', 'Form');
        }
    }

    public function addonBegin(&$request)
    {
        // 加载插件语言包
        $lang = request()->langset();
        $lang = preg_match("/^([a-zA-Z\-_]{2,10})\$/i", $lang) ? $lang : 'zh-cn';
        Lang::load([
            APP_PATH . 'common' . DS . 'lang' . DS . $lang . DS . 'addon' . EXT,
        ]);
        $this->moduleInit($request);
    }
}
