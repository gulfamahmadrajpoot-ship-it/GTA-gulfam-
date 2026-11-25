// 5200x5200 3D Open-World Metropolis & Real-World City Profiles + Owner Custom Buildings & Roads
window.CityWorld = (function () {
  const WORLD_SIZE = 5200;
  const ROAD_W = 160;
  const HALF_ROAD = ROAD_W / 2;
  const SIDEWALK_W = 34;

  let activeCity = null;
  let vRoads = [320, 1100, 1900, 2700, 3500, 4220];
  let hRoads = [320, 1100, 1900, 2700, 3500, 4420];

  const buildings = [];
  const customBuildings = []; // Owner-placed 3D buildings [{id, name, x, z, w, d, h, facade}]
  const customRoads = [];     // Owner-placed 3D road segments [{id, name, x1, z1, x2, z2}]
  const trees = [];
  const streetlamps = [];
  const billboards = [];
  const BASE_BILLBOARDS = [
    { id: "bb_0", title: "Downtown Espresso Billboard", x: 1180, z: 980, rotY: 0, w: 96, h: 54, isWall: false, interactX: 1180, interactZ: 1010 },
    { id: "bb_1", title: "Midtown Motors Billboard", x: 1580, z: 1780, rotY: 0, w: 96, h: 54, isWall: false, interactX: 1580, interactZ: 1805 },
    { id: "bb_2", title: "Fashion District Poster", x: 2040, z: 980, rotY: 0, w: 90, h: 50, isWall: false, interactX: 2040, interactZ: 1010 },
    { id: "bb_3", title: "Beachfront Boardwalk Billboard", x: 4100, z: 1780, rotY: 0, w: 96, h: 54, isWall: false, interactX: 4100, interactZ: 1805 },
    { id: "bb_4", title: "Airport Terminal Wall Poster", x: 4360, z: 3982, rotY: 0, w: 110, h: 56, isWall: true, interactX: 4360, interactZ: 4015 },
    { id: "bb_5", title: "Downtown Shop Wall Poster", x: 1882, z: 2260, rotY: Math.PI / 2, w: 88, h: 48, isWall: true, interactX: 1860, interactZ: 2260 },
  ];
  let extraBillboards = [];
  let disabledBillboardIds = new Set();
  let locationRenames = {};
  const shops = [];
  const benches = [];
  const docks = [];
  const climbables = [];

  let timeOfDay = 15.2;
  let autoCycle = true;
  let weather = "clear";
  let lightTimer = 0;

  const raindrops = [];
  for (let i = 0; i < 95; i++) {
    raindrops.push({
      ox: (Math.random() - 0.5) * 260,
      oy: Math.random() * 140,
      oz: (Math.random() - 0.5) * 260,
      speed: 145 + Math.random() * 65,
    });
  }

  function isInWater(x, z) {
    if (x > 4520 && z < 3580) return true;
    if (x >= 3740 && x <= 3940 && z >= 3580) {
      const onBridge1 = Math.abs(z - 4420) < HALF_ROAD;
      if (!onBridge1) return true;
    }
    if (x > 5040 || z > 5060) return true;
    return false;
  }

  function isOnBeachSand(x, z) {
    return x >= 4320 && x <= 4540 && z < 3580;
  }

  function loadCityProfile(profile) {
    activeCity = profile || (window.CityRealCities ? window.CityRealCities.get("original") : null);
    if (activeCity && activeCity.playable3d) {
      vRoads = activeCity.vRoads ? [...activeCity.vRoads] : [320, 1100, 1900, 2700, 3500, 4220];
      hRoads = activeCity.hRoads ? [...activeCity.hRoads] : [320, 1100, 1900, 2700, 3500, 4420];
    }
    buildCity();
  }

  function addCustomBuilding(name, x, z, w = 130, d = 130, h = 72, facade = "glass") {
    const b = {
      id: "cb_" + Date.now() + "_" + Math.floor(Math.random() * 999),
      name: name || "Custom Building",
      x: Math.round(x - w / 2),
      z: Math.round(z - d / 2),
      w,
      d,
      h,
      facade,
    };
    customBuildings.push(b);
    return b;
  }

  function removeCustomBuilding(id) {
    const idx = customBuildings.findIndex((b) => b.id === id);
    if (idx !== -1) customBuildings.splice(idx, 1);
  }

  function addCustomRoad(name, x1, z1, x2, z2) {
    const r = {
      id: "cr_" + Date.now() + "_" + Math.floor(Math.random() * 999),
      name: name || "Custom Avenue",
      x1: Math.round(x1),
      z1: Math.round(z1),
      x2: Math.round(x2),
      z2: Math.round(z2),
    };
    customRoads.push(r);
    return r;
  }

  function removeCustomRoad(id) {
    const idx = customRoads.findIndex((r) => r.id === id);
    if (idx !== -1) customRoads.splice(idx, 1);
  }

  function buildCity() {
    if (!activeCity && window.CityRealCities) {
      activeCity = window.CityRealCities.get("original");
    }

    buildings.length = 0;
    trees.length = 0;
    streetlamps.length = 0;
    billboards.length = 0;
    shops.length = 0;
    benches.length = 0;
    docks.length = 0;
    climbables.length = 0;

    const palette = (activeCity && activeCity.facadePalette) || ["glass", "brick", "concrete", "residential"];

    // 5x5 grid of city blocks between the 6x6 road network
    for (let r = 0; r < hRoads.length - 1; r++) {
      for (let c = 0; c < vRoads.length - 1; c++) {
        if (c >= 4 && r >= 4) continue;
        if (c === 3 && r === 4) continue;

        const x1 = vRoads[c] + HALF_ROAD + SIDEWALK_W;
        const x2 = vRoads[c + 1] - HALF_ROAD - SIDEWALK_W;
        const z1 = hRoads[r] + HALF_ROAD + SIDEWALK_W;
        const z2 = hRoads[r + 1] - HALF_ROAD - SIDEWALK_W;
        const bw = x2 - x1;
        const bz = z2 - z1;

        // Central Park (c=2, r=1)
        if (c === 2 && r === 1) {
          const treeCoords = [
            [x1 + 55, z1 + 55], [x2 - 55, z1 + 55], [x1 + 55, z2 - 55], [x2 - 55, z2 - 55],
            [x1 + 150, z1 + 70], [x2 - 150, z1 + 70], [x1 + 150, z2 - 70], [x2 - 150, z2 - 70],
            [x1 + 70, z1 + bz / 2], [x2 - 70, z1 + bz / 2],
          ];
          treeCoords.forEach(([tx, tz]) => trees.push({ x: tx, z: tz, r: 24, h: 48 }));
          benches.push({ x: x1 + bw / 2 - 75, z: z1 + bz / 2, rot: Math.PI / 2 });
          benches.push({ x: x1 + bw / 2 + 75, z: z1 + bz / 2, rot: -Math.PI / 2 });
          climbables.push({ x: x1 + 120, z: z1 + bz / 2 - 55, w: 34, d: 18, h: 9 });
          climbables.push({ x: x2 - 154, z: z1 + bz / 2 + 35, w: 34, d: 18, h: 9 });
          continue;
        }

        // Industrial Garage & Freight Block (c=0, r=1)
        if (c === 0 && r === 1) {
          buildings.push({ x: x1 + 14, z: z1 + 14, w: bw * 0.56, d: bz - 28, h: 56, facade: "concrete", awning: [0.22, 0.74, 0.97] });
          buildings.push({ x: x1 + bw * 0.64, z: z1 + 14, w: bw * 0.34, d: bz * 0.44, h: 42, facade: "brick", awning: [0.96, 0.62, 0.04] });
          climbables.push({ x: x1 + bw * 0.68, z: z1 + bz * 0.65, w: 46, d: 22, h: 11 });
          climbables.push({ x: x1 + bw * 0.68, z: z1 + bz * 0.78, w: 46, d: 22, h: 11 });
          continue;
        }

        const isResidential = c <= 1 && r === 0;
        const isFinancial = (c === 2 && r === 0) || (c === 1 && r === 3);

        if (isFinancial) {
          buildings.push({
            x: x1 + 16, z: z1 + 16, w: bw * 0.54, d: bz * 0.54,
            h: 148, facade: palette[0] || "glass", hasHelipad: true, awning: r === 3 ? [0.23, 0.51, 0.96] : [0.98, 0.75, 0.14],
          });
          buildings.push({ x: x1 + bw * 0.62, z: z1 + 16, w: bw * 0.35, d: bz - 32, h: 118, facade: palette[0] || "glass" });
          buildings.push({ x: x1 + 16, z: z1 + bz * 0.62, w: bw * 0.54, d: bz * 0.34, h: 78, facade: "concrete" });
          continue;
        }

        const gap = 22;
        const wHalf = (bw - gap * 3) / 2;
        const dHalf = (bz - gap * 3) / 2;
        const facades = isResidential ? ["residential", "brick"] : palette;
        const awnings = [[0.96, 0.62, 0.04], [0.06, 0.73, 0.5], [0.94, 0.27, 0.27], [0.22, 0.74, 0.97], null];

        const subRects = [
          { x: x1 + gap, z: z1 + gap, w: wHalf, d: dHalf },
          { x: x1 + gap * 2 + wHalf, z: z1 + gap, w: wHalf, d: dHalf },
          { x: x1 + gap, z: z1 + gap * 2 + dHalf, w: wHalf, d: dHalf },
          { x: x1 + gap * 2 + wHalf, z: z1 + gap * 2 + dHalf, w: wHalf, d: dHalf },
        ];

        subRects.forEach((sr, idx) => {
          if (isResidential && idx === 2) {
            trees.push({ x: sr.x + sr.w * 0.38, z: sr.z + sr.d * 0.4, r: 22, h: 46 });
            trees.push({ x: sr.x + sr.w * 0.7, z: sr.z + sr.d * 0.72, r: 20, h: 42 });
            climbables.push({ x: sr.x + 24, z: sr.z + 24, w: 38, d: 18, h: 9 });
            return;
          }
          const h = isResidential ? 32 + ((c + r + idx) % 3) * 10 : 52 + ((c * 3 + r * 5 + idx * 7) % 5) * 18;
          buildings.push({
            x: sr.x,
            z: sr.z,
            w: sr.w,
            d: sr.d,
            h,
            facade: facades[(c + r + idx) % facades.length],
            awning: !isResidential && idx === 0 ? awnings[(c + r) % awnings.length] : null,
          });
        });
      }
    }

    // Airport Terminal & Hangar (SE)
    buildings.push({ x: 4200, z: 3820, w: 320, d: 160, h: 52, facade: "glass", hasHelipad: true, awning: [0.22, 0.74, 0.97] });
    buildings.push({ x: 4580, z: 3840, w: 210, d: 140, h: 44, facade: "concrete", awning: [0.96, 0.62, 0.04] });
    climbables.push({ x: 4160, z: 4020, w: 42, d: 24, h: 10 });

    // Streetlamps
    for (const rx of vRoads) {
      for (let z = 140; z < 4500; z += 280) {
        if (hRoads.some((hz) => Math.abs(z - hz) < HALF_ROAD + 26)) continue;
        streetlamps.push({ x: rx - HALF_ROAD - 12, z });
        streetlamps.push({ x: rx + HALF_ROAD + 12, z });
      }
    }

    rebuildBillboards();

    // Load active city's places (Garages, Commercial Markets, Shopping Centers, Restaurants, Hospitals, Police Stations, Parks, Marina)
    if (activeCity && Array.isArray(activeCity.places)) {
      activeCity.places.forEach((p) => {
        if (typeof p.x === "number" && typeof p.z === "number") {
          shops.push({ ...p, baseName: p.name, name: locationRenames[p.id] || p.name });
        }
      });
    }

    docks.push(
      { x: 4545, z: 1120, w: 36, d: 96, color: [0.95, 0.97, 0.99] },
      { x: 4545, z: 1900, w: 40, d: 110, color: [0.89, 0.91, 0.94] },
      { x: 4545, z: 2780, w: 34, d: 92, color: [0.8, 0.84, 0.88] }
    );
  }

  function rebuildBillboards() {
    billboards.length = 0;
    BASE_BILLBOARDS.forEach((b) => {
      if (!disabledBillboardIds.has(b.id)) billboards.push({ ...b });
    });
    extraBillboards.forEach((cb) => {
      if (!cb || !cb.id || disabledBillboardIds.has(cb.id)) return;
      const isWall = cb.adType === "wall" || cb.adType === "shop";
      billboards.push({
        id: cb.id,
        title: cb.title || "Custom Ad",
        x: typeof cb.x === "number" ? cb.x : 1400,
        z: typeof cb.z === "number" ? cb.z : 1400,
        rotY: Number(cb.rotY) || 0,
        w: isWall ? 88 : 96,
        h: isWall ? 48 : 54,
        isWall,
        interactX: typeof cb.x === "number" ? cb.x : 1400,
        interactZ: (typeof cb.z === "number" ? cb.z : 1400) + 30,
      });
    });
  }

  function setExtraBillboards(list, disabledIds, Textures, GL) {
    extraBillboards = Array.isArray(list) ? list : [];
    disabledBillboardIds = new Set(Array.isArray(disabledIds) ? disabledIds : []);
    rebuildBillboards();
    if (Textures && GL) {
      billboards.forEach((bb) => Textures.ensureBillboardTexture(bb.id, bb.title, GL));
    }
  }

  function applyLocationRenames(renameMap) {
    locationRenames = renameMap && typeof renameMap === "object" ? { ...renameMap } : {};
    shops.forEach((s) => {
      const orig = s.baseName || s.name;
      s.baseName = orig;
      s.name = locationRenames[s.id] || orig;
    });
  }

  function update(dt) {
    lightTimer = (lightTimer + dt) % 14;
    if (autoCycle) {
      timeOfDay = (timeOfDay + dt * 0.08) % 24;
    }
    if (weather === "rain") {
      for (let i = 0; i < raindrops.length; i++) {
        raindrops[i].oy -= raindrops[i].speed * dt;
        if (raindrops[i].oy < 0) raindrops[i].oy = 120 + Math.random() * 30;
      }
    }
  }

  function getLightState(axis) {
    if (axis === "ns") {
      if (lightTimer < 5.2) return "green";
      if (lightTimer < 7.0) return "amber";
      return "red";
    } else {
      if (lightTimer < 7.0) return "red";
      if (lightTimer < 12.2) return "green";
      return "amber";
    }
  }

  function setTimeMode(mode) {
    if (mode === "cycle") autoCycle = true;
    else if (mode === "morning") { autoCycle = false; timeOfDay = 8.2; }
    else if (mode === "noon") { autoCycle = false; timeOfDay = 13.5; }
    else if (mode === "sunset") { autoCycle = false; timeOfDay = 18.5; }
    else if (mode === "night") { autoCycle = false; timeOfDay = 22.8; }
  }

  function setWeather(w) {
    weather = w === "rain" ? "rain" : "clear";
  }

  function getClockString() {
    const hr = Math.floor(timeOfDay) % 24;
    const min = Math.floor((timeOfDay - Math.floor(timeOfDay)) * 60);
    return `${String(hr).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }

  function getAtmosphere(graphicsQuality = "balanced") {
    const h = timeOfDay;
    let sky, sunColor, hemiSky, hemiGround, sunDir, isNight = false;

    if (h >= 6 && h < 8.5) {
      sky = [0.68, 0.56, 0.58];
      sunColor = [0.95, 0.72, 0.55];
      hemiSky = [0.42, 0.38, 0.48];
      hemiGround = [0.22, 0.18, 0.2];
      sunDir = [0.6, 0.45, 0.5];
    } else if (h >= 8.5 && h < 17) {
      sky = [0.48, 0.68, 0.88];
      sunColor = [0.95, 0.92, 0.85];
      hemiSky = [0.42, 0.5, 0.62];
      hemiGround = [0.24, 0.24, 0.22];
      sunDir = [0.45, 0.82, 0.35];
    } else if (h >= 17 && h < 19.8) {
      sky = [0.64, 0.36, 0.28];
      sunColor = [0.98, 0.58, 0.28];
      hemiSky = [0.42, 0.26, 0.3];
      hemiGround = [0.18, 0.14, 0.14];
      sunDir = [-0.65, 0.38, 0.48];
      isNight = h > 18.7;
    } else {
      sky = [0.05, 0.08, 0.15];
      sunColor = [0.18, 0.24, 0.38];
      hemiSky = [0.12, 0.16, 0.26];
      hemiGround = [0.06, 0.08, 0.12];
      sunDir = [0.3, 0.8, 0.4];
      isNight = true;
    }

    if (weather === "rain") {
      sky = [sky[0] * 0.55, sky[1] * 0.6, sky[2] * 0.68];
      sunColor = [sunColor[0] * 0.55, sunColor[1] * 0.58, sunColor[2] * 0.65];
    }

    const fogFar = graphicsQuality === "low" ? 880 : graphicsQuality === "high" ? 1500 : 1180;
    return { sky, sunColor, hemiSky, hemiGround, sunDir, isNight, fogNear: 340, fogFar };
  }

  function getDistrictName(x, z) {
    const d = (activeCity && activeCity.districts) || {
      nw: "OAKWOOD RESIDENTIAL",
      nc: "FINANCIAL CORE",
      center: "CENTRAL PARK",
      west: "INDUSTRIAL GARAGE",
      south: "SOUTH RING HIGHWAY",
      east: "GOLDEN SANDS BEACH",
      se: "METRO AIRPORT",
      downtown: "DOWNTOWN COMMERCIAL",
    };
    if (x > 4000 && z > 3600) return d.se;
    if (x > 4320 && z < 3580) return d.east;
    if (x < 1900 && z < 1100) return d.nw;
    if (x > 1900 && x < 2700 && z > 1100 && z < 1900) return d.center;
    if (x < 1100 && z > 1100 && z < 1900) return d.west;
    if (x > 1900 && x < 2700 && z < 1100) return d.nc;
    if (z > 4200 && x < 3700) return d.south;
    return d.downtown;
  }

  function getClimbHeightAt(x, z) {
    for (let i = 0; i < climbables.length; i++) {
      const c = climbables[i];
      if (x >= c.x && x <= c.x + c.w && z >= c.z && z <= c.z + c.d) {
        return c.h;
      }
    }
    return 0;
  }

  function collideList(nx, nz, radius, list) {
    let hit = false;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      const cx = Math.max(b.x, Math.min(nx, b.x + b.w));
      const cz = Math.max(b.z, Math.min(nz, b.z + b.d));
      const dx = nx - cx;
      const dz = nz - cz;
      const dSq = dx * dx + dz * dz;
      if (dSq < radius * radius) {
        hit = true;
        const d = Math.sqrt(dSq) || 0.001;
        const overlap = radius - d;
        nx += (dx / d) * overlap;
        nz += (dz / d) * overlap;
      }
    }
    return { x: nx, z: nz, hit };
  }

  function collideCircleWithBuildings(x, z, radius, ignoreWater = false, curY = 0) {
    let nx = x, nz = z, hit = false;
    const minB = 28 + radius;
    const maxX = ignoreWater ? WORLD_SIZE - 28 - radius : 5040 - radius;
    const maxZ = WORLD_SIZE - 28 - radius;
    if (nx < minB) { nx = minB; hit = true; }
    if (nx > maxX) { nx = maxX; hit = true; }
    if (nz < minB) { nz = minB; hit = true; }
    if (nz > maxZ) { nz = maxZ; hit = true; }

    const r1 = collideList(nx, nz, radius, buildings);
    nx = r1.x; nz = r1.z; hit = hit || r1.hit;

    const r2 = collideList(nx, nz, radius, customBuildings);
    nx = r2.x; nz = r2.z; hit = hit || r2.hit;

    for (let i = 0; i < climbables.length; i++) {
      const c = climbables[i];
      if (curY >= c.h - 2) continue;
      const cx = Math.max(c.x, Math.min(nx, c.x + c.w));
      const cz = Math.max(c.z, Math.min(nz, c.z + c.d));
      const dx = nx - cx;
      const dz = nz - cz;
      const dSq = dx * dx + dz * dz;
      if (dSq < radius * radius) {
        hit = true;
        const d = Math.sqrt(dSq) || 0.001;
        const overlap = radius - d;
        nx += (dx / d) * overlap;
        nz += (dz / d) * overlap;
      }
    }

    return { x: nx, z: nz, hit };
  }

  function renderWorld(GL, Textures, camPos, timeSec, atmo, graphicsQuality = "balanced") {
    const tex = Textures.glTex;
    const drawDist = graphicsQuality === "low" ? 860 : graphicsQuality === "high" ? 1420 : 1140;
    const wCol = (activeCity && activeCity.waterColor) || [0.07, 0.25, 0.4];

    // 1. Base City Sidewalk Ground Plane
    GL.draw("plane", 2180, 0.0, 1800, 0, 0, 0, 4360, 1, 3600, [0.95, 0.95, 0.95, 1], tex.sidewalk, 105, 90);
    GL.draw("plane", 1870, 0.0, 4400, 0, 0, 0, 3740, 1, 1600, [0.95, 0.95, 0.95, 1], tex.sidewalk, 90, 40);

    // 2. Beach & Ocean / Canal
    GL.draw("plane", 4425, 0.05, 1790, 0, 0, 0, 220, 1, 3580, [0.96, 0.92, 0.82, 1], tex.sand, 6, 85);
    GL.draw("plane", 4880, -1.6, 2600, 0, 0, 0, 720, 1, 5200, [wCol[0], wCol[1], wCol[2], 1], null);
    GL.draw("plane", 3840, -1.6, 4400, 0, 0, 0, 200, 1, 1650, [wCol[0], wCol[1], wCol[2], 1], null);

    // Airport Tarmac & Runway
    GL.draw("plane", 4500, 0.05, 4340, 0, 0, 0, 1120, 1, 1460, [0.85, 0.85, 0.88, 1], tex.sidewalk, 24, 30);
    GL.draw("plane", 4530, 0.22, 4720, 0, 0, 0, 960, 1, 170, [0.85, 0.85, 0.88, 1], tex.asphalt, 18, 3);
    for (let rx = 4100; rx < 4960; rx += 75) {
      GL.draw("plane", rx, 0.27, 4720, 0, 0, 0, 38, 1, 5, [0.98, 0.98, 0.98, 1], null);
    }

    // Grand Bridge over South Canal
    GL.draw("box", 3840, 2.2, 4420, 0, 0, 0, 260, 4.4, ROAD_W, [0.35, 0.38, 0.42, 1], tex.asphalt, 4, 2);
    GL.draw("box", 3840, 7.5, 4420 - HALF_ROAD + 3, 0, 0, 0, 260, 6, 4, [0.55, 0.58, 0.64, 1], null);
    GL.draw("box", 3840, 7.5, 4420 + HALF_ROAD - 3, 0, 0, 0, 260, 6, 4, [0.55, 0.58, 0.64, 1], null);

    // Marina Pier & Docked Boats
    GL.draw("box", 4505, 0.55, 1900, 0, 0, 0, 26, 1.2, 2100, [0.38, 0.25, 0.18, 1], null);
    docks.forEach((d) => {
      GL.draw("box", 4520, 0.5, d.z, 0, 0, 0, 56, 1.2, 18, [0.34, 0.22, 0.16, 1], null);
      const bob = Math.sin(timeSec * 1.5 + d.z) * 0.4;
      GL.draw("box", d.x + 28, 1.4 + bob, d.z, 0, 0, 0, d.w, 6, d.d, [d.color[0], d.color[1], d.color[2], 1], null);
      GL.draw("box", d.x + 28, 5.2 + bob, d.z - 8, 0, 0, 0, d.w * 0.62, 5, d.d * 0.42, [0.12, 0.16, 0.24, 1], null);
    });

    // 3. Central Park Lawn & Fountain
    const px = 2300, pz = 1500, pw = 570, pd = 570;
    GL.draw("plane", px, 0.35, pz, 0, 0, 0, pw, 1, pd, [0.92, 0.96, 0.9, 1], tex.grass, 14, 14);
    GL.draw("plane", px, 0.42, pz, 0, 0, 0, 38, 1, pd, [0.62, 0.64, 0.66, 1], tex.sidewalk, 1, 12);
    GL.draw("plane", px, 0.42, pz, 0, 0, 0, pw, 1, 38, [0.62, 0.64, 0.66, 1], tex.sidewalk, 12, 1);
    GL.draw("cylinder", px, 2.5, pz, 0, 0, 0, 76, 4.5, 76, [0.45, 0.5, 0.55, 1], null);
    GL.draw("cylinder", px, 3.2, pz, 0, 0, 0, 62, 3.8, 62, [0.08, 0.62, 0.88, 1], null);
    GL.draw("cylinder", px, 9 + Math.sin(timeSec * 4) * 1.5, pz, 0, 0, 0, 7, 14, 7, [0.75, 0.92, 1, 0.85], null);

    // 4. Asphalt Road Grid + Owner Custom Roads
    hRoads.forEach((rz) => {
      const roadLen = rz === 4420 ? 4800 : 4300;
      GL.draw("plane", roadLen / 2, 0.18, rz, 0, 0, 0, roadLen, 1, ROAD_W, [0.9, 0.9, 0.9, 1], tex.asphalt, 38, 2);
      for (let x = 80; x < roadLen - 80; x += 68) {
        if (Math.abs(x - camPos[0]) > drawDist || Math.abs(rz - camPos[2]) > drawDist) continue;
        if (vRoads.some((vx) => Math.abs(x - vx) < HALF_ROAD + 16)) continue;
        GL.draw("plane", x, 0.24, rz, 0, 0, 0, 28, 1, 3.5, [0.96, 0.78, 0.15, 1], null);
      }
    });
    vRoads.forEach((rx) => {
      const rLen = rx === 4220 ? 3580 : 4980;
      GL.draw("plane", rx, 0.2, rLen / 2, 0, 0, 0, ROAD_W, 1, rLen, [0.9, 0.9, 0.9, 1], tex.asphalt, 2, 42);
      for (let z = 80; z < rLen - 80; z += 68) {
        if (Math.abs(rx - camPos[0]) > drawDist || Math.abs(z - camPos[2]) > drawDist) continue;
        if (hRoads.some((hz) => Math.abs(z - hz) < HALF_ROAD + 16)) continue;
        GL.draw("plane", rx, 0.25, z, 0, 0, 0, 3.5, 1, 28, [0.96, 0.78, 0.15, 1], null);
      }
    });

    // Owner Custom Road Segments
    customRoads.forEach((cr) => {
      const mx = (cr.x1 + cr.x2) / 2;
      const mz = (cr.z1 + cr.z2) / 2;
      if (Math.hypot(mx - camPos[0], mz - camPos[2]) > drawDist + 200) return;
      const len = Math.max(40, Math.hypot(cr.x2 - cr.x1, cr.z2 - cr.z1));
      const ang = Math.atan2(cr.x2 - cr.x1, cr.z2 - cr.z1);
      GL.draw("box", mx, 0.28, mz, 0, ang, 0, 120, 0.3, len, [0.88, 0.88, 0.9, 1], tex.asphalt, 2, Math.max(2, Math.round(len / 90)));
    });

    // Crosswalks & Traffic Signals
    hRoads.forEach((rz) => {
      vRoads.forEach((rx) => {
        if (rx === 4220 && rz === 4420) return;
        if (Math.hypot(rx - camPos[0], rz - camPos[2]) > drawDist) return;
        for (let s = -HALF_ROAD + 18; s <= HALF_ROAD - 18; s += 18) {
          GL.draw("plane", rx + s, 0.27, rz - HALF_ROAD - 10, 0, 0, 0, 8, 1, 14, [0.9, 0.92, 0.95, 0.85], null);
          GL.draw("plane", rx + s, 0.27, rz + HALF_ROAD + 10, 0, 0, 0, 8, 1, 14, [0.9, 0.92, 0.95, 0.85], null);
          GL.draw("plane", rx - HALF_ROAD - 10, 0.27, rz + s, 0, 0, 0, 14, 1, 8, [0.9, 0.92, 0.95, 0.85], null);
          GL.draw("plane", rx + HALF_ROAD + 10, 0.27, rz + s, 0, 0, 0, 14, 1, 8, [0.9, 0.92, 0.95, 0.85], null);
        }
        const nsCol = getLightState("ns") === "green" ? [0.1, 0.9, 0.45] : getLightState("ns") === "amber" ? [0.98, 0.7, 0.1] : [0.95, 0.2, 0.2];
        const ewCol = getLightState("ew") === "green" ? [0.1, 0.9, 0.45] : getLightState("ew") === "amber" ? [0.98, 0.7, 0.1] : [0.95, 0.2, 0.2];
        GL.draw("cylinder", rx - HALF_ROAD - 6, 14, rz - HALF_ROAD - 6, 0, 0, 0, 2.5, 28, 2.5, [0.2, 0.24, 0.28, 1], null);
        GL.draw("sphere", rx - HALF_ROAD - 6, 26, rz - HALF_ROAD - 6, 0, 0, 0, 4.4, 4.4, 4.4, [nsCol[0], nsCol[1], nsCol[2], 1], null, 1, 1, nsCol, true);
        GL.draw("cylinder", rx + HALF_ROAD + 6, 14, rz + HALF_ROAD + 6, 0, 0, 0, 2.5, 28, 2.5, [0.2, 0.24, 0.28, 1], null);
        GL.draw("sphere", rx + HALF_ROAD + 6, 26, rz + HALF_ROAD + 6, 0, 0, 0, 4.4, 4.4, 4.4, [ewCol[0], ewCol[1], ewCol[2], 1], null, 1, 1, ewCol, true);
      });
    });

    // 5. Realistic Multi-Story 3D Buildings + Owner Custom Buildings
    const facadeMap = {
      glass: tex.facadeGlass,
      brick: tex.facadeBrick,
      concrete: tex.facadeConcrete,
      residential: tex.facadeResidential,
    };
    const drawBuildingGroup = (list) => {
      for (let i = 0; i < list.length; i++) {
        const b = list[i];
        const cx = b.x + b.w / 2;
        const cz = b.z + b.d / 2;
        if (Math.hypot(cx - camPos[0], cz - camPos[2]) > drawDist + 180) continue;

        const fTex = facadeMap[b.facade] || tex.facadeConcrete;
        const em = atmo.isNight ? [0.12, 0.1, 0.06] : [0, 0, 0];
        GL.draw("box", cx, b.h / 2, cz, 0, 0, 0, b.w, b.h, b.d, [0.95, 0.95, 0.95, 1], fTex, 1, 1, em);
        GL.draw("plane", cx, b.h + 0.15, cz, 0, 0, 0, b.w, 1, b.d, [0.85, 0.85, 0.88, 1], tex.rooftop, 2, 2);
        GL.draw("box", cx - b.w * 0.2, b.h + 4, cz - b.d * 0.15, 0, 0, 0, 18, 8, 14, [0.35, 0.4, 0.46, 1], null);

        if (b.awning) {
          GL.draw("box", cx, 12, b.z + b.d + 3, 0, 0, 0, Math.min(80, b.w * 0.65), 2.5, 8, [b.awning[0], b.awning[1], b.awning[2], 1], null, 1, 1, atmo.isNight ? [b.awning[0] * 0.4, b.awning[1] * 0.4, b.awning[2] * 0.4] : [0, 0, 0]);
        }
        if (b.hasHelipad) {
          GL.draw("cylinder", cx, b.h + 0.4, cz, 0, 0, 0, 52, 0.8, 52, [0.96, 0.72, 0.12, 1], null);
        }
      }
    };
    drawBuildingGroup(buildings);
    drawBuildingGroup(customBuildings);

    climbables.forEach((c) => {
      if (Math.hypot(c.x - camPos[0], c.z - camPos[2]) > drawDist) return;
      GL.draw("box", c.x + c.w / 2, c.h / 2, c.z + c.d / 2, 0, 0, 0, c.w, c.h, c.d, [0.48, 0.36, 0.24, 1], tex.rooftop, 1, 1);
    });

    trees.forEach((t) => {
      if (Math.hypot(t.x - camPos[0], t.z - camPos[2]) > drawDist) return;
      GL.draw("plane", t.x, 0.46, t.z, 0, 0, 0, t.r * 1.9, 1, t.r * 1.9, [0, 0, 0, 0.3], null);
      GL.draw("cylinder", t.x, t.h * 0.32, t.z, 0, 0, 0, 5, t.h * 0.64, 5, [0.38, 0.25, 0.16, 1], null);
      GL.draw("sphere", t.x, t.h * 0.74, t.z, 0, 0, 0, t.r * 1.5, t.r * 1.35, t.r * 1.5, [0.18, 0.38, 0.17, 1], null);
      GL.draw("sphere", t.x + 6, t.h * 0.84, t.z - 4, 0, 0, 0, t.r * 1.1, t.r * 1.0, t.r * 1.1, [0.24, 0.46, 0.21, 1], null);
    });
    benches.forEach((bn) => {
      GL.draw("box", bn.x, 3, bn.z, 0, bn.rot, 0, 22, 4, 8, [0.46, 0.24, 0.1, 1], null);
    });

    // 7. Elevated Billboards & Shop Wall Posters
    billboards.forEach((bb) => {
      if (Math.hypot(bb.x - camPos[0], bb.z - camPos[2]) > drawDist + 100) return;
      const bTex = tex.billboards[bb.id] || Textures.ensureBillboardTexture(bb.id, bb.title, GL);
      const em = atmo.isNight ? [0.42, 0.42, 0.42] : [0.06, 0.06, 0.06];
      if (!bb.isWall) {
        GL.draw("cylinder", bb.x - bb.w * 0.32, 22, bb.z, 0, 0, 0, 3.5, 44, 3.5, [0.22, 0.26, 0.32, 1], null);
        GL.draw("cylinder", bb.x + bb.w * 0.32, 22, bb.z, 0, 0, 0, 3.5, 44, 3.5, [0.22, 0.26, 0.32, 1], null);
        GL.draw("box", bb.x, 46, bb.z, 0, bb.rotY, 0, bb.w + 4, bb.h + 4, 3.5, [0.12, 0.15, 0.22, 1], null);
        const offZ = Math.cos(bb.rotY) * 2.0;
        const offX = Math.sin(bb.rotY) * 2.0;
        GL.draw("quad", bb.x + offX, 46, bb.z + offZ, 0, bb.rotY, 0, bb.w, bb.h, 1, [1, 1, 1, 1], bTex, 1, 1, em);
        GL.draw("quad", bb.x - offX, 46, bb.z - offZ, 0, bb.rotY + Math.PI, 0, bb.w, bb.h, 1, [1, 1, 1, 1], bTex, 1, 1, em);
      } else {
        const yPos = 30;
        GL.draw("box", bb.x, yPos, bb.z, 0, bb.rotY, 0, bb.w + 4, bb.h + 4, 2.5, [0.1, 0.12, 0.16, 1], null);
        const offZ = Math.cos(bb.rotY) * 1.6;
        const offX = Math.sin(bb.rotY) * 1.6;
        GL.draw("quad", bb.x + offX, yPos, bb.z + offZ, 0, bb.rotY, 0, bb.w, bb.h, 1, [1, 1, 1, 1], bTex, 1, 1, em);
        GL.draw("quad", bb.x - offX, yPos, bb.z - offZ, 0, bb.rotY + Math.PI, 0, bb.w, bb.h, 1, [1, 1, 1, 1], bTex, 1, 1, em);
      }
    });

    streetlamps.forEach((sl) => {
      if (Math.hypot(sl.x - camPos[0], sl.z - camPos[2]) > drawDist * 0.72) return;
      GL.draw("cylinder", sl.x, 16, sl.z, 0, 0, 0, 1.8, 32, 1.8, [0.25, 0.29, 0.36, 1], null);
      const bulbEm = atmo.isNight ? [1.0, 0.85, 0.45] : [0.2, 0.2, 0.15];
      GL.draw("sphere", sl.x, 32.5, sl.z, 0, 0, 0, 4.2, 3.2, 4.2, [1, 0.94, 0.75, 1], null, 1, 1, bulbEm, atmo.isNight);
      if (atmo.isNight && graphicsQuality !== "low") {
        GL.draw("plane", sl.x, 0.38, sl.z, 0, 0, 0, 54, 1, 54, [1.0, 0.82, 0.45, 0.16], null, 1, 1, [0.2, 0.15, 0.05], true);
      }
    });

    shops.forEach((s) => {
      if (Math.hypot(s.x - camPos[0], s.z - camPos[2]) > drawDist) return;
      const pulse = 1 + Math.sin(timeSec * 3.5) * 0.12;
      GL.draw("cylinder", s.x, 0.45, s.z, 0, 0, 0, 40 * pulse, 0.4, 40 * pulse, [s.color[0], s.color[1], s.color[2], 0.36], null, 1, 1, s.color, true);
      GL.draw("cylinder", s.x, 10 + Math.sin(timeSec * 2.8) * 2, s.z, 0, timeSec * 1.5, 0, 8, 8, 8, [s.color[0], s.color[1], s.color[2], 0.85], null, 1, 1, s.color, true);
    });

    if (weather === "rain") {
      for (let i = 0; i < raindrops.length; i++) {
        const r = raindrops[i];
        GL.draw("box", camPos[0] + r.ox, r.oy, camPos[2] + r.oz, 0, 0, 0.15, 0.35, 8, 0.35, [0.75, 0.88, 1.0, 0.45], null, 1, 1, [0, 0, 0], true);
      }
    }
  }

  return {
    WORLD_SIZE,
    ROAD_W,
    HALF_ROAD,
    get vRoads() { return vRoads; },
    get hRoads() { return hRoads; },
    buildings,
    customBuildings,
    customRoads,
    billboards,
    shops,
    climbables,
    buildCity,
    loadCityProfile,
    getActiveCity: () => activeCity,
    addCustomBuilding,
    removeCustomBuilding,
    addCustomRoad,
    removeCustomRoad,
    setExtraBillboards,
    applyLocationRenames,
    setCustomWorld: (bList, rList) => {
      customBuildings.length = 0;
      customRoads.length = 0;
      if (Array.isArray(bList)) bList.forEach((b) => customBuildings.push(b));
      if (Array.isArray(rList)) rList.forEach((r) => customRoads.push(r));
    },
    update,
    isInWater,
    isOnBeachSand,
    getClimbHeightAt,
    getLightState,
    setTimeMode,
    setWeather,
    getWeather: () => weather,
    getClockString,
    getAtmosphere,
    getDistrictName,
    collideCircleWithBuildings,
    renderWorld,
  };
})();
