"""
检查已安装包的版本
"""
import subprocess
import sys

packages = [
    'httpx',
    'supabase',
    'gotrue',
    'postgrest',
    'openai',
    'pydantic',
    'fastapi'
]

print("=" * 60)
print("已安装包版本")
print("=" * 60)

for package in packages:
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'show', package],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if line.startswith('Version:'):
                    version = line.split(':')[1].strip()
                    print(f"{package:15} -> {version}")
                    break
        else:
            print(f"{package:15} -> 未安装")
    except Exception as e:
        print(f"{package:15} -> 错误: {e}")

print("=" * 60)

