"""
用户认证路由
使用Supabase认证服务
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
from supabase import create_client, Client

router = APIRouter()

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user_id: str
    email: str
    access_token: str
    refresh_token: str

def get_supabase_client() -> Client:
    """获取Supabase客户端"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase配置缺失")
    
    return create_client(supabase_url, supabase_key)

@router.post("/signup", response_model=AuthResponse)
async def sign_up(request: SignUpRequest):
    """用户注册"""
    try:
        client = get_supabase_client()
        
        # 使用Supabase注册用户
        result = client.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "name": request.name
                }
            }
        })
        
        if not result.user:
            raise HTTPException(status_code=400, detail="注册失败")
        
        # 检查session是否存在（有些Supabase配置需要邮箱确认）
        if not result.session:
            raise HTTPException(
                status_code=400, 
                detail="注册成功！请检查邮箱并确认后登录。注意：如果在Supabase中未启用邮箱确认，请在Authentication > Settings中禁用Email Confirmations。"
            )
        
        return AuthResponse(
            user_id=result.user.id,
            email=result.user.email,
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"注册失败: {str(e)}")

@router.post("/signin", response_model=AuthResponse)
async def sign_in(request: SignInRequest):
    """用户登录"""
    try:
        client = get_supabase_client()
        
        # 使用Supabase登录
        result = client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not result.user:
            raise HTTPException(status_code=401, detail="登录失败")
        
        return AuthResponse(
            user_id=result.user.id,
            email=result.user.email,
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token
        )
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"登录失败: {str(e)}")

@router.post("/signout")
async def sign_out():
    """用户登出"""
    try:
        client = get_supabase_client()
        client.auth.sign_out()
        return {"message": "登出成功"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"登出失败: {str(e)}")

@router.get("/user")
async def get_current_user(token: str):
    """获取当前用户信息"""
    try:
        client = get_supabase_client()
        user = client.auth.get_user(token)
        
        if not user:
            raise HTTPException(status_code=401, detail="未授权")
        
        return user
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"获取用户信息失败: {str(e)}")


