"""
配置管理模块
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置"""
    
    # Supabase配置
    supabase_url: str
    supabase_key: str
    
    # 阿里云百炼配置
    dashscope_api_key: str
    
    # 阿里云语音识别配置（可选）
    aliyun_speech_app_key: Optional[str] = None
    aliyun_access_key_id: Optional[str] = None
    aliyun_access_key_secret: Optional[str] = None
    
    # 高德地图配置
    amap_api_key: Optional[str] = None
    amap_web_key: Optional[str] = None
    
    # 应用配置
    app_env: str = "development"
    app_port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# 全局配置实例
settings = Settings()



