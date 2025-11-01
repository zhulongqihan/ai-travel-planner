"""
示例测试文件
运行: pytest tests/
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# 添加 backend 到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app

client = TestClient(app)


def test_root():
    """测试根路径"""
    response = client.get("/")
    assert response.status_code == 200
    assert "AI Travel Planner API" in response.json()["message"]


def test_health_check():
    """测试健康检查"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# 注意: 以下测试需要配置环境变量才能运行

# def test_create_travel_plan():
#     """测试创建旅行计划"""
#     response = client.post(
#         "/api/travel/plan?user_id=test-user",
#         json={
#             "destination": "日本东京",
#             "days": 5,
#             "budget": 10000,
#             "travelers": 2,
#             "preferences": "美食、动漫"
#         }
#     )
#     assert response.status_code == 200
#     data = response.json()
#     assert data["destination"] == "日本东京"
#     assert data["days"] == 5


# def test_invalid_travel_plan():
#     """测试无效的旅行计划数据"""
#     response = client.post(
#         "/api/travel/plan?user_id=test-user",
#         json={
#             "destination": "",
#             "days": -1,
#             "budget": -1000
#         }
#     )
#     assert response.status_code == 422  # Validation error



