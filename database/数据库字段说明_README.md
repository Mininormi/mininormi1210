# FastAdmin 数据库字段命名规范

> **重要提示**：在编写 `schema.json` 创建数据库表时，请严格遵循本文档的命名规范。这些规范将确保使用 `php think crud -t 表名` 生成 CRUD 时能够自动生成对应的控制器、模型、视图、JS 等。

---

## 目录

1. [字段类型规则](#字段类型规则)
2. [特殊字段规则](#特殊字段规则)
3. [特殊字符结尾规则](#特殊字符结尾规则)
4. [注释说明规则](#注释说明规则)
5. [常见问题](#常见问题)
6. [示例](#示例)

---

## 字段类型规则

根据字段类型，FastAdmin 会自动生成对应的表单组件：

| 类型 | 备注 | 类型说明 | 生成的组件 |
|------|------|----------|-----------|
| `int` | 整型 | 整数类型 | 自动生成 `type="number"` 的文本框，步长为 1 |
| `enum` | 枚举型 | 枚举类型 | 自动生成单选下拉列表框 |
| `set` | set型 | SET 类型 | 自动生成多选下拉列表框 |
| `float` | 浮点型 | 浮点数类型 | 自动生成 `type="number"` 的文本框，步长根据小数点位数生成 |
| `text` | 文本型 | 文本类型 | 自动生成 `textarea` 文本框 |
| `datetime` | 日期时间 | 日期时间类型 | 自动生成日期时间的组件 |
| `date` | 日期型 | 日期类型 | 自动生成日期型的组件 |
| `timestamp` | 时间戳 | 时间戳类型 | 自动生成日期时间的组件 |
| `varchar` | 字符串 | 字符串类型 | 当字符串长度定义大于等于 255 时，将自动在列表启用 `autocontent`（仅支持 FastAdmin 1.4.0+） |

---

## 特殊字段规则

以下字段名具有特殊含义，FastAdmin 会自动识别并生成对应的组件：

| 字段名 | 字段类型 | 字段说明 | 生成的组件 |
|--------|----------|----------|-----------|
| `user_id` | `int` | 会员ID | 生成选择会员的 SelectPage 组件，**单选** |
| `user_ids` | `varchar` | 会员ID集合 | 生成选择会员的 SelectPage 组件，**多选** |
| `admin_id` | `int` | 管理员ID | 生成选择管理员的 SelectPage 组件 |
| `admin_ids` | `varchar` | 管理员ID集合 | 生成选择管理员的 SelectPage 组件，**多选** |
| `category_id` | `int` | 分类ID | 生成选择分类的下拉框，分类类型根据去掉前缀的表名，**单选** |
| `category_ids` | `varchar` | 分类ID集合 | 生成选择分类的下拉框，分类类型根据去掉前缀的表名，**多选** |
| `weigh` | `int` | 权重 | 后台的排序字段，如果存在该字段将出现排序按钮，可上下拖动进行排序 |
| `createtime` | `bigint` / `datetime` | 创建时间 | 记录添加时间字段，不需要手动维护 |
| `updatetime` | `bigint` / `datetime` | 更新时间 | 记录更新时间的字段，不需要手动维护 |
| `deletetime` | `bigint` / `datetime` | 删除时间 | 记录删除时间的字段，不需要手动维护。如果存在此字段将会生成回收站功能，**字段默认值务必为 null** |
| `status` | `enum` | 状态字段 | 列表筛选字段，如果存在此字段将启用 TAB 选项卡展示列表 |

---

## 特殊字符结尾规则

字段名以特定字符结尾时，FastAdmin 会自动识别并生成对应的组件：

### 时间相关

| 结尾字符 | 示例 | 类型要求 | 字段说明 | 生成的组件 |
|---------|------|----------|----------|-----------|
| `time` | `refreshtime` | `bigint` / `datetime` | 识别为日期时间型数据 | 自动创建选择时间的组件 |

### 文件相关

| 结尾字符 | 示例 | 类型要求 | 字段说明 | 生成的组件 |
|---------|------|----------|----------|-----------|
| `image` | `smallimage` | `varchar` | 识别为图片文件 | 自动生成可上传图片的组件，**单图** |
| `images` | `smallimages` | `varchar` | 识别为图片文件 | 自动生成可上传图片的组件，**多图** |
| `file` | `attachfile` | `varchar` | 识别为普通文件 | 自动生成可上传文件的组件，**单文件** |
| `files` | `attachfiles` | `varchar` | 识别为普通文件 | 自动生成可上传文件的组件，**多文件** |
| `avatar` | `miniavatar` | `varchar` | 识别为头像 | 自动生成可上传图片的组件，**单图** |
| `avatars` | `miniavatars` | `varchar` | 识别为头像 | 自动生成可上传图片的组件，**多图** |

### 内容相关

| 结尾字符 | 示例 | 类型要求 | 字段说明 | 生成的组件 |
|---------|------|----------|----------|-----------|
| `content` | `maincontent` | `text` / `mediumtext` / `longtext` | 识别为内容 | 自动生成富文本编辑器（需安装富文本插件） |

### 关联字段

| 结尾字符 | 示例 | 类型要求 | 字段说明 | 生成的组件 |
|---------|------|----------|----------|-----------|
| `_id` | `user_id` | `int` / `varchar` | 识别为关联字段 | 自动生成可自动完成的文本框，**单选** |
| `_ids` | `user_ids` | `varchar` | 识别为关联字段 | 自动生成可自动完成的文本框，**多选** |

### 列表和选项

| 结尾字符 | 示例 | 类型要求 | 字段说明 | 生成的组件 |
|---------|------|----------|----------|-----------|
| `list` | `timelist` | `enum` | 识别为列表字段 | 自动生成单选下拉列表 |
| `list` | `timelist` | `set` | 识别为列表字段 | 自动生成多选下拉列表 |
| `data` | `hobbydata` | `enum` | 识别为选项字段 | 自动生成单选框 |
| `data` | `hobbydata` | `set` | 识别为选项字段 | 自动生成复选框 |

**⚠️ 重要提示**：以 `list` 或 `data` 结尾的字段**必须搭配 `enum` 或 `set` 类型**才起作用。

### 其他特殊组件

| 结尾字符 | 示例 | 类型要求 | 字段说明 | 生成的组件 | 版本要求 |
|---------|------|----------|----------|-----------|---------|
| `json` | `configjson` | `varchar` | 识别为键值组件 | 自动生成键值录入组件 | FastAdmin 1.2.0+ |
| `switch` | `siteswitch` | `tinyint` | 识别为开关字段 | 自动生成开关组件，默认值 1 为开，0 为关 | FastAdmin 1.2.0+ |
| `range` | `daterange` | `varchar` | 识别为时间区间组件 | 自动生成时间区间组件 | FastAdmin 1.3.0+ |
| `tag` | `articletag` | `varchar` | 识别为 Tagsinput | 自动生成标签输入组件 | FastAdmin 1.3.0+ |
| `tags` | `articletags` | `varchar` | 识别为 Tagsinput | 自动生成标签输入组件 | FastAdmin 1.3.0+ |

**⚠️ 重要提示**：
- 如果为多图或多列表字段，请务必确保字段长度足够
- `switch` 类型字段：默认值 `1` 为开，`0` 为关

---

## 注释说明规则

字段注释的格式会影响生成的组件和语言包：

### 1. 普通注释

```
字段名: 注释内容
```

**示例**：
- `status: 状态` → 将生成普通语言包和普通文本框

### 2. 枚举类型注释（带选项值）

```
字段名: 注释内容
```

字段类型为 `enum('0','1','2')` → 将生成普通语言包和单选下拉列表，同时生成 TAB 选项卡

### 3. 枚举类型注释（带选项值和说明）

```
字段名: 注释内容:0=选项1说明,1=选项2说明,2=选项3说明
```

**示例**：
- `status: 状态:0=隐藏,1=正常,2=推荐` → 将生成多个语言包和单选下拉列表，同时生成 TAB 选项卡，且列表中的值显示为对应的文字

**格式说明**：
- 使用冒号 `:` 分隔字段说明和选项值
- 使用等号 `=` 分隔选项值和说明文字
- 使用逗号 `,` 分隔多个选项

---

## 常见问题

### 1. 修改表结构后需要重新生成 CRUD

**问题**：如果使用 `php think crud` 生成过表的 CRUD，当修改了表结构类型或新增了字段时，只有重新生成 CRUD 或自己手动修改视图文件和 JS 文件。

**解决方法**：
- 重新运行 `php think crud -t 表名` 生成 CRUD
- 或手动修改对应的视图文件和 JS 文件

### 2. 关联模型规范

**建议**：如果你的表需要生成关联模型，建议在设计表时遵循以下规范：

- `category_id` 字段关联对应 `fa_category` 表主键
- `company_info_id` 关联对应 `fa_company_info` 表主键
- 字段名格式：`关联表名（去掉前缀）_id`

### 3. 关联数据列表无法显示

**问题**：如果字段名为 `user_id`，生成的动态下拉列表会自动匹配 `user/index` 这个控制器方法。如果发现 CRUD 后无法显示关联数据列表，请检查视图中元素 `data-source` 的值是否正确。

**解决方法**：
- 检查控制器方法是否存在
- 检查视图文件中 `data-source` 属性值是否正确

### 4. 必填字段验证

**规则**：当设定数据库字段不能为 NULL 时，表单会自动追加必选 `required` 验证。

---

## 示例

### 示例 1：基础表结构

```json
{
  "fa_example": {
    "id": {
      "type": "int",
      "primary": true,
      "auto_increment": true,
      "comment": "ID"
    },
    "title": {
      "type": "varchar",
      "length": 255,
      "nullable": false,
      "comment": "标题"
    },
    "content": {
      "type": "text",
      "nullable": true,
      "comment": "内容"
    },
    "status": {
      "type": "enum",
      "values": ["0", "1", "2"],
      "default": "1",
      "nullable": false,
      "comment": "状态:0=隐藏,1=正常,2=推荐"
    },
    "createtime": {
      "type": "bigint",
      "nullable": true,
      "comment": "创建时间"
    },
    "updatetime": {
      "type": "bigint",
      "nullable": true,
      "comment": "更新时间"
    }
  }
}
```

### 示例 2：带关联字段的表

```json
{
  "fa_article": {
    "id": {
      "type": "int",
      "primary": true,
      "auto_increment": true,
      "comment": "ID"
    },
    "category_id": {
      "type": "int",
      "nullable": false,
      "comment": "分类ID"
    },
    "user_id": {
      "type": "int",
      "nullable": false,
      "comment": "会员ID"
    },
    "title": {
      "type": "varchar",
      "length": 255,
      "nullable": false,
      "comment": "标题"
    },
    "image": {
      "type": "varchar",
      "length": 255,
      "nullable": true,
      "comment": "封面图"
    },
    "weigh": {
      "type": "int",
      "default": 0,
      "nullable": false,
      "comment": "权重"
    },
    "status": {
      "type": "enum",
      "values": ["0", "1"],
      "default": "1",
      "nullable": false,
      "comment": "状态:0=隐藏,1=正常"
    },
    "createtime": {
      "type": "bigint",
      "nullable": true,
      "comment": "创建时间"
    },
    "updatetime": {
      "type": "bigint",
      "nullable": true,
      "comment": "更新时间"
    }
  }
}
```

### 示例 3：带文件上传的表

```json
{
  "fa_product": {
    "id": {
      "type": "int",
      "primary": true,
      "auto_increment": true,
      "comment": "ID"
    },
    "name": {
      "type": "varchar",
      "length": 255,
      "nullable": false,
      "comment": "产品名称"
    },
    "images": {
      "type": "varchar",
      "length": 2000,
      "nullable": true,
      "comment": "产品图片"
    },
    "attachfile": {
      "type": "varchar",
      "length": 255,
      "nullable": true,
      "comment": "附件文件"
    },
    "avatar": {
      "type": "varchar",
      "length": 255,
      "nullable": true,
      "comment": "头像"
    }
  }
}
```

### 示例 4：带开关和 JSON 字段的表

```json
{
  "fa_config": {
    "id": {
      "type": "int",
      "primary": true,
      "auto_increment": true,
      "comment": "ID"
    },
    "name": {
      "type": "varchar",
      "length": 100,
      "nullable": false,
      "comment": "配置名称"
    },
    "value": {
      "type": "text",
      "nullable": true,
      "comment": "配置值"
    },
    "siteswitch": {
      "type": "tinyint",
      "default": 1,
      "nullable": false,
      "comment": "站点开关"
    },
    "configjson": {
      "type": "varchar",
      "length": 2000,
      "nullable": true,
      "comment": "配置JSON"
    }
  }
}
```

---

## 最佳实践

1. **字段命名**：
   - 使用小写字母和下划线
   - 遵循 FastAdmin 的命名规范
   - 关联字段使用 `表名_id` 格式

2. **字段类型选择**：
   - 时间字段使用 `bigint`（时间戳）或 `datetime`
   - 状态字段使用 `enum` 类型
   - 文本内容使用 `text` 或 `varchar`（根据长度）

3. **注释规范**：
   - 枚举类型字段使用 `字段名:说明:0=选项1,1=选项2` 格式
   - 确保注释清晰明了

4. **默认值设置**：
   - `status` 字段默认值通常为 `'1'`（正常）
   - `switch` 类型字段默认值为 `1`（开）或 `0`（关）
   - `deletetime` 字段默认值必须为 `null`

5. **字段长度**：
   - 多图或多文件字段确保长度足够（建议 2000+）
   - JSON 字段建议使用 `varchar(2000)` 或 `text`

---

**文档版本**：v1.0  
**最后更新**：2025-12-26  
**适用工具**：`sync-ui.php` / `php think crud`
