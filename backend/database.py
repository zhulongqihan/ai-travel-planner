"""
数据库配置和操作 - 使用Supabase
"""
import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List

class Database:
    """数据库管理类"""
    
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL 和 SUPABASE_KEY 必须在环境变量中设置")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
    
    async def create_travel_plan(self, user_id: str, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建旅行计划"""
        data = {
            "user_id": user_id,
            "destination": plan_data.get("destination"),
            "start_date": plan_data.get("start_date"),
            "end_date": plan_data.get("end_date"),
            "days": plan_data.get("days"),
            "budget": plan_data.get("budget"),
            "travelers": plan_data.get("travelers"),
            "preferences": plan_data.get("preferences"),
            "itinerary": plan_data.get("itinerary"),
            "created_at": "now()"
        }
        
        result = self.client.table("travel_plans").insert(data).execute()
        return result.data[0] if result.data else None
    
    async def get_user_travel_plans(self, user_id: str) -> List[Dict[str, Any]]:
        """获取用户的所有旅行计划"""
        result = self.client.table("travel_plans")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return result.data
    
    async def get_travel_plan(self, plan_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """获取特定旅行计划"""
        result = self.client.table("travel_plans")\
            .select("*")\
            .eq("id", plan_id)\
            .eq("user_id", user_id)\
            .execute()
        return result.data[0] if result.data else None
    
    async def update_travel_plan(self, plan_id: str, user_id: str, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新旅行计划"""
        result = self.client.table("travel_plans")\
            .update(plan_data)\
            .eq("id", plan_id)\
            .eq("user_id", user_id)\
            .execute()
        return result.data[0] if result.data else None
    
    async def delete_travel_plan(self, plan_id: str, user_id: str) -> bool:
        """删除旅行计划"""
        result = self.client.table("travel_plans")\
            .delete()\
            .eq("id", plan_id)\
            .eq("user_id", user_id)\
            .execute()
        return len(result.data) > 0
    
    async def create_expense(self, user_id: str, plan_id: str, expense_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建费用记录"""
        data = {
            "user_id": user_id,
            "plan_id": plan_id,
            "category": expense_data.get("category"),
            "amount": expense_data.get("amount"),
            "description": expense_data.get("description"),
            "date": expense_data.get("date"),
            "created_at": "now()"
        }
        
        result = self.client.table("expenses").insert(data).execute()
        return result.data[0] if result.data else None
    
    async def get_plan_expenses(self, plan_id: str, user_id: str) -> List[Dict[str, Any]]:
        """获取计划的所有费用记录"""
        result = self.client.table("expenses")\
            .select("*")\
            .eq("plan_id", plan_id)\
            .eq("user_id", user_id)\
            .order("date", desc=True)\
            .execute()
        return result.data

# 全局数据库实例
db_instance: Optional[Database] = None

async def init_db():
    """初始化数据库连接"""
    global db_instance
    db_instance = Database()

def get_db() -> Database:
    """获取数据库实例"""
    if db_instance is None:
        raise RuntimeError("数据库未初始化")
    return db_instance


