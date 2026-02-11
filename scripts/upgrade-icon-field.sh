#!/bin/bash

# 图标字段升级脚本
# 用于将 icon 字段从 VARCHAR(500) 升级到 TEXT

echo "🔧 开始升级图标字段类型..."
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录执行此脚本"
    exit 1
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "❌ 错误：未找到 .env 文件，请先配置数据库连接"
    exit 1
fi

echo "📋 步骤 1/3: 备份数据库（可选但推荐）"
echo "   手动备份命令："
echo "   mysqldump -u用户名 -p 数据库名 > backup_$(date +%Y%m%d_%H%M%S).sql"
echo ""
read -p "   已备份？按回车继续... " -r
echo ""

echo "📋 步骤 2/3: 推送 Schema 变更"
pnpm db:push
if [ $? -ne 0 ]; then
    echo "❌ Schema 推送失败"
    exit 1
fi
echo "✅ Schema 更新成功"
echo ""

echo "📋 步骤 3/3: 重新生成 Prisma Client"
pnpm prisma:generate
if [ $? -ne 0 ]; then
    echo "❌ Prisma Client 生成失败"
    exit 1
fi
echo "✅ Prisma Client 已更新"
echo ""

echo "🎉 升级完成！"
echo ""
echo "📝 验证步骤："
echo "   1. 重启开发服务器: pnpm dev"
echo "   2. 测试导入功能: 使用 test/bookmarks_2026_2_11.html"
echo "   3. 检查图标显示是否正常"
echo ""
echo "📚 详细文档: docs/ICON_FIELD_UPGRADE.md"
