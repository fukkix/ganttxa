#!/bin/bash

# 数据库初始化脚本

echo "🔄 正在初始化数据库..."

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 5

# 执行初始化脚本
echo "📝 执行初始化脚本..."
docker compose exec -T postgres psql -U postgres -d ganttxa < database/init.sql

if [ $? -eq 0 ]; then
  echo "✅ 数据库初始化成功！"
else
  echo "❌ 数据库初始化失败"
  exit 1
fi

# 可选：执行种子数据
if [ -f "database/seed.sql" ]; then
  echo "🌱 执行种子数据..."
  docker compose exec -T postgres psql -U postgres -d ganttxa < database/seed.sql
  
  if [ $? -eq 0 ]; then
    echo "✅ 种子数据导入成功！"
  else
    echo "⚠️  种子数据导入失败（可选）"
  fi
fi

echo "🎉 数据库准备完成！"
