# PowerShell 数据库初始化脚本

Write-Host "🔄 正在初始化数据库..." -ForegroundColor Cyan

# 等待数据库启动
Write-Host "⏳ 等待数据库启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 读取并执行初始化脚本
Write-Host "📝 执行初始化脚本..." -ForegroundColor Cyan
$initSql = Get-Content -Path "database/init.sql" -Raw

try {
    $initSql | docker compose exec -T postgres psql -U postgres -d ganttxa
    Write-Host "✅ 数据库初始化成功！" -ForegroundColor Green
} catch {
    Write-Host "❌ 数据库初始化失败: $_" -ForegroundColor Red
    exit 1
}

# 可选：执行种子数据
if (Test-Path "database/seed.sql") {
    Write-Host "🌱 执行种子数据..." -ForegroundColor Cyan
    $seedSql = Get-Content -Path "database/seed.sql" -Raw
    
    try {
        $seedSql | docker compose exec -T postgres psql -U postgres -d ganttxa
        Write-Host "✅ 种子数据导入成功！" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  种子数据导入失败（可选）: $_" -ForegroundColor Yellow
    }
}

Write-Host "🎉 数据库准备完成！" -ForegroundColor Green
