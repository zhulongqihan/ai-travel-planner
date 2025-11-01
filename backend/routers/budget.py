"""
预算管理路由
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from openai import OpenAI

from database import get_db, Database

router = APIRouter()

class ExpenseRequest(BaseModel):
    plan_id: str
    category: str
    amount: float
    description: str
    date: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: str
    plan_id: str
    category: str
    amount: float
    description: str
    date: str

class BudgetAnalysis(BaseModel):
    total_budget: float
    total_spent: float
    remaining: float
    category_breakdown: Dict[str, float]
    recommendations: List[str]

@router.post("/expense")
async def add_expense(
    expense: ExpenseRequest,
    user_id: str,
    db: Database = Depends(get_db)
):
    """添加费用记录"""
    try:
        expense_data = {
            "category": expense.category,
            "amount": expense.amount,
            "description": expense.description,
            "date": expense.date or datetime.now().isoformat()
        }
        
        result = await db.create_expense(user_id, expense.plan_id, expense_data)
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"添加费用记录失败: {str(e)}")

@router.get("/expenses/{plan_id}")
async def get_expenses(
    plan_id: str,
    user_id: str,
    db: Database = Depends(get_db)
):
    """获取计划的所有费用记录"""
    try:
        expenses = await db.get_plan_expenses(plan_id, user_id)
        return {"expenses": expenses}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取费用记录失败: {str(e)}")

@router.get("/analysis/{plan_id}", response_model=BudgetAnalysis)
async def analyze_budget(
    plan_id: str,
    user_id: str,
    db: Database = Depends(get_db)
):
    """分析预算使用情况"""
    try:
        # 获取旅行计划
        plan = await db.get_travel_plan(plan_id, user_id)
        
        if not plan:
            raise HTTPException(status_code=404, detail="旅行计划不存在")
        
        # 获取所有费用记录
        expenses = await db.get_plan_expenses(plan_id, user_id)
        
        # 计算总花费
        total_spent = sum(exp.get("amount", 0) for exp in expenses)
        total_budget = plan.get("budget", 0)
        remaining = total_budget - total_spent
        
        # 按类别统计
        category_breakdown = {}
        for exp in expenses:
            category = exp.get("category", "其他")
            category_breakdown[category] = category_breakdown.get(category, 0) + exp.get("amount", 0)
        
        # 使用AI生成预算建议
        recommendations = await generate_budget_recommendations(
            total_budget, total_spent, category_breakdown, plan
        )
        
        return BudgetAnalysis(
            total_budget=total_budget,
            total_spent=total_spent,
            remaining=remaining,
            category_breakdown=category_breakdown,
            recommendations=recommendations
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"预算分析失败: {str(e)}")

async def generate_budget_recommendations(
    total_budget: float,
    total_spent: float,
    category_breakdown: Dict[str, float],
    plan: Dict[str, Any]
) -> List[str]:
    """使用AI生成预算建议"""
    try:
        api_key = os.getenv("DASHSCOPE_API_KEY")
        
        if not api_key:
            return ["预算建议功能需要配置DASHSCOPE_API_KEY"]
        
        client = OpenAI(
            api_key=api_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
        )
        
        prompt = f"""
根据以下旅行预算信息，给出3-5条实用的预算管理建议：

总预算：{total_budget}元
已花费：{total_spent}元
剩余预算：{total_budget - total_spent}元

各类别花费：
{json.dumps(category_breakdown, ensure_ascii=False, indent=2)}

目的地：{plan.get('destination')}
旅行天数：{plan.get('days')}天

请以列表形式返回建议，每条建议简洁实用。只返回建议内容，不要其他说明。
"""
        
        response = client.chat.completions.create(
            model="qwen-plus",
            messages=[
                {"role": "system", "content": "你是一个专业的旅行预算顾问。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        recommendations_text = response.choices[0].message.content
        
        # 解析建议（按行分割）
        recommendations = [
            line.strip().lstrip('- ').lstrip('• ').lstrip('1234567890. ')
            for line in recommendations_text.split('\n')
            if line.strip() and len(line.strip()) > 10
        ]
        
        return recommendations[:5]  # 最多返回5条
    
    except Exception as e:
        return [f"生成建议时出错: {str(e)}"]

import json


