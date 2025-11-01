"""
高德地图地理编码服务和路径规划服务
使用Web服务API进行地址解析和路径规划
支持地理编码、POI搜索和驾车路径规划
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import os
import httpx
from typing import Optional, List, Dict, Any

router = APIRouter()

class GeocodeRequest(BaseModel):
    address: str

class GeocodeResponse(BaseModel):
    lng: float
    lat: float
    formatted_address: Optional[str] = None
    name: Optional[str] = None  # POI名称

class RouteRequest(BaseModel):
    origin_lng: float
    origin_lat: float
    destination_lng: float
    destination_lat: float

class RouteResponse(BaseModel):
    distance: float  # 距离（米）
    duration: float  # 时间（秒）
    steps: List[Dict[str, Any]]  # 路径步骤
    polyline: str  # 路径轨迹（编码后的坐标串）

@router.post("/geocode")
async def geocode_address(request: GeocodeRequest):
    """
    智能地理编码：将地址转换为经纬度坐标
    策略：
    1. 先尝试POI搜索（适合景点、学校、商场等具体地点）
    2. 如果POI搜索无结果，再使用地理编码（适合地址）
    """
    amap_key = os.getenv("AMAP_WEB_KEY", "564f4fc5fbd68a60cf4b80191841d1ee")
    
    print(f"🔑 使用的 API Key: {amap_key[:10]}...{amap_key[-6:]}")
    
    if not request.address:
        raise HTTPException(status_code=400, detail="地址不能为空")
    
    try:
        # 方案1: 优先尝试POI搜索（更精确）
        poi_result = await search_poi(amap_key, request.address)
        if poi_result:
            print(f"✅ POI搜索成功: {poi_result.name}")
            return poi_result
        
        # 方案2: 使用地理编码
        print(f"⚠️ POI搜索无结果，使用地理编码")
        geo_result = await geocode_by_address(amap_key, request.address)
        if geo_result:
            print(f"✅ 地理编码成功")
            return geo_result
        
        # 都失败了
        raise HTTPException(status_code=404, detail=f"无法找到该地址: {request.address}")
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="地理编码服务超时")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 地理编码错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"地理编码服务错误: {str(e)}")


async def search_poi(amap_key: str, keyword: str) -> Optional[GeocodeResponse]:
    """
    POI（兴趣点）搜索 - 更精确
    适用于：景点、学校、商场、酒店等
    """
    url = "https://restapi.amap.com/v3/place/text"
    params = {
        "key": amap_key,
        "keywords": keyword,
        "offset": 1,  # 只返回最相关的1个结果
        "extensions": "base"
    }
    
    print(f"🔍 POI搜索: {keyword}")
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(url, params=params)
        data = response.json()
        
        if data.get("status") == "1" and data.get("count") != "0":
            pois = data.get("pois", [])
            if pois:
                poi = pois[0]
                location = poi["location"].split(",")
                print(f"📍 找到POI: {poi.get('name')} - {poi.get('address')}")
                return GeocodeResponse(
                    lng=float(location[0]),
                    lat=float(location[1]),
                    formatted_address=poi.get("address"),
                    name=poi.get("name")
                )
    
    return None


async def geocode_by_address(amap_key: str, address: str) -> Optional[GeocodeResponse]:
    """
    传统地理编码
    适用于：详细地址
    """
    url = "https://restapi.amap.com/v3/geocode/geo"
    params = {
        "key": amap_key,
        "address": address
    }
    
    print(f"📡 地理编码: {address}")
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(url, params=params)
        data = response.json()
        
        print(f"🗺️ 地理编码响应: {data}")
        
        if data.get("status") == "1" and data.get("count") != "0":
            geocodes = data.get("geocodes", [])
            if geocodes:
                location = geocodes[0]["location"].split(",")
                return GeocodeResponse(
                    lng=float(location[0]),
                    lat=float(location[1]),
                    formatted_address=geocodes[0].get("formatted_address")
                )
        
        # 检查错误信息
        if data.get("status") == "0":
            error_msg = data.get("info", "未知错误")
            print(f"❌ 地理编码失败: {error_msg}")
    
    return None


@router.post("/driving-route")
async def get_driving_route(request: RouteRequest):
    """
    驾车路径规划
    使用高德地图Web服务API（backend api Key）
    """
    amap_key = os.getenv("AMAP_WEB_KEY", "564f4fc5fbd68a60cf4b80191841d1ee")
    
    print(f"🚗 驾车路径规划: ({request.origin_lng}, {request.origin_lat}) → ({request.destination_lng}, {request.destination_lat})")
    
    try:
        # 调用高德地图驾车路径规划API
        url = "https://restapi.amap.com/v3/direction/driving"
        params = {
            "key": amap_key,
            "origin": f"{request.origin_lng},{request.origin_lat}",
            "destination": f"{request.destination_lng},{request.destination_lat}",
            "extensions": "all",  # all=详细信息（包含完整polyline），base=基本信息
            "strategy": 0  # 0=最快捷, 1=最经济, 2=最短距离
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            data = response.json()
            
            print(f"📊 路径规划API响应状态: {data.get('status')}, info: {data.get('info')}")
            
            if data.get("status") == "1" and data.get("route"):
                route = data["route"]
                paths = route.get("paths", [])
                
                if paths:
                    path = paths[0]
                    steps = path.get("steps", [])
                    
                    print(f"📊 Path数据: distance={path.get('distance')}, duration={path.get('duration')}")
                    print(f"📊 Path keys: {list(path.keys())}")
                    print(f"📊 Polyline in path: {path.get('polyline', 'NOT_FOUND')[:100] if path.get('polyline') else 'EMPTY'}")
                    
                    # 如果path没有polyline，尝试从steps中组合
                    path_polyline = path.get("polyline", "")
                    if not path_polyline and steps:
                        # 将所有step的polyline连接起来
                        step_polylines = []
                        for step in steps:
                            step_poly = step.get("polyline", "")
                            if step_poly:
                                step_polylines.append(step_poly)
                        path_polyline = ";".join(step_polylines)
                        print(f"✅ 从steps组合polyline，总长度: {len(path_polyline)}")
                    
                    return RouteResponse(
                        distance=float(path.get("distance", 0)),
                        duration=float(path.get("duration", 0)),
                        steps=[{
                            "instruction": step.get("instruction", ""),
                            "road": step.get("road", ""),
                            "distance": step.get("distance", ""),
                            "duration": step.get("duration", ""),
                            "polyline": step.get("polyline", "")
                        } for step in steps],
                        polyline=path_polyline
                    )
            
            # API调用失败
            error_msg = data.get("info", "未知错误")
            print(f"❌ 路径规划失败: {error_msg}")
            raise HTTPException(
                status_code=400,
                detail=f"路径规划失败: {error_msg}"
            )
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="路径规划服务超时")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 路径规划错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"路径规划服务错误: {str(e)}")

