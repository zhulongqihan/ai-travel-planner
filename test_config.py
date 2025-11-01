"""
测试配置是否正确
"""
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

print("=" * 60)
print("配置检查")
print("=" * 60)

# 检查 Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

print(f"\n✓ SUPABASE_URL: {'已配置' if supabase_url else '❌ 未配置'}")
if supabase_url:
    print(f"  值: {supabase_url}")

print(f"\n✓ SUPABASE_KEY: {'已配置' if supabase_key else '❌ 未配置'}")
if supabase_key:
    print(f"  值: {supabase_key[:20]}...{supabase_key[-20:]}")

# 检查阿里云百炼
dashscope_key = os.getenv("DASHSCOPE_API_KEY")

print(f"\n✓ DASHSCOPE_API_KEY: {'已配置' if dashscope_key else '❌ 未配置'}")
if dashscope_key:
    print(f"  值: {dashscope_key[:10]}...{dashscope_key[-10:]}")
    
    # 测试 API 调用
    print("\n正在测试阿里云百炼 API...")
    try:
        from openai import OpenAI
        
        client = OpenAI(
            api_key=dashscope_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
        )
        
        response = client.chat.completions.create(
            model="qwen-plus",
            messages=[
                {"role": "user", "content": "你好"}
            ]
        )
        
        print("✅ API 调用成功！")
        print(f"响应: {response.choices[0].message.content}")
        
    except Exception as e:
        print(f"❌ API 调用失败: {str(e)}")

print("\n" + "=" * 60)

