#!/bin/bash
# 快速启动脚本 (Linux/Mac)

echo "启动 AI 旅行规划师..."

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 启动服务
python run.py



