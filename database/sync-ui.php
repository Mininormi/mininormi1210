<?php
/**
 * 数据库同步工具 - 独立Web界面
 * 
 * 访问方式: http://your-domain.com/database/sync-ui.php
 * 或直接打开文件（需要配置本地PHP服务器）
 * 
 * 注意：此工具仅用于开发环境，生产环境请勿使用
 */

// 引入 ThinkPHP 框架
$isDocker = (strpos(__DIR__, '/var/www/database') === 0);

if ($isDocker) {
    $adminPath = '/var/www/html';
} else {
    $adminPath = __DIR__ . '/../backend/admin';
}

define('APP_PATH', $adminPath . '/application/');
define('RUNTIME_PATH', $adminPath . '/runtime/');
define('ROOT_PATH', $adminPath . '/');

require $adminPath . '/thinkphp/base.php';
\think\App::initCommon();

use think\Db;

// 处理 AJAX 请求
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json; charset=utf-8');
    
    $action = $_POST['action'];
    $response = ['code' => 0, 'msg' => '', 'data' => null];
    
    try {
        switch ($action) {
            case 'get_status':
                // 检查 schema.json
                $schemaFile = __DIR__ . '/schema.json';
                $schemaExists = file_exists($schemaFile);
                $schemaInfo = null;
                
                if ($schemaExists) {
                    $content = file_get_contents($schemaFile);
                    $schema = json_decode($content, true);
                    $schemaInfo = [
                        'version' => $schema['version'] ?? '1.0.0',
                        'generated_at' => $schema['generated_at'] ?? '-',
                        'table_count' => isset($schema['tables']) ? count($schema['tables']) : 0,
                    ];
                }
                
                // 表版本数量（已废弃，使用日志系统）
                $versionCount = 0;
                
                // 获取待删除字段列表
                $pendingDeletionsFile = __DIR__ . '/pending_deletions.json';
                $pendingDeletions = [];
                if (file_exists($pendingDeletionsFile)) {
                    $content = file_get_contents($pendingDeletionsFile);
                    $pendingDeletions = json_decode($content, true) ?: [];
                }
                
                // 获取已处理的字段列表
                $processedDeletionsFile = __DIR__ . '/processed_deletions.json';
                $processedDeletions = [];
                if (file_exists($processedDeletionsFile)) {
                    $content = file_get_contents($processedDeletionsFile);
                    $processedDeletions = json_decode($content, true) ?: [];
                }
                
                // 实时检查字段是否真的存在，只显示真正存在的字段
                require_once __DIR__ . '/DatabaseInspector.php';
                $inspector = new DatabaseInspector('mini_');
                $activePendingDeletions = [];
                $updatedProcessedDeletions = [];
                
                // 遍历待删除列表，实时检查数据库中字段/表是否存在
                foreach ($pendingDeletions as $deletion) {
                    $deletionType = $deletion['deletion_type'] ?? 'column';
                    
                    // #region agent log
                    $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/../.cursor/debug.log';
                    @mkdir(dirname($logFile), 0755, true);
                    $logData = [
                        'sessionId' => 'debug-session',
                        'runId' => 'run1',
                        'hypothesisId' => 'E',
                        'location' => 'sync-ui.php:80',
                        'message' => 'Processing pending deletion',
                        'data' => [
                            'deletion' => $deletion,
                            'deletion_type' => $deletionType,
                            'column_type' => gettype($deletion['column'] ?? null)
                        ],
                        'timestamp' => time() * 1000
                    ];
                    @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                    // #endregion
                    
                    if ($deletionType === 'column') {
                        // 字段类型
                        // 确保 column 是字符串类型
                        $columnName = (string)($deletion['column'] ?? '');
                        $key = $deletion['table'] . '.' . $columnName;
                        
                        // #region agent log
                        $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/../.cursor/debug.log';
                        $logData = [
                            'sessionId' => 'debug-session',
                            'runId' => 'run1',
                            'hypothesisId' => 'E',
                            'location' => 'sync-ui.php:95',
                            'message' => 'Checking column existence',
                            'data' => [
                                'table' => $deletion['table'],
                                'column_original' => $deletion['column'],
                                'column_string' => $columnName,
                                'key' => $key
                            ],
                            'timestamp' => time() * 1000
                        ];
                        @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                        // #endregion
                        
                        // 实时检查字段是否真的存在于数据库中
                        $columnStillExists = $inspector->columnExists($deletion['table'], $columnName);
                        
                        // #region agent log
                        $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : dirname(__DIR__) . '/../.cursor/debug.log';
                        $logData = [
                            'sessionId' => 'debug-session',
                            'runId' => 'run1',
                            'hypothesisId' => 'E',
                            'location' => 'sync-ui.php:105',
                            'message' => 'Column existence check result',
                            'data' => [
                                'table' => $deletion['table'],
                                'column' => $columnName,
                                'column_still_exists' => $columnStillExists,
                                'will_add_to_active' => $columnStillExists
                            ],
                            'timestamp' => time() * 1000
                        ];
                        @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                        // #endregion
                        
                        if ($columnStillExists) {
                            // 字段还存在，应该显示在待删除列表中（不管之前是否标记为已处理）
                            $activePendingDeletions[] = $deletion;
                        } else {
                            // 字段已经不存在了（真正删除了），如果之前标记为已处理，保留在已处理列表中
                            if (in_array($key, $processedDeletions)) {
                                $updatedProcessedDeletions[] = $key;
                            }
                        }
                    } else if ($deletionType === 'table') {
                        // 表类型
                        $key = $deletion['table'];
                        
                        // 实时检查表是否真的存在于数据库中
                        $tableStillExists = $inspector->tableExists($deletion['table']);
                        
                        if ($tableStillExists) {
                            // 表还存在，应该显示在待删除列表中（不管之前是否标记为已处理）
                            $activePendingDeletions[] = $deletion;
                        } else {
                            // 表已经不存在了（真正删除了），如果之前标记为已处理，保留在已处理列表中
                            if (in_array($key, $processedDeletions)) {
                                $updatedProcessedDeletions[] = $key;
                            }
                        }
                    }
                }
                
                // 清理已处理列表：只保留那些字段/表已经真正删除的记录
                foreach ($processedDeletions as $processedKey) {
                    // 检查这个已处理的项是否在待删除列表中
                    $foundInPending = false;
                    foreach ($pendingDeletions as $deletion) {
                        $deletionType = $deletion['deletion_type'] ?? 'column';
                        
                        if ($deletionType === 'column') {
                            $key = $deletion['table'] . '.' . $deletion['column'];
                            if ($key === $processedKey) {
                                $foundInPending = true;
                                // 检查字段是否还存在
                                if ($inspector->columnExists($deletion['table'], $deletion['column'])) {
                                    // 字段还存在，不应该在已处理列表中
                                    // 不添加到 updatedProcessedDeletions
                                } else {
                                    // 字段已删除，保留在已处理列表中
                                    $updatedProcessedDeletions[] = $processedKey;
                                }
                                break;
                            }
                        } else if ($deletionType === 'table') {
                            $key = $deletion['table'];
                            if ($key === $processedKey) {
                                $foundInPending = true;
                                // 检查表是否还存在
                                if ($inspector->tableExists($deletion['table'])) {
                                    // 表还存在，不应该在已处理列表中
                                    // 不添加到 updatedProcessedDeletions
                                } else {
                                    // 表已删除，保留在已处理列表中
                                    $updatedProcessedDeletions[] = $processedKey;
                                }
                                break;
                            }
                        }
                    }
                    
                    // 如果不在待删除列表中，说明可能是旧的记录，保留它
                    if (!$foundInPending && !in_array($processedKey, $updatedProcessedDeletions)) {
                        $updatedProcessedDeletions[] = $processedKey;
                    }
                }
                
                // 保存更新后的已处理列表
                file_put_contents($processedDeletionsFile, json_encode($updatedProcessedDeletions, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                
                // #region agent log
                $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : __DIR__ . '/../.cursor/debug.log';
                $logData = [
                    'sessionId' => 'debug-session',
                    'runId' => 'run1',
                    'hypothesisId' => 'E',
                    'location' => 'sync-ui.php:get_status',
                    'message' => 'pending deletions status',
                    'data' => [
                        'pending_deletions_count' => count($pendingDeletions),
                        'processed_deletions_count' => count($processedDeletions),
                        'active_pending_deletions_count' => count($activePendingDeletions),
                        'pending_deletions_file_exists' => file_exists($pendingDeletionsFile),
                    ],
                    'timestamp' => time() * 1000
                ];
                @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                // #endregion
                
                $response = [
                    'code' => 1,
                    'msg' => '获取成功',
                    'data' => [
                        'schema' => $schemaInfo,
                        'version_count' => $versionCount,
                        'pending_deletions' => $activePendingDeletions,
                    ]
                ];
                break;
                
            case 'mark_deletion_processed':
                // #region agent log
                $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : __DIR__ . '/../.cursor/debug.log';
                $logData = [
                    'sessionId' => 'debug-session',
                    'runId' => 'run1',
                    'hypothesisId' => 'E',
                    'location' => 'sync-ui.php:mark_deletion_processed',
                    'message' => 'mark deletion processed started',
                    'data' => [
                        'deletion_type' => $_POST['deletion_type'] ?? '',
                        'table' => $_POST['table'] ?? '',
                        'column' => $_POST['column'] ?? ''
                    ],
                    'timestamp' => time() * 1000
                ];
                @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                // #endregion
                
                $deletionType = $_POST['deletion_type'] ?? 'column';
                $table = $_POST['table'] ?? '';
                $column = $_POST['column'] ?? '';
                
                if (empty($table)) {
                    throw new \Exception('表名不能为空');
                }
                
                if ($deletionType === 'column' && empty($column)) {
                    throw new \Exception('字段名不能为空');
                }
                
                $processedDeletionsFile = __DIR__ . '/processed_deletions.json';
                $processedDeletions = [];
                if (file_exists($processedDeletionsFile)) {
                    $content = file_get_contents($processedDeletionsFile);
                    $processedDeletions = json_decode($content, true) ?: [];
                }
                
                // 生成 key：字段用 table.column，表用 table
                $key = ($deletionType === 'table') ? $table : ($table . '.' . $column);
                
                if (!in_array($key, $processedDeletions)) {
                    $processedDeletions[] = $key;
                    file_put_contents($processedDeletionsFile, json_encode($processedDeletions, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                }
                
                // #region agent log
                $logData = [
                    'sessionId' => 'debug-session',
                    'runId' => 'run1',
                    'hypothesisId' => 'E',
                    'location' => 'sync-ui.php:mark_deletion_processed',
                    'message' => 'mark deletion processed completed',
                    'data' => ['key' => $key, 'deletion_type' => $deletionType, 'processed_count' => count($processedDeletions)],
                    'timestamp' => time() * 1000
                ];
                @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                // #endregion
                
                $response = [
                    'code' => 1,
                    'msg' => '已标记为已处理',
                    'data' => null
                ];
                break;
                
            case 'execute':
                // #region agent log
                $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : __DIR__ . '/../.cursor/debug.log';
                @mkdir(dirname($logFile), 0755, true);
                $logData = [
                    'sessionId' => 'debug-session',
                    'runId' => 'run1',
                    'hypothesisId' => 'A',
                    'location' => 'sync-ui.php:73',
                    'message' => 'execute action started',
                    'data' => ['dry_run' => isset($_POST['dry_run']) ? $_POST['dry_run'] : 'not set', 'log_file' => $logFile],
                    'timestamp' => time() * 1000
                ];
                @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                // #endregion
                
                $dryRun = isset($_POST['dry_run']) && $_POST['dry_run'] == '1' ? 1 : 0;
                
                // 检查 exec 函数是否可用
                if (!function_exists('exec')) {
                    throw new \Exception('exec() 函数被禁用，无法执行同步。请联系服务器管理员启用 exec() 函数。');
                }
                
                $originalDir = getcwd();
                chdir(__DIR__);
                
                // #region agent log
                $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : __DIR__ . '/../.cursor/debug.log';
                $logData = [
                    'sessionId' => 'debug-session',
                    'runId' => 'run1',
                    'hypothesisId' => 'C',
                    'location' => 'sync-ui.php:96',
                    'message' => 'after chdir',
                    'data' => ['current_dir' => getcwd(), 'sync_file_exists' => file_exists(__DIR__ . '/sync.php'), 'sync_file_path' => __DIR__ . '/sync.php'],
                    'timestamp' => time() * 1000
                ];
                @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                // #endregion
                
                // 构建命令（固定使用 schema 模式）
                $phpPath = getPhpPath();
                
                // #region agent log
                $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : __DIR__ . '/../.cursor/debug.log';
                $logData = [
                    'sessionId' => 'debug-session',
                    'runId' => 'run1',
                    'hypothesisId' => 'B',
                    'location' => 'sync-ui.php:112',
                    'message' => 'php path resolved',
                    'data' => ['php_path' => $phpPath, 'php_exists' => file_exists($phpPath) || $phpPath === 'php'],
                    'timestamp' => time() * 1000
                ];
                @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                // #endregion
                
                $command = $phpPath . " sync.php";
                
                if ($dryRun) {
                    $command .= " --dry-run";
                }
                
                // #region agent log
                $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : __DIR__ . '/../.cursor/debug.log';
                $logData = [
                    'sessionId' => 'debug-session',
                    'runId' => 'run1',
                    'hypothesisId' => 'A',
                    'location' => 'sync-ui.php:127',
                    'message' => 'before exec',
                    'data' => ['command' => $command, 'dry_run' => $dryRun, 'current_dir' => getcwd()],
                    'timestamp' => time() * 1000
                ];
                @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                // #endregion
                
                // 执行命令
                $output = [];
                $returnVar = 0;
                exec($command . " 2>&1", $output, $returnVar);
                
                // #region agent log
                $logFile = (strpos(__DIR__, '/var/www') === 0) ? '/var/www/.cursor/debug.log' : __DIR__ . '/../.cursor/debug.log';
                $logData = [
                    'sessionId' => 'debug-session',
                    'runId' => 'run1',
                    'hypothesisId' => 'D',
                    'location' => 'sync-ui.php:135',
                    'message' => 'after exec',
                    'data' => [
                        'return_var' => $returnVar, 
                        'output_count' => count($output), 
                        'output_all' => $output,
                        'output_joined' => implode("\n", $output)
                    ],
                    'timestamp' => time() * 1000
                ];
                @file_put_contents($logFile, json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
                // #endregion
                
                chdir($originalDir);
                
                $response = [
                    'code' => $returnVar === 0 ? 1 : 0,
                    'msg' => $returnVar === 0 ? '执行完成' : '执行失败',
                    'data' => [
                        'success' => $returnVar === 0,
                        'output' => implode("\n", $output),
                        'command' => $command,
                        'return_var' => $returnVar,
                    ]
                ];
                break;
                
            case 'generate_schema':
                // 检查 exec 函数是否可用
                if (!function_exists('exec')) {
                    throw new \Exception('exec() 函数被禁用，无法生成 Schema。请联系服务器管理员启用 exec() 函数。');
                }
                
                $originalDir = getcwd();
                chdir(__DIR__);
                
                if (!file_exists('generate-schema.php')) {
                    chdir($originalDir);
                    throw new \Exception('generate-schema.php 文件不存在');
                }
                
                $phpPath = getPhpPath();
                $output = [];
                $returnVar = 0;
                exec($phpPath . " generate-schema.php 2>&1", $output, $returnVar);
                
                chdir($originalDir);
                
                $response = [
                    'code' => $returnVar === 0 ? 1 : 0,
                    'msg' => $returnVar === 0 ? 'Schema 文件生成成功' : '生成失败',
                    'data' => [
                        'success' => $returnVar === 0,
                        'output' => implode("\n", $output),
                    ]
                ];
                break;
                
            default:
                throw new \Exception('未知操作');
        }
    } catch (\Exception $e) {
        $response = [
            'code' => 0,
            'msg' => $e->getMessage(),
            'data' => null
        ];
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// 获取 PHP 可执行文件路径
function getPhpPath() {
    $possiblePaths = [
        'php',
        '/usr/bin/php',
        '/usr/local/bin/php',
        PHP_BINARY,
    ];
    
    foreach ($possiblePaths as $path) {
        if ($path === 'php' || file_exists($path)) {
            $test = @exec($path . ' -v 2>&1', $testOutput, $testReturn);
            if ($testReturn === 0) {
                return $path;
            }
        }
    }
    
    return 'php';
}

?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>数据库同步工具</title>
    <link href="https://cdn.bootcdn.net/ajax/libs/bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <style>
        body {
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .panel {
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .panel-heading {
            font-weight: bold;
        }
        #output_log {
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            line-height: 1.6;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 4px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        #output_log .text-success { color: #4ec9b0; }
        #output_log .text-danger { color: #f48771; }
        #output_log .text-warning { color: #dcdcaa; }
        #output_log .text-info { color: #569cd6; }
        .btn-lg {
            padding: 10px 20px;
            font-size: 16px;
        }
        .alert {
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="page-header">
            <h1><i class="fa fa-database"></i> 数据库同步工具</h1>
            <p class="text-muted">开发环境专用 - 请勿在生产环境使用</p>
        </div>

        <div class="row">
            <!-- 左侧：操作面板 -->
            <div class="col-md-8">
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <h3 class="panel-title"><i class="fa fa-cog"></i> 数据库同步工具</h3>
                    </div>
                    <div class="panel-body">
                        <!-- Schema 模式说明 -->
                        <div class="form-group">
                            <div class="alert alert-info">
                                <i class="fa fa-info-circle"></i> 
                                <strong>Schema 热更新模式：</strong>基于 schema.json 文件自动检测差异并同步数据库结构
                            </div>
                        </div>

                        <!-- 预览模式 -->
                        <div class="form-group">
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="dry_run" value="1"> 
                                    <i class="fa fa-eye"></i> 预览模式（只显示 SQL，不执行）
                                </label>
                            </div>
                        </div>

                        <!-- Schema 文件状态 -->
                        <div id="schema_status" class="alert alert-info" style="display:none;">
                            <i class="fa fa-info-circle"></i> 
                            <span id="schema_status_text"></span>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="form-group">
                            <button type="button" class="btn btn-success btn-lg" id="btn_execute">
                                <i class="fa fa-play"></i> 执行同步
                            </button>
                            <button type="button" class="btn btn-info btn-lg" id="btn_generate_schema">
                                <i class="fa fa-magic"></i> 生成 Schema 文件
                            </button>
                            <button type="button" class="btn btn-default" id="btn_refresh_status">
                                <i class="fa fa-refresh"></i> 刷新状态
                            </button>
                        </div>

                        <!-- 执行日志 -->
                        <div class="form-group">
                            <label class="control-label">执行日志</label>
                            <div id="output_log" class="well well-sm" style="height: 400px; overflow-y: auto;">
                                <div class="text-muted">等待执行...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧：状态信息 -->
            <div class="col-md-4">
                <!-- 统计信息 -->
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <h3 class="panel-title"><i class="fa fa-bar-chart"></i> 统计信息</h3>
                    </div>
                    <div class="panel-body">
                        <table class="table table-condensed">
                            <tr>
                                <td><i class="fa fa-file-code-o"></i> Schema 文件</td>
                                <td id="stat_schema" class="text-right">-</td>
                            </tr>
                            <tr>
                                <td><i class="fa fa-file-text-o"></i> 日志记录</td>
                                <td id="stat_versions" class="text-right">-</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Schema 信息 -->
                <div id="schema_info_panel" class="panel panel-success" style="display:none;">
                    <div class="panel-heading">
                        <h3 class="panel-title"><i class="fa fa-info-circle"></i> Schema 信息</h3>
                    </div>
                    <div class="panel-body">
                        <p><strong>版本：</strong><span id="schema_version">-</span></p>
                        <p><strong>生成时间：</strong><span id="schema_generated">-</span></p>
                        <p><strong>表数量：</strong><span id="schema_tables">-</span></p>
                    </div>
                </div>

                <!-- 待删除字段和表列表 -->
                <div id="pending_deletions_panel" class="panel panel-warning" style="display:none;">
                    <div class="panel-heading">
                        <h3 class="panel-title"><i class="fa fa-exclamation-triangle"></i> 待删除项</h3>
                    </div>
                    <div class="panel-body">
                        <p class="text-muted small">以下字段/表在数据库中存在，但 schema.json 中已删除，需要手动处理：</p>
                        <div id="pending_deletions_list"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.bootcdn.net/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
    <script>
    (function() {
        var apiUrl = 'sync-ui.php';
        
        // 初始化
        $(function() {
            loadStatus();
            
            // 执行同步
            $('#btn_execute').on('click', function() {
                executeSync();
            });
            
            // 生成 Schema
            $('#btn_generate_schema').on('click', function() {
                generateSchema();
            });
        });
        
        // 加载状态
        function loadStatus() {
            $.ajax({
                url: apiUrl,
                type: 'POST',
                data: {action: 'get_status'},
                dataType: 'json',
                success: function(res) {
                    if (res.code === 1) {
                        var data = res.data;
                        
                        if (data.schema) {
                            $('#stat_schema').html('<span class="label label-success">存在</span>');
                            $('#schema_info_panel').show();
                            $('#schema_version').text(data.schema.version);
                            $('#schema_generated').text(data.schema.generated_at);
                            $('#schema_tables').text(data.schema.table_count);
                            
                            $('#schema_status').removeClass('alert-warning alert-danger').addClass('alert-success').show();
                            $('#schema_status_text').html('<strong>Schema 文件已就绪</strong> - 版本 ' + data.schema.version + '，包含 ' + data.schema.table_count + ' 个表');
                            
                            $('#btn_generate_schema').show().html('<i class="fa fa-magic"></i> 重新生成 Schema 文件');
                        } else {
                            $('#stat_schema').html('<span class="label label-danger">不存在</span>');
                            $('#schema_info_panel').hide();
                            
                            $('#schema_status').removeClass('alert-success alert-info').addClass('alert-warning').show();
                            $('#schema_status_text').html('<strong>Schema 文件不存在</strong> - 请先点击"生成 Schema 文件"按钮');
                            
                            $('#btn_generate_schema').show().html('<i class="fa fa-magic"></i> 生成 Schema 文件').addClass('btn-warning');
                        }
                        
                        $('#stat_versions').text(data.version_count);
                        
                        // 显示待删除字段和表列表
                        if (data.pending_deletions && data.pending_deletions.length > 0) {
                            var html = '<table class="table table-condensed table-hover">';
                            data.pending_deletions.forEach(function(item) {
                                var deletionType = item.deletion_type || 'column';
                                var rowId = deletionType === 'column' 
                                    ? (item.table + '.' + item.column)
                                    : item.table;
                                
                                html += '<tr data-deletion-type="' + escapeHtml(deletionType) + '" data-table="' + escapeHtml(item.table) + '" data-column="' + (item.column || '') + '" data-row-id="' + escapeHtml(rowId) + '">';
                                
                                if (deletionType === 'column') {
                                    // 字段类型
                                    html += '<td><i class="fa fa-columns"></i> <strong>' + escapeHtml(item.table) + '</strong><br><small class="text-muted">字段: ' + escapeHtml(item.column) + ' (' + escapeHtml(item.column_type || 'unknown') + ')</small></td>';
                                } else {
                                    // 表类型
                                    html += '<td><i class="fa fa-table"></i> <strong>表: ' + escapeHtml(item.table) + '</strong></td>';
                                }
                                
                                html += '<td class="text-right"><button class="btn btn-xs btn-success btn-mark-processed" data-deletion-type="' + escapeHtml(deletionType) + '" data-table="' + escapeHtml(item.table) + '" data-column="' + (item.column || '') + '"><i class="fa fa-check"></i> 已处理</button></td>';
                                html += '</tr>';
                            });
                            html += '</table>';
                            $('#pending_deletions_list').html(html);
                            $('#pending_deletions_panel').show();
                            
                            // 绑定"已处理"按钮事件
                            $('.btn-mark-processed').off('click').on('click', function() {
                                var deletionType = $(this).data('deletion-type') || 'column';
                                var table = $(this).data('table');
                                var column = $(this).data('column') || null;
                                markDeletionProcessed(deletionType, table, column, $(this).closest('tr'));
                            });
                        } else {
                            $('#pending_deletions_panel').hide();
                        }
                    }
                },
                error: function(xhr, status, error) {
                    console.error('加载状态失败:', error);
                }
            });
        }
        
        // 标记字段/表为已处理
        function markDeletionProcessed(deletionType, table, column, $row) {
            $.ajax({
                url: apiUrl,
                type: 'POST',
                data: {
                    action: 'mark_deletion_processed',
                    deletion_type: deletionType,
                    table: table,
                    column: column || ''
                },
                dataType: 'json',
                success: function(res) {
                    if (res.code === 1) {
                        $row.fadeOut(300, function() {
                            $(this).remove();
                            // 检查是否还有待删除项
                            if ($('#pending_deletions_list tr').length === 0) {
                                $('#pending_deletions_panel').fadeOut(300);
                            }
                        });
                    } else {
                        alert('标记失败: ' + (res.msg || '未知错误'));
                    }
                },
                error: function(xhr, status, error) {
                    alert('请求失败: ' + error);
                }
            });
        }
        
        // 执行同步
        function executeSync() {
            var dryRun = $('#dry_run').is(':checked') ? 1 : 0;
            
            if (!$('#schema_status').hasClass('alert-success')) {
                alert('请先生成 Schema 文件');
                return;
            }
            
            var btn = $('#btn_execute');
            btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> 执行中...');
            
            $('#output_log').html('<div class="text-info">开始执行同步...</div>');
            
            $.ajax({
                url: apiUrl,
                type: 'POST',
                data: {
                    action: 'execute',
                    mode: 'schema',
                    dry_run: dryRun
                },
                dataType: 'json',
                success: function(res) {
                    btn.prop('disabled', false).html('<i class="fa fa-play"></i> 执行同步');
                    
                    if (res.code === 1) {
                        var output = res.data.output || '';
                        var html = '<div class="text-success">执行完成！</div>\n';
                        html += '<div class="text-muted">命令: ' + (res.data.command || '') + '</div>\n';
                        html += '<hr style="border-color: #444;">\n';
                        
                        var lines = output.split('\n');
                        lines.forEach(function(line) {
                            if (line.trim() === '') return;
                            
                            var className = 'text-default';
                            if (line.indexOf('✓') !== -1 || line.indexOf('成功') !== -1) {
                                className = 'text-success';
                            } else if (line.indexOf('✗') !== -1 || line.indexOf('失败') !== -1 || line.indexOf('错误') !== -1) {
                                className = 'text-danger';
                            } else if (line.indexOf('⚠') !== -1 || line.indexOf('警告') !== -1) {
                                className = 'text-warning';
                            } else if (line.indexOf('SQL') !== -1 || line.indexOf('执行') !== -1) {
                                className = 'text-info';
                            }
                            
                            html += '<div class="' + className + '">' + escapeHtml(line) + '</div>\n';
                        });
                        
                        $('#output_log').html(html);
                        $('#output_log').scrollTop($('#output_log')[0].scrollHeight);
                        
                        setTimeout(function() {
                            loadStatus();
                        }, 1000);
                        
                        alert('执行完成');
                    } else {
                        $('#output_log').html('<div class="text-danger">执行失败: ' + (res.msg || '未知错误') + '</div>');
                        alert('执行失败: ' + res.msg);
                    }
                },
                error: function(xhr, status, error) {
                    btn.prop('disabled', false).html('<i class="fa fa-play"></i> 执行同步');
                    $('#output_log').html('<div class="text-danger">请求失败: ' + error + '</div>');
                    alert('请求失败: ' + error);
                }
            });
        }
        
        // 生成 Schema
        function generateSchema() {
            var btn = $('#btn_generate_schema');
            btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> 生成中...');
            
            $('#output_log').html('<div class="text-info">开始生成 Schema 文件...</div>');
            
            $.ajax({
                url: apiUrl,
                type: 'POST',
                data: {action: 'generate_schema'},
                dataType: 'json',
                success: function(res) {
                    btn.prop('disabled', false).html('<i class="fa fa-magic"></i> 生成 Schema 文件');
                    
                    if (res.code === 1) {
                        var output = res.data.output || '';
                        var html = '<div class="text-success">Schema 文件生成成功！</div>\n';
                        html += '<hr style="border-color: #444;">\n';
                        
                        var lines = output.split('\n');
                        lines.forEach(function(line) {
                            if (line.trim() === '') return;
                            var className = line.indexOf('✓') !== -1 ? 'text-success' : 'text-default';
                            html += '<div class="' + className + '">' + escapeHtml(line) + '</div>\n';
                        });
                        
                        $('#output_log').html(html);
                        $('#output_log').scrollTop($('#output_log')[0].scrollHeight);
                        
                        setTimeout(function() {
                            loadStatus();
                        }, 1000);
                        
                        alert('生成成功');
                    } else {
                        $('#output_log').html('<div class="text-danger">生成失败: ' + (res.msg || '未知错误') + '</div>');
                        alert('生成失败: ' + res.msg);
                    }
                },
                error: function(xhr, status, error) {
                    btn.prop('disabled', false).html('<i class="fa fa-magic"></i> 生成 Schema 文件');
                    $('#output_log').html('<div class="text-danger">请求失败: ' + error + '</div>');
                    alert('请求失败: ' + error);
                }
            });
        }
        
        // HTML 转义
        function escapeHtml(text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }
    })();
    </script>
</body>
</html>

