# 数据库版本管理系统

## 📖 简介

这是一个基于 Schema 热更新的数据库结构同步系统。通过维护统一的 `schema.json` 文件来管理所有 `mini_` 前缀表的结构，实现声明式的数据库同步。

### 表前缀说明

- **`mini_` 前缀**：由 sync 工具生成和维护的项目自定义表
- **`fa_` 前缀**：FastAdmin 原生表，不应通过 sync 工具修改

## 🚀 快速开始

### 1. 生成 Schema 文件

首次使用前，需要从现有数据库生成初始 schema.json：

**方式 1：使用 Web UI（推荐）**
1. 访问：`http://localhost:8082/sync-ui.php`
2. 点击"生成 Schema 文件"按钮

**方式 2：使用命令行**

```bash
# Docker 环境
docker compose exec -T php php /var/www/database/generate-schema.php

# 本地环境
php database/generate-schema.php
```

这会将数据库中所有 `mini_` 前缀表的结构导出到 `database/schema.json`。

### 2. 同步数据库

**方式 1：使用 Web UI（推荐）**

1. 访问：`http://localhost:8082/sync-ui.php`
2. 编辑 `database/schema.json` 文件
3. 勾选"预览模式"查看 SQL
4. 确认无误后，取消预览模式，点击"执行同步"

**方式 2：使用命令行**

```bash
# Docker 环境
docker compose exec -T php php /var/www/database/sync.php --dry-run  # 预览
docker compose exec -T php php /var/www/database/sync.php            # 执行

# 本地环境
php database/sync.php --dry-run  # 预览
php database/sync.php            # 执行
```

## 📁 目录结构

```
database/
├── sync.php                    # 同步脚本（主程序）
├── sync-ui.php                 # Web UI 界面
├── generate-schema.php          # Schema 生成工具
├── schema.json                 # Schema 定义文件
├── SchemaParser.php            # Schema 解析器
├── DatabaseInspector.php       # 数据库结构提取器
├── DiffGenerator.php           # 差异检测和 SQL 生成器
└── README.md                   # 本文件
```

## ✍️ 如何修改数据库结构

### 工作流程

1. **编辑 schema.json**：修改表结构定义（添加/修改/删除字段、索引等）

2. **预览变更**：
   - Web UI：勾选"预览模式"，点击"执行同步"
   - 命令行：`php database/sync.php --dry-run`

3. **执行同步**：
   - Web UI：取消预览模式，点击"执行同步"
   - 命令行：`php database/sync.php`

4. **提交到 Git**：
   ```bash
   git add database/schema.json
   git commit -m "更新表结构"
   ```

## 📝 Schema 文件格式

`schema.json` 文件格式如下：

```json
{
  "version": "1.0.0",
  "generated_at": "2025-01-XX",
  "tables": {
    "mini_brand": {
      "columns": {
        "id": {
          "type": "int(11)",
          "null": false,
          "auto_increment": true,
          "comment": "ID"
        },
        "name": {
          "type": "varchar(100)",
          "null": false,
          "comment": "品牌名称"
        }
      },
      "primary_key": ["id"],
      "indexes": {
        "slug": ["slug"],
        "status": ["status"]
      },
      "engine": "InnoDB",
      "charset": "utf8mb4",
      "comment": "品牌表"
    }
  }
}
```

### 字段定义说明

- `type`: 字段类型，如 `int(11)`, `varchar(100)`, `text` 等
- `null`: 是否允许 NULL，`true` 或 `false`
- `default`: 默认值（可选），字符串、数字或 `null`
- `auto_increment`: 是否自增，`true` 或 `false`（可选）
- `comment`: 字段注释（可选）

### 索引定义说明

- 普通索引：`"index_name": ["column1", "column2"]`
- 唯一索引：`"index_name": {"columns": ["column1"], "unique": true}`

## 🔍 查看状态

### 使用 Web UI

访问 `http://localhost:8082/sync-ui.php`，右侧面板会显示：
- Schema 文件状态
- Schema 信息（版本、生成时间、表数量）
- 表版本记录

### 使用命令行

```bash
# 查看日志文件（按版本和日期）
ls -la database/logs/*/
cat database/logs/1.0.2/12-13.log
```

## 🔄 工作流程

### 日常开发流程

1. **需要修改表结构时**：
   - 编辑 `database/schema.json`
   - 在 Web UI 中预览并执行同步
   - 提交 schema.json 到 Git

2. **团队协作时**：
   - 拉取最新代码（包含更新的 schema.json）
   - 在 Web UI 中点击"执行同步"
   - 系统会自动检测差异并同步数据库结构

## ⚠️ 注意事项

1. ✅ **Schema 文件需要手动维护**：每次修改表结构后，需要手动更新 `schema.json`

2. ⚠️ **删除字段/表**：系统不会自动删除字段或表，需要手动处理：
   - 先备份数据
   - 手动执行 `ALTER TABLE ... DROP COLUMN` 或 `DROP TABLE`
   - 更新 schema.json（移除该字段/表定义）

3. ✅ **版本控制**：建议将 `schema.json` 纳入 Git 版本控制

4. ⚠️ **生产环境**：此工具仅用于开发环境，生产环境请勿使用

5. ⚠️ **数据迁移**：字段类型变更、删除字段等操作可能需要数据迁移，请谨慎处理

## 📚 文档索引

### 🚀 快速开始
- **`QUICK_START.md`** - ⚡ 5分钟快速上手指南
- **`DEPLOYMENT_CHECKLIST.md`** - ✅ 部署检查清单

### 📖 详细文档
- **`DEPLOYMENT_GUIDE.md`** - 🆕 **部署指南**：如何在新项目中部署和使用此工具（Docker 环境配置）
- **`USAGE_GUIDE.md`** - Schema 修改详细使用指南
- **`ACCESS_GUIDE.md`** - Web UI 访问配置指南
- **`SCHEMA_SYNC_README.md`** - 技术实现细节文档

## 🚀 在新项目中使用

### 快速部署（3步）

1. **复制工具文件**
   ```bash
   cp -r old-project/database new-project/database
   cd new-project/database
   rm -f schema.json pending_deletions.json processed_deletions.json
   rm -rf logs/*
   ```

2. **配置 Docker**
   ```yaml
   # docker-compose.yml
   services:
     php:
       volumes:
         - ./database:/var/www/database
       ports:
         - "8082:8082"
   ```

3. **生成初始 Schema**
   ```bash
   docker-compose exec php php /var/www/database/generate-schema.php
   ```

**详细步骤请查看：`DEPLOYMENT_GUIDE.md`**

## 📞 遇到问题？

1. 检查 `schema.json` 格式是否正确（JSON 语法）
2. 检查表名、字段名是否正确（注意表前缀 `mini_`）
3. 查看错误信息，根据提示修复
4. 使用预览模式先查看 SQL，确认无误后再执行
5. 查看日志文件：`database/logs/{version}/MM-DD.log`
6. 参考相关文档获取详细帮助
