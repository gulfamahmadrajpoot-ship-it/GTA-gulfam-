// Dual World Map System (Mode A: Original Game City, Mode B: Real-World OpenStreetMap Cities), Driving/Walking GPS Navigation, Favorites & Owner Map Builder
window.CityMap = (function () {
  const view = {
    mode: "original",       // "original" | "real"
    selectedCityId: "original",
    centerX: 2200,
    centerZ: 2200,
    zoom: 1.0,
    realCenterLat: 31.5204,
    realCenterLng: 74.3587,
    realZoom: 13,
    navMode: "driving",     // "driving" | "walking"
    editorMode: false,
    editorTool: "poi",      // "poi" | "building" | "road" | "mission_pt"
    pendingType: "Custom Spot",
    pendingRoadStart: null, // {x, z} while placing custom road
  };

  let destination = null;   // { x, z, lat, lng, name, route: [{x,z}...], realRoute: [[lat,lng]...], distMeters, etaSeconds, etaAvailable }
  let customPOIs = [];      // [{ id, name, category, x, z, lat, lng, color, cityId }]
  let ownerPins = [];       // Owner-published custom GPS destination pins
  let favorites = [];       // [{ id, name, x, z, lat, lng, cityId }]
  const tileCache = new Map();

  function deg2rad(d) { return (d * Math.PI) / 180; }

  function haversineMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function lngLatToTile(lat, lng, z) {
    const n = Math.pow(2, z);
    const x = ((lng + 180) / 360) * n;
    const latRad = deg2rad(lat);
    const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
    return { x, y };
  }

  function tileToLatLng(tx, ty, z) {
    const n = Math.pow(2, z);
    const lng = (tx / n) * 360 - 180;
    const nLat = Math.PI - (2 * Math.PI * ty) / n;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(nLat) - Math.exp(-nLat)));
    return { lat, lng };
  }

  function getOsmTile(z, tx, ty, onLoadCallback) {
    const n = Math.pow(2, z);
    const wrapX = ((tx % n) + n) % n;
    if (ty < 0 || ty >= n) return null;
    const key = `${z}/${wrapX}/${ty}`;
    if (tileCache.has(key)) return tileCache.get(key);
    const img = new Image();
    img.crossOrigin = "anonymous";
    const entry = { img, loaded: false, failed: false };
    tileCache.set(key, entry);
    img.onload = () => { entry.loaded = true; if (onLoadCallback) onLoadCallback(); };
    img.onerror = () => { entry.failed = true; };
    img.src = `https://tile.openstreetmap.org/${z}/${wrapX}/${ty}.png`;
    return entry;
  }

  // Street-by-street road network Dijkstra GPS router
  function computeRoadRoute(World, startX, startZ, destX, destZ) {
    const nodes = [];
    for (let r = 0; r < World.hRoads.length; r++) {
      for (let c = 0; c < World.vRoads.length; c++) {
        nodes.push({ x: World.vRoads[c], z: World.hRoads[r], r, c });
      }
    }
    nodes.push({ x: 4530, z: 4420, r: 5, c: 6 });

    function nearestNode(px, pz) {
      let best = 0, bestD = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        const d = Math.hypot(nodes[i].x - px, nodes[i].z - pz);
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    }

    const sIdx = nearestNode(startX, startZ);
    const eIdx = nearestNode(destX, destZ);
    const dist = new Array(nodes.length).fill(Infinity);
    const prev = new Array(nodes.length).fill(-1);
    const visited = new Array(nodes.length).fill(false);
    dist[sIdx] = 0;

    for (let step = 0; step < nodes.length; step++) {
      let u = -1;
      for (let i = 0; i < nodes.length; i++) {
        if (!visited[i] && (u === -1 || dist[i] < dist[u])) u = i;
      }
      if (u === -1 || dist[u] === Infinity || u === eIdx) break;
      visited[u] = true;

      const nu = nodes[u];
      for (let v = 0; v < nodes.length; v++) {
        if (visited[v]) continue;
        const nv = nodes[v];
        const connected =
          (nu.r === nv.r && Math.abs(nu.c - nv.c) === 1) ||
          (nu.c === nv.c && Math.abs(nu.r - nv.r) === 1);
        if (!connected) continue;
        const w = Math.hypot(nv.x - nu.x, nv.z - nu.z);
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          prev[v] = u;
        }
      }
    }

    const path = [{ x: startX, z: startZ }];
    const stack = [];
    let cur = eIdx;
    while (cur !== -1) {
      stack.push({ x: nodes[cur].x, z: nodes[cur].z });
      cur = prev[cur];
    }
    while (stack.length > 0) path.push(stack.pop());
    path.push({ x: destX, z: destZ });
    return path;
  }

  function computePathLengthMeters(path) {
    if (!path || path.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      total += Math.hypot(path[i + 1].x - path[i].x, path[i + 1].z - path[i].z);
    }
    return Math.round(total * 0.9); // ~0.9 meters per world unit
  }

  function getDirectionSummary(playerAngle, route, playerX, playerZ) {
    if (!route || route.length < 2) return { arrow: "↑", label: "HOLD COURSE" };
    const nextPt = route[1];
    const targetAng = Math.atan2(nextPt.x - playerX, nextPt.z - playerZ);
    let diff = targetAng - playerAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) < 0.4) return { arrow: "↑", label: "STRAIGHT" };
    if (diff > 0.4 && diff < 2.2) return { arrow: "↰", label: "TURN LEFT" };
    if (diff < -0.4 && diff > -2.2) return { arrow: "↱", label: "TURN RIGHT" };
    return { arrow: "↺", label: "U-TURN" };
  }

  function formatEta(seconds, available) {
    if (!available || !seconds || seconds <= 0) return "ETA unavailable";
    const mins = Math.max(1, Math.round(seconds / 60));
    return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  function setDestination(World, playerX, playerZ, x, z, name = "Custom GPS Pin", realLat = null, realLng = null) {
    const activeCity = World.getActiveCity();
    const speedMps = view.navMode === "walking" ? 1.45 : 14.5;

    if (view.mode === "real" && activeCity && !activeCity.playable3d) {
      // Navigation-only real city (OSM OSRM route lookup, zero fake playable 3D coords)
      const destLat = realLat !== null ? realLat : activeCity.lat;
      const destLng = realLng !== null ? realLng : activeCity.lng;
      const straightM = Math.round(haversineMeters(activeCity.lat, activeCity.lng, destLat, destLng));
      destination = {
        x: null,
        z: null,
        lat: destLat,
        lng: destLng,
        name,
        route: null,
        realRoute: [[activeCity.lat, activeCity.lng], [destLat, destLng]],
        distMeters: straightM,
        etaSeconds: null,
        etaAvailable: false,
      };
      fetchOsrmRoute(activeCity.lat, activeCity.lng, destLat, destLng, destination);
      return destination;
    }

    const route = computeRoadRoute(World, playerX, playerZ, x, z);
    const distMeters = computePathLengthMeters(route);
    const ll = window.CityRealCities ? window.CityRealCities.worldToLatLng(activeCity, x, z) : { lat: 0, lng: 0 };
    destination = {
      x,
      z,
      lat: realLat !== null ? realLat : ll.lat,
      lng: realLng !== null ? realLng : ll.lng,
      name,
      route,
      realRoute: null,
      distMeters,
      etaSeconds: Math.round(distMeters / speedMps),
      etaAvailable: route.length >= 2,
    };
    return destination;
  }

  async function fetchOsrmRoute(sLat, sLng, eLat, eLng, destObj) {
    try {
      const profile = view.navMode === "walking" ? "foot" : "driving";
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3500);
      const url = `https://router.project-osrm.org/route/v1/${profile}/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson`;
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) return;
      const data = await res.json();
      if (data.routes && data.routes.length > 0 && destination === destObj) {
        const r = data.routes[0];
        destObj.distMeters = Math.round(r.distance);
        destObj.etaSeconds = Math.round(r.duration);
        destObj.etaAvailable = true;
        if (r.geometry && Array.isArray(r.geometry.coordinates)) {
          destObj.realRoute = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        }
      }
    } catch (_) {
      // Keeps etaAvailable = false cleanly when offline instead of faking route ETA!
    }
  }

  function clearDestination() {
    destination = null;
  }

  function refreshRouteFromPlayer(World, playerX, playerZ) {
    if (!destination || destination.x === null) return;
    const speedMps = view.navMode === "walking" ? 1.45 : 14.5;
    destination.route = computeRoadRoute(World, playerX, playerZ, destination.x, destination.z);
    destination.distMeters = computePathLengthMeters(destination.route);
    destination.etaSeconds = Math.round(destination.distMeters / speedMps);
    destination.etaAvailable = destination.route.length >= 2;
  }

  function addCustomPOI(name, category, x, z, lat = null, lng = null) {
    const colors = {
      "Custom Spot": "#f59e0b",
      "Shop": "#10b981",
      "Stunt": "#ec4899",
      "Safehouse": "#38bdf8",
      "Ad Wall": "#a855f7",
      "Mission Pt": "#facc15",
    };
    const poi = {
      id: "poi_" + Date.now() + "_" + Math.floor(Math.random() * 999),
      name: name || category,
      category,
      cityId: view.selectedCityId,
      x: x !== null ? Math.round(x) : null,
      z: z !== null ? Math.round(z) : null,
      lat,
      lng,
      color: colors[category] || "#f59e0b",
    };
    customPOIs.push(poi);
    return poi;
  }

  function removeCustomPOI(id) {
    customPOIs = customPOIs.filter((p) => p.id !== id);
  }

  function addFavorite(name, x, z, lat, lng, cityId) {
    const fav = {
      id: "fav_" + Date.now(),
      name: name || "Saved Location",
      x: x !== null ? Math.round(x) : null,
      z: z !== null ? Math.round(z) : null,
      lat,
      lng,
      cityId: cityId || view.selectedCityId,
    };
    favorites.push(fav);
    return fav;
  }

  function removeFavorite(id) {
    favorites = favorites.filter((f) => f.id !== id);
  }

  function screenToWorld(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    const span = 5200 / view.zoom;
    const wx = view.centerX + (nx - 0.5) * span;
    const wz = view.centerZ + (ny - 0.5) * span;
    return {
      x: Math.max(40, Math.min(5160, wx)),
      z: Math.max(40, Math.min(5160, wz)),
    };
  }

  function screenToLatLng(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const dxPx = (clientX - rect.left) * (canvas.width / rect.width) - canvas.width / 2;
    const dyPx = (clientY - rect.top) * (canvas.height / rect.height) - canvas.height / 2;
    const centerTile = lngLatToTile(view.realCenterLat, view.realCenterLng, view.realZoom);
    const tx = centerTile.x + dxPx / 256;
    const ty = centerTile.y + dyPx / 256;
    return tileToLatLng(tx, ty, view.realZoom);
  }

  function findNearestMarker(World, wx, wz, maxRadius = 175) {
    for (let i = 0; i < ownerPins.length; i++) {
      const p = ownerPins[i];
      if (p.cityId && p.cityId !== view.selectedCityId) continue;
      if (typeof p.x === "number" && Math.hypot(p.x - wx, p.z - wz) < maxRadius) return { type: "owner_pin", item: p };
    }
    for (let i = 0; i < customPOIs.length; i++) {
      const p = customPOIs[i];
      if (p.cityId && p.cityId !== view.selectedCityId) continue;
      if (p.x !== null && Math.hypot(p.x - wx, p.z - wz) < maxRadius) return { type: "poi", item: p };
    }
    for (let i = 0; i < World.shops.length; i++) {
      const s = World.shops[i];
      if (Math.hypot(s.x - wx, s.z - wz) < maxRadius) return { type: "shop", item: s };
    }
    return null;
  }

  function renderRealOsmMap(ctx, w, h, World, Entities, onTileRedraw) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0b1422";
    ctx.fillRect(0, 0, w, h);

    const z = Math.max(4, Math.min(17, Math.round(view.realZoom)));
    const cTile = lngLatToTile(view.realCenterLat, view.realCenterLng, z);
    const tilesX = Math.ceil(w / 256) + 2;
    const tilesY = Math.ceil(h / 256) + 2;
    const startTx = Math.floor(cTile.x - tilesX / 2);
    const startTy = Math.floor(cTile.y - tilesY / 2);

    const latLngToPx = (lat, lng) => {
      const t = lngLatToTile(lat, lng, z);
      return {
        px: w / 2 + (t.x - cTile.x) * 256,
        py: h / 2 + (t.y - cTile.y) * 256,
      };
    };

    let anyTileLoaded = false;
    for (let tx = startTx; tx <= startTx + tilesX; tx++) {
      for (let ty = startTy; ty <= startTy + tilesY; ty++) {
        const px = Math.round(w / 2 + (tx - cTile.x) * 256);
        const py = Math.round(h / 2 + (ty - cTile.y) * 256);
        const entry = getOsmTile(z, tx, ty, onTileRedraw);
        if (entry && entry.loaded) {
          ctx.drawImage(entry.img, px, py, 256, 256);
          anyTileLoaded = true;
        } else {
          ctx.fillStyle = "#111c2d";
          ctx.fillRect(px, py, 256, 256);
          ctx.strokeStyle = "#1e2e46";
          ctx.strokeRect(px, py, 256, 256);
        }
      }
    }

    const activeCity = World.getActiveCity();
    if (!anyTileLoaded && activeCity) {
      // Crisp fallback geographic grid when offline
      ctx.fillStyle = "rgba(148,163,184,0.22)";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`OSM VECTOR OVERLAY · ${activeCity.name.toUpperCase()}`, 18, 28);
    }

    // Draw playable city places or nav-only places in real lat/lng space
    if (activeCity && Array.isArray(activeCity.places)) {
      activeCity.places.forEach((pl) => {
        const ll = typeof pl.lat === "number"
          ? { lat: pl.lat, lng: pl.lng }
          : window.CityRealCities.worldToLatLng(activeCity, pl.x, pl.z);
        const { px, py } = latLngToPx(ll.lat, ll.lng);
        const col = pl.color ? `rgb(${Math.round(pl.color[0] * 255)},${Math.round(pl.color[1] * 255)},${Math.round(pl.color[2] * 255)})` : "#38bdf8";
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#09111f";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#09111f";
        ctx.fillRect(px + 8, py - 8, pl.name.length * 6.2 + 8, 15);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(pl.name, px + 12, py + 3);
      });
    }

    // Real-World Navigation Route
    if (destination) {
      if (destination.realRoute && destination.realRoute.length > 1) {
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 5;
        ctx.beginPath();
        destination.realRoute.forEach(([lat, lng], idx) => {
          const { px, py } = latLngToPx(lat, lng);
          if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
      } else if (destination.route && activeCity) {
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 5;
        ctx.beginPath();
        destination.route.forEach((pt, idx) => {
          const ll = window.CityRealCities.worldToLatLng(activeCity, pt.x, pt.z);
          const { px, py } = latLngToPx(ll.lat, ll.lng);
          if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
      if (typeof destination.lat === "number") {
        const { px, py } = latLngToPx(destination.lat, destination.lng);
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Player marker in real city
    if (activeCity && activeCity.playable3d) {
      const pLl = window.CityRealCities.worldToLatLng(activeCity, Entities.player.x, Entities.player.z);
      const { px, py } = latLngToPx(pLl.lat, pLl.lng);
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Mandatory OpenStreetMap Attribution
    ctx.fillStyle = "rgba(9, 17, 31, 0.8)";
    ctx.fillRect(w - 196, h - 22, 190, 18);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "10px sans-serif";
    ctx.fillText("© OpenStreetMap contributors", w - 188, h - 9);
  }

  function renderMapCanvas(ctx, w, h, World, Entities, activeMission, simTime, isMinimap, onTileRedraw) {
    if (!isMinimap && view.mode === "real") {
      renderRealOsmMap(ctx, w, h, World, Entities, onTileRedraw);
      return;
    }

    const p = Entities.player;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#08101e";
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    let scale, offX, offZ;
    if (isMinimap) {
      scale = 0.072;
      offX = w / 2 - p.x * scale;
      offZ = h / 2 - p.z * scale;
    } else {
      scale = (Math.min(w, h) / World.WORLD_SIZE) * view.zoom;
      offX = w / 2 - view.centerX * scale;
      offZ = h / 2 - view.centerZ * scale;
    }
    ctx.translate(offX, offZ);

    // Mainland / Island land
    ctx.fillStyle = "#111b2e";
    ctx.fillRect(0, 0, 4520 * scale, 3580 * scale);
    ctx.fillRect(0, 3580 * scale, 3740 * scale, 1500 * scale);
    ctx.fillRect(3940 * scale, 3580 * scale, 1120 * scale, 1500 * scale);

    // Beach & Water
    ctx.fillStyle = "#7c6b4e";
    ctx.fillRect(4340 * scale, 0, 200 * scale, 3580 * scale);
    ctx.fillStyle = "#0b2942";
    ctx.fillRect(4540 * scale, 0, 700 * scale, World.WORLD_SIZE * scale);
    ctx.fillRect(3740 * scale, 3580 * scale, 200 * scale, 1620 * scale);

    // Central Park
    ctx.fillStyle = "#1f4225";
    ctx.fillRect(2015 * scale, 1215 * scale, 570 * scale, 570 * scale);

    // Airport Runway
    ctx.fillStyle = "#334155";
    ctx.fillRect(4050 * scale, 4635 * scale, 960 * scale, 170 * scale);

    // Roads & Bridge
    ctx.fillStyle = "#475569";
    World.hRoads.forEach((rz) => {
      const len = rz === 4420 ? 4800 : 4300;
      ctx.fillRect(0, (rz - World.HALF_ROAD) * scale, len * scale, World.ROAD_W * scale);
    });
    World.vRoads.forEach((rx) => {
      const len = rx === 4220 ? 3580 : 4980;
      ctx.fillRect((rx - World.HALF_ROAD) * scale, 0, World.ROAD_W * scale, len * scale);
    });

    // Owner Custom Roads
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = Math.max(3, 100 * scale);
    World.customRoads.forEach((cr) => {
      ctx.beginPath();
      ctx.moveTo(cr.x1 * scale, cr.z1 * scale);
      ctx.lineTo(cr.x2 * scale, cr.z2 * scale);
      ctx.stroke();
    });

    // Buildings & Owner Custom Buildings
    ctx.fillStyle = "#1e293b";
    World.buildings.forEach((b) => ctx.fillRect(b.x * scale, b.z * scale, b.w * scale, b.d * scale));
    ctx.fillStyle = "#334155";
    World.customBuildings.forEach((b) => ctx.fillRect(b.x * scale, b.z * scale, b.w * scale, b.d * scale));

    // GPS Route Polyline
    const navTarget = activeMission ? { x: activeMission.tx, z: activeMission.tz, route: activeMission.route } : destination;
    if (navTarget && navTarget.route && navTarget.route.length > 1) {
      ctx.strokeStyle = activeMission ? "#f59e0b" : "#38bdf8";
      ctx.lineWidth = isMinimap ? 3 : 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      navTarget.route.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x * scale, pt.z * scale);
        else ctx.lineTo(pt.x * scale, pt.z * scale);
      });
      ctx.stroke();
    }

    // All City Facilities (Shops, Garages, Hospitals, Police, Markets, Restaurants, Malls, Parks)
    World.shops.forEach((s) => {
      const col = `rgb(${Math.round(s.color[0] * 255)},${Math.round(s.color[1] * 255)},${Math.round(s.color[2] * 255)})`;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(s.x * scale, s.z * scale, isMinimap ? 4 : 6.5, 0, Math.PI * 2);
      ctx.fill();
      if (!isMinimap && view.zoom >= 1.05) {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(s.name, s.x * scale + 8, s.z * scale + 3);
      }
    });

    // Custom Owner POIs & Published GPS Destinations
    [...ownerPins, ...customPOIs].forEach((poi) => {
      if (poi.cityId && poi.cityId !== view.selectedCityId) return;
      if (poi.x === null || typeof poi.x !== "number") return;
      ctx.fillStyle = poi.color || "#38bdf8";
      ctx.beginPath();
      ctx.arc(poi.x * scale, poi.z * scale, isMinimap ? 4 : 7, 0, Math.PI * 2);
      ctx.fill();
      if (!isMinimap) {
        ctx.fillStyle = "#fde68a";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("★ " + poi.name, poi.x * scale + 9, poi.z * scale + 3);
      }
    });

    // Police Radar Blips
    Entities.vehicles.forEach((v) => {
      if (v.kind === "police" || v.kind === "police_heli" || v.kind === "police_moto") {
        ctx.fillStyle = v.sirenActive && Math.floor(simTime * 6) % 2 === 0 ? "#ef4444" : "#3b82f6";
        ctx.beginPath();
        ctx.arc(v.x * scale, v.z * scale, isMinimap ? 3 : 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Active Destination / Mission Pin
    if (navTarget && navTarget.x !== null) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.fillStyle = activeMission ? "#f59e0b" : "#38bdf8";
      ctx.beginPath();
      ctx.arc(navTarget.x * scale, navTarget.z * scale, isMinimap ? 5.5 : 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Player Arrow
    ctx.save();
    ctx.translate(p.x * scale, p.z * scale);
    ctx.rotate(-p.angle + Math.PI / 2);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  return {
    view,
    computeRoadRoute,
    computePathLengthMeters,
    getDirectionSummary,
    formatEta,
    setDestination,
    clearDestination,
    refreshRouteFromPlayer,
    getDestination: () => destination,
    getCustomPOIs: () => customPOIs,
    setCustomPOIs: (list) => { customPOIs = Array.isArray(list) ? list : []; },
    setOwnerDestinationPins: (list) => { ownerPins = Array.isArray(list) ? list : []; },
    addCustomPOI,
    removeCustomPOI,
    getFavorites: () => favorites,
    setFavorites: (list) => { favorites = Array.isArray(list) ? list : []; },
    addFavorite,
    removeFavorite,
    screenToWorld,
    screenToLatLng,
    findNearestMarker,
    renderMapCanvas,
  };
})();
