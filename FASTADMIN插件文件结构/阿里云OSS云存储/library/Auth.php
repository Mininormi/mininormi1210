<?php

namespace addons\r2\library;

use app\common\library\Upload;

class Auth
{

    public function __construct()
    {

    }

    /**
     * 生成S3 presigned URL参数
     * @param string $name
     * @param string $md5
     * @param bool $callback
     * @return array
     */
    public function params($name, $md5, $callback = true)
    {
        $config = get_addon_config('r2');
        $key = (new Upload())->getSavekey($config['savekey'], $name, $md5);
        $key = ltrim($key, "/");

        $expires = time() + $config['expire'];
        
        // 生成presigned URL
        $presignedUrl = $this->generatePresignedUrl(
            $config['bucket'],
            $key,
            $expires,
            $config['accessKeyId'],
            $config['secretAccessKey'],
            $config['endpoint'],
            $config['region']
        );

        $response = array();
        $response['id'] = $config['accessKeyId'];
        $response['key'] = $key;
        $response['url'] = $presignedUrl;
        $response['expire'] = $expires;
        return $response;
    }

    /**
     * 生成AWS Signature V4 presigned URL
     * @param string $bucket
     * @param string $key
     * @param int $expires
     * @param string $accessKeyId
     * @param string $secretAccessKey
     * @param string $endpoint
     * @param string $region
     * @return string
     */
    private function generatePresignedUrl($bucket, $key, $expires, $accessKeyId, $secretAccessKey, $endpoint, $region)
    {
        $parsedEndpoint = parse_url($endpoint);
        $host = $parsedEndpoint['host'];
        $scheme = $parsedEndpoint['scheme'] ?? 'https';
        
        $date = gmdate('Ymd\THis\Z');
        $dateShort = gmdate('Ymd');
        
        $credentialScope = $dateShort . '/' . $region . '/s3/aws4_request';
        
        // 构建查询参数
        $queryParams = [
            'X-Amz-Algorithm' => 'AWS4-HMAC-SHA256',
            'X-Amz-Credential' => $accessKeyId . '/' . $credentialScope,
            'X-Amz-Date' => $date,
            'X-Amz-Expires' => $expires - time(),
            'X-Amz-SignedHeaders' => 'host',
        ];
        
        ksort($queryParams);
        $queryString = http_build_query($queryParams);
        
        // 构建规范请求
        $canonicalUri = '/' . $bucket . '/' . $key;
        $canonicalQueryString = $queryString;
        $canonicalHeaders = 'host:' . $host . "\n";
        $signedHeaders = 'host';
        
        $canonicalRequest = "PUT\n"
            . $canonicalUri . "\n"
            . $canonicalQueryString . "\n"
            . $canonicalHeaders . "\n"
            . $signedHeaders . "\n"
            . 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // 空payload的SHA256
        
        // 构建待签名字符串
        $stringToSign = "AWS4-HMAC-SHA256\n"
            . $date . "\n"
            . $credentialScope . "\n"
            . hash('sha256', $canonicalRequest);
        
        // 计算签名
        $kDate = hash_hmac('sha256', $dateShort, 'AWS4' . $secretAccessKey, true);
        $kRegion = hash_hmac('sha256', $region, $kDate, true);
        $kService = hash_hmac('sha256', 's3', $kRegion, true);
        $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
        $signature = hash_hmac('sha256', $stringToSign, $kSigning);
        
        // 添加签名到查询参数
        $queryParams['X-Amz-Signature'] = $signature;
        $finalQueryString = http_build_query($queryParams, '', '&', PHP_QUERY_RFC3986);
        
        // 构建最终URL（key不需要在URL中编码，因为已经在canonicalUri中处理了）
        $finalUri = '/' . $bucket . '/' . $key;
        return $scheme . '://' . $host . $finalUri . '?' . $finalQueryString;
    }

    /**
     * 生成分片上传的presigned URL
     * @param string $bucket
     * @param string $key
     * @param string $uploadId
     * @param int $partNumber
     * @param int $expires
     * @param string $accessKeyId
     * @param string $secretAccessKey
     * @param string $endpoint
     * @param string $region
     * @return string
     */
    public function generatePresignedPartUrl($bucket, $key, $uploadId, $partNumber, $expires, $accessKeyId, $secretAccessKey, $endpoint, $region)
    {
        $parsedEndpoint = parse_url($endpoint);
        $host = $parsedEndpoint['host'];
        $scheme = $parsedEndpoint['scheme'] ?? 'https';
        
        $date = gmdate('Ymd\THis\Z');
        $dateShort = gmdate('Ymd');
        
        $credentialScope = $dateShort . '/' . $region . '/s3/aws4_request';
        
        // 构建查询参数（包含partNumber和uploadId）
        $queryParams = [
            'partNumber' => $partNumber,
            'uploadId' => $uploadId,
            'X-Amz-Algorithm' => 'AWS4-HMAC-SHA256',
            'X-Amz-Credential' => $accessKeyId . '/' . $credentialScope,
            'X-Amz-Date' => $date,
            'X-Amz-Expires' => $expires - time(),
            'X-Amz-SignedHeaders' => 'host',
        ];
        
        ksort($queryParams);
        // URL编码查询参数
        $queryString = http_build_query($queryParams, '', '&', PHP_QUERY_RFC3986);
        
        // 构建规范请求 - R2格式: /<bucket>/<key>
        // URI路径需要URL编码
        $canonicalUri = '/' . rawurlencode($bucket) . '/' . str_replace('%2F', '/', rawurlencode($key));
        $canonicalQueryString = $queryString;
        $canonicalHeaders = 'host:' . $host . "\n";
        $signedHeaders = 'host';
        
        $canonicalRequest = "PUT\n"
            . $canonicalUri . "\n"
            . $canonicalQueryString . "\n"
            . $canonicalHeaders . "\n"
            . $signedHeaders . "\n"
            . 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        
        // 构建待签名字符串
        $stringToSign = "AWS4-HMAC-SHA256\n"
            . $date . "\n"
            . $credentialScope . "\n"
            . hash('sha256', $canonicalRequest);
        
        // 计算签名
        $kDate = hash_hmac('sha256', $dateShort, 'AWS4' . $secretAccessKey, true);
        $kRegion = hash_hmac('sha256', $region, $kDate, true);
        $kService = hash_hmac('sha256', 's3', $kRegion, true);
        $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
        $signature = hash_hmac('sha256', $stringToSign, $kSigning);
        
        // 添加签名到查询参数
        $queryParams['X-Amz-Signature'] = $signature;
        $finalQueryString = http_build_query($queryParams, '', '&', PHP_QUERY_RFC3986);
        
        // 构建最终URL（key不需要在URL中编码，因为已经在canonicalUri中处理了）
        $finalUri = '/' . $bucket . '/' . $key;
        return $scheme . '://' . $host . $finalUri . '?' . $finalQueryString;
    }

    public function check($signature, $policy)
    {
        $config = get_addon_config('r2');
        $sign = base64_encode(hash_hmac('sha256', $policy, $config['secretAccessKey'], true));
        return $signature == $sign;
    }

    public static function isModuleAllow()
    {
        $config = get_addon_config('r2');
        $module = request()->module();
        $module = $module ? strtolower($module) : 'index';
        $noNeedLogin = array_filter(explode(',', $config['noneedlogin'] ?? ''));
        $isModuleLogin = false;
        $tagName = 'upload_config_checklogin';
        foreach (\think\Hook::get($tagName) as $index => $name) {
            if (\think\Hook::exec($name, $tagName)) {
                $isModuleLogin = true;
                break;
            }
        }
        if (in_array($module, $noNeedLogin)
            || ($module == 'admin' && \app\admin\library\Auth::instance()->id)
            || ($module != 'admin' && \app\common\library\Auth::instance()->id)
            || $isModuleLogin) {
            return true;
        } else {
            return false;
        }
    }

}
