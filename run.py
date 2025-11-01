"""
快速启动脚本
运行此脚本以启动后端服务
"""
import os
import sys

# 添加 backend 目录到 Python 路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("🌍 AI 旅行规划师")
    print("=" * 60)
    print()
    print("后端服务启动中...")
    print("API 文档地址: http://localhost:8000/docs")
    print("前端访问地址: http://localhost:8000/static/index.html")
    print()
    print("按 Ctrl+C 停止服务")
    print("=" * 60)
    print()
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",  # 改为只监听本地
        port=8000,
        reload=True,
        log_level="info"
    )



