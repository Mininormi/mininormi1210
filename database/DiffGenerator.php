<?php
/**
 * 差异检测器和 SQL 生成器
 * 
 * 对比 schema 定义和数据库实际结构，生成 SQL 语句
 */

class DiffGenerator
{
    private $schemaParser;
    private $databaseInspector;
    private $typeValidator;
    private $dryRun;
    private $warnings;
    private $pendingDeletions; // 待删除的字段和表列表
    
    public function __construct($schemaParser, $databaseInspector, $dryRun = false)
    {
        $this->schemaParser = $schemaParser;
        $this->databaseInspector = $databaseInspector;
        $this->dryRun = $dryRun;
        $this->warnings = [];
        $this->pendingDeletions = [];
        
        // 初始化类型验证器
        require_once __DIR__ . '/TypeValidator.php';
        $this->typeValidator = new TypeValidator();
    }
    
    /**
     * 生成所有差异的 SQL
     */
    public function generateDiff()
    {
        $sqls = [];
        $schemaTables = $this->schemaParser->getAllTables();
        $dbTables = $this->databaseInspector->getTableNames();
        
        // 检查 schema 中定义的表
        foreach ($schemaTables as $tableName => $tableDef) {
            $dbDef = $this->databaseInspector->getTableDefinition($tableName);
            
            if (!$dbDef) {
                // 表不存在，创建表
                $sqls[] = $this->generateCreateTable($tableName, $tableDef);
            } else {
                // 表存在，检查差异
                $alterSqls = $this->generateAlterTable($tableName, $tableDef, $dbDef);
                $sqls = array_merge($sqls, $alterSqls);
            }
        }
        
        // 检查数据库中多余的表（在 schema 中不存在，记录到待删除列表）
        foreach ($dbTables as $tableName) {
            if (!isset($schemaTables[$tableName])) {
                $this->pendingDeletions[] = [
                    'deletion_type' => 'table',
                    'table' => $tableName,
                    'column' => null,
                ];
            }
        }
        
        return $sqls;
    }
    
    /**
     * 生成 CREATE TABLE 语句
     */
    private function generateCreateTable($tableName, $tableDef)
    {
        $columns = [];
        $primaryKey = [];
        
        // 生成字段定义
        foreach ($tableDef['columns'] as $colName => $colDef) {
            // 验证字段定义
            $validation = $this->typeValidator->validateColumn($tableName, $colName, $colDef);
            if (!$validation['valid']) {
                $this->warnings = array_merge($this->warnings, $validation['warnings']);
                // 继续处理，但记录警告
            } else {
                $this->warnings = array_merge($this->warnings, $validation['warnings']);
            }
            
            $normalized = $this->schemaParser->normalizeColumn($colName, $colDef);
            $columns[] = $this->schemaParser->generateColumnSql($normalized);
            
            if ($normalized['auto_increment']) {
                $primaryKey[] = $colName;
            }
        }
        
        // 添加主键
        if (!empty($tableDef['primary_key'])) {
            $primaryKey = $tableDef['primary_key'];
        }
        
        $sql = "CREATE TABLE IF NOT EXISTS `{$tableName}` (\n";
        $sql .= "  " . implode(",\n  ", $columns);
        
        if (!empty($primaryKey)) {
            $sql .= ",\n  PRIMARY KEY (`" . implode("`, `", $primaryKey) . "`)";
        }
        
        // 添加索引
        if (!empty($tableDef['indexes'])) {
            foreach ($tableDef['indexes'] as $idxName => $idxDef) {
                $normalized = $this->schemaParser->normalizeIndex($idxName, $idxDef);
                $idxType = $normalized['unique'] ? 'UNIQUE KEY' : 'KEY';
                $sql .= ",\n  {$idxType} `{$idxName}` (`" . implode("`, `", $normalized['columns']) . "`)";
            }
        }
        
        $sql .= "\n)";
        
        // 添加引擎和字符集
        $engine = $tableDef['engine'] ?? 'InnoDB';
        $charset = $tableDef['charset'] ?? 'utf8mb4';
        $comment = $tableDef['comment'] ?? '';
        
        $sql .= " ENGINE={$engine} DEFAULT CHARSET={$charset}";
        
        if (!empty($comment)) {
            $sql .= " COMMENT='{$comment}'";
        }
        
        return $sql;
    }
    
    /**
     * 生成 ALTER TABLE 语句
     */
    private function generateAlterTable($tableName, $schemaDef, $dbDef)
    {
        $sqls = [];
        $alterParts = [];
        
        // 检查字段差异
        $schemaColumns = $schemaDef['columns'] ?? [];
        $dbColumns = $dbDef['columns'] ?? [];
        
        // 新增字段
        foreach ($schemaColumns as $colName => $colDef) {
            if (!isset($dbColumns[$colName])) {
                // 验证新字段
                $validation = $this->typeValidator->validateColumn($tableName, $colName, $colDef);
                if (!$validation['valid']) {
                    $this->warnings = array_merge($this->warnings, $validation['warnings']);
                    // 继续处理，但记录警告
                } else {
                    $this->warnings = array_merge($this->warnings, $validation['warnings']);
                }
                
                $normalized = $this->schemaParser->normalizeColumn($colName, $colDef);
                $colSql = $this->schemaParser->generateColumnSql($normalized);
                
                // 确定字段位置
                $after = $this->findColumnPosition($colName, $schemaColumns);
                if ($after) {
                    $alterParts[] = "ADD COLUMN {$colSql} AFTER `{$after}`";
                } else {
                    $alterParts[] = "ADD COLUMN {$colSql}";
                }
            } else {
                // 检查字段是否被修改
                $normalized = $this->schemaParser->normalizeColumn($colName, $colDef);
                $dbCol = $dbColumns[$colName];
                
                // 验证字段变更
                $validation = $this->typeValidator->validateColumn($tableName, $colName, $colDef, $dbCol);
                if (!$validation['valid']) {
                    $this->warnings = array_merge($this->warnings, $validation['warnings']);
                    // 类型不兼容时，仍然生成 SQL，但记录严重警告
                } else {
                    $this->warnings = array_merge($this->warnings, $validation['warnings']);
                }
                
                if ($this->isColumnChanged($normalized, $dbCol)) {
                    $colSql = $this->schemaParser->generateColumnSql($normalized);
                    $alterParts[] = "MODIFY COLUMN {$colSql}";
                }
            }
        }
        
        // 检查删除的字段（记录到待删除列表，不生成 SQL）
        foreach ($dbColumns as $colName => $colDef) {
            if (!isset($schemaColumns[$colName])) {
                $this->pendingDeletions[] = [
                    'deletion_type' => 'column',
                    'table' => $tableName,
                    'column' => (string)$colName, // 确保列名是字符串类型
                    'column_type' => $colDef['type'] ?? 'unknown',
                    'comment' => $colDef['comment'] ?? '',
                ];
            }
        }
        
        // 检查索引差异
        $schemaIndexes = $schemaDef['indexes'] ?? [];
        $dbIndexes = $dbDef['indexes'] ?? [];
        
        // 删除不存在的索引
        foreach ($dbIndexes as $idxName => $idxDef) {
            if (!isset($schemaIndexes[$idxName])) {
                $alterParts[] = "DROP INDEX `{$idxName}`";
            }
        }
        
        // 添加新索引或修改索引
        foreach ($schemaIndexes as $idxName => $idxDef) {
            $normalized = $this->schemaParser->normalizeIndex($idxName, $idxDef);
            
            if (!isset($dbIndexes[$idxName])) {
                // 新索引
                $idxType = $normalized['unique'] ? 'UNIQUE KEY' : 'KEY';
                $alterParts[] = "ADD {$idxType} `{$idxName}` (`" . implode("`, `", $normalized['columns']) . "`)";
            } else {
                // 检查索引是否变化
                $dbIdx = $dbIndexes[$idxName];
                if ($this->isIndexChanged($normalized, $dbIdx)) {
                    // 先删除再添加
                    $alterParts[] = "DROP INDEX `{$idxName}`";
                    $idxType = $normalized['unique'] ? 'UNIQUE KEY' : 'KEY';
                    $alterParts[] = "ADD {$idxType} `{$idxName}` (`" . implode("`, `", $normalized['columns']) . "`)";
                }
            }
        }
        
        // 生成 ALTER TABLE 语句
        if (!empty($alterParts)) {
            $sql = "ALTER TABLE `{$tableName}`\n  " . implode(",\n  ", $alterParts);
            $sqls[] = $sql;
        }
        
        return $sqls;
    }
    
    /**
     * 检查字段是否被修改
     */
    private function isColumnChanged($schemaCol, $dbCol)
    {
        // 对比类型（忽略大小写和空格）
        $schemaType = strtolower(trim($schemaCol['type']));
        $dbType = strtolower(trim($dbCol['type']));
        if ($schemaType !== $dbType) {
            return true;
        }
        
        // 对比 NULL
        if ($schemaCol['null'] !== $dbCol['null']) {
            return true;
        }
        
        // 对比默认值（需要处理 NULL、字符串、数字等）
        $schemaDefault = $schemaCol['default'];
        $dbDefault = $dbCol['default'];
        
        // 处理 NULL 值
        if ($schemaDefault === null && $dbDefault === null) {
            // 都是 null，继续检查其他属性
        } elseif ($schemaDefault === null && $dbDefault !== null) {
            return true;
        } elseif ($schemaDefault !== null && $dbDefault === null) {
            return true;
        } else {
            // 都非 null，转换为字符串比较
            if ((string)$schemaDefault !== (string)$dbDefault) {
                return true;
            }
        }
        
        // 对比 AUTO_INCREMENT
        if ($schemaCol['auto_increment'] !== $dbCol['auto_increment']) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 检查索引是否被修改
     */
    private function isIndexChanged($schemaIdx, $dbIdx)
    {
        // 对比列
        if (count($schemaIdx['columns']) !== count($dbIdx['columns'])) {
            return true;
        }
        
        foreach ($schemaIdx['columns'] as $i => $col) {
            if ($col !== $dbIdx['columns'][$i]) {
                return true;
            }
        }
        
        // 对比唯一性
        if ($schemaIdx['unique'] !== $dbIdx['unique']) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 查找字段应该放在哪个字段之后
     */
    private function findColumnPosition($colName, $columns)
    {
        $keys = array_keys($columns);
        $pos = array_search($colName, $keys);
        
        if ($pos > 0) {
            return $keys[$pos - 1];
        }
        
        return null;
    }
    
    /**
     * 获取警告信息
     */
    public function getWarnings()
    {
        return $this->warnings;
    }
    
    /**
     * 获取待删除的字段列表
     */
    public function getPendingDeletions()
    {
        return $this->pendingDeletions;
    }
}

