#!/bin/bash

# GanttXa 一键部署脚本
# 使用方法: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}
echo "🚀 开始部署 GanttXa - 环境: $ENV"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查必需的命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ 错误: $1 未安装${NC}"
        exit 1
    fi
}

echo "📋 检查依赖..."
check_command docker
check_command docker-compose
check_command git

# 检查环境变量文件
if [ ! -f ".env.$ENV" ]; then
    echo -e "${RED}❌ 错误: .env.$ENV 文件不存在${NC}"
    echo "请先创建环境变量文件"
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose -f docker-compose.prod.yml --env-file .env.$ENV down

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker-compose -f docker-compose.prod.yml --env-file .env.$ENV build --no-cache

# 启动服务
echo "🚀 启动服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.$ENV up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 健康检查
echo "🏥 健康检查..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端服务启动成功${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "等待后端启动... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ 后端服务启动失败${NC}"
    echo "查看日志:"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# 检查前端
if curl -f http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 前端服务启动成功${NC}"
else
    echo -e "${YELLOW}⚠️  前端服务可能未启动${NC}"
fi

# 显示服务状态
echo ""
echo "📊 服务状态:"
docker-compose -f docker-compose.prod.yml ps

# 显示日志
echo ""
echo "📝 最近日志:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "🌐 访问地址:"
echo "   前端: http://localhost"
echo "   后端: http://localhost:3000"
echo ""
echo "📝 查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 停止服务: docker-compose -f docker-compose.prod.yml down"
