#!/bin/bash
# 项目初始化脚本 (Linux/Mac)

echo "================================"
echo "AI 旅行规划师 - 项目初始化"
echo "================================"
echo ""

# 检查 Python 版本
echo "1. 检查 Python 版本..."
python3 --version

if [ $? -ne 0 ]; then
    echo "❌ 未找到 Python 3，请先安装 Python 3.8+"
    exit 1
fi

# 创建虚拟环境
echo ""
echo "2. 创建虚拟环境..."
python3 -m venv venv

# 激活虚拟环境
echo ""
echo "3. 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo ""
echo "4. 安装依赖..."
pip install --upgrade pip
pip install -r requirements.txt

# 复制环境变量模板
echo ""
echo "5. 配置环境变量..."
if [ ! -f .env ]; then
    cp .env.template .env
    echo "✅ 已创建 .env 文件，请编辑并填入你的 API 密钥"
else
    echo "⚠️  .env 文件已存在，跳过"
fi

# 完成
echo ""
echo "================================"
echo "✅ 初始化完成！"
echo "================================"
echo ""
echo "下一步："
echo "1. 编辑 .env 文件，填入 API 密钥"
echo "2. 在 Supabase 中运行 database_setup.sql"
echo "3. 运行: python run.py"
echo ""
echo "访问: http://localhost:8000/static/index.html"
echo ""



