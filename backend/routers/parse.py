"""
智能语音文本解析路由
使用AI大模型解析语音识别的文本，提取旅行信息
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
import os
from openai import OpenAI

router = APIRouter()

def get_dashscope_client():
    """获取阿里云百炼API客户端"""
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="DASHSCOPE_API_KEY未配置")
    return OpenAI(
        api_key=api_key,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )

class ParseRequest(BaseModel):
    text: str

class ParsedTravelInfo(BaseModel):
    destination: Optional[str] = None
    days: Optional[int] = None
    budget: Optional[float] = None
    travelers: Optional[int] = None
    preferences: Optional[str] = None
    start_date: Optional[str] = None  # 格式: YYYY-MM-DD

@router.post("/voice-text", response_model=ParsedTravelInfo)
async def parse_voice_text(request: ParseRequest):
    """
    使用AI解析语音识别的文本，提取旅行信息
    """
    try:
        client = get_dashscope_client()
        
        # 构建AI提示词
        prompt = f"""请从以下语音识别的文本中提取旅行规划信息，并以JSON格式返回。

语音文本："{request.text}"

请提取以下信息（如果文本中没有提到某项信息，则该字段返回null）：
1. destination: 目的地（字符串，如"日本"、"东京"）
2. days: 旅行天数（整数，将"五天"、"5天"等转换为数字5）
3. budget: 预算金额（浮点数，单位为元，将"一万元"、"1万元"转换为10000）
4. travelers: 同行人数（整数，将"两人"、"2人"等转换为数字2）
5. preferences: 旅行偏好（字符串，多个偏好用顿号分隔，如"美食、动漫文化"）
6. start_date: 出发日期（字符串，格式YYYY-MM-DD，如"2024-12-25"）

注意：
- 中文数字要转换为阿拉伯数字（一、二、三 → 1、2、3）
- 金额单位转换（万→10000，千→1000）
- 偏好关键词规范化（吃→美食，孩子→亲子游）
- 日期转换：
  * "明天"、"后天" → 计算具体日期
  * "下周一"、"下个月1号" → 计算具体日期
  * "12月25号"、"12月25日" → 转换为当年的2024-12-25格式
  * "元旦"、"春节"、"国庆" → 转换为对应的具体日期
  * 如果只说"月日"没说年份，默认是2024年或2025年（就近原则）

只返回JSON，不要其他解释。格式如下：
{{
  "destination": "目的地或null",
  "days": 天数数字或null,
  "budget": 预算数字或null,
  "travelers": 人数数字或null,
  "preferences": "偏好或null",
  "start_date": "YYYY-MM-DD格式日期或null"
}}"""

        response = client.chat.completions.create(
            model="qwen-plus",
            messages=[
                {"role": "system", "content": "你是一个专业的文本信息提取助手，擅长从自然语言中提取结构化信息。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # 降低温度以获得更稳定的输出
        )
        
        ai_response = response.choices[0].message.content.strip()
        print(f"AI解析响应: {ai_response}")
        
        # 尝试提取JSON
        json_start = ai_response.find('{')
        json_end = ai_response.rfind('}') + 1
        
        if json_start != -1 and json_end > json_start:
            json_str = ai_response[json_start:json_end]
            parsed_data = json.loads(json_str)
            
            # 验证和清理数据
            result = ParsedTravelInfo(
                destination=parsed_data.get("destination"),
                days=parsed_data.get("days"),
                budget=parsed_data.get("budget"),
                travelers=parsed_data.get("travelers"),
                preferences=parsed_data.get("preferences"),
                start_date=parsed_data.get("start_date")
            )
            
            print(f"解析结果: {result}")
            return result
        else:
            raise ValueError("AI未返回有效的JSON格式")
    
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {str(e)}")
        print(f"AI响应内容: {ai_response}")
        raise HTTPException(status_code=500, detail=f"解析AI响应失败: {str(e)}")
    
    except Exception as e:
        print(f"语音文本解析错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"解析失败: {str(e)}")

