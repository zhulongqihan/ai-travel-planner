@echo off
REM 项目初始化脚本 (Windows)

echo ================================
echo AI 旅行规划师 - 项目初始化
echo ================================
echo.

REM 检查 Python 版本
echo 1. 检查 Python 版本...
python --version

if errorlevel 1 (
    echo ❌ 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 创建虚拟环境
echo.
echo 2. 创建虚拟环境...
python -m venv venv

REM 激活虚拟环境
echo.
echo 3. 激活虚拟环境...
call venv\Scripts\activate.bat

REM 安装依赖
echo.
echo 4. 安装依赖...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM 复制环境变量模板
echo.
echo 5. 配置环境变量...
if not exist .env (
    copy .env.template .env
    echo ✅ 已创建 .env 文件，请编辑并填入你的 API 密钥
) else (
    echo ⚠️  .env 文件已存在，跳过
)

REM 完成
echo.
echo ================================
echo ✅ 初始化完成！
echo ================================
echo.
echo 下一步：
echo 1. 编辑 .env 文件，填入 API 密钥
echo 2. 在 Supabase 中运行 database_setup.sql
echo 3. 运行: python run.py
echo.
echo 访问: http://localhost:8000/static/index.html
echo.
pause



