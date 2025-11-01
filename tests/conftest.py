"""
pytest 配置文件
"""
import pytest
import os
from dotenv import load_dotenv

# 加载测试环境变量
load_dotenv('.env.test', override=True)


@pytest.fixture(scope="session")
def test_user():
    """测试用户数据"""
    return {
        "user_id": "test-user-uuid",
        "email": "test@example.com",
        "name": "测试用户"
    }


@pytest.fixture(scope="session")
def test_travel_plan():
    """测试旅行计划数据"""
    return {
        "destination": "日本东京",
        "days": 5,
        "budget": 10000,
        "travelers": 2,
        "preferences": "美食、动漫、文化",
        "start_date": "2024-05-01"
    }



