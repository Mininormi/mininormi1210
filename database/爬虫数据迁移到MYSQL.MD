0. 背景目标（你要解决的核心问题）1
源数据在 canada_wheels.db（SQLite），车辆数据主要来自 4 张表：
years
makes
models
vehicle_details（核心：约 159,112 行）
需求是 1:1 原样迁移到 MySQL：
不做任何去重 / 合并 / 清洗（尤其是 vehicle_details 一辆车也不能少）
保留源库关键标识：
years.id 保留
vehicle_details.vehicle_id 保留（作为 MySQL 主键/唯一键）
同时补充 MySQL 常用字段：createtime、updatetime（Unix timestamp）
1. 数据模型设计（为什么要这样建表）
1.1 Year-scoped 的关键事实
源库的 makes 和 models 不是“全局唯一”的概念，而是“按年份分组（year-scoped）”：
makes：UNIQUE(year_id, make_id)
models：UNIQUE(year_id, make_id, model_id)
也就是说：
同一个 make_id 在不同 year_id 下可能代表不同集合（不能用单列 id 逻辑去理解）
同一个 model_id 也必须放在 (year_id, make_id) 语境下才有意义
因此 MySQL 表必须按这个唯一性建模，最稳的是 复合主键。
1.2 MySQL 侧目标表（raw 表）
你现在的 schema 设计（在 database/schema.json）对应四张表：
mini_vehicle_year
id（PK，源库 years.id）
year
createtime, updatetime
mini_vehicle_make
year_id
make_id
make_name
createtime, updatetime
PK(year_id, make_id)
mini_vehicle_model
year_id
make_id
model_id
model_name
createtime, updatetime
PK(year_id, make_id, model_id)
mini_vehicle_detail
vehicle_id（PK，源库 vehicle_details.vehicle_id）
year_id, make_id, model_id
vehicle_name
fitment 字段（bolt_pattern / hub_bore / offsets / rim & tire sizes 等）
createtime, updatetime
索引：
idx_detail_lookup(year_id, make_id, model_id)（支撑 by-vehicle 级联筛选）
其它辅助索引（year_id/make_id/model_id）
> 注：为了保持 schema 简洁、避免复合外键复杂度，当前不强制 MySQL 外键约束（靠 ETL 顺序 & 数据一致性保证）。但注释里明确了逻辑引用关系。
2. 工具总体流程（ETL 主链路）
迁移工具目录：database/etl_canada_wheels_raw/
核心文件：
main.py：入口/编排
extract.py：从 SQLite 原样读取
load.py：写入 MySQL（TRUNCATE + 批量插入）
verify_data.py：对比 SQLite 与 MySQL 计数与关键 ID
2.1 执行顺序（非常关键）
Extract 全量 → Truncate → Load（按依赖顺序）→ Verify
Extract：
years → makes → models → vehicle_details
Truncate（清表顺序要反过来，先清依赖者）：
mini_vehicle_detail
mini_vehicle_model
mini_vehicle_make
mini_vehicle_year
Load（导入顺序要按依赖顺序）：
mini_vehicle_year
mini_vehicle_make
mini_vehicle_model
mini_vehicle_detail（批量分段 insert）
3. Extract 过程（SQLite → 内存数据结构）
3.1 读取策略
使用 sqlite3.connect() + row_factory = sqlite3.Row，把每一行转成 dict
不做任何去重、合并、clean
使用 ORDER BY 保证结果稳定（便于调试/验证）
3.2 提取 SQL（关键点）
years：
SELECT id, year FROM years ORDER BY id;
makes（year-scoped）：
SELECT year_id, make_id, make_name FROM makes ORDER BY year_id, make_id;
models（year+make scoped）：
SELECT year_id, make_id, model_id, model_name FROM models ORDER BY year_id, make_id, model_id;
vehicle_details（核心 159,112 行）：
SELECT vehicle_id, year_id, make_id, model_id, vehicle_name,       bolt_pattern_front, bolt_pattern_rear,       hub_bore_front, hub_bore_rear,       min_offset_front, min_offset_rear,       max_offset_front, max_offset_rear,       oem_offset_front, oem_offset_rear,       rim_diameter_front, rim_diameter_rear,       rim_width_front, rim_width_rear,       wheel_size_front, wheel_size_rear,       tire_size_front, tire_size_rearFROM vehicle_detailsORDER BY vehicle_id;
4. Load 过程（MySQL 写入策略）
4.1 连接与事务
使用 pymysql.connect(autocommit=False)，每个表/每个 batch 手动 commit
任何异常 rollback，保证不会出现“写一半”的破坏状态
4.2 replace 策略
你选择的是 replace，所以每次跑都会：
TRUNCATE TABLE ... 清空旧数据
再全量导入一遍
4.3 createtime / updatetime
统一用 now = int(datetime.now().timestamp()) 写入
years/makes/models/vehicle_details 都写同一批次时间（便于一致性）
4.4 批量插入（性能关键）
years/makes/models：cursor.executemany(sql, values) 一次性批量
vehicle_details：行数太大，必须分批（默认 batch_size=5000）：
for 循环切片
每批 executemany + commit
打印累计进度（便于长时间导入时确定没卡住）
5. Verify 过程（保证“真 1:1”）
目标：验证迁移结果是否正确、是否丢行。
5.1 行数验证
years：SQLite count == MySQL count
makes：SQLite count == MySQL count（不再 distinct）
models：SQLite count == MySQL count（不再 distinct）
vehicle_details：SQLite count == MySQL count == 159112（硬指标）
5.2 ID 保留验证（抽样）
years：对比前 5 个 id
vehicle_details：对比前 5 个 vehicle_id
> 这能快速确认“不是重新生成了 id / 不是写错列”。
6. 你现在这个工具为什么“可靠”（关键设计原则）
不做转换：最容易保证不丢车，不会出现“清洗导致车型缺失”
按源库唯一性建模：year-scoped makes/models 用复合主键表达，不会再出现“选 year 后 makes 空数组”这种结构性错误
replace + truncate：能反复重跑，调试成本低
批量导入：159k 行不会慢到不可用
verify_data：有明确的“成功标准”，不是凭感觉
7. 常见问题与排查清单（你做 prompt 也很需要）
7.1 makes/models 为空
99% 原因：MySQL 表结构仍然是旧版本（没有 year_id/make_id/model_id 复合结构）
解决：先跑 schema 同步，再跑 ETL
7.2 ETL 运行报表不存在
原因：没在 MySQL 建表
解决：先同步 database/schema.json
7.3 159112 不匹配
原因可能是：
SQLite 读取路径错了（读到别的 db 或空 db）
MySQL 写入中途异常导致没写完
vehicle_id 冲突（如果 schema 不对或残留旧表定义）
解决：
看 main.py 打印的源 db 路径是否正确
重跑：truncate 后全量导入
用 verify_data.py 定位是哪张表不一致
7.4 密码/连接失败
原因：环境变量/默认值不匹配 docker-compose
解决：用环境变量明确指定 DATABASE_*
8. 你要把它“迁回爬虫项目”时的最佳实践（可写进文档）
把 etl_canada_wheels_raw/ 整个目录当成一个独立工具
运行时：
参数传入 canada_wheels.db 的绝对路径
MySQL 连接用环境变量注入
输出（可选增强）：
保留进度打印
保留 verify 脚本作为 CI/检查步骤