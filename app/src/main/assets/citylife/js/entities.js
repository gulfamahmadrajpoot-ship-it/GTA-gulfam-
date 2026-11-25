// Player (Walk/Run/Jump/Fight/Swim/Climb), 8 Vehicle Classes (Cars/SUVs/Motorcycles/Buses/Trucks/Boats/Helicopters), Combat Weapons & Enemy AI, Advanced 1-5 Star Police AI
window.CityEntities = (function () {
  const VEHICLE_SPECS = {
    coupe: { name: "Apex GT Coupe", category: "Sports Car", maxSpeed: 540, accel: 430, turn: 3.1, radius: 22, kindType: "car", defaultColor: "#cbd5e1", price: 0 },
    muscle: { name: "Thunder V8", category: "Sports Car", maxSpeed: 570, accel: 480, turn: 2.9, radius: 23, kindType: "car", defaultColor: "#b91c1c", price: 2800 },
    sedan: { name: "Metro Sedan", category: "Sedan", maxSpeed: 445, accel: 335, turn: 2.8, radius: 22, kindType: "car", defaultColor: "#334155", price: 1200 },
    taxi: { name: "City Yellow Cab", category: "Sedan", maxSpeed: 455, accel: 350, turn: 3.0, radius: 22, kindType: "car", defaultColor: "#eab308", price: 1500 },
    suv: { name: "Titan Metro SUV", category: "SUV", maxSpeed: 430, accel: 340, turn: 2.6, radius: 25, kindType: "suv", defaultColor: "#1f2937", price: 2100 },
    superbike: { name: "Veloce 1000cc", category: "Motorcycle", maxSpeed: 620, accel: 560, turn: 3.8, radius: 14, kindType: "moto", defaultColor: "#dc2626", price: 3200 },
    cruiser: { name: "Boulevard Cruiser", category: "Motorcycle", maxSpeed: 505, accel: 425, turn: 3.4, radius: 14, kindType: "moto", defaultColor: "#1f2937", price: 1800 },
    bus: { name: "Metro Transit Bus", category: "Bus", maxSpeed: 340, accel: 210, turn: 1.9, radius: 32, kindType: "bus", defaultColor: "#2563eb", price: 3500 },
    truck: { name: "Heavy Cargo Truck", category: "Truck", maxSpeed: 365, accel: 230, turn: 2.0, radius: 30, kindType: "truck", defaultColor: "#e2e8f0", price: 3900 },
    boat: { name: "Harbour Speedboat", category: "Boat", maxSpeed: 490, accel: 360, turn: 2.9, radius: 22, kindType: "boat", defaultColor: "#f8fafc", price: 4200 },
    heli: { name: "Metro Air Chopper", category: "Helicopter", maxSpeed: 520, accel: 360, turn: 2.6, radius: 28, kindType: "heli", defaultColor: "#0f172a", price: 6500 },
    police: { name: "Metro PD Interceptor", category: "Police", maxSpeed: 585, accel: 470, turn: 3.2, radius: 22, kindType: "car", defaultColor: "#1e293b", price: 99999 },
    police_moto: { name: "Metro PD Motorbike", category: "Police", maxSpeed: 605, accel: 520, turn: 3.7, radius: 14, kindType: "moto", defaultColor: "#1e293b", price: 99999 },
    police_heli: { name: "Metro PD Chopper", category: "Police", maxSpeed: 520, accel: 350, turn: 2.5, radius: 28, kindType: "heli", defaultColor: "#0f172a", price: 99999 },
  };

  const WEAPON_SPECS = {
    fists: { id: "fists", name: "Hand-to-Hand", damage: 22, range: 26, cooldown: 0.34, isMelee: true, price: 0, maxAmmo: 0 },
    baton: { id: "baton", name: "Shock Baton", damage: 36, range: 32, cooldown: 0.4, isMelee: true, price: 350, maxAmmo: 0 },
    pistol: { id: "pistol", name: "VX-9 Pulse Pistol", damage: 28, range: 260, cooldown: 0.32, isMelee: false, price: 600, maxAmmo: 60 },
    smg: { id: "smg", name: "Kestrel-45 SMG", damage: 18, range: 230, cooldown: 0.13, isMelee: false, price: 1400, maxAmmo: 150 },
    rifle: { id: "rifle", name: "Vanguard Carbine", damage: 42, range: 360, cooldown: 0.28, isMelee: false, price: 2400, maxAmmo: 90 },
  };

  const OUTFIT_COLORS = {
    streetwear: { torso: "#334155", accent: "#f59e0b", pants: "#1e293b", sleeve: "#475569" },
    suit: { torso: "#111827", accent: "#e2e8f0", pants: "#0f172a", sleeve: "#1f2937" },
    biker: { torso: "#1c1917", accent: "#dc2626", pants: "#27272a", sleeve: "#292524" },
    tactical: { torso: "#1e3a2f", accent: "#84cc16", pants: "#1c1917", sleeve: "#365314" },
    racer: { torso: "#991b1b", accent: "#f8fafc", pants: "#0f172a", sleeve: "#dc2626" },
    enemy: { torso: "#450a0a", accent: "#ef4444", pants: "#18181b", sleeve: "#7f1d1d" },
    ped1: { torso: "#4b5563", accent: "#cbd5e1", pants: "#1f2937", sleeve: "#6b7280" },
    ped2: { torso: "#1e40af", accent: "#93c5fd", pants: "#1e293b", sleeve: "#2563eb" },
    ped3: { torso: "#7c2d12", accent: "#fdba74", pants: "#292524", sleeve: "#9a3412" },
    ped4: { torso: "#3f6212", accent: "#d9f99d", pants: "#1c1917", sleeve: "#4d7c0f" },
  };

  const CHARACTER_SPECS = {
    alex: { id: "alex", name: "Alex Mercer", role: "Street Hustler", defaultOutfit: "streetwear", skinHex: "#d8a482", hairHex: "#1e1b18" },
    zara: { id: "zara", name: "Zara Vance", role: "Pro Street Racer", defaultOutfit: "racer", skinHex: "#f1c27d", hairHex: "#451a03" },
    tariq: { id: "tariq", name: "Tariq Khan", role: "Tactical Operative", defaultOutfit: "tactical", skinHex: "#c68642", hairHex: "#1e1b18" },
    elena: { id: "elena", name: "Elena Cruz", role: "Executive Broker", defaultOutfit: "suit", skinHex: "#d8a482", hairHex: "#78350f" },
    marcus: { id: "marcus", name: "Marcus Cole", role: "Heavy Enforcer", defaultOutfit: "biker", skinHex: "#8d5524", hairHex: "#1e1b18" },
  };

  const BASE_VEHICLE_SPECS = JSON.parse(JSON.stringify(VEHICLE_SPECS));
  const BASE_CHARACTER_SPECS = JSON.parse(JSON.stringify(CHARACTER_SPECS));

  const policeConfig = {
    enabled: true,
    maxVehicles: 8,
    difficulty: 1.0,
    minWanted: 0,
    maxWanted: 5,
    helisEnabled: true,
    roadblocksEnabled: true,
    responseSpeed: 1.0,
  };
  let globalDifficulty = "normal";
  let currentTrafficDensity = 1.0;
  let currentPedDensity = 1.0;
  let disabledVehicles = new Set();
  let disabledCharacters = new Set();

  const player = {
    x: 1120,
    y: 0,
    z: 1540,
    angle: 0,
    radius: 10,
    health: 100,
    maxHealth: 100,
    speedMult: 1.0,
    stamina: 100,
    cash: 3200,
    xp: 0,
    wanted: 0,
    evadeTimer: 0,
    hiddenFromPolice: false,
    arrestProgress: 0,
    characterId: "alex",
    outfit: "streetwear",
    skinHex: "#d8a482",
    hairHex: "#1e1b18",
    walkPhase: 0,
    moveSpeedRatio: 0,
    stepAccum: 0,
    jumpY: 0,
    jumpVel: 0,
    isJumping: false,
    isSwimming: false,
    crouching: false,
    attackTimer: 0,
    comboStep: 0,
    hitTriggered: false,
    weapon: "fists",
    ownedWeapons: ["fists", "pistol"],
    ammo: { pistol: 36, smg: 0, rifle: 0 },
    vehicle: null,
    ownedVehicles: ["coupe", "superbike", "boat", "heli"],
    upgrades: { turbo: 0, handling: 0 },
  };

  const vehicles = [];
  const pedestrians = [];
  const enemies = [];
  const projectiles = [];
  const combatSparks = [];
  const roadblocks = [];
  let nextVehId = 1;

  function createVehicle(kind, x, z, angle, color, isTraffic = false) {
    const spec = VEHICLE_SPECS[kind] || VEHICLE_SPECS.sedan;
    const v = {
      id: nextVehId++,
      kind,
      name: spec.name,
      kindType: spec.kindType,
      isMoto: spec.kindType === "moto",
      isBoat: spec.kindType === "boat",
      isHeli: spec.kindType === "heli",
      x,
      y: spec.kindType === "heli" ? 0 : 0,
      z,
      angle,
      speed: 0,
      steerAngle: 0,
      wheelSpin: 0,
      rotorSpin: 0,
      leanAngle: 0,
      maxSpeed: spec.maxSpeed,
      accel: spec.accel,
      turn: spec.turn,
      radius: spec.radius,
      color: color || spec.defaultColor,
      hp: 100,
      braking: false,
      sirenActive: false,
      isTraffic,
      trafficAxis: Math.abs(Math.sin(angle)) > 0.7 ? "ew" : "ns",
      trafficDir: Math.abs(Math.sin(angle)) > 0.7 ? (Math.sin(angle) > 0 ? 1 : -1) : (Math.cos(angle) > 0 ? 1 : -1),
      honkCooldown: 0,
      driverOccupied: isTraffic,
    };
    vehicles.push(v);
    return v;
  }

  function spawnInitialPopulation(world) {
    vehicles.length = 0;
    pedestrians.length = 0;
    enemies.length = 0;
    projectiles.length = 0;
    roadblocks.length = 0;

    // Player starter fleet across the city (Cars, Motorcycles, SUV, Bus, Truck, Boat, Helicopter!)
    createVehicle("coupe", 1075, 1480, 0, "#cbd5e1", false);
    createVehicle("superbike", 1075, 1595, 0, "#dc2626", false);
    createVehicle("suv", 980, 1540, Math.PI / 2, "#1f2937", false);
    createVehicle("muscle", 1600, 1085, Math.PI / 2, "#b91c1c", false);
    createVehicle("bus", 1960, 1180, 0, "#2563eb", false);
    createVehicle("truck", 820, 1680, Math.PI / 2, "#e2e8f0", false);
    createVehicle("boat", 4585, 1900, 0, "#f8fafc", false);
    createVehicle("heli", 4360, 4180, 0, "#0f172a", false);
    createVehicle("heli", 2300, 1590, 0, "#0f172a", false); // Central Park Helipad Spawn too!

    // Ambient traffic cars, SUVs, motorcycles, buses, trucks & police patrols
    const trafficCount = Math.max(4, Math.round(28 * currentTrafficDensity));
    const trafficKinds = ["sedan", "taxi", "coupe", "suv", "bus", "truck", "superbike", "cruiser", "police", "police_moto"];
    const colors = ["#334155", "#64748b", "#991b1b", "#1e40af", "#065f46", "#d97706", "#e2e8f0"];
    for (let i = 0; i < trafficCount; i++) {
      let kind = trafficKinds[i % trafficKinds.length];
      if (!policeConfig.enabled && kind.startsWith("police")) kind = "sedan";
      const onH = i % 2 === 0;
      const col = kind === "taxi" ? "#eab308" : kind.startsWith("police") ? "#1e293b" : colors[i % colors.length];
      if (onH) {
        const rz = world.hRoads[i % world.hRoads.length];
        const dir = i % 4 === 0 ? 1 : -1;
        const laneZ = rz + (dir > 0 ? -38 : 38);
        const rx = 420 + ((i * 340) % 3600);
        createVehicle(kind, rx, laneZ, dir > 0 ? Math.PI / 2 : -Math.PI / 2, col, true);
      } else {
        const rx = world.vRoads[i % world.vRoads.length];
        const dir = i % 4 === 1 ? 1 : -1;
        const laneX = rx + (dir > 0 ? 38 : -38);
        const rz = 420 + ((i * 360) % 3800);
        createVehicle(kind, laneX, rz, dir > 0 ? 0 : Math.PI, col, true);
      }
    }

    // Pedestrians
    const pedCount = Math.max(6, Math.round(40 * currentPedDensity));
    const pedOutfits = ["ped1", "ped2", "ped3", "ped4", "streetwear", "suit"];
    const skins = ["#f1c27d", "#d8a482", "#8d5524", "#e0ac69", "#c68642"];
    const hairs = ["#1e1b18", "#451a03", "#78350f", "#0f172a", "#52525b"];
    for (let i = 0; i < pedCount; i++) {
      const alongH = i % 2 === 0;
      let px, pz, ang;
      if (alongH) {
        const rz = world.hRoads[i % world.hRoads.length];
        const side = i % 4 === 0 ? -1 : 1;
        pz = rz + side * (world.HALF_ROAD + 16);
        px = 360 + ((i * 250) % 3700);
        ang = i % 3 === 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        const rx = world.vRoads[i % world.vRoads.length];
        const side = i % 4 === 1 ? -1 : 1;
        px = rx + side * (world.HALF_ROAD + 16);
        pz = 360 + ((i * 270) % 3700);
        ang = i % 3 === 0 ? 0 : Math.PI;
      }
      pedestrians.push({
        x: px, z: pz, angle: ang, speed: 44 + (i % 4) * 8,
        outfit: pedOutfits[i % pedOutfits.length], skin: skins[i % skins.length], hair: hairs[i % hairs.length],
        phase: Math.random() * 6.28, panicTimer: 0, turnTimer: 2 + Math.random() * 5, hp: 40, koTimer: 0,
      });
    }
  }

  function applyPopulationDensity(world, trafficMult, pedMult) {
    const nextT = Math.max(0.25, Math.min(2.0, Number(trafficMult) || 1.0));
    const nextP = Math.max(0.25, Math.min(2.0, Number(pedMult) || 1.0));
    if (Math.abs(nextT - currentTrafficDensity) < 0.05 && Math.abs(nextP - currentPedDensity) < 0.05) return;
    currentTrafficDensity = nextT;
    currentPedDensity = nextP;

    const targetTraffic = Math.max(4, Math.round(28 * currentTrafficDensity));
    for (let i = vehicles.length - 1; i >= 0 && vehicles.filter((v) => v.isTraffic).length > targetTraffic; i--) {
      if (vehicles[i].isTraffic && vehicles[i] !== player.vehicle) vehicles.splice(i, 1);
    }
    const colors = ["#334155", "#64748b", "#991b1b", "#1e40af", "#065f46", "#d97706", "#e2e8f0"];
    const trafficKinds = ["sedan", "taxi", "coupe", "suv", "bus", "truck", "superbike", "cruiser"];
    while (vehicles.filter((v) => v.isTraffic).length < targetTraffic) {
      const idx = vehicles.length;
      const kind = trafficKinds[idx % trafficKinds.length];
      const rz = world.hRoads[idx % world.hRoads.length];
      const rx = 420 + ((idx * 340) % 3600);
      createVehicle(kind, rx, rz - 38, Math.PI / 2, colors[idx % colors.length], true);
    }

    const targetPed = Math.max(6, Math.round(40 * currentPedDensity));
    if (pedestrians.length > targetPed) pedestrians.length = targetPed;
    const pedOutfits = ["ped1", "ped2", "ped3", "ped4", "streetwear", "suit"];
    while (pedestrians.length < targetPed) {
      const i = pedestrians.length;
      const rz = world.hRoads[i % world.hRoads.length];
      pedestrians.push({
        x: 360 + ((i * 250) % 3700),
        z: rz + world.HALF_ROAD + 16,
        angle: Math.PI / 2,
        speed: 44 + (i % 4) * 8,
        outfit: pedOutfits[i % pedOutfits.length],
        skin: "#d8a482",
        hair: "#1e1b18",
        phase: Math.random() * 6.28,
        panicTimer: 0,
        turnTimer: 2 + Math.random() * 5,
        hp: 40,
        koTimer: 0,
      });
    }
  }

  function setOwnerRuntimeConfig(cfg) {
    if (!cfg || typeof cfg !== "object") return;
    if (cfg.police) {
      policeConfig.enabled = cfg.police.enabled !== false;
      policeConfig.maxVehicles = Math.max(0, Math.min(16, Number(cfg.police.maxVehicles ?? 8)));
      policeConfig.difficulty = Math.max(0.5, Math.min(2.0, Number(cfg.police.difficulty ?? 1.0)));
      policeConfig.minWanted = Math.max(0, Math.min(5, Number(cfg.police.minWanted ?? 0)));
      policeConfig.maxWanted = Math.max(0, Math.min(5, Number(cfg.police.maxWanted ?? 5)));
      policeConfig.helisEnabled = cfg.police.helisEnabled !== false;
      policeConfig.roadblocksEnabled = cfg.police.roadblocksEnabled !== false;
      policeConfig.responseSpeed = Math.max(0.5, Math.min(2.0, Number(cfg.police.responseSpeed ?? 1.0)));
    }
    if (cfg.worldSettings) {
      globalDifficulty = cfg.worldSettings.globalDifficulty || "normal";
    }

    // Reset and re-apply Vehicle Specs + Custom Vehicles
    Object.keys(VEHICLE_SPECS).forEach((k) => {
      if (!BASE_VEHICLE_SPECS[k]) delete VEHICLE_SPECS[k];
      else VEHICLE_SPECS[k] = { ...BASE_VEHICLE_SPECS[k] };
    });
    disabledVehicles = new Set();
    if (cfg.vehicleOverrides && typeof cfg.vehicleOverrides === "object") {
      Object.entries(cfg.vehicleOverrides).forEach(([kind, ov]) => {
        if (!ov) return;
        if (ov.disabled) disabledVehicles.add(kind);
        if (VEHICLE_SPECS[kind]) {
          if (ov.name) VEHICLE_SPECS[kind].name = ov.name;
          if (typeof ov.price === "number" && ov.price >= 0) VEHICLE_SPECS[kind].price = ov.price;
          if (typeof ov.maxSpeed === "number" && ov.maxSpeed > 50) VEHICLE_SPECS[kind].maxSpeed = ov.maxSpeed;
          if (typeof ov.turn === "number" && ov.turn > 0.5) VEHICLE_SPECS[kind].turn = ov.turn;
        }
      });
    }
    if (Array.isArray(cfg.customVehicles)) {
      cfg.customVehicles.forEach((cv) => {
        if (!cv || !cv.kind) return;
        if (cv.disabled) disabledVehicles.add(cv.kind);
        const kType = cv.kindType || "car";
        VEHICLE_SPECS[cv.kind] = {
          name: cv.name || "Custom Ride",
          category: cv.category || "Custom",
          maxSpeed: Number(cv.maxSpeed) || 520,
          accel: Math.round((Number(cv.maxSpeed) || 520) * 0.8),
          turn: Number(cv.turn) || 3.0,
          radius: kType === "moto" ? 14 : kType === "bus" ? 32 : kType === "truck" ? 30 : kType === "heli" ? 28 : 22,
          kindType: kType,
          defaultColor: cv.defaultColor || "#f59e0b",
          price: typeof cv.price === "number" ? cv.price : 2500,
        };
      });
    }
    // Propagate updated vehicle stats to existing spawned vehicles
    vehicles.forEach((v) => {
      const sp = VEHICLE_SPECS[v.kind];
      if (sp) {
        v.name = sp.name;
        v.maxSpeed = sp.maxSpeed;
        v.accel = sp.accel;
        v.turn = sp.turn;
      }
    });

    // Reset and re-apply Character Specs + Custom Characters
    Object.keys(CHARACTER_SPECS).forEach((k) => {
      if (!BASE_CHARACTER_SPECS[k]) delete CHARACTER_SPECS[k];
      else CHARACTER_SPECS[k] = { ...BASE_CHARACTER_SPECS[k] };
    });
    disabledCharacters = new Set();
    if (cfg.characterOverrides && typeof cfg.characterOverrides === "object") {
      Object.entries(cfg.characterOverrides).forEach(([cid, ov]) => {
        if (!ov) return;
        if (ov.disabled) disabledCharacters.add(cid);
        if (CHARACTER_SPECS[cid]) {
          if (ov.name) CHARACTER_SPECS[cid].name = ov.name;
          if (ov.role) CHARACTER_SPECS[cid].role = ov.role;
          if (ov.defaultOutfit) CHARACTER_SPECS[cid].defaultOutfit = ov.defaultOutfit;
          if (typeof ov.maxHealth === "number" && ov.maxHealth >= 40) CHARACTER_SPECS[cid].maxHealth = ov.maxHealth;
          if (typeof ov.speedMult === "number" && ov.speedMult >= 0.5) CHARACTER_SPECS[cid].speedMult = ov.speedMult;
        }
      });
    }
    if (Array.isArray(cfg.customCharacters)) {
      cfg.customCharacters.forEach((cc) => {
        if (!cc || !cc.id) return;
        if (cc.disabled) disabledCharacters.add(cc.id);
        CHARACTER_SPECS[cc.id] = {
          id: cc.id,
          name: cc.name || "Custom Agent",
          role: cc.role || "Custom Hero",
          defaultOutfit: cc.defaultOutfit || "streetwear",
          skinHex: cc.skinHex || "#d8a482",
          hairHex: cc.hairHex || "#1e1b18",
          maxHealth: Number(cc.maxHealth) || 100,
          speedMult: Number(cc.speedMult) || 1.0,
        };
      });
    }
    const activeChar = CHARACTER_SPECS[player.characterId];
    if (activeChar) {
      player.maxHealth = activeChar.maxHealth || 100;
      player.health = Math.min(player.health, player.maxHealth);
      player.speedMult = activeChar.speedMult || 1.0;
    }
  }

  function getDifficultyMult() {
    if (globalDifficulty === "easy") return 0.75;
    if (globalDifficulty === "hard") return 1.3;
    if (globalDifficulty === "extreme") return 1.6;
    return 1.0;
  }

  function spawnMissionEnemies(cx, cz, count) {
    enemies.length = 0;
    const hpVal = Math.round(75 * getDifficultyMult());
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const dist = 65 + (i % 2) * 35;
      enemies.push({
        x: cx + Math.cos(ang) * dist,
        z: cz + Math.sin(ang) * dist,
        angle: ang + Math.PI,
        hp: hpVal,
        maxHp: hpVal,
        phase: Math.random() * 6,
        fireTimer: 1.0 + Math.random() * 1.4,
        hasGun: i % 2 === 0,
        takingCover: false,
      });
    }
  }

  function clearMissionEnemies() {
    enemies.length = 0;
  }

  function getAliveEnemyCount() {
    return enemies.length;
  }

  function addWanted(stars, showToast) {
    if (!policeConfig.enabled || policeConfig.maxWanted <= 0) {
      player.wanted = 0;
      return;
    }
    const prev = player.wanted;
    const target = Math.max(policeConfig.minWanted, Math.min(policeConfig.maxWanted, stars));
    player.wanted = Math.min(policeConfig.maxWanted, Math.max(player.wanted, target));
    player.evadeTimer = 14 + player.wanted * 4;
    if (player.wanted > prev && showToast) {
      showToast(`WANTED LEVEL ${"★".repeat(player.wanted)}`);
    }
  }

  function spawnVehicleNearPlayer(kind, color, world) {
    const spec = VEHICLE_SPECS[kind];
    if (spec && spec.kindType === "boat") {
      return createVehicle(kind, 4585, Math.max(400, Math.min(3400, player.z)), 0, color, false);
    }
    const px = player.x + Math.sin(player.angle) * 65;
    const pz = player.z + Math.cos(player.angle) * 65;
    const res = world.collideCircleWithBuildings(px, pz, 28);
    return createVehicle(kind, res.x, res.z, player.angle, color, false);
  }

  function findNearestVehicle(maxDist = 68) {
    let best = null, bestD = maxDist;
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (v.isHeli && v.y > 16) continue;
      const d = Math.hypot(v.x - player.x, v.z - player.z);
      if (d < bestD) { bestD = d; best = v; }
    }
    return best;
  }

  function toggleEnterExitVehicle(audio, showToast) {
    if (player.vehicle) {
      const v = player.vehicle;
      if (v.isHeli && v.y > 16) {
        showToast("DESCEND TO LAND BEFORE EXITING");
        return false;
      }
      v.driverOccupied = false;
      const sideAng = v.angle + Math.PI / 2;
      player.x = v.x + Math.sin(sideAng) * (v.radius + 14);
      player.z = v.z + Math.cos(sideAng) * (v.radius + 14);
      player.angle = v.angle;
      player.vehicle = null;
      player.y = 0;
      audio.playDoor();
      audio.updateEngine(false, 0, false);
      return true;
    }

    const v = findNearestVehicle(72);
    if (!v) return false;

    if (v.isTraffic && v.driverOccupied) {
      v.isTraffic = false;
      v.driverOccupied = false;
      if (v.kind.startsWith("police")) addWanted(2, showToast);
      else if (vehicles.some((c) => c.kind.startsWith("police") && Math.hypot(c.x - v.x, c.z - v.z) < 420)) {
        addWanted(1, showToast);
      }
    }
    player.vehicle = v;
    player.isJumping = false;
    player.jumpY = 0;
    player.crouching = false;
    player.attackTimer = 0;
    audio.playDoor();
    return true;
  }

  function cycleWeapon() {
    if (player.ownedWeapons.length === 0) return "fists";
    const idx = player.ownedWeapons.indexOf(player.weapon);
    const nextIdx = (idx + 1) % player.ownedWeapons.length;
    player.weapon = player.ownedWeapons[nextIdx];
    return player.weapon;
  }

  function setCharacter(characterId) {
    const spec = CHARACTER_SPECS[characterId] || CHARACTER_SPECS.alex;
    player.characterId = spec.id;
    player.outfit = spec.defaultOutfit;
    player.skinHex = spec.skinHex;
    player.hairHex = spec.hairHex;
    player.maxHealth = spec.maxHealth || 100;
    player.health = Math.min(player.maxHealth, player.health);
    player.speedMult = spec.speedMult || 1.0;
    return spec;
  }

  function honkHorn(audio) {
    audio.playHorn();
    if (!player.vehicle) return;
    for (let i = 0; i < pedestrians.length; i++) {
      const pd = pedestrians[i];
      if (Math.hypot(pd.x - player.x, pd.z - player.z) < 210) {
        pd.panicTimer = Math.max(pd.panicTimer, 2.5);
        pd.angle = Math.atan2(pd.x - player.x, pd.z - player.z);
      }
    }
  }

  function fireProjectile(originX, originY, originZ, angle, damage, range, isPlayerShot) {
    projectiles.push({
      x: originX,
      y: originY,
      z: originZ,
      vx: Math.sin(angle) * 620,
      vz: Math.cos(angle) * 620,
      life: range / 620,
      damage,
      isPlayerShot,
    });
  }

  function updateProjectiles(dt, world, audio, showToast) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i];
      pr.life -= dt;
      pr.x += pr.vx * dt;
      pr.z += pr.vz * dt;
      if (pr.life <= 0) { projectiles.splice(i, 1); continue; }

      const col = world.collideCircleWithBuildings(pr.x, pr.z, 2, true, pr.y);
      if (col.hit) {
        combatSparks.push({ x: pr.x, y: pr.y, z: pr.z, life: 0.16 });
        projectiles.splice(i, 1);
        continue;
      }

      if (pr.isPlayerShot) {
        let hitSomething = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(e.x - pr.x, e.z - pr.z) < 14) {
            e.hp -= pr.damage;
            audio.playHit();
            combatSparks.push({ x: e.x, y: 12, z: e.z, life: 0.22 });
            if (e.hp <= 0) {
              enemies.splice(j, 1);
              player.cash += 85;
              player.xp += 35;
              showToast("TARGET DOWN · +$85");
            }
            hitSomething = true;
            break;
          }
        }
        if (!hitSomething) {
          for (let j = 0; j < pedestrians.length; j++) {
            const pd = pedestrians[j];
            if (pd.koTimer > 0) continue;
            if (Math.hypot(pd.x - pr.x, pd.z - pr.z) < 12) {
              pd.hp -= pr.damage;
              pd.panicTimer = 4;
              audio.playHit();
              combatSparks.push({ x: pd.x, y: 12, z: pd.z, life: 0.2 });
              if (pd.hp <= 0) {
                pd.koTimer = 12;
                addWanted(Math.max(1, player.wanted), showToast);
              }
              hitSomething = true;
              break;
            }
          }
        }
        if (hitSomething) projectiles.splice(i, 1);
      } else if (!player.vehicle) {
        if (Math.hypot(player.x - pr.x, player.z - pr.z) < 12) {
          const dmgMult = player.crouching ? 0.35 : 1.0; // Cover reduces damage!
          player.health = Math.max(0, player.health - pr.damage * dmgMult);
          audio.playHit();
          combatSparks.push({ x: player.x, y: 11, z: player.z, life: 0.2 });
          projectiles.splice(i, 1);
        }
      }
    }
  }

  function updatePlayer(dt, input, camYaw, world, audio, showToast, drivingSens = 1.0) {
    for (let i = combatSparks.length - 1; i >= 0; i--) {
      combatSparks[i].life -= dt;
      if (combatSparks[i].life <= 0) combatSparks.splice(i, 1);
    }

    const joySens = input.joystickSens || 1.0;
    const rawJoyX = Math.max(-1, Math.min(1, input.joyX * joySens));
    const rawJoyY = Math.max(-1, Math.min(1, input.joyY * joySens));

    if (player.vehicle) {
      const v = player.vehicle;
      const turboMult = 1 + player.upgrades.turbo * 0.14;
      const turnMult = (1 + player.upgrades.handling * 0.12) * drivingSens;
      const topSpeed = v.maxSpeed * turboMult;
      const accel = v.accel * turboMult;

      const wantGas = input.gas || rawJoyY < -0.25;
      const wantReverse = input.reverse || rawJoyY > 0.35;
      const wantBrake = input.brake || input.handbrake;
      const btnSteer = (input.steerLeft ? 1 : 0) + (input.steerRight ? -1 : 0);
      const joySteer = Math.abs(rawJoyX) > 0.08 ? -rawJoyX : 0;
      const steerInput = btnSteer !== 0 ? btnSteer : joySteer;

      // Helicopter Flight Controls (Gas = ascend/thrust forward, Reverse/Brake = descend/slow)
      if (v.isHeli) {
        v.rotorSpin += dt * (input.gas || v.y > 2 ? 22 : 4);
        if (input.gas) {
          v.y = Math.min(135, v.y + 52 * dt);
          v.speed += accel * 0.75 * dt;
        } else if (input.reverse || input.brake) {
          v.y = Math.max(0, v.y - 58 * dt);
          v.speed *= Math.pow(0.32, dt);
        } else if (v.y > 1) {
          v.speed += (-rawJoyY) * accel * 0.65 * dt;
        }
        if (input.handbrake) v.speed *= Math.pow(0.15, dt);
        v.speed = Math.max(-180, Math.min(topSpeed, v.speed));
        v.angle += steerInput * v.turn * turnMult * dt;
        v.leanAngle = (v.speed / topSpeed) * 0.18;
        v.x += Math.sin(v.angle) * v.speed * dt;
        v.z += Math.cos(v.angle) * v.speed * dt;
        if (v.y < 32) {
          const col = world.collideCircleWithBuildings(v.x, v.z, v.radius, true, v.y);
          v.x = col.x; v.z = col.z;
        }
        player.x = v.x; player.y = v.y; player.z = v.z; player.angle = v.angle;
        audio.updateEngine(true, Math.max(0.2, Math.abs(v.speed) / topSpeed), false);
        return;
      }

      if (input.handbrake) {
        v.speed *= Math.pow(0.08, dt);
        if (Math.abs(v.speed) < 10) v.speed = 0;
        v.braking = true;
      } else if (wantGas && !wantBrake && !wantReverse) {
        const factor = input.gas ? 1.0 : Math.min(1.0, Math.abs(rawJoyY));
        v.speed += accel * factor * dt;
        v.braking = false;
      } else if (wantBrake) {
        // Service Brake brings speed smoothly to 0 without reversing
        if (v.speed > 12) v.speed = Math.max(0, v.speed - accel * 2.1 * dt);
        else if (v.speed < -12) v.speed = Math.min(0, v.speed + accel * 2.1 * dt);
        else v.speed = 0;
        v.braking = true;
      } else if (wantReverse) {
        if (v.speed > 25) { v.speed -= accel * 1.9 * dt; v.braking = true; }
        else { v.speed -= accel * 0.72 * dt; v.braking = true; }
      } else {
        v.speed *= Math.pow(0.28, dt);
        if (Math.abs(v.speed) < 6) v.speed = 0;
        v.braking = false;
      }

      v.speed = Math.max(-topSpeed * 0.38, Math.min(topSpeed, v.speed));

      v.steerAngle += (steerInput * 0.45 - v.steerAngle) * Math.min(1, dt * 10);
      if (Math.abs(v.speed) > 8 && Math.abs(steerInput) > 0.05) {
        const dirSign = v.speed >= 0 ? 1 : -1;
        const speedFactor = 0.45 + 0.55 * Math.min(1, Math.abs(v.speed) / 180);
        const driftBoost = input.handbrake ? 1.55 : 1.0;
        v.angle += steerInput * v.turn * turnMult * speedFactor * driftBoost * dirSign * dt;
      }

      const targetLean = v.isMoto ? -steerInput * Math.min(1, Math.abs(v.speed) / 260) * 0.32 : (input.handbrake ? -steerInput * 0.06 : 0);
      v.leanAngle += (targetLean - v.leanAngle) * Math.min(1, dt * 8);
      v.wheelSpin += (v.speed * dt) / 4;

      const nextX = v.x + Math.sin(v.angle) * v.speed * dt;
      const nextZ = v.z + Math.cos(v.angle) * v.speed * dt;

      if (v.isBoat) {
        // Boats stay in ocean & South Canal water!
        if (world.isInWater(nextX, nextZ)) {
          v.x = Math.max(3750, Math.min(5160, nextX));
          v.z = Math.max(60, Math.min(5140, nextZ));
        } else {
          v.speed *= 0.3;
        }
      } else {
        v.x = nextX;
        v.z = nextZ;
        if (world.isInWater(v.x, v.z)) {
          v.speed *= 0.4;
          v.hp = Math.max(10, v.hp - 12 * dt);
        }
        const col = world.collideCircleWithBuildings(v.x, v.z, v.radius, false, 0);
        if (col.hit) {
          v.x = col.x; v.z = col.z;
          if (Math.abs(v.speed) > 140) {
            audio.playCrash(Math.abs(v.speed) / 450);
            v.hp = Math.max(10, v.hp - Math.abs(v.speed) * 0.03);
          }
          v.speed *= 0.45;
        }
      }

      player.x = v.x; player.y = v.y; player.z = v.z; player.angle = v.angle;
      player.stamina = Math.min(100, player.stamina + 18 * dt);
      audio.updateEngine(true, v.speed / topSpeed, v.isMoto);
      return;
    }

    // On-Foot / Swimming / Climbing / Combat
    audio.updateEngine(false, 0, false);
    player.crouching = !!input.crouch;
    player.isSwimming = world.isInWater(player.x, player.z);

    // Weapon Attack / Punch / Shooting
    const wSpec = WEAPON_SPECS[player.weapon] || WEAPON_SPECS.fists;
    if (player.attackTimer > 0) player.attackTimer -= dt;

    // Dedicated Hand-to-Hand PUNCH button (works even while carrying a firearm!)
    if (input.punchPressed) {
      input.punchPressed = false;
      if (player.attackTimer <= 0.02 && !player.isSwimming) {
        player.attackTimer = WEAPON_SPECS.fists.cooldown;
        player.comboStep = (player.comboStep + 1) % 3;
        player.hitTriggered = false;
        player.punchOverride = true;
        audio.playPunch();
      }
    }

    if (input.fightPressed) {
      input.fightPressed = false;
      if (player.attackTimer <= 0.02 && !player.isSwimming) {
        player.punchOverride = false;
        if (wSpec.isMelee) {
          player.attackTimer = wSpec.cooldown;
          player.comboStep = (player.comboStep + 1) % 3;
          player.hitTriggered = false;
          audio.playPunch();
        } else {
          const curAmmo = player.ammo[player.weapon] || 0;
          if (curAmmo > 0) {
            player.ammo[player.weapon] = curAmmo - 1;
            player.attackTimer = wSpec.cooldown;
            let fireAngle = input.aim ? camYaw : player.angle;
            let bestDist = 200;
            enemies.forEach((e) => {
              const d = Math.hypot(e.x - player.x, e.z - player.z);
              if (d < bestDist) {
                const angToE = Math.atan2(e.x - player.x, e.z - player.z);
                let diff = angToE - fireAngle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                if (Math.abs(diff) < 0.42) { bestDist = d; fireAngle = angToE; }
              }
            });
            player.angle = fireAngle;
            fireProjectile(
              player.x + Math.sin(fireAngle) * 8,
              player.y + (player.crouching ? 8 : 12),
              player.z + Math.cos(fireAngle) * 8,
              fireAngle,
              wSpec.damage,
              wSpec.range,
              true
            );
            audio.playPunch();
          } else {
            showToast("OUT OF AMMO · SWITCH WEAPON");
          }
        }
      }
    }

    // Resolve Melee Hit (either Punch button or melee weapon attack)
    const activeMeleeSpec = player.punchOverride ? WEAPON_SPECS.fists : wSpec;
    if ((player.punchOverride || wSpec.isMelee) && player.attackTimer > 0 && !player.hitTriggered && player.attackTimer < activeMeleeSpec.cooldown * 0.65) {
      player.hitTriggered = true;
      const reachX = player.x + Math.sin(player.angle) * (activeMeleeSpec.range * 0.72);
      const reachZ = player.z + Math.cos(player.angle) * (activeMeleeSpec.range * 0.72);

      let hitTarget = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (Math.hypot(e.x - reachX, e.z - reachZ) < 26) {
          e.hp -= activeMeleeSpec.damage;
          audio.playHit();
          combatSparks.push({ x: e.x, y: 12, z: e.z, life: 0.25 });
          if (e.hp <= 0) {
            enemies.splice(j, 1);
            player.cash += 85;
            player.xp += 35;
            showToast("KNOCKOUT · +$85");
          }
          hitTarget = true;
          break;
        }
      }
      if (!hitTarget) {
        for (let i = 0; i < pedestrians.length; i++) {
          const p = pedestrians[i];
          if (p.koTimer > 0) continue;
          if (Math.hypot(p.x - reachX, p.z - reachZ) < 24) {
            p.hp -= activeMeleeSpec.damage;
            p.panicTimer = 4.0;
            p.angle = Math.atan2(p.x - player.x, p.z - player.z);
            p.x += Math.sin(p.angle) * 10;
            p.z += Math.cos(p.angle) * 10;
            audio.playHit();
            combatSparks.push({ x: p.x, y: 12, z: p.z, life: 0.25 });
            if (p.hp <= 0) {
              p.koTimer = 10;
              player.cash += 35;
              player.xp += 20;
              showToast("KNOCKOUT · +$35");
              addWanted(Math.max(1, player.wanted), showToast);
            }
            break;
          }
        }
      }
    }

    const joyMag = Math.hypot(rawJoyX, rawJoyY);
    const canSprint = input.sprint && player.stamina > 2 && joyMag > 0.2 && !player.crouching;
    const baseSpd = (player.isSwimming ? 46 : player.crouching ? 40 : canSprint ? 138 : 70) * (player.speedMult || 1.0);

    if (canSprint) player.stamina = Math.max(0, player.stamina - 22 * dt);
    else player.stamina = Math.min(100, player.stamina + 16 * dt);

    if (joyMag > 0.1) {
      const fwd = -rawJoyY;
      const right = rawJoyX;
      const worldMoveX = Math.sin(camYaw) * fwd - Math.cos(camYaw) * right;
      const worldMoveZ = Math.cos(camYaw) * fwd + Math.sin(camYaw) * right;
      const moveLen = Math.hypot(worldMoveX, worldMoveZ) || 1;
      const nx = worldMoveX / moveLen;
      const nz = worldMoveZ / moveLen;

      const targetAng = Math.atan2(nx, nz);
      let diff = targetAng - player.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      player.angle += diff * Math.min(1, dt * 14);

      const scale = Math.min(1, joyMag) * (player.attackTimer > 0 && wSpec.isMelee ? 0.35 : 1.0);
      player.x += nx * baseSpd * scale * dt;
      player.z += nz * baseSpd * scale * dt;
      player.moveSpeedRatio = canSprint ? 1.0 : 0.55;

      const animRate = canSprint ? 12 : 7.5;
      player.walkPhase += dt * animRate * scale;
      player.stepAccum += dt * animRate * scale;
      if (player.stepAccum >= Math.PI && !player.isJumping && !player.isSwimming) {
        player.stepAccum = 0;
        audio.playFootstep(canSprint);
      }
    } else {
      player.moveSpeedRatio = 0;
    }

    // Jump & Climb onto crates / low walls
    const climbSurfaceY = world.getClimbHeightAt(player.x, player.z);
    if (input.jumpPressed && !player.isJumping && !player.isSwimming) {
      player.isJumping = true;
      player.jumpVel = 66;
      audio.playJump();
      // Climb forward boost if near a climbable ledge
      const aheadClimb = world.getClimbHeightAt(player.x + Math.sin(player.angle) * 14, player.z + Math.cos(player.angle) * 14);
      if (aheadClimb > 0) {
        player.x += Math.sin(player.angle) * 10;
        player.z += Math.cos(player.angle) * 10;
      }
    }
    input.jumpPressed = false;

    const groundFloor = player.isSwimming ? -1.4 : climbSurfaceY;
    if (player.isJumping || player.y > groundFloor) {
      player.y += player.jumpVel * dt;
      player.jumpVel -= 185 * dt;
      if (player.y <= groundFloor) {
        player.y = groundFloor;
        player.jumpVel = 0;
        player.isJumping = false;
      }
    } else {
      player.y = groundFloor;
    }
    player.jumpY = Math.max(0, player.y);

    const col = world.collideCircleWithBuildings(player.x, player.z, player.radius, true, player.y);
    player.x = col.x;
    player.z = col.z;
  }

  function updateEnemies(dt, audio) {
    const dMult = getDifficultyMult();
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      const dx = player.x - e.x;
      const dz = player.z - e.z;
      const dist = Math.hypot(dx, dz);
      e.angle = Math.atan2(dx, dz);

      if (dist > (e.hasGun ? 130 : 22)) {
        e.x += Math.sin(e.angle) * 52 * dMult * dt;
        e.z += Math.cos(e.angle) * 52 * dMult * dt;
        e.phase += dt * 7;
      }

      e.fireTimer -= dt;
      if (e.fireTimer <= 0 && dist < (e.hasGun ? 240 : 28)) {
        e.fireTimer = (e.hasGun ? 1.4 : 1.0) / Math.max(0.75, dMult);
        if (e.hasGun) {
          fireProjectile(e.x, 12, e.z, e.angle + (Math.random() - 0.5) * 0.14, 7 * dMult, 250, false);
        } else if (!player.vehicle) {
          const dmgMult = player.crouching ? 0.45 : 1.0;
          player.health = Math.max(0, player.health - 9 * dMult * dmgMult);
          audio.playHit();
        }
      }
    }
  }

  function updateTrafficAndPolice(dt, world, audio, showToast, onBusted) {
    const nsState = world.getLightState("ns");
    const ewState = world.getLightState("ew");
    let activeChasers = 0;
    let closestPoliceDist = 9999;

    if (!policeConfig.enabled || policeConfig.maxWanted <= 0) {
      player.wanted = 0;
      player.arrestProgress = 0;
      roadblocks.length = 0;
      audio.updateSiren(false, dt);
    } else {
      if (policeConfig.minWanted > 0 && player.wanted < policeConfig.minWanted) {
        player.wanted = policeConfig.minWanted;
        player.evadeTimer = Math.max(player.evadeTimer, 14);
      }
      if (player.wanted > policeConfig.maxWanted) {
        player.wanted = policeConfig.maxWanted;
      }
      // Manage roadblocks at Wanted >= 3
      if (policeConfig.roadblocksEnabled && player.wanted >= 3 && roadblocks.length < 2 && policeConfig.maxVehicles > 0) {
        const rx = world.vRoads[Math.floor(Math.random() * world.vRoads.length)];
        const rz = world.hRoads[Math.floor(Math.random() * world.hRoads.length)];
        if (Math.hypot(rx - player.x, rz - player.z) > 480) {
          roadblocks.push({ x: rx, z: rz });
          createVehicle("police", rx - 32, rz, Math.PI / 2, "#1e293b", false);
          createVehicle("police", rx + 32, rz, -Math.PI / 2, "#1e293b", false);
        }
      } else if (!policeConfig.roadblocksEnabled || player.wanted < 3) {
        roadblocks.length = 0;
      }
    }

    const chaseMult = policeConfig.difficulty * policeConfig.responseSpeed * getDifficultyMult();

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (v === player.vehicle) continue;
      if (v.honkCooldown > 0) v.honkCooldown -= dt;

      const distToPlayer = Math.hypot(player.x - v.x, player.z - v.z);
      const isPoliceUnit = v.kind.startsWith("police");
      const canUnitChase = policeConfig.enabled && policeConfig.maxVehicles > 0 && (v.kind !== "police_heli" || policeConfig.helisEnabled);
      const isPoliceChasing = isPoliceUnit && canUnitChase && player.wanted > 0 && activeChasers < policeConfig.maxVehicles && distToPlayer < (v.isHeli ? 1900 : 1450);

      if (isPoliceChasing) {
        activeChasers++;
        closestPoliceDist = Math.min(closestPoliceDist, distToPlayer);
        v.sirenActive = true;
        const targetAng = Math.atan2(player.x - v.x, player.z - v.z);
        let diff = targetAng - v.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        v.angle += Math.sign(diff) * Math.min(Math.abs(diff), 2.8 * policeConfig.responseSpeed * dt);

        if (v.isHeli) {
          v.y = 105;
          v.rotorSpin += dt * 22;
          const targetSpd = distToPlayer > 140 ? 320 * chaseMult : 80;
          v.speed += (targetSpd - v.speed) * Math.min(1, dt * 3 * policeConfig.responseSpeed);
          v.x += Math.sin(v.angle) * v.speed * dt;
          v.z += Math.cos(v.angle) * v.speed * dt;
        } else {
          const targetSpd = distToPlayer > 68 ? (335 + player.wanted * 30) * Math.min(1.5, chaseMult) : 80;
          v.speed += (targetSpd - v.speed) * Math.min(1, dt * 3.5 * policeConfig.responseSpeed);
          v.wheelSpin += (v.speed * dt) / 4;
          v.x += Math.sin(v.angle) * v.speed * dt;
          v.z += Math.cos(v.angle) * v.speed * dt;
          const col = world.collideCircleWithBuildings(v.x, v.z, v.radius);
          if (col.hit) { v.x = col.x; v.z = col.z; v.angle += 0.9 * dt; }
        }
      } else if (v.isTraffic && !v.isHeli && !v.isBoat) {
        v.sirenActive = false;
        let shouldStop = false;
        if (v.trafficAxis === "ew") {
          for (let r = 0; r < world.vRoads.length; r++) {
            const rx = world.vRoads[r];
            const distAhead = (rx - v.x) * v.trafficDir - world.HALF_ROAD;
            if (distAhead > 8 && distAhead < 85 && ewState !== "green") { shouldStop = true; break; }
          }
        } else {
          for (let r = 0; r < world.hRoads.length; r++) {
            const rz = world.hRoads[r];
            const distAhead = (rz - v.z) * v.trafficDir - world.HALF_ROAD;
            if (distAhead > 8 && distAhead < 85 && nsState !== "green") { shouldStop = true; break; }
          }
        }
        const lookX = v.x + Math.sin(v.angle) * 72;
        const lookZ = v.z + Math.cos(v.angle) * 72;
        if (Math.hypot(player.x - lookX, player.z - lookZ) < 46) {
          shouldStop = true;
          if (v.honkCooldown <= 0 && distToPlayer < 320) { v.honkCooldown = 3.5; audio.playHorn(); }
        }
        for (let j = 0; j < vehicles.length; j++) {
          if (i === j) continue;
          const other = vehicles[j];
          if (Math.hypot(other.x - lookX, other.z - lookZ) < 44) { shouldStop = true; break; }
        }
        const targetSpd = shouldStop ? 0 : v.isMoto ? 205 : 160;
        v.speed += (targetSpd - v.speed) * Math.min(1, dt * 4.5);
        v.braking = shouldStop;
        v.wheelSpin += (v.speed * dt) / 4;
        v.x += Math.sin(v.angle) * v.speed * dt;
        v.z += Math.cos(v.angle) * v.speed * dt;

        if (v.x < 120) v.x = 4180;
        if (v.x > 4200) v.x = 140;
        if (v.z < 120) v.z = 4400;
        if (v.z > 4420) v.z = 140;
      } else {
        v.sirenActive = false;
        v.speed *= Math.pow(0.08, dt);
        if (v.isHeli && v.y > 0) v.y = Math.max(0, v.y - 25 * dt);
        if (Math.abs(v.speed) > 4) {
          v.x += Math.sin(v.angle) * v.speed * dt;
          v.z += Math.cos(v.angle) * v.speed * dt;
          if (!v.isBoat && !v.isHeli) {
            const col = world.collideCircleWithBuildings(v.x, v.z, v.radius);
            v.x = col.x; v.z = col.z;
          }
        }
      }

      // Collisions with ground vehicles
      const activeEntity = player.vehicle || player;
      if (v !== activeEntity && Math.abs(v.y - (player.vehicle ? player.vehicle.y : 0)) < 25) {
        const dx = activeEntity.x - v.x;
        const dz = activeEntity.z - v.z;
        const minDist = activeEntity.radius + v.radius;
        const d = Math.hypot(dx, dz);
        if (d < minDist && d > 0.001) {
          const overlap = minDist - d;
          activeEntity.x += (dx / d) * overlap * 0.6;
          activeEntity.z += (dz / d) * overlap * 0.6;
          v.x -= (dx / d) * overlap * 0.4;
          v.z -= (dz / d) * overlap * 0.4;

          const relSpd = Math.abs((player.vehicle ? player.vehicle.speed : 70) - v.speed);
          if (relSpd > 130) {
            audio.playCrash(relSpd / 500);
            if (player.vehicle) {
              player.vehicle.speed *= 0.6;
              player.vehicle.hp = Math.max(10, player.vehicle.hp - 5);
            } else {
              player.health = Math.max(0, player.health - 7);
            }
            if (isPoliceUnit) addWanted(Math.max(2, player.wanted + 1), showToast);
          }
        }
      }
    }

    // Wanted System: Spawn Motorcycles, Choppers, Search/Hide & Arrest ("BUSTED")
    if (policeConfig.enabled && player.wanted > 0 && policeConfig.maxWanted > 0) {
      audio.updateSiren(activeChasers > 0, dt);

      // Spawn Police Chopper at Wanted >= 4
      if (policeConfig.helisEnabled && player.wanted >= 4 && policeConfig.maxVehicles > 0 && !vehicles.some((v) => v.kind === "police_heli")) {
        const ch = createVehicle("police_heli", player.x + 650, player.z + 650, 0, "#0f172a", false);
        ch.y = 110;
        showToast("POLICE CHOPPER DEPLOYED!");
      }

      const maxUnitsCap = policeConfig.maxVehicles;
      if (activeChasers < Math.min(maxUnitsCap, player.wanted + 1) && vehicles.filter((c) => c.kind.startsWith("police")).length < Math.max(2, maxUnitsCap)) {
        const rx = world.vRoads[Math.floor(Math.random() * world.vRoads.length)];
        const rz = world.hRoads[Math.floor(Math.random() * world.hRoads.length)];
        if (Math.hypot(rx - player.x, rz - player.z) > 580) {
          const unitKind = player.wanted >= 2 && Math.random() > 0.5 ? "police_moto" : "police";
          createVehicle(unitKind, rx, rz, 0, "#1e293b", true);
        }
      }

      // Arrest System if player is slow/on foot near police
      const playerSlow = !player.vehicle || Math.abs(player.vehicle.speed) < 35;
      if (closestPoliceDist < 48 && playerSlow && !player.isSwimming) {
        player.arrestProgress += dt * 0.42 * policeConfig.difficulty;
        if (player.arrestProgress >= 1.0) {
          player.arrestProgress = 0;
          player.wanted = policeConfig.minWanted;
          player.vehicle = null;
          player.x = 1460; player.z = 3080; // Respawn at Downtown Precinct
          player.cash = Math.max(0, player.cash - 150);
          if (onBusted) onBusted();
          return;
        }
      } else {
        player.arrestProgress = Math.max(0, player.arrestProgress - dt * 0.6);
      }

      // Search & Hide Escape Cooldown
      const spotted = closestPoliceDist < (player.crouching ? 240 : 360) * Math.max(0.75, policeConfig.difficulty);
      player.hiddenFromPolice = !spotted;
      if (spotted) {
        player.evadeTimer = 10 + player.wanted * 3;
      } else if (player.wanted > policeConfig.minWanted) {
        player.evadeTimer -= dt;
        if (player.evadeTimer <= 0) {
          player.wanted = Math.max(policeConfig.minWanted, player.wanted - 1);
          if (player.wanted > policeConfig.minWanted) {
            player.evadeTimer = 8;
            showToast("WANTED LEVEL DROPPING...");
          } else {
            showToast("ESCAPED POLICE · +$300 BONUS");
            player.cash += 300;
            audio.playCash();
          }
        }
      }
    } else {
      player.hiddenFromPolice = false;
      player.arrestProgress = 0;
    }
  }

  function updatePedestrians(dt, world, showToast) {
    for (let i = 0; i < pedestrians.length; i++) {
      const p = pedestrians[i];
      if (p.koTimer > 0) { p.koTimer -= dt; if (p.koTimer <= 0) p.hp = 40; continue; }
      p.turnTimer -= dt;
      if (p.panicTimer > 0) p.panicTimer -= dt;

      const dp = Math.hypot(p.x - player.x, p.z - player.z);
      if (dp < 95 && player.vehicle && !player.vehicle.isHeli && Math.abs(player.vehicle.speed) > 180) {
        p.angle = Math.atan2(p.x - player.x, p.z - player.z);
        p.panicTimer = 2.5;
        if (dp < 24 && Math.abs(player.vehicle.speed) > 210) addWanted(Math.max(1, player.wanted), showToast);
      } else if (p.turnTimer <= 0) {
        p.turnTimer = 3 + Math.random() * 6;
        p.angle += (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 2);
      }

      const spd = p.panicTimer > 0 ? p.speed * 2.1 : p.speed;
      p.x += Math.sin(p.angle) * spd * dt;
      p.z += Math.cos(p.angle) * spd * dt;
      p.phase += dt * (p.panicTimer > 0 ? 11 : 6.2);

      const col = world.collideCircleWithBuildings(p.x, p.z, 10);
      if (col.hit) { p.x = col.x; p.z = col.z; p.angle += Math.PI * 0.75; }
    }
  }

  function drawHuman(GL, Textures, opts) {
    const { x, y, z, angle, phase, speedRatio, jumpY, attackTimer, comboStep, outfitId, skinHex, hairHex, isPlayer, seatedMoto, swimming, crouching, weaponId, characterId } = opts;
    const cfg = OUTFIT_COLORS[outfitId] || OUTFIT_COLORS.streetwear;
    const torsoRgb = GL.hexToRgb(cfg.torso);
    const sleeveRgb = GL.hexToRgb(cfg.sleeve);
    const pantsRgb = GL.hexToRgb(cfg.pants);
    const accentRgb = GL.hexToRgb(cfg.accent);
    const skinRgb = GL.hexToRgb(skinHex);
    const hairRgb = GL.hexToRgb(hairHex);

    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const crouchDrop = crouching ? -3.8 : 0;
    const swimTilt = swimming ? Math.PI / 2.3 : 0;
    const localToWorld = (lx, ly, lz) => [
      x + lx * cosA + lz * sinA,
      y + jumpY + ly + crouchDrop,
      z - lx * sinA + lz * cosA,
    ];

    if (!seatedMoto && !swimming) {
      const shScale = Math.max(0.5, 1 - jumpY / 28);
      GL.draw("plane", x, 0.44, z, 0, 0, 0, 11 * shScale, 1, 11 * shScale, [0, 0, 0, 0.36 * shScale], null);
    }

    const stride = seatedMoto ? 0 : Math.sin(phase) * speedRatio * 0.65;
    const lean = seatedMoto ? 0.32 : swimming ? swimTilt : crouching ? 0.25 : speedRatio * 0.14;
    const attackProg = attackTimer > 0 ? Math.sin((1 - attackTimer / 0.36) * Math.PI) : 0;

    // Legs
    if (!swimming) {
      const legAngL = seatedMoto ? -0.85 : stride;
      const legAngR = seatedMoto ? -0.85 : -stride;
      const kickAng = attackTimer > 0 && comboStep === 2 ? -attackProg * 1.45 : legAngR;
      const lHip = localToWorld(-2.3, seatedMoto ? 7.2 : 6.2, seatedMoto ? 1.5 : 0);
      GL.draw("cylinder", lHip[0], lHip[1], lHip[2], legAngL, angle, 0, 2.8, crouching ? 5.2 : 7.6, 2.8, [pantsRgb[0], pantsRgb[1], pantsRgb[2], 1], null);
      const rHip = localToWorld(2.3, seatedMoto ? 7.2 : 6.2, seatedMoto ? 1.5 : 0);
      GL.draw("cylinder", rHip[0], rHip[1], rHip[2], kickAng, angle, 0, 2.8, crouching ? 5.2 : 7.6, 2.8, [pantsRgb[0], pantsRgb[1], pantsRgb[2], 1], null);
    }

    // Torso
    const torsoPos = localToWorld(0, seatedMoto ? 11.2 : swimming ? 2.5 : 11.8, 0);
    const twist = attackTimer > 0 ? attackProg * (comboStep === 0 ? -0.45 : 0.45) : 0;
    GL.draw("cylinder", torsoPos[0], torsoPos[1], torsoPos[2], lean, angle + twist, 0, 6.8, 7.2, 4.2, [torsoRgb[0], torsoRgb[1], torsoRgb[2], 1], null);

    // Custom Uploaded Photo Crest (supports per-character portrait or player custom photo)
    const customTex = isPlayer ? ((characterId && Textures.glTex.customChars && Textures.glTex.customChars[characterId]) || Textures.glTex.customChar) : null;
    if (customTex && !swimming) {
      const badgePos = localToWorld(0, seatedMoto ? 12 : 12.6, 2.25);
      GL.draw("quad", badgePos[0], badgePos[1], badgePos[2], 0, angle + twist, 0, 4.2, 4.2, 1, [1, 1, 1, 1], customTex, 1, 1, [0.08, 0.08, 0.08]);
      const backBadge = localToWorld(0, seatedMoto ? 12 : 12.6, -2.25);
      GL.draw("quad", backBadge[0], backBadge[1], backBadge[2], 0, angle + twist + Math.PI, 0, 4.2, 4.2, 1, [1, 1, 1, 1], customTex, 1, 1, [0.08, 0.08, 0.08]);
    } else if (!swimming) {
      const collarPos = localToWorld(0, seatedMoto ? 13.8 : 14.4, 1.8);
      GL.draw("box", collarPos[0], collarPos[1], collarPos[2], lean, angle + twist, 0, 3.2, 2.0, 1.2, [accentRgb[0], accentRgb[1], accentRgb[2], 1], null);
    }

    // Arms + Weapon
    const hasGun = weaponId && weaponId !== "fists" && weaponId !== "baton";
    const lPunch = swimming ? Math.sin(phase) * 1.1 : attackTimer > 0 && comboStep === 0 ? -1.45 * attackProg : (seatedMoto ? -0.75 : -stride * 0.9);
    const rPunch = swimming ? -Math.sin(phase) * 1.1 : hasGun ? -1.35 : (attackTimer > 0 && comboStep === 1 ? -1.5 * attackProg : (seatedMoto ? -0.75 : stride * 0.9));

    const lArm = localToWorld(-4.6, swimming ? 2.5 : seatedMoto ? 11.8 : 12.2, 0);
    GL.draw("cylinder", lArm[0], lArm[1], lArm[2], lPunch, angle + twist, 0, 2.2, 6.8, 2.2, [sleeveRgb[0], sleeveRgb[1], sleeveRgb[2], 1], null);
    const rArm = localToWorld(4.6, swimming ? 2.5 : seatedMoto ? 11.8 : 12.2, 0);
    GL.draw("cylinder", rArm[0], rArm[1], rArm[2], rPunch, angle + twist, 0, 2.2, 6.8, 2.2, [sleeveRgb[0], sleeveRgb[1], sleeveRgb[2], 1], null);

    // Held Weapon Mesh
    if (hasGun && !swimming && !seatedMoto) {
      const gunPos = localToWorld(4.6, 12.6, 5.2);
      const gunLen = weaponId === "rifle" ? 8.5 : weaponId === "smg" ? 5.8 : 3.8;
      GL.draw("box", gunPos[0], gunPos[1], gunPos[2], 0, angle, 0, 1.3, 1.8, gunLen, [0.15, 0.17, 0.22, 1], null);
    } else if (weaponId === "baton" && !swimming && !seatedMoto) {
      const batPos = localToWorld(4.6, 11.0, 4.5);
      GL.draw("cylinder", batPos[0], batPos[1], batPos[2], rPunch, angle, 0, 1.1, 7.5, 1.1, [0.22, 0.74, 0.97, 1], null);
    }

    // Head + Hair
    const headPos = localToWorld(0, swimming ? 4.2 : seatedMoto ? 16.5 : 17.2, swimming ? 4.5 : lean * 3);
    GL.draw("sphere", headPos[0], headPos[1], headPos[2], 0, angle, 0, 4.4, 4.8, 4.4, [skinRgb[0], skinRgb[1], skinRgb[2], 1], null);
    const hairPos = localToWorld(0, swimming ? 5.0 : seatedMoto ? 17.5 : 18.2, (swimming ? 4.5 : lean * 3) - 0.5);
    GL.draw("sphere", hairPos[0], hairPos[1], hairPos[2], 0, angle, 0, 4.6, 3.4, 4.6, [hairRgb[0], hairRgb[1], hairRgb[2], 1], null);
  }

  function drawVehicle(GL, Textures, v, atmo, timeSec) {
    const colRgb = GL.hexToRgb(v.color);
    const cosA = Math.cos(v.angle), sinA = Math.sin(v.angle);
    const localToWorld = (lx, ly, lz) => [
      v.x + lx * cosA + lz * sinA,
      v.y + ly,
      v.z - lx * sinA + lz * cosA,
    ];

    if (v.isHeli) {
      // Helicopter Shadow on Ground
      GL.draw("plane", v.x, 0.45, v.z, 0, v.angle, 0, 32, 1, 48, [0, 0, 0, 0.32], null);
      // Skids
      [-9, 9].forEach((sx) => {
        const sk = localToWorld(sx, 2.0, 0);
        GL.draw("cylinder", sk[0], sk[1], sk[2], Math.PI / 2, v.angle, 0, 1.4, 34, 1.4, [0.55, 0.6, 0.68, 1], null);
      });
      // Fuselage & Cockpit Glass
      const body = localToWorld(0, 10, 2);
      GL.draw("box", body[0], body[1], body[2], v.leanAngle, v.angle, 0, 16, 12, 30, [colRgb[0], colRgb[1], colRgb[2], 1], null);
      const glass = localToWorld(0, 11, 13);
      GL.draw("box", glass[0], glass[1], glass[2], v.leanAngle, v.angle, 0, 13, 8, 10, [0.12, 0.22, 0.34, 1], null);
      // Tail Boom & Rotor
      const tail = localToWorld(0, 12, -24);
      GL.draw("box", tail[0], tail[1], tail[2], v.leanAngle, v.angle, 0, 4, 4, 24, [colRgb[0], colRgb[1], colRgb[2], 1], null);
      // Main Spinning Rotor
      const hub = localToWorld(0, 18.5, 0);
      GL.draw("box", hub[0], hub[1], hub[2], 0, v.angle + v.rotorSpin, 0, 58, 0.8, 2.8, [0.15, 0.18, 0.22, 1], null);
      GL.draw("box", hub[0], hub[1], hub[2], 0, v.angle + v.rotorSpin + Math.PI / 2, 0, 58, 0.8, 2.8, [0.15, 0.18, 0.22, 1], null);

      if (v.kind === "police_heli") {
        const spot = localToWorld(0, 0.5, 25);
        GL.draw("plane", v.x, 0.5, v.z, 0, 0, 0, 46, 1, 46, [0.8, 0.9, 1.0, 0.22], null, 1, 1, [0.3, 0.35, 0.45], true);
      }
      return;
    }

    if (v.isBoat) {
      const bob = Math.sin(timeSec * 2.5 + v.id) * 0.4;
      const hull = localToWorld(0, 1.5 + bob, 0);
      GL.draw("box", hull[0], hull[1], hull[2], 0, v.angle, 0, 18, 5, 44, [colRgb[0], colRgb[1], colRgb[2], 1], null);
      const deck = localToWorld(0, 4.5 + bob, -4);
      GL.draw("box", deck[0], deck[1], deck[2], 0, v.angle, 0, 13, 3, 20, [0.12, 0.16, 0.24, 1], null);
      const bow = localToWorld(0, 2.0 + bob, 24);
      GL.draw("box", bow[0], bow[1], bow[2], 0, v.angle, 0, 10, 4, 10, [0.96, 0.62, 0.04, 1], null);
      return;
    }

    if (v.isMoto) {
      GL.draw("plane", v.x, 0.36, v.z, 0, v.angle, 0, 12, 1, 34, [0, 0, 0, 0.42], null);
      const fTire = localToWorld(0, 3.8, 10.5);
      GL.draw("cylinder", fTire[0], fTire[1], fTire[2], 0, v.angle + v.steerAngle * 0.7, Math.PI / 2, 7.6, 2.6, 7.6, [0.1, 0.11, 0.13, 1], null);
      const rTire = localToWorld(0, 3.8, -10.5);
      GL.draw("cylinder", rTire[0], rTire[1], rTire[2], 0, v.angle, Math.PI / 2, 7.6, 3.2, 7.6, [0.1, 0.11, 0.13, 1], null);
      const body = localToWorld(0, 7.2, 1.0);
      GL.draw("box", body[0], body[1], body[2], 0, v.angle, v.leanAngle, 5.2, 4.4, 18, [colRgb[0], colRgb[1], colRgb[2], 1], null);
      const hl = localToWorld(0, 8.0, 10.5);
      GL.draw("sphere", hl[0], hl[1], hl[2], 0, 0, 0, 2.6, 2.6, 2.6, [1, 0.98, 0.82, 1], null, 1, 1, [0.9, 0.85, 0.6], true);

      if (v.kind === "police_moto") {
        const flash = Math.floor(timeSec * 8) % 2 === 0;
        const lb = localToWorld(0, 11.2, -7);
        GL.draw("sphere", lb[0], lb[1], lb[2], 0, 0, 0, 2.8, 2.8, 2.8, flash ? [1, 0.15, 0.15, 1] : [0.2, 0.5, 1, 1], null, 1, 1, flash ? [1, 0.1, 0.1] : [0.2, 0.5, 1], true);
      }

      if (v === player.vehicle) {
        drawHuman(GL, Textures, {
          x: v.x, y: 0, z: v.z, angle: v.angle, phase: 0, speedRatio: 0, jumpY: 0, attackTimer: 0, comboStep: 0,
          outfitId: player.outfit, skinHex: player.skinHex, hairHex: player.hairHex, isPlayer: true, seatedMoto: true,
          characterId: player.characterId,
        });
      }
      return;
    }

    // Cars, SUVs, Buses, Trucks
    const len = v.kindType === "bus" ? 68 : v.kindType === "truck" ? 64 : v.kindType === "suv" ? 48 : 44;
    const wid = v.kindType === "bus" || v.kindType === "truck" ? 24 : v.kindType === "suv" ? 21 : 19.5;
    const bodyH = v.kindType === "bus" ? 13 : v.kindType === "suv" ? 8 : 6.2;

    GL.draw("plane", v.x, 0.36, v.z, 0, v.angle, 0, wid + 4, 1, len + 4, [0, 0, 0, 0.44], null);
    const wheelOffsets = [
      [-wid * 0.48, 3.8, len * 0.32, v.steerAngle],
      [wid * 0.48, 3.8, len * 0.32, v.steerAngle],
      [-wid * 0.48, 3.8, -len * 0.32, 0],
      [wid * 0.48, 3.8, -len * 0.32, 0],
    ];
    wheelOffsets.forEach(([wx, wy, wz, steer]) => {
      const wp = localToWorld(wx, wy, wz);
      GL.draw("cylinder", wp[0], wp[1], wp[2], 0, v.angle + steer, Math.PI / 2, 7.6, 3.4, 7.6, [0.09, 0.1, 0.12, 1], null);
      GL.draw("cylinder", wp[0], wp[1], wp[2], 0, v.angle + steer, Math.PI / 2, 4.4, 3.7, 4.4, [0.72, 0.76, 0.82, 1], null);
    });

    const chassis = localToWorld(0, 3.4 + bodyH / 2, 0);
    GL.draw("box", chassis[0], chassis[1], chassis[2], 0, v.angle, 0, wid, bodyH, len, [colRgb[0], colRgb[1], colRgb[2], 1], null);

    // Owner Custom Vehicle Wrap / Hood Emblem if uploaded
    const vehTex = Textures.glTex.customVehicles && Textures.glTex.customVehicles[v.kind];
    if (vehTex) {
      const hoodPos = localToWorld(0, 3.4 + bodyH + 0.15, len * 0.28);
      GL.draw("plane", hoodPos[0], hoodPos[1], hoodPos[2], 0, v.angle, 0, wid * 0.72, 1, len * 0.28, [1, 1, 1, 1], vehTex, 1, 1, [0.08, 0.08, 0.08]);
      const sideL = localToWorld(-wid * 0.505, 3.4 + bodyH * 0.52, 0);
      GL.draw("quad", sideL[0], sideL[1], sideL[2], 0, v.angle - Math.PI / 2, 0, len * 0.45, bodyH * 0.8, 1, [1, 1, 1, 1], vehTex, 1, 1, [0.06, 0.06, 0.06]);
      const sideR = localToWorld(wid * 0.505, 3.4 + bodyH * 0.52, 0);
      GL.draw("quad", sideR[0], sideR[1], sideR[2], 0, v.angle + Math.PI / 2, 0, len * 0.45, bodyH * 0.8, 1, [1, 1, 1, 1], vehTex, 1, 1, [0.06, 0.06, 0.06]);
    }

    if (v.kind === "police") {
      const doors = localToWorld(0, 6.4, 0);
      GL.draw("box", doors[0], doors[1], doors[2], 0, v.angle, 0, wid + 0.3, 5.4, 17, [0.95, 0.97, 0.99, 1], null);
    }

    if (v.kindType === "truck") {
      const cargo = localToWorld(0, 12.5, -9);
      GL.draw("box", cargo[0], cargo[1], cargo[2], 0, v.angle, 0, wid - 1, 14, len * 0.62, [0.85, 0.88, 0.92, 1], null);
      const cab = localToWorld(0, 11.5, len * 0.3);
      GL.draw("box", cab[0], cab[1], cab[2], 0, v.angle, 0, wid * 0.88, 10, 16, [0.14, 0.18, 0.25, 1], null);
    } else if (v.kindType === "bus") {
      const glass = localToWorld(0, 11.5, 0);
      GL.draw("box", glass[0], glass[1], glass[2], 0, v.angle, 0, wid + 0.2, 5.2, len * 0.88, [0.1, 0.16, 0.24, 1], null);
    } else {
      const cabH = v.kindType === "suv" ? 7.2 : 5.8;
      const cabLen = v.kindType === "suv" ? 28 : 22;
      const cabin = localToWorld(0, 3.4 + bodyH + cabH * 0.45, -2);
      GL.draw("box", cabin[0], cabin[1], cabin[2], 0, v.angle, 0, wid * 0.82, cabH, cabLen, [0.1, 0.14, 0.2, 1], null);
      const roof = localToWorld(0, 3.4 + bodyH + cabH - 0.5, -2);
      const roofCol = v.kind === "police" ? [0.95, 0.97, 0.99, 1] : [colRgb[0], colRgb[1], colRgb[2], 1];
      GL.draw("box", roof[0], roof[1], roof[2], 0, v.angle, 0, wid * 0.78, 1.2, cabLen * 0.88, roofCol, null);
    }

    if (v.kind === "police") {
      const flash = Math.floor(timeSec * 8) % 2 === 0;
      const lbL = localToWorld(-3.4, 15.8, -2);
      GL.draw("box", lbL[0], lbL[1], lbL[2], 0, v.angle, 0, 5.5, 2.0, 3.2, [0.95, 0.15, 0.15, 1], null, 1, 1, v.sirenActive && flash ? [1, 0.1, 0.1] : [0.2, 0, 0], v.sirenActive && flash);
      const lbR = localToWorld(3.4, 15.8, -2);
      GL.draw("box", lbR[0], lbR[1], lbR[2], 0, v.angle, 0, 5.5, 2.0, 3.2, [0.2, 0.5, 1.0, 1], null, 1, 1, v.sirenActive && !flash ? [0.15, 0.45, 1] : [0, 0.05, 0.2], v.sirenActive && !flash);
    }

    if (v.hp < 40) {
      // Damage smoke sphere on hood
      const sm = localToWorld(0, 12 + (timeSec * 12) % 8, len * 0.35);
      GL.draw("sphere", sm[0], sm[1], sm[2], 0, 0, 0, 7, 7, 7, [0.25, 0.25, 0.28, 0.55], null);
    }

    [-wid * 0.32, wid * 0.32].forEach((lx) => {
      const hl = localToWorld(lx, 6.2, len * 0.5 + 0.2);
      GL.draw("box", hl[0], hl[1], hl[2], 0, v.angle, 0, 3.8, 2.2, 0.8, [1, 0.98, 0.82, 1], null, 1, 1, [0.85, 0.8, 0.55], true);
      const tl = localToWorld(lx, 6.2, -len * 0.5 - 0.2);
      GL.draw("box", tl[0], tl[1], tl[2], 0, v.angle, 0, 4.0, 2.0, 0.8, [0.95, 0.15, 0.15, 1], null, 1, 1, v.braking ? [1, 0.12, 0.12] : [0.4, 0.04, 0.04], v.braking);
    });

    if (atmo.isNight) {
      const beam = localToWorld(0, 0.42, len * 0.5 + 42);
      GL.draw("plane", beam[0], beam[1], beam[2], 0, v.angle, 0, 36, 1, 84, [1, 0.95, 0.72, 0.18], null, 1, 1, [0.2, 0.18, 0.1], true);
    }
  }

  function renderAll(GL, Textures, atmo, timeSec, camPos, graphicsQuality = "balanced") {
    const drawDist = graphicsQuality === "low" ? 820 : graphicsQuality === "high" ? 1350 : 1080;

    for (let i = 0; i < pedestrians.length; i++) {
      const p = pedestrians[i];
      if (p.koTimer > 0) continue;
      if (Math.hypot(p.x - camPos[0], p.z - camPos[2]) > drawDist) continue;
      drawHuman(GL, Textures, {
        x: p.x, y: 0, z: p.z, angle: p.angle, phase: p.phase,
        speedRatio: p.panicTimer > 0 ? 1.0 : 0.55, jumpY: 0, attackTimer: 0, comboStep: 0,
        outfitId: p.outfit, skinHex: p.skin, hairHex: p.hair, isPlayer: false, seatedMoto: false,
      });
    }

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      drawHuman(GL, Textures, {
        x: e.x, y: 0, z: e.z, angle: e.angle, phase: e.phase,
        speedRatio: 0.7, jumpY: 0, attackTimer: 0, comboStep: 0,
        outfitId: "enemy", skinHex: "#d8a482", hairHex: "#0f172a", isPlayer: false, seatedMoto: false,
        weaponId: e.hasGun ? "pistol" : "baton",
      });
      // Enemy health marker overhead
      GL.draw("box", e.x, 22, e.z, 0, 0, 0, 8 * (e.hp / e.maxHp), 1.4, 1.4, [0.95, 0.2, 0.2, 1], null, 1, 1, [0.8, 0.1, 0.1], true);
    }

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (Math.hypot(v.x - camPos[0], v.z - camPos[2]) > drawDist) continue;
      drawVehicle(GL, Textures, v, atmo, timeSec);
    }

    if (!player.vehicle) {
      drawHuman(GL, Textures, {
        x: player.x, y: player.y, z: player.z, angle: player.angle, phase: player.walkPhase,
        speedRatio: player.moveSpeedRatio, jumpY: 0, attackTimer: player.attackTimer, comboStep: player.comboStep,
        outfitId: player.outfit, skinHex: player.skinHex, hairHex: player.hairHex, isPlayer: true,
        characterId: player.characterId,
        seatedMoto: false, swimming: player.isSwimming, crouching: player.crouching, weaponId: player.weapon,
      });
    }

    // Bullet / Pulse Projectiles
    for (let i = 0; i < projectiles.length; i++) {
      const pr = projectiles[i];
      GL.draw("sphere", pr.x, pr.y, pr.z, 0, 0, 0, 2.2, 2.2, 2.2, [1, 0.9, 0.35, 1], null, 1, 1, [1, 0.85, 0.2], true);
    }

    for (let i = 0; i < combatSparks.length; i++) {
      const s = combatSparks[i];
      GL.draw("sphere", s.x, s.y, s.z, 0, 0, 0, 8, 8, 8, [1, 0.72, 0.2, 0.85], null, 1, 1, [1, 0.6, 0.1], true);
    }
  }

  return {
    VEHICLE_SPECS,
    WEAPON_SPECS,
    CHARACTER_SPECS,
    player,
    vehicles,
    pedestrians,
    enemies,
    isVehicleDisabled: (kind) => disabledVehicles.has(kind),
    isCharacterDisabled: (id) => disabledCharacters.has(id),
    setOwnerRuntimeConfig,
    applyPopulationDensity,
    spawnInitialPopulation,
    spawnMissionEnemies,
    clearMissionEnemies,
    getAliveEnemyCount,
    spawnVehicleNearPlayer,
    findNearestVehicle,
    toggleEnterExitVehicle,
    cycleWeapon,
    setCharacter,
    honkHorn,
    updatePlayer,
    updateEnemies,
    updateProjectiles,
    updateTrafficAndPolice,
    updatePedestrians,
    renderAll,
    addWanted,
  };
})();
