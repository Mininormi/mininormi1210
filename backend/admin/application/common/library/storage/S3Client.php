<?php

namespace app\common\library\storage;

/**
 * S3兼容客户端 (用于Cloudflare R2)
 * 实现基本的S3 API操作
 */
class S3Client
{
    private $accessKeyId;
    private $secretAccessKey;
    private $endpoint;
    private $region;
    private $bucket;

    public function __construct($accessKeyId, $secretAccessKey, $endpoint, $region = 'auto')
    {
        $this->accessKeyId = $accessKeyId;
        $this->secretAccessKey = $secretAccessKey;
        $this->endpoint = rtrim($endpoint, '/');
        $this->region = $region;
    }

    /**
     * 上传文件
     * @param string $bucket
     * @param string $key
     * @param string $filePath
     * @param array $options
     * @return array
     */
    public function putObject($bucket, $key, $filePath, $options = [])
    {
        $this->bucket = $bucket;
        $key = ltrim($key, '/');
        
        $fileContent = file_get_contents($filePath);
        $fileSize = strlen($fileContent);
        $contentType = $options['ContentType'] ?? (function_exists('mime_content_type') ? mime_content_type($filePath) : 'application/octet-stream') ?: 'application/octet-stream';
        
        $headers = [
            'Content-Type' => $contentType,
            'Content-Length' => $fileSize,
        ];
        
        if (isset($options['Content-MD5'])) {
            $headers['Content-MD5'] = $options['Content-MD5'];
        }
        
        // R2 URL格式: https://<account-id>.r2.cloudflarestorage.com/<bucket>/<key>
        $url = rtrim($this->endpoint, '/') . '/' . $bucket . '/' . $key;
        $response = $this->request('PUT', $url, $headers, $fileContent);
        
        return $response;
    }

    /**
     * 删除对象
     * @param string $bucket
     * @param string $key
     * @return array
     */
    public function deleteObject($bucket, $key)
    {
        $this->bucket = $bucket;
        $key = ltrim($key, '/');
        $url = rtrim($this->endpoint, '/') . '/' . $bucket . '/' . $key;
        return $this->request('DELETE', $url);
    }

    /**
     * 初始化分片上传
     * @param string $bucket
     * @param string $key
     * @param array $options
     * @return string uploadId
     */
    public function initiateMultipartUpload($bucket, $key, $options = [])
    {
        $this->bucket = $bucket;
        $key = ltrim($key, '/');
        $url = rtrim($this->endpoint, '/') . '/' . $bucket . '/' . $key . '?uploads';
        
        $headers = [];
        if (isset($options['Content-Type'])) {
            $headers['Content-Type'] = $options['Content-Type'];
        }
        
        $response = $this->request('POST', $url, $headers);
        
        // 解析XML响应获取uploadId
        if ($response['statusCode'] != 200) {
            throw new \Exception('Failed to initiate multipart upload: ' . $response['body']);
        }
        
        $xml = @simplexml_load_string($response['body']);
        if ($xml && isset($xml->UploadId)) {
            return (string)$xml->UploadId;
        }
        
        throw new \Exception('Failed to parse uploadId from response: ' . $response['body']);
    }

    /**
     * 上传分片
     * @param string $bucket
     * @param string $key
     * @param string $uploadId
     * @param int $partNumber
     * @param string $filePath
     * @return string ETag
     */
    public function uploadPart($bucket, $key, $uploadId, $partNumber, $filePath)
    {
        $this->bucket = $bucket;
        $key = ltrim($key, '/');
        $url = rtrim($this->endpoint, '/') . '/' . $bucket . '/' . $key . '?partNumber=' . $partNumber . '&uploadId=' . $uploadId;
        
        $fileContent = file_get_contents($filePath);
        $fileSize = strlen($fileContent);
        
        $headers = [
            'Content-Length' => $fileSize,
        ];
        
        $response = $this->request('PUT', $url, $headers, $fileContent);
        
        if ($response['statusCode'] != 200) {
            throw new \Exception('Failed to upload part: ' . $response['body']);
        }
        
        // 从响应头获取ETag
        $etag = isset($response['headers']['etag']) ? trim($response['headers']['etag'], '"') : '';
        return $etag;
    }

    /**
     * 完成分片上传
     * @param string $bucket
     * @param string $key
     * @param string $uploadId
     * @param array $parts [['PartNumber' => 1, 'ETag' => '...'], ...]
     * @return array
     */
    public function completeMultipartUpload($bucket, $key, $uploadId, $parts)
    {
        $this->bucket = $bucket;
        $key = ltrim($key, '/');
        $url = rtrim($this->endpoint, '/') . '/' . $bucket . '/' . $key . '?uploadId=' . $uploadId;
        
        // 构建CompleteMultipartUpload XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?><CompleteMultipartUpload>';
        foreach ($parts as $part) {
            $xml .= '<Part>';
            $xml .= '<PartNumber>' . htmlspecialchars($part['PartNumber'], ENT_XML1) . '</PartNumber>';
            $xml .= '<ETag>' . htmlspecialchars($part['ETag'], ENT_XML1) . '</ETag>';
            $xml .= '</Part>';
        }
        $xml .= '</CompleteMultipartUpload>';
        
        $headers = [
            'Content-Type' => 'application/xml',
            'Content-Length' => strlen($xml),
        ];
        
        $response = $this->request('POST', $url, $headers, $xml);
        
        if ($response['statusCode'] != 200) {
            throw new \Exception('Failed to complete multipart upload: ' . $response['body']);
        }
        
        return $response;
    }

    /**
     * 执行HTTP请求
     * @param string $method
     * @param string $url
     * @param array $headers
     * @param mixed $body
     * @return array
     */
    private function request($method, $url, $headers = [], $body = null)
    {
        $parsedUrl = parse_url($url);
        $host = $parsedUrl['host'];
        $path = isset($parsedUrl['path']) ? $parsedUrl['path'] : '/';
        $query = isset($parsedUrl['query']) ? '?' . $parsedUrl['query'] : '';
        
        $date = gmdate('Ymd\THis\Z');
        $dateShort = gmdate('Ymd');
        
        // 准备请求头
        $requestHeaders = [
            'Host' => $host,
            'Date' => $date,
        ];
        
        if ($body !== null) {
            if (is_resource($body)) {
                // 文件句柄
                $contentLength = isset($headers['Content-Length']) ? $headers['Content-Length'] : 0;
            } else {
                $contentLength = strlen($body);
            }
            $requestHeaders['Content-Length'] = $contentLength;
        }
        
        $requestHeaders = array_merge($requestHeaders, $headers);
        
        // 计算payload hash（需要在构建规范请求之前计算）
        $payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // 空字符串的SHA256
        if ($body !== null) {
            if (is_resource($body)) {
                $content = stream_get_contents($body);
                rewind($body);
                $payloadHash = hash('sha256', $content);
            } else {
                $payloadHash = hash('sha256', $body);
            }
            // 添加 x-amz-content-sha256 头（AWS Signature V4 要求）
            $requestHeaders['x-amz-content-sha256'] = $payloadHash;
        } else {
            // 即使没有 body，也需要添加这个头（UNSIGNED-PAYLOAD 或空字符串的 hash）
            $requestHeaders['x-amz-content-sha256'] = $payloadHash;
        }
        
        // 重新构建规范头（因为添加了新头）
        $canonicalHeaders = '';
        $signedHeaders = '';
        ksort($requestHeaders);
        foreach ($requestHeaders as $key => $value) {
            $canonicalHeaders .= strtolower($key) . ':' . trim($value) . "\n";
            $signedHeaders .= strtolower($key) . ';';
        }
        $signedHeaders = rtrim($signedHeaders, ';');
        
        $canonicalRequest = $method . "\n"
            . $path . "\n"
            . $query . "\n"
            . $canonicalHeaders . "\n"
            . $signedHeaders . "\n"
            . $payloadHash;
        
        $stringToSign = "AWS4-HMAC-SHA256\n"
            . $date . "\n"
            . $dateShort . '/' . $this->region . '/s3/aws4_request' . "\n"
            . hash('sha256', $canonicalRequest);
        
        // 计算签名
        $kDate = hash_hmac('sha256', $dateShort, 'AWS4' . $this->secretAccessKey, true);
        $kRegion = hash_hmac('sha256', $this->region, $kDate, true);
        $kService = hash_hmac('sha256', 's3', $kRegion, true);
        $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);
        $signature = hash_hmac('sha256', $stringToSign, $kSigning);
        
        // 构建Authorization头
        $authorization = 'AWS4-HMAC-SHA256 '
            . 'Credential=' . $this->accessKeyId . '/' . $dateShort . '/' . $this->region . '/s3/aws4_request, '
            . 'SignedHeaders=' . $signedHeaders . ', '
            . 'Signature=' . $signature;
        
        $requestHeaders['Authorization'] = $authorization;
        
        // 执行cURL请求
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $this->buildHeaders($requestHeaders),
            CURLOPT_HEADER => true,
        ]);
        
        if ($body !== null) {
            if (is_resource($body)) {
                curl_setopt($ch, CURLOPT_PUT, true);
                curl_setopt($ch, CURLOPT_INFILE, $body);
                curl_setopt($ch, CURLOPT_INFILESIZE, $requestHeaders['Content-Length']);
            } else {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
            }
        }
        
        $response = curl_exec($ch);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new \Exception('cURL error: ' . $error);
        }
        
        $headers = $this->parseHeaders(substr($response, 0, $headerSize));
        $body = substr($response, $headerSize);
        
        return [
            'statusCode' => $statusCode,
            'headers' => $headers,
            'body' => $body,
        ];
    }

    /**
     * 构建HTTP头数组
     * @param array $headers
     * @return array
     */
    private function buildHeaders($headers)
    {
        $result = [];
        foreach ($headers as $key => $value) {
            $result[] = $key . ': ' . $value;
        }
        return $result;
    }

    /**
     * 解析HTTP响应头
     * @param string $headerString
     * @return array
     */
    private function parseHeaders($headerString)
    {
        $headers = [];
        $lines = explode("\r\n", $headerString);
        foreach ($lines as $line) {
            if (strpos($line, ':') !== false) {
                list($key, $value) = explode(':', $line, 2);
                $headers[strtolower(trim($key))] = trim($value);
            }
        }
        return $headers;
    }
}

