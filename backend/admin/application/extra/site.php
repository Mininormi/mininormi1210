<?php

return array (
  'name' => 'RIMSURGE',
  'beian' => '',
  'cdnurl' => '',
  'version' => '1.0.2',
  'timezone' => 'Asia/Shanghai',
  'forbiddenip' => '',
  'languages' => 
  array (
    'backend' => 'zh-cn',
    'frontend' => 'zh-cn',
  ),
  'fixedpage' => 'dashboard',
  'categorytype' => 
  array (
    'default' => 'Default',
    'page' => 'Page',
    'article' => 'Article',
    'test' => 'Test',
  ),
  'configgroup' => 
  array (
    'r2' => 'R2配置',
    'user' => 'User',
    'basic' => 'Basic',
    'email' => 'Email',
    'example' => 'Example',
    'dictionary' => 'Dictionary',
  ),
  'mail_type' => '1',
  'mail_smtp_host' => 'smtp.qq.com',
  'mail_smtp_port' => '465',
  'mail_smtp_user' => '',
  'mail_smtp_pass' => '',
  'mail_verify_type' => '2',
  'mail_from' => '',
  'attachmentcategory' => 
  array (
    'category1' => 'Category1',
    'category2' => 'Category2',
    'custom' => 'Custom',
  ),
  'r2_upload_storage' => '1',
  'r2_upload_maxsize' => '10mb',
  'r2_upload_mimetype' => 'jpg',
  'r2_upload_multiple' => '0',
  'r2_upload_chunking' => '0',
  'r2_upload_chunksize' => '2097152',
  'r2_upload_timeout' => '60000',
  'r2_upload_savekey' => '/rimsurge/uploads/{year}{mon}{day}/{filemd5}{.suffix}',
  'r2_upload_fullmode' => '1',
  'r2_upload_thumbstyle' => '',
);
