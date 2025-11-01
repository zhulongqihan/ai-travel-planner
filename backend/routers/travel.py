"""
旅行规划路由
使用阿里云百炼大语言模型生成旅行计划
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import json
import asyncio
from openai import OpenAI
from datetime import datetime

from database import get_db, Database

router = APIRouter()

class TravelRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travelers: int
    preferences: str
    start_date: Optional[str] = None

class TravelPlan(BaseModel):
    id: Optional[str] = None
    destination: str
    days: int
    budget: float
    travelers: int
    preferences: str
    itinerary: Dict[str, Any]
    estimated_cost: float

def get_dashscope_client():
    """获取阿里云百炼客户端"""
    api_key = os.getenv("DASHSCOPE_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="DASHSCOPE_API_KEY未配置")
    
    # 阿里云百炼使用OpenAI兼容接口
    client = OpenAI(
        api_key=api_key,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    
    return client

def generate_travel_plan_prompt(request: TravelRequest) -> str:
    """生成旅行规划提示词"""
    # 获取当前日期和年份
    current_date = datetime.now()
    current_year = 2025
    current_date_str = current_date.strftime("%Y年%m月%d日")
    
    prompt = f"""
请为以下旅行需求生成详细的旅行计划：

【重要时间信息】
当前日期：{current_date_str}
当前年份：{current_year}年
注意：当用户提到"今年"时，指的是{current_year}年；"明年"指的是{current_year + 1}年

目的地：{request.destination}
旅行天数：{request.days}天
预算：{request.budget}元人民币
同行人数：{request.travelers}人
旅行偏好：{request.preferences}

请生成一个JSON格式的旅行计划，包含以下信息：
1. 每天的详细行程（包括景点、餐厅、住宿建议）
2. 交通方式建议
3. 每个项目的预估费用
4. 总费用预算分析
5. 特别注意事项和建议

返回格式示例：
{{
    "days": [
        {{
            "day": 1,
            "date": "第一天",
            "activities": [
                {{
                    "time": "09:00",
                    "type": "景点",
                    "name": "景点名称",
                    "description": "详细描述",
                    "estimated_cost": 100,
                    "location": {{"lat": 35.6762, "lng": 139.6503}},
                    "duration": "2小时"
                }}
            ],
            "meals": [
                {{
                    "time": "12:00",
                    "type": "午餐",
                    "restaurant": "餐厅名称",
                    "cuisine": "菜系",
                    "estimated_cost": 150
                }}
            ],
            "accommodation": {{
                "name": "酒店名称",
                "type": "酒店类型",
                "estimated_cost": 500
            }}
        }}
    ],
    "transportation": {{
        "outbound": {{"method": "飞机", "cost": 2000}},
        "local": {{"method": "地铁+出租车", "estimated_daily_cost": 100}},
        "return": {{"method": "飞机", "cost": 2000}}
    }},
    "cost_breakdown": {{
        "transportation": 5000,
        "accommodation": 3000,
        "food": 2000,
        "activities": 1500,
        "shopping": 500,
        "total": 12000
    }},
    "tips": [
        "建议1",
        "建议2"
    ]
}}

请确保返回的是有效的JSON格式，不要包含其他文字说明。

【重要】JSON格式要求：
- 使用标准JSON格式，所有字段名和字符串值都用双引号
- 不要使用单引号
- 不要添加注释
- 确保所有括号正确闭合
- 不要在数组或对象的最后一个元素后添加逗号
- 直接输出JSON，不要有任何前缀或后缀说明

只需要返回上述JSON结构，不需要任何其他解释。
"""
    return prompt

@router.get("/plan-stream")
async def create_travel_plan_stream(
    user_id: str,
    destination: str,
    days: int,
    budget: float,
    travelers: int,
    preferences: str,
    start_date: str = None,
    db: Database = Depends(get_db)
):
    """生成AI旅行计划（流式返回，带进度）"""
    # 构建请求对象
    request = TravelRequest(
        destination=destination,
        days=days,
        budget=budget,
        travelers=travelers,
        preferences=preferences,
        start_date=start_date
    )
    async def generate():
        try:
            # 进度 0%: 开始
            yield f"data: {json.dumps({'progress': 0, 'message': '开始生成旅行计划...'})}\n\n"
            await asyncio.sleep(0.5)
            
            # 进度 10%: 初始化客户端
            yield f"data: {json.dumps({'progress': 10, 'message': '连接AI服务...'})}\n\n"
            client = get_dashscope_client()
            await asyncio.sleep(0.3)
            
            # 进度 20%: 生成提示词
            yield f"data: {json.dumps({'progress': 20, 'message': '准备旅行规划提示...'})}\n\n"
            prompt = generate_travel_plan_prompt(request)
            await asyncio.sleep(0.3)
            
            # 进度 30%: 调用AI
            yield f"data: {json.dumps({'progress': 30, 'message': f'正在为您规划{request.destination}之旅...'})}\n\n"
            
            # 获取当前年份
            current_year = datetime.now().year
            
            # 使用流式响应
            response = client.chat.completions.create(
                model="qwen-plus",
                messages=[
                    {"role": "system", "content": f"""你是一个专业的旅行规划师，擅长为用户制定详细的旅行计划。

重要时间信息：
- 当前年份是{current_year}年
- 当用户说"今年"，指的是{current_year}年
- 当用户说"明年"，指的是{current_year + 1}年
- 请根据实际的{current_year}年日历来安排行程日期

重要规则：
1. 必须严格按照JSON格式返回，不要添加任何额外的文字说明
2. 所有字段名必须使用双引号
3. 不要在JSON中使用单引号
4. 不要在JSON中添加注释
5. 确保所有括号正确闭合
6. 不要在最后一个元素后添加逗号
7. 所有字符串值都要用双引号包裹
8. 确保JSON格式完整有效"""},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                stream=True
            )
            
            # 进度 40-80%: AI生成中
            ai_response = ""
            progress = 40
            for chunk in response:
                if chunk.choices[0].delta.content:
                    ai_response += chunk.choices[0].delta.content
                    progress = min(80, progress + 1)
                    if len(ai_response) % 50 == 0:  # 每50个字符更新一次进度
                        yield f"data: {json.dumps({'progress': progress, 'message': 'AI正在生成详细计划...'})}\n\n"
            
            # 进度 85%: 解析结果
            yield f"data: {json.dumps({'progress': 85, 'message': '解析旅行计划...'})}\n\n"
            
            # 尝试提取和修复JSON
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = ai_response[json_start:json_end]
                
                # 尝试多种方法解析JSON
                itinerary = None
                parse_errors = []
                
                # 方法1: 直接解析
                try:
                    itinerary = json.loads(json_str)
                    print("✅ JSON解析成功（方法1：直接解析）")
                except json.JSONDecodeError as e:
                    parse_errors.append(f"方法1失败: {str(e)}")
                    
                    # 方法2: 修复常见JSON错误
                    try:
                        # 修复尾部逗号问题
                        fixed_json = json_str.replace(',]', ']').replace(',}', '}')
                        # 修复单引号问题
                        fixed_json = fixed_json.replace("'", '"')
                        # 移除注释
                        import re
                        fixed_json = re.sub(r'//.*?$', '', fixed_json, flags=re.MULTILINE)
                        fixed_json = re.sub(r'/\*.*?\*/', '', fixed_json, flags=re.DOTALL)
                        
                        itinerary = json.loads(fixed_json)
                        print("✅ JSON解析成功（方法2：修复后解析）")
                    except json.JSONDecodeError as e2:
                        parse_errors.append(f"方法2失败: {str(e2)}")
                        
                        # 方法3: 使用正则表达式提取关键信息
                        try:
                            print("⚠️ JSON格式错误，尝试提取关键信息...")
                            print(f"错误的JSON（前500字符）: {json_str[:500]}")
                            print(f"错误的JSON（后500字符）: {json_str[-500:]}")
                            
                            # 创建一个基本的行程结构
                            itinerary = {
                                "daily_plans": [],
                                "estimated_cost": request.budget,
                                "tips": ["由于AI生成格式异常，建议重新生成计划以获得完整信息。"]
                            }
                            
                            # 尝试提取每日计划的文本信息
                            import re
                            days_pattern = r'"day["\s]*:\s*(\d+)'
                            days_found = re.findall(days_pattern, json_str, re.IGNORECASE)
                            
                            for day_num in days_found[:request.days]:
                                itinerary["daily_plans"].append({
                                    "day": int(day_num),
                                    "activities": [{
                                        "time": "全天",
                                        "name": f"第{day_num}天行程",
                                        "description": "由于格式解析问题，请重新生成计划",
                                        "location": request.destination,
                                        "estimated_cost": request.budget / request.days
                                    }]
                                })
                            
                            # 如果没有找到任何天数，创建基本结构
                            if not itinerary["daily_plans"]:
                                for day in range(1, request.days + 1):
                                    itinerary["daily_plans"].append({
                                        "day": day,
                                        "activities": [{
                                            "time": "全天",
                                            "name": f"第{day}天行程",
                                            "description": "计划生成中遇到格式问题，建议重新生成",
                                            "location": request.destination,
                                            "estimated_cost": request.budget / request.days
                                        }]
                                    })
                            
                            print("⚠️ 使用降级方案创建基本行程结构")
                            
                        except Exception as e3:
                            parse_errors.append(f"方法3失败: {str(e3)}")
                            print(f"❌ 所有JSON解析方法都失败")
                            print(f"解析错误汇总: {parse_errors}")
                            raise ValueError(f"无法解析AI响应为JSON。错误: {'; '.join(parse_errors)}")
                
                if itinerary is None:
                    raise ValueError(f"无法解析AI响应为JSON。错误: {'; '.join(parse_errors)}")
                    
            else:
                raise ValueError("无法从AI响应中提取JSON")
            
            # 进度 90%: 保存到数据库
            yield f"data: {json.dumps({'progress': 90, 'message': '保存计划到数据库...'})}\n\n"
            
            plan_data = {
                "destination": request.destination,
                "days": request.days,
                "budget": request.budget,
                "travelers": request.travelers,
                "preferences": request.preferences,
                "start_date": request.start_date,
                "itinerary": itinerary
            }
            
            saved_plan = await db.create_travel_plan(user_id, plan_data)
            
            # 进度 100%: 完成
            result = TravelPlan(
                id=saved_plan.get("id"),
                destination=request.destination,
                days=request.days,
                budget=request.budget,
                travelers=request.travelers,
                preferences=request.preferences,
                itinerary=itinerary,
                estimated_cost=itinerary.get("cost_breakdown", {}).get("total", 0)
            )
            
            yield f"data: {json.dumps({'progress': 100, 'message': '完成！', 'result': result.model_dump()})}\n\n"
        
        except Exception as e:
            import traceback
            print(f"流式生成错误: {traceback.format_exc()}")
            yield f"data: {json.dumps({'error': str(e), 'message': f'生成失败: {str(e)}'})}\n\n"
    
    return StreamingResponse(
        generate(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )

@router.post("/plan", response_model=TravelPlan)
async def create_travel_plan(
    request: TravelRequest,
    user_id: str,
    db: Database = Depends(get_db)
):
    """生成AI旅行计划（普通版本，无进度显示）"""
    try:
        # 调用阿里云百炼生成旅行计划
        client = get_dashscope_client()
        
        prompt = generate_travel_plan_prompt(request)
        
        # 获取当前年份
        current_year = datetime.now().year
        
        response = client.chat.completions.create(
            model="qwen-plus",  # 或使用其他模型如 qwen-turbo, qwen-max
            messages=[
                {"role": "system", "content": f"""你是一个专业的旅行规划师，擅长为用户制定详细的旅行计划。

重要时间信息：
- 当前年份是{current_year}年
- 当用户说"今年"，指的是{current_year}年
- 当用户说"明年"，指的是{current_year + 1}年
- 请根据实际的{current_year}年日历来安排行程日期"""},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        # 解析AI返回的JSON
        ai_response = response.choices[0].message.content
        
        # 打印AI响应以便调试
        print(f"AI响应长度: {len(ai_response)}")
        print(f"AI响应前500字符: {ai_response[:500]}")
        
        # 尝试提取JSON（AI可能在JSON前后加了说明文字）
        json_start = ai_response.find('{')
        json_end = ai_response.rfind('}') + 1
        
        if json_start != -1 and json_end > json_start:
            json_str = ai_response[json_start:json_end]
            itinerary = json.loads(json_str)
        else:
            raise ValueError("无法从AI响应中提取JSON")
        
        # 保存到数据库
        plan_data = {
            "destination": request.destination,
            "days": request.days,
            "budget": request.budget,
            "travelers": request.travelers,
            "preferences": request.preferences,
            "start_date": request.start_date,
            "itinerary": itinerary
        }
        
        saved_plan = await db.create_travel_plan(user_id, plan_data)
        
        return TravelPlan(
            id=saved_plan.get("id"),
            destination=request.destination,
            days=request.days,
            budget=request.budget,
            travelers=request.travelers,
            preferences=request.preferences,
            itinerary=itinerary,
            estimated_cost=itinerary.get("cost_breakdown", {}).get("total", 0)
        )
    
    except Exception as e:
        # 打印详细错误信息
        import traceback
        print(f"错误详情: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"生成旅行计划失败: {str(e)}")

@router.get("/plans")
async def get_travel_plans(
    user_id: str,
    db: Database = Depends(get_db)
):
    """获取用户的所有旅行计划"""
    try:
        plans = await db.get_user_travel_plans(user_id)
        return {"plans": plans}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取旅行计划失败: {str(e)}")

@router.get("/plans/{plan_id}")
async def get_travel_plan(
    plan_id: str,
    user_id: str,
    db: Database = Depends(get_db)
):
    """获取特定旅行计划"""
    try:
        plan = await db.get_travel_plan(plan_id, user_id)
        
        if not plan:
            raise HTTPException(status_code=404, detail="旅行计划不存在")
        
        return plan
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取旅行计划失败: {str(e)}")

@router.delete("/plans/{plan_id}")
async def delete_travel_plan(
    plan_id: str,
    user_id: str,
    db: Database = Depends(get_db)
):
    """删除旅行计划"""
    try:
        success = await db.delete_travel_plan(plan_id, user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="旅行计划不存在")
        
        return {"message": "删除成功"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除旅行计划失败: {str(e)}")


