<?php
/**
 * 字段类型验证器
 * 
 * 验证 schema.json 中定义的字段类型是否正确，以及类型变更是否兼容
 */

class TypeValidator
{
    // MySQL 支持的字段类型（基础类型）
    private static $validTypes = [
        // 整数类型
        'tinyint', 'smallint', 'mediumint', 'int', 'bigint',
        // 浮点类型
        'float', 'double', 'decimal',
        // 字符串类型
        'char', 'varchar', 'text', 'tinytext', 'mediumtext', 'longtext',
        // 二进制类型
        'binary', 'varbinary', 'blob', 'tinyblob', 'mediumblob', 'longblob',
        // 日期时间类型
        'date', 'time', 'datetime', 'timestamp', 'year',
        // JSON 类型
        'json',
        // 枚举和集合
        'enum', 'set',
    ];
    
    // 类型兼容性映射（哪些类型可以安全转换）
    private static $compatibleTypes = [
        'tinyint' => ['smallint', 'mediumint', 'int', 'bigint'],
        'smallint' => ['mediumint', 'int', 'bigint'],
        'mediumint' => ['int', 'bigint'],
        'int' => ['bigint'],
        'varchar' => ['text', 'mediumtext', 'longtext'],
        'char' => ['varchar', 'text'],
        'text' => ['mediumtext', 'longtext'],
        'tinytext' => ['text', 'mediumtext', 'longtext'],
        'mediumtext' => ['longtext'],
    ];
    
    /**
     * 验证字段类型格式
     * 
     * @param string $type 字段类型字符串，如 "int(11)", "varchar(100)"
     * @return array ['valid' => bool, 'base_type' => string, 'params' => array, 'error' => string]
     */
    public function validateTypeFormat($type)
    {
        if (empty($type) || !is_string($type)) {
            return [
                'valid' => false,
                'base_type' => '',
                'params' => [],
                'error' => '字段类型不能为空'
            ];
        }
        
        $type = trim($type);
        
        // 解析类型：如 "int(11)", "varchar(100)", "decimal(10,2)"
        if (preg_match('/^(\w+)(?:\(([^)]+)\))?$/i', $type, $matches)) {
            $baseType = strtolower($matches[1]);
            $paramsStr = isset($matches[2]) ? $matches[2] : '';
            
            // 检查基础类型是否有效
            if (!in_array($baseType, self::$validTypes)) {
                return [
                    'valid' => false,
                    'base_type' => $baseType,
                    'params' => [],
                    'error' => "不支持的字段类型: {$baseType}"
                ];
            }
            
            // 解析参数
            $params = [];
            if (!empty($paramsStr)) {
                // 处理 decimal(10,2) 这种多个参数的情况
                if (strpos($paramsStr, ',') !== false) {
                    $params = array_map('trim', explode(',', $paramsStr));
                } else {
                    $params = [trim($paramsStr)];
                }
            }
            
            return [
                'valid' => true,
                'base_type' => $baseType,
                'params' => $params,
                'error' => null
            ];
        }
        
        return [
            'valid' => false,
            'base_type' => '',
            'params' => [],
            'error' => "字段类型格式错误: {$type}"
        ];
    }
    
    /**
     * 验证类型变更是否兼容
     * 
     * @param string $oldType 旧类型
     * @param string $newType 新类型
     * @return array ['compatible' => bool, 'warning' => string]
     */
    public function validateTypeChange($oldType, $newType)
    {
        $oldValidation = $this->validateTypeFormat($oldType);
        $newValidation = $this->validateTypeFormat($newType);
        
        if (!$oldValidation['valid'] || !$newValidation['valid']) {
            return [
                'compatible' => false,
                'warning' => "类型格式错误，无法比较兼容性"
            ];
        }
        
        $oldBase = $oldValidation['base_type'];
        $newBase = $newValidation['base_type'];
        
        // 相同类型，检查参数变化
        if ($oldBase === $newBase) {
            // varchar 长度变化：缩小需要警告
            if ($oldBase === 'varchar' || $oldBase === 'char') {
                $oldLen = isset($oldValidation['params'][0]) ? (int)$oldValidation['params'][0] : 0;
                $newLen = isset($newValidation['params'][0]) ? (int)$newValidation['params'][0] : 0;
                
                if ($newLen < $oldLen && $oldLen > 0) {
                    return [
                        'compatible' => true,
                        'warning' => "字段长度从 {$oldLen} 缩小到 {$newLen}，可能导致数据截断"
                    ];
                }
            }
            
            return ['compatible' => true, 'warning' => null];
        }
        
        // 检查是否在兼容类型列表中
        if (isset(self::$compatibleTypes[$oldBase])) {
            if (in_array($newBase, self::$compatibleTypes[$oldBase])) {
                return ['compatible' => true, 'warning' => null];
            }
        }
        
        // 检查反向兼容（如 bigint -> int，需要警告）
        foreach (self::$compatibleTypes as $fromType => $toTypes) {
            if ($fromType === $newBase && in_array($oldBase, $toTypes)) {
                return [
                    'compatible' => true,
                    'warning' => "字段类型从 {$oldBase} 缩小到 {$newBase}，可能导致数据丢失"
                ];
            }
        }
        
        // 完全不兼容的类型变更
        return [
            'compatible' => false,
            'warning' => "字段类型从 {$oldBase} 变更为 {$newBase}，类型不兼容，可能导致数据丢失或错误"
        ];
    }
    
    /**
     * 验证默认值是否与类型匹配
     * 
     * @param string $type 字段类型
     * @param mixed $default 默认值
     * @return array ['valid' => bool, 'warning' => string]
     */
    public function validateDefaultValue($type, $default)
    {
        if ($default === null) {
            return ['valid' => true, 'warning' => null];
        }
        
        $validation = $this->validateTypeFormat($type);
        if (!$validation['valid']) {
            return ['valid' => false, 'warning' => '类型格式错误，无法验证默认值'];
        }
        
        $baseType = $validation['base_type'];
        
        // 整数类型
        if (in_array($baseType, ['tinyint', 'smallint', 'mediumint', 'int', 'bigint'])) {
            if (!is_numeric($default) && $default !== 'CURRENT_TIMESTAMP') {
                return [
                    'valid' => false,
                    'warning' => "整数类型字段的默认值应该是数字，当前值: " . var_export($default, true)
                ];
            }
        }
        
        // 浮点类型
        if (in_array($baseType, ['float', 'double', 'decimal'])) {
            if (!is_numeric($default)) {
                return [
                    'valid' => false,
                    'warning' => "浮点类型字段的默认值应该是数字，当前值: " . var_export($default, true)
                ];
            }
        }
        
        // 字符串类型
        if (in_array($baseType, ['char', 'varchar', 'text', 'tinytext', 'mediumtext', 'longtext'])) {
            if (!is_string($default) && $default !== null) {
                return [
                    'valid' => false,
                    'warning' => "字符串类型字段的默认值应该是字符串，当前值: " . var_export($default, true)
                ];
            }
        }
        
        // 日期时间类型
        if (in_array($baseType, ['date', 'datetime', 'timestamp'])) {
            if ($default !== 'CURRENT_TIMESTAMP' && $default !== null && !is_string($default)) {
                return [
                    'valid' => false,
                    'warning' => "日期时间类型字段的默认值应该是日期字符串或 CURRENT_TIMESTAMP，当前值: " . var_export($default, true)
                ];
            }
        }
        
        return ['valid' => true, 'warning' => null];
    }
    
    /**
     * 验证字段定义
     * 
     * @param string $tableName 表名
     * @param string $columnName 字段名
     * @param array $columnDef 字段定义
     * @param array|null $oldColumnDef 旧字段定义（用于类型变更检查）
     * @return array ['valid' => bool, 'warnings' => array]
     */
    public function validateColumn($tableName, $columnName, $columnDef, $oldColumnDef = null)
    {
        $warnings = [];
        
        // #region agent log
        $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/../.cursor/debug.log';
        @mkdir(dirname($logFile), 0755, true);
        $logData = [
            'sessionId' => 'debug-session',
            'runId' => 'run1',
            'hypothesisId' => 'C',
            'location' => 'TypeValidator.php:240',
            'message' => 'validateColumn called',
            'data' => [
                'table' => $tableName,
                'column' => $columnName,
                'has_old_column_def' => $oldColumnDef !== null,
                'null_allowed' => $columnDef['null'] ?? 'not_set',
                'has_default' => isset($columnDef['default']),
                'default_value' => $columnDef['default'] ?? 'not_set'
            ],
            'timestamp' => time() * 1000
        ];
        @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
        // #endregion
        
        // 验证类型格式
        $type = $columnDef['type'] ?? '';
        $typeValidation = $this->validateTypeFormat($type);
        
        if (!$typeValidation['valid']) {
            $warnings[] = "表 {$tableName} 字段 {$columnName}: {$typeValidation['error']}";
            return ['valid' => false, 'warnings' => $warnings];
        }
        
        // 验证类型变更（如果有旧定义）
        if ($oldColumnDef !== null) {
            $oldType = $oldColumnDef['type'] ?? '';
            if (!empty($oldType) && $oldType !== $type) {
                $changeValidation = $this->validateTypeChange($oldType, $type);
                
                if (!$changeValidation['compatible']) {
                    $warnings[] = "⚠ 表 {$tableName} 字段 {$columnName}: {$changeValidation['warning']}";
                } elseif (!empty($changeValidation['warning'])) {
                    $warnings[] = "⚠ 表 {$tableName} 字段 {$columnName}: {$changeValidation['warning']}";
                }
            }
        }
        
        // 验证默认值
        if (isset($columnDef['default'])) {
            $defaultValidation = $this->validateDefaultValue($type, $columnDef['default']);
            if (!$defaultValidation['valid']) {
                $warnings[] = "表 {$tableName} 字段 {$columnName}: {$defaultValidation['warning']}";
            }
        }
        
        // 验证 NULL 约束变更（只在字段变更时检查）
        // 注意：NOT NULL 字段没有默认值是正常的数据库设计模式，不应该对所有字段都警告
        // 只在字段从允许 NULL 改为不允许 NULL 时，才检查是否有默认值
        if ($oldColumnDef !== null) {
            $nullAllowed = $columnDef['null'] ?? true;
            $oldNullAllowed = $oldColumnDef['null'] ?? true;
            $hasValidDefault = isset($columnDef['default']) && $columnDef['default'] !== null;
            $isAutoIncrement = $columnDef['auto_increment'] ?? false;
            
            // #region agent log
            $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/../.cursor/debug.log';
            @mkdir(dirname($logFile), 0755, true);
            $logData = [
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => 'B',
                'location' => 'TypeValidator.php:275',
                'message' => 'NULL constraint change validation',
                'data' => [
                    'table' => $tableName,
                    'column' => $columnName,
                    'old_null_allowed' => $oldNullAllowed,
                    'new_null_allowed' => $nullAllowed,
                    'has_valid_default' => $hasValidDefault,
                    'is_auto_increment' => $isAutoIncrement,
                    'will_warn' => ($oldNullAllowed && !$nullAllowed && !$hasValidDefault && !$isAutoIncrement)
                ],
                'timestamp' => time() * 1000
            ];
            @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
            // #endregion
            
            // 如果字段从允许 NULL 改为不允许 NULL，但没有默认值且不是自增，需要警告
            if ($oldNullAllowed && !$nullAllowed && !$hasValidDefault && !$isAutoIncrement) {
                $warnings[] = "⚠ 表 {$tableName} 字段 {$columnName}: 字段从允许 NULL 改为不允许 NULL，但没有默认值，可能导致现有数据或插入数据时出错";
            }
        }
        
        return [
            'valid' => empty($warnings) || !in_array(false, array_map(function($w) {
                return strpos($w, '不支持的字段类型') !== false || strpos($w, '类型格式错误') !== false;
            }, $warnings)),
            'warnings' => $warnings
        ];
    }
}
