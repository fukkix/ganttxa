#!/bin/bash

# GanttXa 部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署 GanttXa..."
echo ""

# 检查是否在正确的目录
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env.prod" ]; then
    echo "❌ 错误: .env.prod 文件不存在"
    echo "请复制 .env.prod.example 为 .env.prod 并配置"
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main
echo "✅ 代码更新完成"
echo ""

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker-compose -f docker-compose.prod.yml build --no-cache
echo "✅ 镜像构建完成"
echo ""

# 停止旧服务
echo "🛑 停止旧服务..."
docker-compose -f docker-compose.prod.yml down
echo "✅ 旧服务已停止"
echo ""

# 启动新服务
echo "▶️  启动新服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
echo "✅ 新服务已启动"
echo ""

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps
echo ""

# 检查健康状态
echo "🏥 检查服务健康状态..."
echo "后端健康检查..."
curl -f http://localhost:3000/ || echo "⚠️  后端可能未就绪"
echo ""
echo "前端健康检查..."
curl -f http://localhost:8080/health || echo "⚠️  前端可能未就绪"
echo ""

# 显示日志
echo "📝 最近的日志:"
docker-compose -f docker-compose.prod.yml logs --tail=20
echo ""

echo "🎉 部署完成！"
echo ""
echo "访问地址:"
echo "  前端: http://localhost:8080"
echo "  后端: http://localhost:3000"
echo ""
echo "查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "停止服务: docker-compose -f docker-compose.prod.yml down"
