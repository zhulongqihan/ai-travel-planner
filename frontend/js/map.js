// 高德地图集成

let mainMap = null; // 主地图实例
let markers = [];

// 页面加载时初始化主地图
document.addEventListener("DOMContentLoaded", function () {
  initMainMap();
});

// 初始化主地图
function initMainMap() {
  console.log("开始初始化主地图...");

  if (!window.AMap) {
    console.error("❌ 高德地图API未加载，请检查：");
    console.error("1. 网络连接是否正常");
    console.error("2. 高德地图API Key是否有效");
    console.error("3. HTML中的地图API引用是否正确");
    return;
  }

  const mapContainer = document.getElementById("mainMap");
  if (!mapContainer) {
    console.error("❌ 找不到地图容器 #mainMap");
    return;
  }

  console.log(
    "✓ 地图容器存在，容器尺寸:",
    mapContainer.offsetWidth,
    "x",
    mapContainer.offsetHeight
  );

  try {
    // 使用mainMap作为容器ID
    mainMap = new AMap.Map("mainMap", {
      zoom: 5,
      center: [105, 35], // 默认中国中心
      mapStyle: "amap://styles/normal",
      features: ["bg", "road", "building"],
      resizeEnable: true,
    });

    // 延迟触发resize，确保地图正确渲染
    setTimeout(() => {
      if (mainMap) {
        mainMap.resize();
        console.log("✅ 主地图初始化完成并已调整尺寸！");
      }
    }, 300);

    console.log("✅ 主地图初始化完成！");
  } catch (error) {
    console.error("❌ 地图初始化失败:", error);
  }
}

// 获取地点坐标（智能方案：JS API → 内置坐标 → 后端API）
async function getLocationCoords(address) {
  console.log("🔍 获取地点坐标:", address);

  // 方案1: 尝试JS API（快速但可能失败）
  try {
    const coords = await geocodeAddress(address);
    console.log("✅ JS API成功:", address);
    return coords;
  } catch (jsError) {
    console.warn("⚠️ JS API失败，尝试其他方案:", address);
  }

  // 方案2: 尝试内置坐标库（仅精确匹配城市）
  const cityCoords = getCityCoordinates(address);
  if (cityCoords) {
    console.log("✅ 内置坐标成功:", address);
    return cityCoords;
  }

  // 方案3: 调用后端POI搜索API（高德地图）
  try {
    const backendCoords = await geocodeAddressViaBackend(address);
    console.log("✅ 后端API成功:", address);
    return backendCoords;
  } catch (backendError) {
    console.warn("⚠️ 高德地图API失败，尝试国际地理编码:", address);
  }

  // 方案4: 使用国际地理编码服务（OpenStreetMap Nominatim）
  try {
    const osmCoords = await geocodeAddressViaOSM(address);
    console.log("✅ OpenStreetMap成功（国际地点）:", address);
    return osmCoords;
  } catch (osmError) {
    console.error("❌ 所有方案都失败:", address, osmError);
    throw new Error(`无法定位: ${address}`);
  }
}

// 在主地图上显示标记
function showLocationsOnMainMap(locations, title = "旅行地图") {
  if (!mainMap) {
    console.error("主地图未初始化");
    initMainMap();
    return;
  }

  // 更新地图标题
  document.getElementById("mainMapTitle").textContent = title;
  document.getElementById(
    "mainMapSubtitle"
  ).textContent = `共 ${locations.length} 个地点`;

  // 清除现有标记和路线
  clearMarkers();
  clearAllDrivingRoutes();

  if (!locations || locations.length === 0) {
    document.getElementById("mainMapSubtitle").textContent = "暂无地点数据";
    return;
  }

  // 添加新标记
  locations.forEach((location, index) => {
    if (location.location && location.location.lng && location.location.lat) {
      // 根据类型选择图标
      let icon = "📍"; // 默认图标
      if (location.type === "activity") {
        icon = "🎯";
      } else if (location.type === "restaurant") {
        icon = "🍽️";
      } else if (location.type === "hotel") {
        icon = "🏨";
      }

      const marker = new AMap.Marker({
        position: [location.location.lng, location.location.lat],
        title: location.name,
        label: {
          content: `<div style="background: white; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${icon} ${
            index + 1
          }. ${location.name}</div>`,
          direction: "top",
          offset: new AMap.Pixel(0, -10),
        },
      });

      // 添加信息窗口
      const typeLabel =
        location.type === "activity"
          ? "景点"
          : location.type === "restaurant"
          ? "餐厅"
          : location.type === "hotel"
          ? "住宿"
          : "地点";

      const infoWindow = new AMap.InfoWindow({
        content: `
                    <div style="padding: 12px; min-width: 200px;">
                        <h4 style="margin: 0 0 8px 0; color: #2563eb;">${icon} ${
          location.name
        }</h4>
                        <p style="margin: 4px 0; color: #64748b; font-size: 0.9em;"><strong>类型：</strong>${typeLabel}</p>
                        <p style="margin: 4px 0; color: #1e293b;">${
                          location.description || "暂无描述"
                        }</p>
                        <p style="margin: 8px 0 0 0; color: #10b981; font-weight: bold;">💰 预估费用：¥${
                          location.estimated_cost || 0
                        }</p>
                    </div>
                `,
      });

      marker.on("click", () => {
        infoWindow.open(mainMap, marker.getPosition());
      });

      mainMap.add(marker);
      markers.push(marker);
    }
  });

  // 自动调整地图视野
  if (markers.length > 0) {
    mainMap.setFitView(markers, false, [60, 60, 60, 60]);
  }
}

// 根据目的地名称定位地图
async function locateDestinationOnMap(destinationName) {
  console.log("🔍 locateDestinationOnMap 被调用，目的地:", destinationName);

  if (!mainMap) {
    console.error("❌ 主地图未初始化，mainMap 为:", mainMap);
    return;
  }

  console.log("✅ 主地图已初始化");

  if (!destinationName) {
    console.log("⚠️ 目的地名称为空");
    return;
  }

  try {
    console.log("📡 开始地理编码:", destinationName);

    // 三重保障方案获取坐标
    let coords;
    try {
      // 方案1: 尝试使用JS API地理编码
      coords = await geocodeAddress(destinationName);
      console.log("✅ JS API地理编码成功，坐标:", coords);
    } catch (geoError) {
      console.warn("⚠️ JS API地理编码失败:", geoError.message);

      // 方案2: 使用内置的常见城市坐标
      coords = getCityCoordinates(destinationName);
      if (coords) {
        console.log("✅ 使用内置坐标:", coords);
      } else {
        console.log("⚠️ 内置坐标库中没有该城市，尝试后端API");

        // 方案3: 调用后端地理编码API
        try {
          coords = await geocodeAddressViaBackend(destinationName);
          console.log("✅ 后端API地理编码成功，坐标:", coords);
        } catch (backendError) {
          console.error("❌ 后端API也失败了:", backendError.message);
          throw new Error("所有地理编码方案都失败了");
        }
      }
    }

    // 清除旧标记
    clearMarkers();
    console.log("🧹 已清除旧标记");

    // 确定显示的名称（优先使用POI名称）
    const displayName = coords.name || destinationName;
    const subtitle = coords.formatted_address || "目的地位置";

    // 添加目的地标记
    const marker = new AMap.Marker({
      position: [coords.lng, coords.lat],
      title: displayName,
      label: {
        content: `<div style="background: white; padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-weight: bold; color: #2563eb;">📍 ${displayName}</div>`,
        direction: "top",
        offset: new AMap.Pixel(0, -20),
      },
    });

    mainMap.add(marker);
    markers.push(marker);
    console.log("📍 已添加目的地标记");

    // 定位到目的地
    mainMap.setZoomAndCenter(12, [coords.lng, coords.lat]);
    console.log("🗺️ 地图已移动到目的地");

    // 更新地图标题
    document.getElementById("mainMapTitle").textContent = displayName;
    document.getElementById("mainMapSubtitle").textContent = subtitle;
    console.log("✏️ 已更新地图标题");

    console.log(`✅ 成功定位到: ${destinationName}`);
  } catch (error) {
    console.error(`❌ 无法定位: ${destinationName}`, error);
    alert(`无法定位到"${destinationName}"，请检查地名是否正确`);
  }
}

// 清除所有标记
function clearMarkers() {
  if (markers.length > 0 && mainMap) {
    mainMap.remove(markers);
    markers = [];
  }
}

// 存储路线对象和信息
let routePolylines = [];
let routeInfoList = []; // 存储路线详细信息

// 清除所有路线
function clearRoutes() {
  if (routePolylines.length > 0 && mainMap) {
    mainMap.remove(routePolylines);
    routePolylines = [];
    routeInfoList = [];
    console.log("🧹 已清除所有路线");
  }
}

// 绘制旅行路线（通过后端API获取真实路线）
async function drawTravelRoute(locations) {
  if (!mainMap || !locations || locations.length < 2) {
    console.log("⚠️ 地点不足，无法绘制路线（至少需要2个地点）");
    return;
  }

  console.log(`🚗 开始绘制真实导航路线，共 ${locations.length} 个地点`);

  // 清除旧路线
  clearRoutes();

  let successCount = 0;
  let failCount = 0;

  // 为连续的地点规划路线
  for (let i = 0; i < locations.length - 1; i++) {
    const startLoc = locations[i];
    const endLoc = locations[i + 1];

    if (!startLoc.location || !endLoc.location) {
      console.log(`⚠️ 跳过路线 ${i + 1}: 缺少坐标信息`);
      continue;
    }

    // 检查起点和终点是否太近（小于10米视为同一地点）
    const distance = AMap.GeometryUtil.distance(
      [startLoc.location.lng, startLoc.location.lat],
      [endLoc.location.lng, endLoc.location.lat]
    );

    if (distance < 10) {
      console.log(
        `⚠️ 跳过路线 ${i + 1}: ${startLoc.name} 和 ${
          endLoc.name
        } 距离太近 (${Math.round(distance)}米)`
      );
      continue;
    }

    // 根据地点类型选择线条颜色
    let strokeColor = "#2563eb"; // 默认蓝色
    if (startLoc.type === "hotel" || endLoc.type === "hotel") {
      strokeColor = "#8b5cf6"; // 紫色 - 往返酒店
    } else if (startLoc.type === "restaurant" || endLoc.type === "restaurant") {
      strokeColor = "#f59e0b"; // 橙色 - 去餐厅
    }

    try {
      // 调用后端API获取路线
      const response = await fetch(`${API_BASE_URL}/map/driving-route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin_lng: startLoc.location.lng,
          origin_lat: startLoc.location.lat,
          destination_lng: endLoc.location.lng,
          destination_lat: endLoc.location.lat,
        }),
      });

      if (response.ok) {
        const routeData = await response.json();

        console.log(`  └─ 后端返回的完整数据:`, routeData);
        console.log(
          `  └─ Polyline原始数据（前100字符）:`,
          routeData.polyline ? routeData.polyline.substring(0, 100) : "(空)"
        );

        // 解析polyline坐标串并绘制路线
        const path = parsePolyline(routeData.polyline);

        console.log(`  └─ 解析后路径点数: ${path.length}`);
        if (path.length > 0) {
          console.log(`  └─ 第一个点:`, path[0]);
          console.log(`  └─ 最后一个点:`, path[path.length - 1]);
        }

        if (path.length < 2) {
          throw new Error("路径点数不足");
        }

        const polyline = new AMap.Polyline({
          path: path,
          strokeColor: strokeColor,
          strokeWeight: 5,
          strokeOpacity: 0.8,
          strokeStyle: "solid",
          lineJoin: "round",
          lineCap: "round",
          extData: { routeIndex: i + 1 }, // 保存路线序号
        });

        mainMap.add(polyline);
        routePolylines.push(polyline);

        // 在路线中点添加序号标记
        const midPointIndex = Math.floor(path.length / 2);
        const midPoint = path[midPointIndex];

        const routeMarker = new AMap.Marker({
          position: midPoint,
          content: `<div class="route-number-marker">${i + 1}</div>`,
          offset: new AMap.Pixel(-15, -15),
          zIndex: 1000,
        });

        mainMap.add(routeMarker);
        routePolylines.push(routeMarker); // 也加入清除列表

        // 保存路线信息
        const routeInfo = {
          index: i + 1,
          from: startLoc.name,
          to: endLoc.name,
          distance: routeData.distance,
          duration: routeData.duration,
          type: startLoc.type || "activity",
          color: strokeColor,
          polyline: polyline,
        };
        routeInfoList.push(routeInfo);

        successCount++;
        console.log(`✓ 路线 ${i + 1}: ${startLoc.name} → ${endLoc.name}`);
        console.log(
          `  └─ 距离: ${(routeData.distance / 1000).toFixed(
            1
          )}km, 时间: ${Math.round(routeData.duration / 60)}分钟`
        );
      } else {
        throw new Error("路线规划失败");
      }
    } catch (error) {
      failCount++;
      console.warn(
        `⚠️ 路线规划失败 ${i + 1}: ${startLoc.name} → ${endLoc.name}`,
        error.message
      );

      // 路线规划失败时，绘制虚线作为后备方案
      const polyline = new AMap.Polyline({
        path: [
          [startLoc.location.lng, startLoc.location.lat],
          [endLoc.location.lng, endLoc.location.lat],
        ],
        strokeColor: strokeColor,
        strokeWeight: 3,
        strokeOpacity: 0.5,
        strokeStyle: "dashed", // 虚线表示这是直线而非真实路线
      });
      mainMap.add(polyline);
      routePolylines.push(polyline);
      console.log(`  └─ 已使用虚线直连作为替代`);
    }
  }

  console.log(
    `✅ 路线规划完成！成功: ${successCount}, 失败(使用虚线): ${failCount}`
  );

  // 显示路线信息面板
  displayRouteInfoPanel();
}

// 显示路线信息面板
function displayRouteInfoPanel() {
  if (routeInfoList.length === 0) return;

  // 计算总距离和总时间
  const totalDistance = routeInfoList.reduce(
    (sum, route) => sum + route.distance,
    0
  );
  const totalDuration = routeInfoList.reduce(
    (sum, route) => sum + route.duration,
    0
  );

  // 更新地图标题信息
  const mapTitle = document.getElementById("mainMapTitle");
  const mapSubtitle = document.getElementById("mainMapSubtitle");

  if (mapTitle && mapSubtitle) {
    mapTitle.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>🗺️ 旅行路线</span>
                <span style="font-size: 14px; color: #64748b; font-weight: normal;">
                    ${routeInfoList.length}段 · ${(
      totalDistance / 1000
    ).toFixed(1)}km · ${Math.round(totalDuration / 60)}分钟
                </span>
            </div>
        `;
    mapSubtitle.textContent = "点击地图上的路线编号查看详情";
  }

  // 在旅行计划下方显示路线列表
  const routeInfoSection = document.getElementById("routeInfoSection");
  const routeInfoListContainer = document.getElementById("routeInfoList");

  if (routeInfoSection && routeInfoListContainer) {
    // 显示路线信息区域
    routeInfoSection.style.display = "block";

    // 创建路线列表HTML
    let routeListHTML = "";
    routeInfoList.forEach((route, index) => {
      const typeIcon = getTypeIcon(route.type);
      routeListHTML += `
                <div class="route-item" data-route-index="${
                  route.index
                }" onclick="highlightRoute(${route.index})">
                    <div class="route-number" style="background: ${
                      route.color
                    };">${route.index}</div>
                    <div class="route-details">
                        <div class="route-title">
                            <span>${typeIcon}</span>
                            <span>${route.from}</span>
                            <span style="color: #94a3b8;"> → </span>
                            <span>${route.to}</span>
                        </div>
                        <div class="route-stats">
                            <span>📏 ${(route.distance / 1000).toFixed(
                              1
                            )}km</span>
                            <span>⏱️ ${Math.round(
                              route.duration / 60
                            )}分钟</span>
                        </div>
                    </div>
                </div>
            `;
    });

    routeInfoListContainer.innerHTML = routeListHTML;
  }
}

// 获取类型图标
function getTypeIcon(type) {
  const icons = {
    activity: "🎯",
    restaurant: "🍽️",
    hotel: "🏨",
  };
  return icons[type] || "📍";
}

// 高亮路线（全局函数，供HTML调用）
window.highlightRoute = function (routeIndex) {
  console.log(`🎯 高亮路线 ${routeIndex}`);

  // 重置所有路线样式
  routePolylines.forEach((item) => {
    if (
      item.CLASS_NAME === "AMap.Polyline" ||
      item.CLASS_NAME === "Overlay.Polyline"
    ) {
      item.setOptions({
        strokeWeight: 5,
        strokeOpacity: 0.8,
        zIndex: 50,
      });
    }
  });

  // 高亮选中的路线
  const targetPolyline = routePolylines.find((item) => {
    return (
      (item.CLASS_NAME === "AMap.Polyline" ||
        item.CLASS_NAME === "Overlay.Polyline") &&
      item.getExtData()?.routeIndex === routeIndex
    );
  });

  if (targetPolyline) {
    targetPolyline.setOptions({
      strokeWeight: 8,
      strokeOpacity: 1,
      zIndex: 100,
    });

    // 地图移动到该路线
    const path = targetPolyline.getPath();
    if (path && path.length > 0) {
      const midIndex = Math.floor(path.length / 2);
      mainMap.setZoomAndCenter(14, path[midIndex]);
    }
  }

  // 更新列表项样式
  document.querySelectorAll(".route-item").forEach((item) => {
    item.classList.remove("active");
  });
  const activeItem = document.querySelector(
    `[data-route-index="${routeIndex}"]`
  );
  if (activeItem) {
    activeItem.classList.add("active");
  }
};

// 解析高德地图的polyline编码字符串为坐标数组
function parsePolyline(polylineStr) {
  if (!polylineStr || typeof polylineStr !== "string") {
    console.error("❌ Invalid polyline:", polylineStr);
    return [];
  }

  try {
    const coordinates = polylineStr.split(";");
    const path = [];

    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i].trim();
      if (!coord) continue; // 跳过空字符串

      const parts = coord.split(",");
      if (parts.length !== 2) {
        console.warn(`⚠️ Invalid coordinate at index ${i}:`, coord);
        continue;
      }

      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);

      // 验证坐标是否有效
      if (isNaN(lng) || isNaN(lat)) {
        console.warn(`⚠️ NaN coordinate at index ${i}:`, coord);
        continue;
      }

      // 验证坐标范围（中国境内大致范围：73-136°E, 3-54°N）
      if (lng < 73 || lng > 136 || lat < 3 || lat > 54) {
        console.warn(`⚠️ Out of range coordinate at index ${i}:`, lng, lat);
        // 不跳过，继续使用，可能是边界情况
      }

      path.push([lng, lat]);
    }

    return path;
  } catch (error) {
    console.error("❌ Error parsing polyline:", error);
    return [];
  }
}

// 清除所有驾车路线规划（需要重新规划时调用）
function clearAllDrivingRoutes() {
  console.log("🧹 清除所有驾车路线");

  // 清除地图上所有覆盖物（路线、标记等）
  // 但保留我们手动添加的标记
  if (mainMap) {
    const overlays = mainMap.getAllOverlays();
    overlays.forEach((overlay) => {
      // 只清除Polyline类型的覆盖物（路线）
      if (
        overlay.CLASS_NAME === "AMap.Polyline" ||
        overlay.CLASS_NAME === "Overlay.Polyline"
      ) {
        mainMap.remove(overlay);
      }
    });
  }
}

// 地理编码 - 根据地址获取坐标
async function geocodeAddress(address) {
  console.log("🔧 geocodeAddress 开始，地址:", address);

  return new Promise((resolve, reject) => {
    console.log("📦 开始加载 AMap.Geocoder 插件...");

    // 添加超时处理（3秒）
    const timeout = setTimeout(() => {
      console.warn("⏰ 地理编码API无响应（3秒），将使用备用坐标");
      reject(new Error("地理编码API无响应"));
    }, 3000);

    AMap.plugin("AMap.Geocoder", () => {
      console.log("✅ AMap.Geocoder 插件加载成功");

      try {
        const geocoder = new AMap.Geocoder({
          city: "全国", // 设置城市范围为全国
        });
        console.log("✅ Geocoder 实例创建成功");

        console.log("🔍 调用 getLocation，地址:", address);
        console.log("🔧 Geocoder 配置:", geocoder);

        geocoder.getLocation(address, (status, result) => {
          clearTimeout(timeout); // 清除超时

          console.log("📡 getLocation 回调触发");
          console.log("📊 状态码:", status);
          console.log("📦 完整结果:", JSON.stringify(result, null, 2));

          if (status === "complete" && result.info === "OK") {
            if (result.geocodes && result.geocodes.length > 0) {
              const location = result.geocodes[0].location;
              const coords = {
                lng: location.getLng(),
                lat: location.getLat(),
              };
              console.log("✅ 地理编码成功，坐标:", coords);
              resolve(coords);
            } else {
              console.error("❌ 没有找到地理编码结果");
              reject(new Error("没有找到该地址"));
            }
          } else {
            console.error(
              "❌ 地理编码失败，状态:",
              status,
              "信息:",
              result.info
            );
            reject(new Error(`地理编码失败: ${result.info || status}`));
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        console.error("❌ Geocoder 创建或调用失败:", error);
        reject(error);
      }
    });
  });
}

// 搜索周边POI（景点、餐厅等）
async function searchNearby(location, keyword, type = "") {
  return new Promise((resolve, reject) => {
    AMap.plugin("AMap.PlaceSearch", () => {
      const placeSearch = new AMap.PlaceSearch({
        type: type,
        pageSize: 10,
        pageIndex: 1,
        city: "全国",
      });

      placeSearch.searchNearBy(
        keyword,
        [location.lng, location.lat],
        5000,
        (status, result) => {
          if (status === "complete" && result.info === "OK") {
            resolve(result.poiList.pois);
          } else {
            reject(new Error("搜索失败"));
          }
        }
      );
    });
  });
}

// 通过后端API进行地理编码（方案3）
async function geocodeAddressViaBackend(address) {
  console.log("🌐 调用后端地理编码API:", address);

  try {
    const response = await fetch(`${API_BASE_URL}/map/geocode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: address }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "后端地理编码失败");
    }

    const data = await response.json();
    console.log("✅ 后端API返回:", data);

    return {
      lng: data.lng,
      lat: data.lat,
      name: data.name, // POI名称
      formatted_address: data.formatted_address,
    };
  } catch (error) {
    console.error("❌ 后端地理编码请求失败:", error);
    throw error;
  }
}

// 获取常见城市坐标（备用方案2）
function getCityCoordinates(cityName) {
  // 常见城市坐标库
  const cityCoords = {
    北京: { lng: 116.407526, lat: 39.90403 },
    上海: { lng: 121.473701, lat: 31.230416 },
    广州: { lng: 113.264385, lat: 23.129112 },
    深圳: { lng: 114.057868, lat: 22.543099 },
    杭州: { lng: 120.153576, lat: 30.287459 },
    成都: { lng: 104.065735, lat: 30.659462 },
    重庆: { lng: 106.504962, lat: 29.533155 },
    武汉: { lng: 114.305393, lat: 30.593099 },
    西安: { lng: 108.948024, lat: 34.263161 },
    南京: { lng: 118.767413, lat: 32.041544 },
    天津: { lng: 117.190182, lat: 39.125596 },
    苏州: { lng: 120.585315, lat: 31.298886 },
    长沙: { lng: 112.982279, lat: 28.19409 },
    郑州: { lng: 113.665412, lat: 34.757975 },
    济南: { lng: 117.000923, lat: 36.675807 },
    青岛: { lng: 120.369557, lat: 36.094406 },
    大连: { lng: 121.618622, lat: 38.91459 },
    厦门: { lng: 118.11022, lat: 24.490474 },
    昆明: { lng: 102.712251, lat: 25.040609 },
    哈尔滨: { lng: 126.642464, lat: 45.756967 },
    沈阳: { lng: 123.429096, lat: 41.796767 },
    长春: { lng: 125.3245, lat: 43.886841 },
    石家庄: { lng: 114.502461, lat: 38.045474 },
    太原: { lng: 112.549248, lat: 37.857014 },
    合肥: { lng: 117.283042, lat: 31.86119 },
    南昌: { lng: 115.892151, lat: 28.676493 },
    福州: { lng: 119.306239, lat: 26.075302 },
    海口: { lng: 110.33119, lat: 20.031971 },
    三亚: { lng: 109.508268, lat: 18.247872 },
    拉萨: { lng: 91.132212, lat: 29.660361 },
    乌鲁木齐: { lng: 87.617733, lat: 43.792818 },
    银川: { lng: 106.278179, lat: 38.46637 },
    呼和浩特: { lng: 111.670801, lat: 40.818311 },
    兰州: { lng: 103.823557, lat: 36.058039 },
    西宁: { lng: 101.778916, lat: 36.623178 },
    贵阳: { lng: 106.713478, lat: 26.578343 },
    南宁: { lng: 108.320004, lat: 22.82402 },

    // 国际城市 - 亚洲
    东京: { lng: 139.691706, lat: 35.689487 },
    大阪: { lng: 135.502165, lat: 34.693738 },
    京都: { lng: 135.768029, lat: 35.011636 },
    首尔: { lng: 126.977969, lat: 37.566535 },
    釜山: { lng: 129.075642, lat: 35.179554 },
    曼谷: { lng: 100.501765, lat: 13.756331 },
    新加坡: { lng: 103.819836, lat: 1.352083 },
    吉隆坡: { lng: 101.686855, lat: 3.139003 },
    河内: { lng: 105.804817, lat: 21.028511 },
    胡志明市: { lng: 106.629664, lat: 10.776889 },
    马尼拉: { lng: 120.984219, lat: 14.599512 },
    雅加达: { lng: 106.845599, lat: -6.208763 },
    德里: { lng: 77.209023, lat: 28.613939 },
    孟买: { lng: 72.877656, lat: 19.075984 },
    迪拜: { lng: 55.296249, lat: 25.276987 },

    // 欧洲
    巴黎: { lng: 2.352222, lat: 48.856614 },
    伦敦: { lng: -0.127758, lat: 51.507351 },
    罗马: { lng: 12.496366, lat: 41.902782 },
    威尼斯: { lng: 12.315515, lat: 45.440847 },
    巴塞罗那: { lng: 2.173403, lat: 41.385064 },
    马德里: { lng: -3.70379, lat: 40.416775 },
    阿姆斯特丹: { lng: 4.904139, lat: 52.370216 },
    柏林: { lng: 13.404954, lat: 52.520007 },
    慕尼黑: { lng: 11.581981, lat: 48.135125 },
    维也纳: { lng: 16.373819, lat: 48.208174 },
    布拉格: { lng: 14.41854, lat: 50.075538 },
    雅典: { lng: 23.727539, lat: 37.98381 },
    莫斯科: { lng: 37.618423, lat: 55.755826 },

    // 美洲
    纽约: { lng: -74.005941, lat: 40.712784 },
    洛杉矶: { lng: -118.243685, lat: 34.052234 },
    旧金山: { lng: -122.419416, lat: 37.774929 },
    芝加哥: { lng: -87.629798, lat: 41.878114 },
    拉斯维加斯: { lng: -115.13983, lat: 36.169941 },
    迈阿密: { lng: -80.193659, lat: 25.76168 },
    多伦多: { lng: -79.383184, lat: 43.653226 },
    温哥华: { lng: -123.120738, lat: 49.282729 },
    墨西哥城: { lng: -99.133208, lat: 19.432608 },
    里约热内卢: { lng: -43.172896, lat: -22.906847 },

    // 大洋洲
    悉尼: { lng: 151.209296, lat: -33.86882 },
    墨尔本: { lng: 144.963058, lat: -37.813628 },
    奥克兰: { lng: 174.763332, lat: -36.848461 },
  };

  // 只进行精确匹配
  // 不使用模糊匹配，避免"南京大学"被匹配为"南京市"
  // 如果精确匹配失败，返回null，让后端API来处理精确定位
  if (cityCoords[cityName]) {
    console.log(`✅ 内置坐标库精确匹配: ${cityName}`);
    return cityCoords[cityName];
  }

  console.log(`⚠️ 内置坐标库无精确匹配: ${cityName}，将使用后端API`);
  return null;
}

// 使用OpenStreetMap Nominatim API进行国际地理编码（备用方案4）
async function geocodeAddressViaOSM(address) {
  console.log("🌍 尝试使用OpenStreetMap进行国际地理编码:", address);

  try {
    // 构建搜索URL，增加更多参数以提高搜索质量
    // limit=5: 返回前5个结果，从中选择最佳
    // addressdetails=1: 返回详细地址信息
    // dedupe=0: 不去重，获取更多可能的结果
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `format=json` +
      `&q=${encodeURIComponent(address)}` +
      `&limit=5` +
      `&addressdetails=1` +
      `&dedupe=0` +
      `&accept-language=zh-CN,en`;

    console.log("📡 Nominatim请求URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "AI-Travel-Planner/1.0", // Nominatim要求设置User-Agent
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API请求失败: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📡 Nominatim API返回 ${data.length} 个结果:`, data);

    if (!data || data.length === 0) {
      throw new Error("未找到该地点");
    }

    // 智能选择最佳结果
    const bestResult = selectBestResult(data, address);
    console.log("✅ 选择最佳结果:", bestResult);

    // 注意：OpenStreetMap使用的是标准经纬度格式 (lat, lon)
    // 高德地图使用的是 (lng, lat)
    return {
      lng: parseFloat(bestResult.lon),
      lat: parseFloat(bestResult.lat),
      formatted_address: bestResult.display_name,
      name: bestResult.name || bestResult.display_name.split(",")[0] || address,
    };
  } catch (error) {
    console.error("❌ OpenStreetMap地理编码失败:", error);
    throw error;
  }
}

// 从多个搜索结果中选择最佳结果
function selectBestResult(results, searchQuery) {
  if (results.length === 1) {
    return results[0];
  }

  console.log("🎯 开始选择最佳结果，搜索词:", searchQuery);

  // 评分系统
  let scored = results.map((result, index) => {
    let score = 100 - index; // 基础分：排名越靠前分数越高

    // 加分项1：重要性评分（importance字段）
    if (result.importance) {
      score += result.importance * 50;
    }

    // 加分项2：类型优先级
    const type = result.type || "";
    const osmType = result.osm_type || "";

    // 优先城市、景点、建筑物
    if (type === "city" || type === "town" || type === "administrative") {
      score += 30;
    } else if (type === "tourism" || type === "attraction") {
      score += 25;
    } else if (type === "building" || type === "place_of_worship") {
      score += 20;
    }

    // 加分项3：名称匹配度
    const displayName = (result.display_name || "").toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    if (displayName.includes(searchLower)) {
      score += 40;
    }

    // 加分项4：地址详细程度（有address对象的优先）
    if (result.address) {
      score += 10;

      // 有城市信息的优先
      if (result.address.city || result.address.town || result.address.state) {
        score += 15;
      }

      // 有国家信息的优先
      if (result.address.country) {
        score += 10;
      }
    }

    // 减分项：class为boundary的通常是行政边界，不是具体地点
    if (result.class === "boundary") {
      score -= 20;
    }

    console.log(
      `  候选 ${index + 1}: ${result.display_name.substring(
        0,
        60
      )}... (score: ${score.toFixed(1)})`
    );

    return {
      result: result,
      score: score,
    };
  });

  // 按分数排序
  scored.sort((a, b) => b.score - a.score);

  console.log(
    `✅ 最佳结果: ${
      scored[0].result.display_name
    } (score: ${scored[0].score.toFixed(1)})`
  );

  return scored[0].result;
}

// 路线规划
async function planRoute(origin, destination, mode = "WALKING") {
  return new Promise((resolve, reject) => {
    let routeService;

    switch (mode) {
      case "DRIVING":
        AMap.plugin("AMap.Driving", () => {
          routeService = new AMap.Driving({
            map: map,
            panel: "route-panel",
          });

          routeService.search(origin, destination, (status, result) => {
            if (status === "complete") {
              resolve(result);
            } else {
              reject(new Error("路线规划失败"));
            }
          });
        });
        break;

      case "TRANSIT":
        AMap.plugin("AMap.Transfer", () => {
          routeService = new AMap.Transfer({
            map: map,
            panel: "route-panel",
            city: "北京",
          });

          routeService.search(origin, destination, (status, result) => {
            if (status === "complete") {
              resolve(result);
            } else {
              reject(new Error("路线规划失败"));
            }
          });
        });
        break;

      default: // WALKING
        AMap.plugin("AMap.Walking", () => {
          routeService = new AMap.Walking({
            map: map,
            panel: "route-panel",
          });

          routeService.search(origin, destination, (status, result) => {
            if (status === "complete") {
              resolve(result);
            } else {
              reject(new Error("路线规划失败"));
            }
          });
        });
    }
  });
}
