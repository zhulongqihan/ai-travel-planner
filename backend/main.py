"""
AI Travel Planner - 后端主程序
FastAPI应用入口
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

from routers import travel, voice, auth, budget, parse, geocode
from database import init_db

# 加载环境变量
load_dotenv()

app = FastAPI(title="AI Travel Planner API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该设置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务 - 动态获取正确的路径
current_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(os.path.dirname(current_dir), "frontend")
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(travel.router, prefix="/api/travel", tags=["旅行规划"])
app.include_router(voice.router, prefix="/api/voice", tags=["语音识别"])
app.include_router(budget.router, prefix="/api/budget", tags=["预算管理"])
app.include_router(parse.router, prefix="/api/parse", tags=["智能解析"])
app.include_router(geocode.router, prefix="/api/map", tags=["地图服务"])

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化数据库"""
    await init_db()

@app.get("/")
async def root():
    """根路径"""
    return {"message": "AI Travel Planner API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

