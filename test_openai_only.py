"""
只测试阿里云百炼 API（不涉及 Supabase）
"""
import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("测试阿里云百炼 API")
print("=" * 60)

dashscope_key = os.getenv("DASHSCOPE_API_KEY")

if not dashscope_key:
    print("❌ DASHSCOPE_API_KEY 未配置")
    exit(1)

print(f"✓ API Key: {dashscope_key[:10]}...{dashscope_key[-10:]}")

try:
    from openai import OpenAI
    
    print("\n正在测试 API 调用...")
    
    client = OpenAI(
        api_key=dashscope_key,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
    )
    
    response = client.chat.completions.create(
        model="qwen-plus",
        messages=[
            {"role": "system", "content": "你是一个旅行规划助手"},
            {"role": "user", "content": "简单介绍一下北京的旅游景点"}
        ],
        max_tokens=200
    )
    
    print("✅ API 调用成功！")
    print(f"\n响应内容：\n{response.choices[0].message.content}")
    print("\n" + "=" * 60)
    print("阿里云百炼 API 工作正常！")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ API 调用失败: {str(e)}")
    print("\n请检查：")
    print("1. API Key 是否正确")
    print("2. 是否有足够的额度")
    print("3. 网络连接是否正常")

