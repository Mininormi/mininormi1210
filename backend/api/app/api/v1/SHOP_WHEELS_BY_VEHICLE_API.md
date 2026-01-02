# 轮毂商品按车辆匹配 API 文档

## 端点

**GET** `/api/v1/shop/wheels/by-vehicle`

## 功能说明

根据车辆ID获取匹配的轮毂商品，使用**路线A（数值匹配）**：
- 从 `mini_vehicle_detail` 获取车辆的 `bolt_pattern_front/rear`
- 解析 bolt pattern 为 `(lugs, mm)` 数值对
- 使用 `pcd_lugs` 和 `pcd_mm` 精确匹配 `mini_wheel_product_spec`
- 返回匹配的商品列表（包含规格）

## 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `vehicle_id` | string | 是 | 车辆ID（vehicle_id） |
| `axle` | string | 否 | 匹配轴：`front`=前轮, `rear`=后轮, `both`=前后轮都匹配（默认：`both`） |
| `diameter` | int | 否 | 轮毂直径（英寸，可选过滤，如：18）范围：10-30 |
| `brand_id` | int | 否 | 品牌ID（可选过滤） |
| `page` | int | 否 | 页码（默认：1） |
| `page_size` | int | 否 | 每页数量（默认：20，最大：100） |

## 响应格式

```json
{
  "items": [
    {
      "product_id": 1,
      "name": "TC105风格轮毂",
      "brand_id": 4,
      "brand_name": null,
      "image": "https://...",
      "sale_price": null,
      "original_price": null,
      "price_per": null,
      "stock": 0,
      "status": "normal",
      "specs": [
        {
          "spec_id": 1,
          "size": "15×6.5 ET40",
          "diameter": "15",
          "width": "6.5",
          "pcd": "4×100",
          "offset": "40",
          "center_bore": "73.1",
          "price": 190.0,
          "original_price": 380.0,
          "stock": 100
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

## 使用示例

### 示例1：根据车辆ID获取匹配的轮毂（前后轮都匹配）

```bash
GET /api/v1/shop/wheels/by-vehicle?vehicle_id=10000&axle=both
```

### 示例2：只匹配前轮

```bash
GET /api/v1/shop/wheels/by-vehicle?vehicle_id=10000&axle=front
```

### 示例3：匹配前轮，并过滤直径和品牌

```bash
GET /api/v1/shop/wheels/by-vehicle?vehicle_id=10000&axle=front&diameter=18&brand_id=4
```

### 示例4：分页查询

```bash
GET /api/v1/shop/wheels/by-vehicle?vehicle_id=10000&page=1&page_size=10
```

## 技术实现细节

### Bolt Pattern 解析

使用 `parse_bolt_pattern()` 函数解析 bolt pattern 字符串：

- **输入格式**：`"5x120.65"`, `"4x100"`, `"6x139.7"` 等
- **标准化**：统一 `×/X` -> `x`，去除空格，转小写
- **输出**：`(lugs: int, mm: Decimal)` 数值对
- **精度保证**：使用 `Decimal` 类型避免浮点数误差

### 匹配逻辑

1. **获取车辆数据**：从 `mini_vehicle_detail` 查询 `vehicle_id`
2. **解析 Bolt Pattern**：
   - 根据 `axle` 参数选择 `bolt_pattern_front` 或 `bolt_pattern_rear`
   - 解析为 `(lugs, mm)` 数值对
   - 如果 `axle=both`，会同时匹配前后轴（去重）
3. **数值匹配**：
   ```sql
   WHERE pcd_lugs = {lugs} AND pcd_mm = {mm}
   ```
   使用 `OR` 组合多个 bolt pattern（如果前后轴不同）
4. **商品查询**：
   - 先查询匹配的规格，获取 `product_id` 列表
   - 再查询商品信息（支持品牌、状态过滤）
   - 最后查询每个商品的匹配规格

### 数据库字段

- **车辆表**：`mini_vehicle_detail`
  - `bolt_pattern_front`: `varchar(50)` - 前轮螺栓孔距（如：`"5x120.65"`）
  - `bolt_pattern_rear`: `varchar(50)` - 后轮螺栓孔距（如：`"5x120.65"`）

- **规格表**：`mini_wheel_product_spec`
  - `pcd_lugs`: `tinyint` - PCD螺栓数量（如：`5`）
  - `pcd_mm`: `decimal(6,3)` - PCD直径（毫米，如：`120.650`）
  - `pcd`: `varchar(50)` - PCD字符串（如：`"5×114.3"`，用于展示）

## 错误处理

- **404 Not Found**：车辆ID不存在
- **400 Bad Request**：参数验证失败（如 `axle` 值不正确）

## 注意事项

1. **精度要求**：`pcd_mm` 字段已升级为 `decimal(6,3)`，支持 `120.65` 这种两位小数的 PCD
2. **性能优化**：建议在 `mini_wheel_product_spec` 表上创建联合索引：
   ```sql
   CREATE INDEX idx_pcd_match ON mini_wheel_product_spec(pcd_lugs, pcd_mm, status);
   ```
3. **数据完整性**：确保 `mini_wheel_product_spec` 表中的 `pcd_lugs` 和 `pcd_mm` 字段已正确填充（从 `pcd` 字段解析）

## 相关 API

- `GET /api/v1/vehicles/fitment?vehicle_id=...` - 获取车辆适配参数
- `GET /api/v1/shop/wheels?...` - 通用轮毂商品列表（使用字符串匹配，已废弃）

## 更新日期

2025-12-19

