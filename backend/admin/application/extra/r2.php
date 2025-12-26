<?php

/**
 * Cloudflare R2 存储配置
 * 
 * 配置说明：
 * - endpoint: R2 的 endpoint 地址，格式: https://<account-id>.r2.cloudflarestorage.com
 * - bucket: R2 的 bucket 名称
 * - access_key_id: R2 的 Access Key ID
 * - secret_access_key: R2 的 Secret Access Key
 * - region: R2 的 region，通常填写 'auto' 或 'wnam'
 * - cdnurl: R2 的公网访问地址（自定义域名或 R2 public bucket 域名）
 * - delete_local_after_upload: 上传到 R2 后是否删除本地文件（true/false）
 * - thumbstyle: 缩略图样式（如使用 Cloudflare Images 等）
 */
// 支持从环境变量读取（使用 PHP 原生 getenv），如果不存在则使用默认值
return [
    // R2 Endpoint（必需）
    'endpoint' => 'https://67692b1bd40cb69c647bb9ed5cbcf319.r2.cloudflarestorage.com',
    
    // Bucket 名称（必需）
    'bucket' => 'mininormi',
    
    // Access Key ID（必需）
    'access_key_id' => '7d0e75c5c36503ccd3a5eefe802e3373',
    
    // Secret Access Key（必需）
    'secret_access_key' => '25f987580f29b3b6857c45fa30338a0bcd464754d74583cec45acd8324f94d4c',
    
    // Region（必需，通常填写 'auto'）
    'region' => 'auto',
    
    // CDN 地址（必需，必须以 http(s):// 开头）
    'cdnurl' => 'https://pub-46d013ef97df4875bc41b321f1dc1294.r2.dev',
    
    // 上传到 R2 后是否删除本地文件（可选，默认 false）
    'delete_local_after_upload' => (bool)(getenv('R2_DELETE_LOCAL') ?: false),
    
    // 缩略图样式（可选）
    'thumbstyle' => getenv('R2_THUMBSTYLE') ?: '',
];

