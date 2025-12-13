<?php
/**
 * 数据库同步脚本
 * 
 * 使用方法:
 *   Windows: php database/sync.php --schema
 *   Linux/Mac: php database/sync.php --schema
 * 
 * 功能:
 *   1. 基于 schema.json 文件自动检测差异并同步数据库结构
 *   2. 支持预览模式（--dry-run），只显示 SQL 不执行
 */

// 引入 ThinkPHP 框架
// 检测是否在 Docker 容器内运行（通过检查路径）
$isDocker = (strpos(__DIR__, '/var/www/database') === 0);

if ($isDocker) {
    // 容器内路径：database 在 /var/www/database，backend/admin 在 /var/www/html
    $adminPath = '/var/www/html';
} else {
    // 宿主机路径：使用相对路径
    $adminPath = __DIR__ . '/../backend/admin';
}

define('APP_PATH', $adminPath . '/application/');
define('RUNTIME_PATH', $adminPath . '/runtime/');
define('ROOT_PATH', $adminPath . '/');

// 只加载基础框架，不执行 Console 或 Web 应用
require $adminPath . '/thinkphp/base.php';

// 手动初始化应用（但不执行 Console）
\think\App::initCommon();

require_once __DIR__ . '/SchemaParser.php';
require_once __DIR__ . '/DatabaseInspector.php';
require_once __DIR__ . '/TypeValidator.php';
require_once __DIR__ . '/DiffGenerator.php';

use think\Db;
use think\Config;

class DatabaseSync
{
    private $prefix;
    private $dryRun;
    private $logFile;
    
    public function __construct($dryRun = false)
    {
        // 使用固定的 mini_ 前缀，标识由 sync 工具管理的表
        // fa_ 前缀保留给 FastAdmin 原生表
        $this->prefix = 'mini_';
        $this->dryRun = $dryRun;
        $this->logFile = null;
    }
    
    /**
     * 运行同步
     */
    public function run()
    {
        // 启动输出缓冲，用于记录日志
        ob_start();
        
        try {
            echo "========================================\n";
            echo "数据库结构同步工具（Schema 热更新模式）\n";
            if ($this->dryRun) {
                echo "[预览模式 - 不会实际执行 SQL]\n";
            }
            echo "========================================\n\n";
            
            $this->syncFromSchema();
        } catch (\Exception $e) {
            // 发生异常时，确保日志文件已初始化
            if ($this->logFile === null) {
                try {
                    $schemaFile = __DIR__ . '/schema.json';
                    if (file_exists($schemaFile)) {
                        $parser = new SchemaParser($schemaFile);
                        $version = $parser->getVersion();
                    } else {
                        $version = '1.0.0';
                    }
                    $this->initVersionLog($version);
                } catch (\Exception $e2) {
                    $this->initVersionLog('1.0.0');
                }
            }
            throw $e;
        } finally {
            // 无论成功还是失败，都保存日志并输出
            $this->saveLog();
            $output = ob_get_clean();
            echo $output;
        }
    }
    
    /**
     * 基于 Schema 同步（热更新模式）
     */
    public function syncFromSchema()
    {
        // #region agent log
        $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/.cursor/debug.log';
        @mkdir(dirname($logFile), 0755, true);
        $logData = [
            'sessionId' => 'debug-session',
            'runId' => 'run1',
            'hypothesisId' => 'D',
            'location' => 'sync.php:76',
            'message' => 'syncFromSchema started',
            'data' => ['dry_run' => $this->dryRun, 'log_file' => $logFile],
            'timestamp' => time() * 1000
        ];
        @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
        // #endregion
        
        try {
            $schemaFile = __DIR__ . '/schema.json';
            
            // #region agent log
            $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/.cursor/debug.log';
            $logData = [
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => 'D',
                'location' => 'sync.php:81',
                'message' => 'checking schema file',
                'data' => ['schema_file' => $schemaFile, 'exists' => file_exists($schemaFile)],
                'timestamp' => time() * 1000
            ];
            @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
            // #endregion
            
            if (!file_exists($schemaFile)) {
                // 即使 Schema 文件不存在，也尝试初始化日志（使用默认版本）
                $this->initVersionLog('1.0.0');
                echo "⚠ Schema 文件不存在: {$schemaFile}\n";
                echo "请先运行: php database/generate-schema.php\n";
                // 注意：return 后，日志会在 run() 方法的 finally 块中保存
                return;
            }
            
            // #region agent log
            $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/.cursor/debug.log';
            $logData = [
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => 'D',
                'location' => 'sync.php:90',
                'message' => 'creating parser and inspector',
                'data' => [],
                'timestamp' => time() * 1000
            ];
            @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
            // #endregion
            
            $parser = new SchemaParser($schemaFile);
            $inspector = new DatabaseInspector($this->prefix);
            $diffGenerator = new DiffGenerator($parser, $inspector, $this->dryRun);
            
            // 初始化版本日志
            $version = $parser->getVersion();
            $this->initVersionLog($version);
            
            echo "加载 Schema 文件: {$schemaFile}\n";
            echo "Schema 版本: {$version}\n\n";
            
            // 生成差异 SQL
            $sqls = $diffGenerator->generateDiff();
            $warnings = $diffGenerator->getWarnings();
            $pendingDeletions = $diffGenerator->getPendingDeletions();
            
            // #region agent log
            $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/.cursor/debug.log';
            $logData = [
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => 'D',
                'location' => 'sync.php:101',
                'message' => 'diff generated',
                'data' => ['sql_count' => count($sqls), 'warning_count' => count($warnings), 'pending_deletions_count' => count($pendingDeletions)],
                'timestamp' => time() * 1000
            ];
            @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
            // #endregion
            
            // 保存待删除字段列表到文件
            $pendingDeletionsFile = __DIR__ . '/pending_deletions.json';
            file_put_contents($pendingDeletionsFile, json_encode($pendingDeletions, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            
            // 显示警告
            if (!empty($warnings)) {
                echo "警告信息:\n";
                foreach ($warnings as $warning) {
                    echo "  ⚠ {$warning}\n";
                }
                echo "\n";
            }
            
            // 显示待删除字段和表
            if (!empty($pendingDeletions)) {
                $columns = array_filter($pendingDeletions, function($item) { return ($item['deletion_type'] ?? 'column') === 'column'; });
                $tables = array_filter($pendingDeletions, function($item) { return ($item['deletion_type'] ?? '') === 'table'; });
                
                if (!empty($columns)) {
                    echo "待删除字段（需要手动处理）:\n";
                    foreach ($columns as $deletion) {
                        $columnType = $deletion['column_type'] ?? 'unknown';
                        echo "  ⚠ 表: {$deletion['table']}, 字段: {$deletion['column']} ({$columnType})\n";
                    }
                }
                
                if (!empty($tables)) {
                    echo "待删除表（需要手动处理）:\n";
                    foreach ($tables as $deletion) {
                        echo "  ⚠ 表: {$deletion['table']}\n";
                    }
                }
                
                if (!empty($columns) || !empty($tables)) {
                    echo "  提示: 请在 Adminer 或命令行中手动删除，然后点击 Web UI 中的\"已处理\"按钮\n\n";
                }
            }
            
            if (empty($sqls)) {
                echo "✓ 数据库结构已是最新版本，无需更新\n";
                // 注意：return 后，日志会在 run() 方法的 finally 块中保存
                return;
            }
            
            echo "发现 " . count($sqls) . " 个需要执行的 SQL 语句:\n\n";
            
            if ($this->dryRun) {
                // 预览模式，只显示 SQL
                foreach ($sqls as $i => $sql) {
                    echo "SQL #" . ($i + 1) . ":\n";
                    echo $sql . ";\n\n";
                }
                echo "========================================\n";
                echo "[预览模式] 以上 SQL 未实际执行\n";
                echo "========================================\n";
            } else {
                // 执行 SQL
                $successCount = 0;
                $failedCount = 0;
                
                foreach ($sqls as $i => $sql) {
                    echo "执行 SQL #" . ($i + 1) . "...\n";
                    try {
                        Db::execute($sql);
                        echo "  ✓ 成功\n\n";
                        $successCount++;
                    } catch (\Exception $e) {
                        echo "  ✗ 失败: " . $e->getMessage() . "\n\n";
                        $failedCount++;
                        // 继续执行下一个，不中断
                    }
                }
                
                echo "========================================\n";
                echo "同步完成！\n";
                echo "成功: {$successCount} 个\n";
                echo "失败: {$failedCount} 个\n";
                echo "========================================\n";
            }
            
        } catch (\Exception $e) {
            // #region agent log
            $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/.cursor/debug.log';
            $logData = [
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => 'D',
                'location' => 'sync.php:catch',
                'message' => 'exception caught',
                'data' => ['exception_message' => $e->getMessage(), 'exception_file' => $e->getFile(), 'exception_line' => $e->getLine(), 'trace' => $e->getTraceAsString()],
                'timestamp' => time() * 1000
            ];
            @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
            // #endregion
            
            // 如果日志文件未初始化，尝试初始化（使用默认版本）
            if ($this->logFile === null) {
                try {
                    $schemaFile = __DIR__ . '/schema.json';
                    if (file_exists($schemaFile)) {
                        $parser = new SchemaParser($schemaFile);
                        $version = $parser->getVersion();
                    } else {
                        $version = '1.0.0';
                    }
                    $this->initVersionLog($version);
                } catch (\Exception $e2) {
                    // 如果初始化失败，使用默认版本
                    $this->initVersionLog('1.0.0');
                }
            }
            
            echo "\n✗ 同步失败: " . $e->getMessage() . "\n";
            echo "请检查错误信息并修复后重试\n";
            
            // 重新抛出异常，让 run() 方法统一处理
            throw $e;
        }
    }
    
    /**
     * 初始化版本日志
     */
    private function initVersionLog($version)
    {
        // 创建日志目录：database/logs/{version}/
        $logDir = __DIR__ . '/logs/' . $version;
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        
        // 生成日志文件名：MM-DD.log
        $date = date('m-d');
        $this->logFile = $logDir . '/' . $date . '.log';
    }
    
    /**
     * 保存日志到文件
     */
    private function saveLog()
    {
        if ($this->logFile === null) {
            return;
        }
        
        // 获取输出缓冲内容（不清理缓冲，因为后面还要输出）
        $output = ob_get_contents();
        
        if (empty(trim($output))) {
            return;
        }
        
        // 添加时间戳和分隔符
        $timestamp = date('Y-m-d H:i:s');
        $logContent = "\n" . str_repeat('=', 80) . "\n";
        $logContent .= "执行时间: {$timestamp}\n";
        $logContent .= str_repeat('=', 80) . "\n";
        $logContent .= $output;
        $logContent .= "\n";
        
        // 追加到日志文件
        @file_put_contents($this->logFile, $logContent, FILE_APPEND);
    }
    
    /**
     * 检查表是否存在
     */
    private function tableExists($tableName)
    {
        try {
            $result = Db::query("SHOW TABLES LIKE '{$tableName}'");
            return !empty($result);
        } catch (\Exception $e) {
            return false;
        }
    }
}

// 解析命令行参数
$dryRun = false;

foreach ($argv as $arg) {
    if ($arg === '--dry-run') {
        $dryRun = true;
    }
}

// 运行同步（固定使用 schema 模式）
try {
    // #region agent log
    $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/.cursor/debug.log';
    @mkdir(dirname($logFile), 0755, true);
    $logData = [
        'sessionId' => 'debug-session',
        'runId' => 'run1',
        'hypothesisId' => 'D',
        'location' => 'sync.php:245',
        'message' => 'script entry point',
        'data' => ['dry_run' => $dryRun, 'argv' => $argv, 'log_file' => $logFile],
        'timestamp' => time() * 1000
    ];
    @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
    // #endregion
    
    $sync = new DatabaseSync($dryRun);
    $sync->run();
    
    // #region agent log
    $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/.cursor/debug.log';
    $logData = [
        'sessionId' => 'debug-session',
        'runId' => 'run1',
        'hypothesisId' => 'D',
        'location' => 'sync.php:250',
        'message' => 'sync completed successfully',
        'data' => [],
        'timestamp' => time() * 1000
    ];
    @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
    // #endregion
} catch (\Exception $e) {
    // #region agent log
    $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/.cursor/debug.log';
    $logData = [
        'sessionId' => 'debug-session',
        'runId' => 'run1',
        'hypothesisId' => 'D',
        'location' => 'sync.php:catch',
        'message' => 'top level exception',
        'data' => ['exception_message' => $e->getMessage(), 'exception_file' => $e->getFile(), 'exception_line' => $e->getLine(), 'trace' => $e->getTraceAsString()],
        'timestamp' => time() * 1000
    ];
    @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
    // #endregion
    
    // 输出错误信息（已经在 run() 方法中输出，这里只是确保）
    echo "\n✗ 错误: " . $e->getMessage() . "\n";
    exit(1);
}

