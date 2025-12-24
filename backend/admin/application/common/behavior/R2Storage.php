<?php

namespace app\common\behavior;

use app\common\library\storage\S3Client;
use app\common\model\Attachment;
use think\Config;
use think\Log;

/**
 * R2 存储行为类
 * 处理文件上传到 R2 和删除逻辑
 */
class R2Storage
{
    /**
     * 上传配置初始化
     * 当配置 storage=r2 时，修改上传配置
     * @param array $upload
     */
    public function uploadConfigInit(&$upload)
    {
        $storage = Config::get('upload.storage', 'local');
        
        if ($storage !== 'r2') {
            return;
        }
        
        $r2Config = Config::get('r2');
        if (empty($r2Config) || empty($r2Config['endpoint']) || empty($r2Config['bucket'])) {
            // R2 配置不完整，回退到本地存储
            return;
        }
        
        // 修改上传配置
        $upload['storage'] = 'r2';
        $upload['cdnurl'] = $r2Config['cdnurl'] ?? '';
        $upload['uploadmode'] = 'server'; // 强制使用服务器中转模式
        $upload['bucket'] = $r2Config['bucket'] ?? '';
    }

    /**
     * 上传完成后处理
     * 将文件同步上传到 R2
     * @param Attachment $attachment
     */
    public function uploadAfter($attachment)
    {
        // 获取存储类型配置
        $storage = Config::get('upload.storage');
        // 如果配置不存在或为 null，使用默认值
        if (is_null($storage) || $storage === '') {
            $storage = 'local';
        }
        
        if ($storage !== 'r2') {
            return;
        }
        
        $r2Config = Config::get('r2');
        if (empty($r2Config) || empty($r2Config['endpoint']) || empty($r2Config['bucket'])) {
            Log::write('R2 config incomplete, skip upload to R2', 'error');
            return;
        }
        
        try {
            // 本地文件路径 - 使用 getData() 方法安全访问属性
            $attachmentData = $attachment->getData();
            $url = isset($attachmentData['url']) ? $attachmentData['url'] : (isset($attachment->url) ? $attachment->url : '');
            $localFilePath = ROOT_PATH . 'public' . $url;
            
            if (!file_exists($localFilePath)) {
                Log::write('Local file not found: ' . $localFilePath, 'error');
                return;
            }
            
            // 初始化 S3 客户端
            $s3Client = new S3Client(
                $r2Config['access_key_id'],
                $r2Config['secret_access_key'],
                $r2Config['endpoint'],
                $r2Config['region'] ?? 'auto'
            );
            
            // 上传到 R2（key 使用 attachment->url，去掉开头的 /）
            $key = ltrim($url, '/');
            $mimetype = isset($attachmentData['mimetype']) ? $attachmentData['mimetype'] : (isset($attachment->mimetype) ? $attachment->mimetype : 'application/octet-stream');
            
            $response = $s3Client->putObject(
                $r2Config['bucket'],
                $key,
                $localFilePath,
                ['ContentType' => $mimetype]
            );
            
            if ($response['statusCode'] == 200) {
                // 更新 attachment 的 storage 字段
                // 使用 setAttr 方法更安全，避免直接访问可能不存在的属性
                $attachment->setAttr('storage', 'r2');
                $attachment->save();
                
                // 如果配置了删除本地文件，则删除
                if (!empty($r2Config['delete_local_after_upload'])) {
                    @unlink($localFilePath);
                }
                
                Log::write('File uploaded to R2 successfully: ' . $key, 'info');
            } else {
                Log::write('Failed to upload to R2: ' . (isset($response['body']) ? $response['body'] : 'unknown error'), 'error');
            }
        } catch (\Exception $e) {
            Log::write('R2 upload exception: ' . $e->getMessage(), 'error');
        }
    }

    /**
     * 删除附件时处理
     * 同步删除 R2 中的文件
     * @param Attachment $attachment
     */
    public function uploadDelete($attachment)
    {
        if (!isset($attachment['storage']) || $attachment['storage'] !== 'r2') {
            return;
        }
        
        $r2Config = Config::get('r2');
        if (empty($r2Config) || empty($r2Config['endpoint']) || empty($r2Config['bucket'])) {
            return;
        }
        
        try {
            $s3Client = new S3Client(
                $r2Config['access_key_id'],
                $r2Config['secret_access_key'],
                $r2Config['endpoint'],
                $r2Config['region'] ?? 'auto'
            );
            
            $key = ltrim($attachment->url, '/');
            $response = $s3Client->deleteObject($r2Config['bucket'], $key);
            
            if ($response['statusCode'] == 204 || $response['statusCode'] == 200) {
                Log::write('File deleted from R2 successfully: ' . $key, 'info');
            } else {
                Log::write('Failed to delete from R2: ' . $response['body'], 'error');
            }
        } catch (\Exception $e) {
            Log::write('R2 delete exception: ' . $e->getMessage(), 'error');
        }
    }
}
