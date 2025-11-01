@echo off
REM 快速启动脚本 (Windows)

echo 启动 AI 旅行规划师...

REM 激活虚拟环境
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM 启动服务
python run.py

pause



