#!/bin/bash

# FastAdmin Docker 环境启动脚本

echo "=========================================="
echo "FastAdmin Docker 环境启动脚本"
echo "=========================================="

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "正在创建 .env 文件..."
    cp env.docker.example .env
    echo ".env 文件已创建，请根据需要修改配置"
fi

# 构建并启动容器
echo "正在构建并启动 Docker 容器..."
docker-compose up -d --build

# 等待 MySQL 就绪
echo "等待 MySQL 服务就绪..."
sleep 10

# 检查容器状态
echo ""
echo "容器状态："
docker-compose ps

# 安装 Composer 依赖
echo ""
echo "正在安装 Composer 依赖..."
docker-compose exec -T php composer install --no-interaction

# 设置目录权限
echo ""
echo "正在设置目录权限..."
docker-compose exec php chown -R www-data:www-data /var/www/html/runtime 2>/dev/null || true
docker-compose exec php chmod -R 755 /var/www/html/runtime 2>/dev/null || true

echo ""
echo "=========================================="
echo "启动完成！"
echo "=========================================="
echo "前台访问: http://localhost:8080"
echo "后台访问: http://localhost:8080/admin.php"
echo "安装页面: http://localhost:8080/install.php"
echo ""
echo "数据库连接信息："
echo "  主机: mysql (容器内) 或 127.0.0.1 (宿主机)"
echo "  端口: 3306"
echo "  数据库: fastadmin"
echo "  用户名: fastadmin"
echo "  密码: fastadmin123"
echo "=========================================="

