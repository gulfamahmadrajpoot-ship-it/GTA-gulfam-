// Main Third-Person 3D Game Loop, Dual World Map + OSM GPS, Story/Free/Custom Missions, Professional Mobile Controls & Android Bridge
(function () {
  const glCanvas = document.getElementById("glCanvas");
  const minimapCanvas = document.getElementById("minimapCanvas");
  const mctx = minimapCanvas.getContext("2d");
  const fullMapCanvas = document.getElementById("fullMapCanvas");
  const fctx = fullMapCanvas.getContext("2d");
  const avatarCanvas = document.getElementById("avatarPreview");
  const actx = avatarCanvas.getContext("2d");

  const GL = window.CityGL;
  const RealCities = window.CityRealCities;
  const World = window.CityWorld;
  const Textures = window.CityTextures;
  const Entities = window.CityEntities;
  const CityMap = window.CityMap;
  const Missions = window.CityMissions;
  const Audio = window.CityAudio;

  let settings = {
    joystickPos: "mid",
    buttonPos: "mid",
    buttonSize: 1.0,
    cameraSens: 1.0,
    joystickSens: 1.0,
    drivingSens: 1.0,
    graphicsQuality: "balanced",
    soundVol: 0.85,
    musicVol: 0.45,
    language: "en",
    layout: "standard",
    autoSave: true,
    fullscreen: true,
    customControls: {},
    policeAggression: 1.0,
    trafficDensity: 1.0,
  };

  function createDefaultOwnerConfig() {
    return {
      version: 1,
      ownerUnlocked: false,
      disabledCityIds: [],
      customCities: [],
      locationRenames: {},
      customDestinationPins: [],
      disabledMissionIds: [],
      missionOverrides: {},
      police: {
        enabled: true,
        maxVehicles: 8,
        difficulty: 1.0,
        minWanted: 0,
        maxWanted: 5,
        helisEnabled: true,
        roadblocksEnabled: true,
        responseSpeed: 1.0,
      },
      vehicleOverrides: {},
      customVehicles: [],
      characterOverrides: {},
      customCharacters: [],
      customBillboards: [],
      disabledBillboardIds: [],
      economy: {
        rewardMultiplier: 1.0,
        startingCash: 3200,
        repairCost: 100,
        ammoCost: 120,
      },
      worldSettings: {
        defaultTimeMode: "cycle",
        defaultWeather: "clear",
        trafficDensity: 1.0,
        pedestrianDensity: 1.0,
        globalDifficulty: "normal",
        enabledModes: ["story", "free", "freeroam"],
        defaultGraphicsQuality: "balanced",
        defaultSoundVol: 0.85,
        defaultMusicVol: 0.45,
      },
    };
  }

  let ownerConfig = createDefaultOwnerConfig();

  const I18N = {
    en: {
      enter: "ENTER", exit: "EXIT", run: "RUN", jump: "JUMP", fight: "ATTACK", fire: "FIRE",
      punch: "PUNCH", attack: "ATTACK", interact: "USE", weapon: "WEAP", aim: "AIM", cover: "CROUCH",
      gas: "GAS", brake: "BRAKE", reverse: "REV", hb: "DRIFT", horn: "HORN", cam: "CAM",
      left: "LEFT", right: "RIGHT", paused: "GAME PAUSED",
    },
    es: {
      enter: "ENTRAR", exit: "SALIR", run: "CORRER", jump: "SALTAR", fight: "ATACAR", fire: "FUEGO",
      punch: "GOLPE", attack: "ATACAR", interact: "USAR", weapon: "ARMA", aim: "APUNTAR", cover: "AGACHAR",
      gas: "ACEL", brake: "FRENO", reverse: "REV", hb: "DERRAPE", horn: "CLAXON", cam: "CÁM",
      left: "IZQ", right: "DER", paused: "PAUSA",
    },
    fr: {
      enter: "ENTRER", exit: "SORTIR", run: "COURIR", jump: "SAUTER", fight: "ATTAQ", fire: "TIRER",
      punch: "POING", attack: "ATTAQ", interact: "ACT", weapon: "ARME", aim: "VISER", cover: "BAISSER",
      gas: "GAZ", brake: "FREIN", reverse: "REC", hb: "DRIFT", horn: "KLAXON", cam: "CAM",
      left: "GAUCHE", right: "DROITE", paused: "PAUSE",
    },
    ur: {
      enter: "داخل", exit: "باہر", run: "دوڑیں", jump: "چھلانگ", fight: "حملہ", fire: "فائر",
      punch: "مکا", attack: "حملہ", interact: "استعمال", weapon: "ہتھیار", aim: "نشانہ", cover: "جھکیں",
      gas: "ریس", brake: "بریک", reverse: "ریورس", hb: "ڈرفٹ", horn: "ہارن", cam: "کیمرہ",
      left: "بائیں", right: "دائیں", paused: "رکا ہوا",
    },
    ar: {
      enter: "دخول", exit: "خروج", run: "ركض", jump: "قفز", fight: "هجوم", fire: "إطلاق",
      punch: "لكمة", attack: "هجوم", interact: "تفاعل", weapon: "سلاح", aim: "تصويب", cover: "انحناء",
      gas: "بنزين", brake: "فرامل", reverse: "خلف", hb: "انجراف", horn: "بوق", cam: "كاميرا",
      left: "يسار", right: "يمين", paused: "متوقف",
    },
  };

  const CAM_MODES = [
    { id: 0, label: "CHASE" },
    { id: 1, label: "FAR" },
    { id: 2, label: "HOOD" },
  ];

  const input = {
    joyX: 0,
    joyY: 0,
    joystickSens: 1.0,
    sprint: false,
    jumpPressed: false,
    punchPressed: false,
    fightPressed: false,
    aim: false,
    crouch: false,
    gas: false,
    brake: false,
    reverse: false,
    steerLeft: false,
    steerRight: false,
    handbrake: false,
  };

  const camera = {
    yaw: 0,
    pitch: 0.28,
    dist: 56,
    heightOffset: 21,
    fovDeg: 58,
    camMode: 0,
    userOrbitCooldown: 0,
    pos: [1120, 40, 1500],
  };

  const projMat = GL.mat4.create();
  const viewMat = GL.mat4.create();

  let currentInteractTarget = null;
  let pendingIntroMission = null;
  let lastCompletedMissionId = null;
  let paused = false;
  let editorActive = false;
  let editorPreviewDriving = false;
  let editorSelectedId = "joystick";
  let editorDraft = {};
  let simTime = 0;
  let lastTs = 0;
  let lastSaveTs = 0;
  let gpsRefreshAccum = 0;

  function callAndroid(method, ...args) {
    if (window.AndroidBridge && typeof window.AndroidBridge[method] === "function") {
      try {
        return window.AndroidBridge[method](...args);
      } catch (e) {
        console.warn("AndroidBridge error:", e);
      }
    }
    return null;
  }

  function showToast(msg) {
    const container = document.getElementById("toastContainer");
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  function resizeCanvas() {
    const dprCap = settings.graphicsQuality === "low" ? 1.0 : settings.graphicsQuality === "high" ? 2.0 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    glCanvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
    glCanvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
  }
  window.addEventListener("resize", resizeCanvas);

  function applyCustomControlTransforms(sourceMap) {
    const map = sourceMap || {};
    const baseBtnScale = settings.buttonSize || 1.0;
    document.querySelectorAll(".editable-hud").forEach((el) => {
      const id = el.dataset.ctrlId;
      const tr = map[id];
      if (tr && (typeof tr.dx === "number" || typeof tr.dy === "number" || typeof tr.scale === "number")) {
        const dx = Math.round(tr.dx || 0);
        const dy = Math.round(tr.dy || 0);
        const sc = Math.max(0.75, Math.min(1.4, Number(tr.scale) || 1.0));
        el.style.position = "relative";
        el.style.left = `${dx}px`;
        el.style.top = `${dy}px`;
        if (id === "joystick") {
          el.style.transform = `translateY(var(--joy-offset-y)) scale(${(sc * baseBtnScale).toFixed(3)})`;
        } else if (id === "actions") {
          el.style.transform = `translateY(var(--btn-offset-y)) scale(${(sc * baseBtnScale).toFixed(3)})`;
        } else {
          el.style.transform = `scale(${sc.toFixed(3)})`;
        }
      } else {
        el.style.position = "";
        el.style.left = "";
        el.style.top = "";
        el.style.transform = "";
      }
    });
  }

  function applySettingsToDomAndAudio() {
    const root = document.documentElement;
    const posOffset = { low: "10px", mid: "0px", high: "-26px" };
    root.style.setProperty("--joy-offset-y", posOffset[settings.joystickPos] || "0px");
    root.style.setProperty("--btn-offset-y", posOffset[settings.buttonPos] || "0px");
    root.style.setProperty("--btn-scale", String(settings.buttonSize || 1.0));
    input.joystickSens = settings.joystickSens || 1.0;

    const tc = document.getElementById("touchControls");
    const appEl = document.getElementById("app");
    tc.classList.toggle("layout-swap", settings.layout === "swap");
    tc.classList.toggle("layout-split", settings.layout === "split");
    appEl.classList.toggle("layout-swap", settings.layout === "swap");

    applyCustomControlTransforms(settings.customControls);

    Audio.setSoundVolume(settings.soundVol);
    Audio.setMusicVolume(settings.musicVol);

    const dict = I18N[settings.language] || I18N.en;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (dict[k]) el.textContent = dict[k];
    });
    document.getElementById("pauseModalTitle").textContent = dict.paused;
    resizeCanvas();
  }

  function populateCitySelector() {
    const sel = document.getElementById("citySelector");
    if (!sel) return;
    const prevVal = CityMap.view.selectedCityId || sel.value || "original";
    const disabledSet = new Set(ownerConfig.disabledCityIds || []);
    const allCities = RealCities.listAll();
    sel.innerHTML = "";
    allCities.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      const isCustom = !!RealCities.CUSTOM_CITIES[c.id];
      const tag = disabledSet.has(c.id)
        ? " (Disabled)"
        : isCustom
          ? c.playable3d ? " (Custom 3D)" : " (Custom OSM)"
          : c.id === "original"
            ? ""
            : c.playable3d
              ? " (Playable 3D)"
              : " (OSM Map Only · 3D Unavailable)";
      opt.textContent = `${c.name}${tag}`;
      opt.disabled = disabledSet.has(c.id);
      sel.appendChild(opt);
    });
    sel.value = RealCities.get(prevVal) ? prevVal : "original";
  }

  function applyOwnerConfigInternal(rawCfg, isPreview = false, persist = true) {
    const base = createDefaultOwnerConfig();
    const parsed = rawCfg && typeof rawCfg === "object" ? rawCfg : {};
    const prevUnlocked = ownerConfig.ownerUnlocked;
    ownerConfig = {
      ...base,
      ...parsed,
      ownerUnlocked: typeof parsed.ownerUnlocked === "boolean" ? parsed.ownerUnlocked : prevUnlocked,
      police: { ...base.police, ...(parsed.police || {}) },
      economy: { ...base.economy, ...(parsed.economy || {}) },
      worldSettings: { ...base.worldSettings, ...(parsed.worldSettings || {}) },
      disabledCityIds: Array.isArray(parsed.disabledCityIds) ? parsed.disabledCityIds : [],
      customCities: Array.isArray(parsed.customCities) ? parsed.customCities : [],
      locationRenames: parsed.locationRenames && typeof parsed.locationRenames === "object" ? parsed.locationRenames : {},
      customDestinationPins: Array.isArray(parsed.customDestinationPins) ? parsed.customDestinationPins : [],
      disabledMissionIds: Array.isArray(parsed.disabledMissionIds) ? parsed.disabledMissionIds : [],
      missionOverrides: parsed.missionOverrides && typeof parsed.missionOverrides === "object" ? parsed.missionOverrides : {},
      vehicleOverrides: parsed.vehicleOverrides && typeof parsed.vehicleOverrides === "object" ? parsed.vehicleOverrides : {},
      customVehicles: Array.isArray(parsed.customVehicles) ? parsed.customVehicles : [],
      characterOverrides: parsed.characterOverrides && typeof parsed.characterOverrides === "object" ? parsed.characterOverrides : {},
      customCharacters: Array.isArray(parsed.customCharacters) ? parsed.customCharacters : [],
      customBillboards: Array.isArray(parsed.customBillboards) ? parsed.customBillboards : [],
      disabledBillboardIds: Array.isArray(parsed.disabledBillboardIds) ? parsed.disabledBillboardIds : [],
    };

    RealCities.setCustomCities(ownerConfig.customCities);
    RealCities.applyLocationRenames(ownerConfig.locationRenames);
    World.applyLocationRenames(ownerConfig.locationRenames);
    World.setExtraBillboards(ownerConfig.customBillboards, ownerConfig.disabledBillboardIds, Textures, GL);
    CityMap.setOwnerDestinationPins(ownerConfig.customDestinationPins);
    Entities.setOwnerRuntimeConfig(ownerConfig);

    const ws = ownerConfig.worldSettings;
    const econ = ownerConfig.economy;
    Missions.setRewardMultiplier(econ.rewardMultiplier || 1.0);
    Missions.setAdminConfig(ownerConfig.disabledMissionIds, ownerConfig.missionOverrides, ws.globalDifficulty, ws.enabledModes);

    settings.trafficDensity = typeof ws.trafficDensity === "number" ? ws.trafficDensity : settings.trafficDensity;
    settings.policeAggression = typeof ownerConfig.police.difficulty === "number" ? ownerConfig.police.difficulty : 1.0;
    if (ws.defaultGraphicsQuality) settings.graphicsQuality = ws.defaultGraphicsQuality;
    if (typeof ws.defaultSoundVol === "number") settings.soundVol = ws.defaultSoundVol;
    if (typeof ws.defaultMusicVol === "number") settings.musicVol = ws.defaultMusicVol;
    if (ws.defaultTimeMode) World.setTimeMode(ws.defaultTimeMode);
    if (ws.defaultWeather) World.setWeather(ws.defaultWeather);

    Entities.applyPopulationDensity(World, ws.trafficDensity, ws.pedestrianDensity);
    applySettingsToDomAndAudio();

    const activeCity = World.getActiveCity();
    if (activeCity && (ownerConfig.disabledCityIds || []).includes(activeCity.id) && activeCity.id !== "original") {
      const orig = RealCities.get("original");
      World.loadCityProfile(orig);
      CityMap.view.selectedCityId = "original";
      CityMap.view.mode = "original";
    } else if (activeCity) {
      World.loadCityProfile(RealCities.get(activeCity.id));
    }

    if (Entities.isCharacterDisabled(Entities.player.characterId)) {
      const fallbackChar = Object.keys(Entities.CHARACTER_SPECS).find((id) => !Entities.isCharacterDisabled(id)) || "alex";
      Entities.setCharacter(fallbackChar);
    }

    if (Entities.player.vehicle && Entities.isVehicleDisabled(Entities.player.vehicle.kind)) {
      Entities.player.vehicle = null;
    }

    populateCitySelector();
    refreshAvatarPreview();
    if (!isPreview && persist) saveState();
    syncAndroidSnapshot();
  }

  function refreshAvatarPreview() {
    actx.clearRect(0, 0, 44, 44);
    const customImg = Textures.getCustomCharacterImg(Entities.player.characterId || "player") || Textures.getCustomCharacterImg("player");
    if (customImg) {
      actx.drawImage(customImg, 0, 0, 44, 44);
      return;
    }
    actx.fillStyle = "#131b2e";
    actx.fillRect(0, 0, 44, 44);
    actx.fillStyle = Entities.player.skinHex;
    actx.beginPath();
    actx.arc(22, 17, 9, 0, Math.PI * 2);
    actx.fill();
    actx.fillStyle = Entities.player.hairHex;
    actx.beginPath();
    actx.arc(22, 14, 9.2, Math.PI, Math.PI * 2);
    actx.fill();
    actx.fillStyle = "#f59e0b";
    actx.beginPath();
    actx.roundRect(10, 28, 24, 14, 6);
    actx.fill();
  }

  function buildStatePayload() {
    const p = Entities.player;
    const active = Missions.getActive();
    const gps = CityMap.getDestination();
    const activeCity = World.getActiveCity();
    return {
      cash: p.cash,
      xp: p.xp,
      health: Math.round(p.health),
      stamina: Math.round(p.stamina),
      characterId: p.characterId || "alex",
      outfit: p.outfit,
      skinHex: p.skinHex,
      hairHex: p.hairHex,
      ownedVehicles: p.ownedVehicles,
      ownedWeapons: p.ownedWeapons,
      ammo: p.ammo,
      activeWeapon: p.weapon,
      upgrades: p.upgrades,
      weather: World.getWeather(),
      selectedCityId: activeCity ? activeCity.id : "original",
      activeMissionId: active ? active.id : null,
      activeMission: active
        ? {
            id: active.id,
            title: active.title,
            objective: active.objective,
            remaining: active.hasTimer ? Math.max(0, Math.ceil(active.remaining)) : -1,
          }
        : null,
      completedMissions: Missions.getCompletedIds(),
      unlockedMissions: Missions.getUnlockedStoryIds(),
      pendingRewards: Missions.getPendingRewards(),
      customMissions: Missions.getCustomMissions(),
      customPOIs: CityMap.getCustomPOIs(),
      customBuildings: World.customBuildings,
      customRoads: World.customRoads,
      favorites: CityMap.getFavorites(),
      gpsDestination: gps ? { x: gps.x, z: gps.z, lat: gps.lat, lng: gps.lng, name: gps.name } : null,
      vehicleHp: p.vehicle ? Math.round(p.vehicle.hp) : 100,
      vehicleKind: p.vehicle ? p.vehicle.kind : null,
      settings,
      ownerConfig,
    };
  }

  function saveState() {
    callAndroid("saveGameState", JSON.stringify(buildStatePayload()));
  }

  function syncAndroidSnapshot() {
    callAndroid("syncStateSnapshot", JSON.stringify(buildStatePayload()));
  }

  function loadSavedState() {
    const raw = callAndroid("loadGameState");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const p = Entities.player;
      if (typeof data.cash === "number") p.cash = data.cash;
      if (typeof data.xp === "number") p.xp = data.xp;
      if (data.characterId) p.characterId = data.characterId;
      if (data.outfit) p.outfit = data.outfit;
      if (data.skinHex) p.skinHex = data.skinHex;
      if (data.hairHex) p.hairHex = data.hairHex;
      if (Array.isArray(data.ownedVehicles) && data.ownedVehicles.length > 0) p.ownedVehicles = data.ownedVehicles;
      if (Array.isArray(data.ownedWeapons) && data.ownedWeapons.length > 0) p.ownedWeapons = data.ownedWeapons;
      if (data.ammo) p.ammo = { ...p.ammo, ...data.ammo };
      if (data.activeWeapon && p.ownedWeapons.includes(data.activeWeapon)) p.weapon = data.activeWeapon;
      if (data.upgrades) p.upgrades = { ...p.upgrades, ...data.upgrades };
      if (data.weather) World.setWeather(data.weather);
      if (Array.isArray(data.completedMissions)) Missions.setCompletedIds(data.completedMissions);
      if (Array.isArray(data.pendingRewards)) Missions.setPendingRewards(data.pendingRewards);
      if (Array.isArray(data.customMissions)) Missions.setCustomMissions(data.customMissions);
      if (Array.isArray(data.customPOIs)) CityMap.setCustomPOIs(data.customPOIs);
      if (Array.isArray(data.favorites)) CityMap.setFavorites(data.favorites);
      World.setCustomWorld(data.customBuildings, data.customRoads);
      if (data.settings) {
        settings = {
          ...settings,
          ...data.settings,
          customControls: data.settings.customControls || {},
        };
      }
      if (data.ownerConfig) {
        applyOwnerConfigInternal({ ...data.ownerConfig, ownerUnlocked: false }, false, false);
      }
      if (data.selectedCityId && !(ownerConfig.disabledCityIds || []).includes(data.selectedCityId)) {
        const prof = RealCities.get(data.selectedCityId);
        if (prof && prof.playable3d) {
          World.loadCityProfile(prof);
          CityMap.view.selectedCityId = prof.id;
          CityMap.view.mode = prof.mode;
          CityMap.view.realCenterLat = prof.lat;
          CityMap.view.realCenterLng = prof.lng;
        }
      }
      if (data.gpsDestination && typeof data.gpsDestination.x === "number") {
        CityMap.setDestination(World, p.x, p.z, data.gpsDestination.x, data.gpsDestination.z, data.gpsDestination.name || "Saved GPS");
      }
    } catch (e) {
      console.warn("Failed to parse saved state", e);
    }
  }

  function selectCityInMap(cityId, enterPlayableNow = false) {
    if ((ownerConfig.disabledCityIds || []).includes(cityId)) {
      showToast("THIS CITY IS DISABLED BY OWNER");
      return;
    }
    const prof = RealCities.get(cityId);
    CityMap.view.selectedCityId = prof.id;
    CityMap.view.mode = prof.id === "original" ? "original" : "real";
    CityMap.view.realCenterLat = prof.lat;
    CityMap.view.realCenterLng = prof.lng;
    CityMap.view.realZoom = prof.defaultZoom || 13;

    document.getElementById("citySelector").value = prof.id;
    document.getElementById("btnMapModeOriginal").classList.toggle("active", CityMap.view.mode === "original");
    document.getElementById("btnMapModeReal").classList.toggle("active", CityMap.view.mode === "real");

    const badge = document.getElementById("cityPlayableBadge");
    const enterBtn = document.getElementById("btnEnterSelectedCity");
    const unavailBanner = document.getElementById("mapUnavailBanner");

    if (prof.playable3d) {
      badge.textContent = "3D PLAYABLE";
      badge.className = "city-avail-badge ok";
      unavailBanner.classList.add("hidden");
      const curWorldCity = World.getActiveCity();
      const isSame = curWorldCity && curWorldCity.id === prof.id;
      enterBtn.classList.toggle("hidden", isSame);
      if (enterPlayableNow && !isSame) {
        World.loadCityProfile(prof);
        Entities.player.vehicle = null;
        Entities.player.x = 1120;
        Entities.player.z = 1540;
        Entities.spawnInitialPopulation(World);
        CityMap.clearDestination();
        saveState();
        syncAndroidSnapshot();
        enterBtn.classList.add("hidden");
        showToast(`ENTERED ${prof.name.toUpperCase()}`);
      }
    } else {
      badge.textContent = "3D UNAVAILABLE · OSM ONLY";
      badge.className = "city-avail-badge unavail";
      enterBtn.classList.add("hidden");
      unavailBanner.classList.remove("hidden");
    }
    renderFullMap();
    refreshFavoritesStrip();
  }

  function refreshFavoritesStrip() {
    const strip = document.getElementById("mapFavoritesStrip");
    strip.innerHTML = '<span class="fav-label">FAVORITES:</span>';
    const favs = CityMap.getFavorites();
    if (favs.length === 0) {
      const empty = document.createElement("span");
      empty.className = "fav-label";
      empty.textContent = "Tap ★ FAV after pinning a destination";
      strip.appendChild(empty);
      return;
    }
    favs.forEach((fav) => {
      const chip = document.createElement("div");
      chip.className = "fav-chip";
      const lbl = document.createElement("span");
      lbl.textContent = "★ " + fav.name;
      lbl.addEventListener("click", () => {
        if (fav.cityId && fav.cityId !== CityMap.view.selectedCityId) {
          selectCityInMap(fav.cityId, false);
        }
        if (typeof fav.lat === "number") {
          CityMap.view.realCenterLat = fav.lat;
          CityMap.view.realCenterLng = fav.lng;
        }
        CityMap.setDestination(World, Entities.player.x, Entities.player.z, fav.x, fav.z, fav.name, fav.lat, fav.lng);
        renderFullMap();
        showToast("GPS TO FAVORITE: " + fav.name.toUpperCase());
      });
      const del = document.createElement("span");
      del.className = "fav-del";
      del.textContent = "✕";
      del.addEventListener("click", (ev) => {
        ev.stopPropagation();
        CityMap.removeFavorite(fav.id);
        saveState();
        refreshFavoritesStrip();
      });
      chip.appendChild(lbl);
      chip.appendChild(del);
      strip.appendChild(chip);
    });
  }

  function showMissionBriefing(missionId) {
    const def = Missions.getCatalog().find((m) => m.id === missionId);
    if (!def) return;
    if (!Missions.isMissionUnlocked(def)) {
      showToast("LOCKED · COMPLETE PREVIOUS STORY MISSION");
      return;
    }
    pendingIntroMission = def;
    document.getElementById("introCatTag").textContent = def.category.toUpperCase();
    document.getElementById("introTitle").textContent = def.title.toUpperCase();
    document.getElementById("introStory").textContent = def.intro;

    const dlgBox = document.getElementById("introDialogueBox");
    if (def.dialogue) {
      dlgBox.classList.remove("hidden");
      document.getElementById("introSpeaker").textContent = def.dialogue.speaker;
      document.getElementById("introDialogueLine").textContent = `"${def.dialogue.lines[0]}"`;
    } else {
      dlgBox.classList.add("hidden");
    }

    document.getElementById("introObjective").textContent = def.objective;
    const isDone = Missions.getCompletedIds().includes(def.id);
    document.getElementById("introProgress").textContent = isDone ? "Completed (Replayable)" : "Unlocked · Ready";
    document.getElementById("introTimer").textContent = def.time > 0 ? `${def.time}s` : "No Limit";
    const scaledReward = Math.round(def.reward * Missions.getRewardMultiplier());
    document.getElementById("introReward").textContent = `$${scaledReward.toLocaleString()} + ${def.xp} XP`;
    document.getElementById("missionIntroModal").classList.remove("hidden");
  }

  function openFullMap(forceMode = null) {
    document.getElementById("fullMapModal").classList.remove("hidden");
    const p = Entities.player;
    CityMap.view.centerX = p.x;
    CityMap.view.centerZ = p.z;
    if (forceMode === "real" && CityMap.view.selectedCityId === "original") {
      selectCityInMap("lahore", false);
    } else {
      selectCityInMap(CityMap.view.selectedCityId, false);
    }
  }

  function renderFullMap() {
    CityMap.renderMapCanvas(
      fctx,
      fullMapCanvas.width,
      fullMapCanvas.height,
      World,
      Entities,
      Missions.getActive(),
      simTime,
      false,
      () => {
        if (!document.getElementById("fullMapModal").classList.contains("hidden")) {
          CityMap.renderMapCanvas(fctx, fullMapCanvas.width, fullMapCanvas.height, World, Entities, Missions.getActive(), simTime, false);
        }
      }
    );
    const gps = CityMap.getDestination();
    const readout = document.getElementById("mapRouteReadout");
    if (gps) {
      const modeTag = CityMap.view.navMode === "walking" ? "WALK" : "DRIVE";
      const distKm = gps.distMeters >= 1000 ? `${(gps.distMeters / 1000).toFixed(2)} km` : `${gps.distMeters} m`;
      const eta = CityMap.formatEta(gps.etaSeconds, gps.etaAvailable);
      readout.textContent = `${modeTag} · ${gps.name} · ${distKm} · ${eta}`;
    } else {
      readout.textContent = CityMap.view.mode === "real" ? "Tap OSM map to route · Search locations above" : "Tap anywhere to calculate GPS route";
    }
  }

  function cycleCameraMode() {
    camera.camMode = (camera.camMode + 1) % CAM_MODES.length;
    const label = CAM_MODES[camera.camMode].label;
    document.getElementById("hudCamLabel").textContent = label;
    showToast(`CAMERA: ${label}`);
  }

  function performInteractOrNearby() {
    if (currentInteractTarget) {
      if (currentInteractTarget.type === "shop") {
        const s = currentInteractTarget.shop;
        const p = Entities.player;
        if (s.action === "heal" || s.action === "hospital_heal") {
          const fee = s.action === "hospital_heal" ? 50 : 25;
          if (p.health >= 100 && p.stamina >= 99) showToast("HEALTH ALREADY FULL");
          else if (p.cash >= fee) {
            p.cash -= fee; p.health = 100; p.stamina = 100; Audio.playCash();
            showToast(s.action === "hospital_heal" ? "MEDICAL TREATMENT COMPLETE" : "MEAL RESTORED ENERGY");
            saveState();
          } else showToast(`NEED $${fee}`);
        } else if (s.action === "precinct") {
          if (p.wanted === 0) showToast("NO ACTIVE WARRANTS");
          else if (p.cash >= 200) {
            p.cash -= 200; p.wanted = 0; p.arrestProgress = 0; Audio.playCash();
            showToast("FINE PAID · WANTED CLEARED"); saveState();
          } else showToast("NEED $200 TO CLEAR WANTED LEVEL");
        } else if (s.action === "spawn_boat") {
          window.CityGameAPI.garageAction("spawn_vehicle", "boat");
        } else if (s.studioTab) {
          callAndroid("openStudioSheet", s.studioTab, JSON.stringify(buildStatePayload()));
        }
      } else if (currentInteractTarget.type === "billboard") {
        callAndroid("openPhotoPicker", "billboard", currentInteractTarget.billboard.id);
      }
      return;
    }
    if (!Entities.player.vehicle && Entities.findNearestVehicle(72)) {
      Entities.toggleEnterExitVehicle(Audio, showToast);
      return;
    }
    showToast("NO INTERACTION NEARBY");
  }

  // Custom Control Editor Helpers
  const CTRL_LABELS = {
    joystick: "Joystick / Steer",
    actions: "Action Buttons",
    centerPills: "Weapon / Speedo",
    hudMenu: "Top Quick Dock",
    minimap: "Minimap & Quick Bar",
  };

  function selectEditorControl(id) {
    editorSelectedId = id;
    document.querySelectorAll(".editable-hud").forEach((el) => {
      el.classList.toggle("editing-active", el.dataset.ctrlId === id);
    });
    const curScale = (editorDraft[id] && editorDraft[id].scale) || 1.0;
    document.getElementById("editorSelectedTag").textContent = `Selected: ${CTRL_LABELS[id] || id}`;
    document.getElementById("editorScaleSlider").value = String(curScale);
    document.getElementById("editorScaleVal").textContent = `${Math.round(curScale * 100)}%`;
  }

  function enterControlEditor() {
    editorActive = true;
    paused = true;
    editorPreviewDriving = !!Entities.player.vehicle;
    document.getElementById("pauseModal").classList.add("hidden");
    document.getElementById("mainMenuModal").classList.add("hidden");

    editorDraft = JSON.parse(JSON.stringify(settings.customControls || {}));
    document.getElementById("controlEditorOverlay").classList.remove("hidden");
    document.getElementById("btnEditorPreviewMode").textContent = editorPreviewDriving ? "PREVIEW: DRIVING" : "PREVIEW: WALKING";
    document.querySelectorAll(".editable-hud").forEach((el) => el.classList.add("editing"));
    selectEditorControl("joystick");
  }

  function exitControlEditor(commit) {
    editorActive = false;
    paused = false;
    editorPreviewDriving = false;
    document.getElementById("controlEditorOverlay").classList.add("hidden");
    document.querySelectorAll(".editable-hud").forEach((el) => {
      el.classList.remove("editing", "editing-active");
    });
    if (commit) {
      settings.customControls = editorDraft;
      applySettingsToDomAndAudio();
      saveState();
      syncAndroidSnapshot();
      showToast("CUSTOM CONTROL LAYOUT SAVED");
    } else {
      applySettingsToDomAndAudio();
    }
  }

  function openPauseMenu() {
    paused = true;
    const ac = World.getActiveCity();
    document.getElementById("pauseDistrictSub").textContent =
      `${ac ? ac.name : "Metro City"} · ${World.getDistrictName(Entities.player.x, Entities.player.z)}`;
    const restartBtn = document.getElementById("btnPauseRestartMission");
    const hasRestartable = !!Missions.getLastMissionId();
    restartBtn.disabled = !hasRestartable;
    restartBtn.style.opacity = hasRestartable ? "1" : "0.45";
    document.getElementById("pauseModal").classList.remove("hidden");
  }

  window.CityGameAPI = {
    setCharacter(characterId) {
      if (Entities.isCharacterDisabled(characterId)) {
        showToast("CHARACTER DISABLED BY OWNER");
        return;
      }
      const spec = Entities.setCharacter(characterId);
      refreshAvatarPreview();
      saveState();
      syncAndroidSnapshot();
      showToast("CHARACTER: " + spec.name.toUpperCase());
    },
    setOutfit(outfitId, skinHex, hairHex) {
      Entities.player.outfit = outfitId;
      if (skinHex) Entities.player.skinHex = skinHex;
      if (hairHex) Entities.player.hairHex = hairHex;
      refreshAvatarPreview();
      saveState();
      syncAndroidSnapshot();
      showToast("OUTFIT EQUIPPED");
    },
    applyCustomPhoto(targetType, targetId, dataUrl) {
      if (targetType === "character") {
        Textures.setCustomCharacterImage(dataUrl, GL, targetId || "player").then(() => {
          refreshAvatarPreview();
          showToast(dataUrl ? "CUSTOM CHARACTER PHOTO APPLIED" : "CUSTOM CHARACTER CLEARED");
        });
      } else if (targetType === "billboard") {
        const slot = (ownerConfig.customBillboards || []).find((b) => b.id === targetId);
        Textures.setCustomBillboardImage(targetId, dataUrl, GL, slot ? slot.title : "AD POSTER");
        showToast(dataUrl ? "BILLBOARD PHOTO UPDATED" : "BILLBOARD RESET");
      } else if (targetType === "vehicle") {
        Textures.setCustomVehicleImage(targetId, dataUrl, GL).then(() => {
          showToast(dataUrl ? "VEHICLE CUSTOM WRAP APPLIED" : "VEHICLE WRAP CLEARED");
        });
      }
    },
    applyOwnerConfig(configJson, isPreview = false) {
      try {
        const parsed = typeof configJson === "string" ? JSON.parse(configJson) : configJson;
        applyOwnerConfigInternal(parsed, !!isPreview, !isPreview);
        showToast(isPreview ? "OWNER PREVIEW APPLIED" : "OWNER CONFIG LIVE");
      } catch (e) {
        console.warn("applyOwnerConfig error", e);
      }
    },
    garageAction(action, param) {
      const p = Entities.player;
      const repairFee = Math.max(0, (ownerConfig.economy && ownerConfig.economy.repairCost) || 100);
      if (action === "repair") {
        if (!p.vehicle) { showToast("ENTER A VEHICLE FIRST"); return; }
        if (p.cash < repairFee) { showToast(`NEED $${repairFee} TO REPAIR`); return; }
        p.cash -= repairFee;
        p.vehicle.hp = 100;
        Audio.playCash();
        showToast("VEHICLE REPAIRED");
      } else if (action === "paint") {
        if (!p.vehicle) { showToast("ENTER A VEHICLE FIRST"); return; }
        p.vehicle.color = param;
        Audio.playCash();
        showToast("RESPRAY APPLIED");
      } else if (action === "upgrade_turbo") {
        const cost = 600 + p.upgrades.turbo * 500;
        if (p.upgrades.turbo >= 3 || p.cash < cost) { showToast("UNABLE TO UPGRADE"); return; }
        p.cash -= cost;
        p.upgrades.turbo += 1;
        Audio.playCash();
        showToast("TURBO UPGRADED LV." + p.upgrades.turbo);
      } else if (action === "upgrade_handling") {
        const cost = 500 + p.upgrades.handling * 450;
        if (p.upgrades.handling >= 3 || p.cash < cost) { showToast("UNABLE TO UPGRADE"); return; }
        p.cash -= cost;
        p.upgrades.handling += 1;
        Audio.playCash();
        showToast("HANDLING UPGRADED LV." + p.upgrades.handling);
      } else if (action === "spawn_vehicle") {
        if (Entities.isVehicleDisabled(param)) { showToast("VEHICLE DISABLED BY OWNER"); return; }
        const spec = Entities.VEHICLE_SPECS[param];
        if (!spec) return;
        if (!p.ownedVehicles.includes(param)) {
          if (p.cash < spec.price) { showToast("INSUFFICIENT CASH"); return; }
          p.cash -= spec.price;
          p.ownedVehicles.push(param);
          Audio.playCash();
          showToast("PURCHASED " + spec.name.toUpperCase());
        } else {
          showToast("DELIVERED " + spec.name.toUpperCase());
        }
        const v = Entities.spawnVehicleNearPlayer(param, spec.defaultColor, World);
        if (!p.vehicle) { p.vehicle = v; p.x = v.x; p.z = v.z; }
      }
      saveState();
      syncAndroidSnapshot();
    },
    combatAction(action, param) {
      const p = Entities.player;
      const spec = Entities.WEAPON_SPECS[param];
      if (!spec) return;
      const ammoFee = Math.max(10, (ownerConfig.economy && ownerConfig.economy.ammoCost) || 120);
      if (action === "equip_or_buy") {
        if (p.ownedWeapons.includes(param)) {
          p.weapon = param;
          showToast("EQUIPPED " + spec.name.toUpperCase());
        } else {
          if (p.cash < spec.price) { showToast("INSUFFICIENT CASH"); return; }
          p.cash -= spec.price;
          p.ownedWeapons.push(param);
          p.weapon = param;
          if (!spec.isMelee) p.ammo[param] = (p.ammo[param] || 0) + Math.round(spec.maxAmmo * 0.5);
          Audio.playCash();
          showToast("UNLOCKED " + spec.name.toUpperCase());
        }
      } else if (action === "buy_ammo") {
        if (spec.isMelee) return;
        if (!p.ownedWeapons.includes(param)) { showToast("BUY WEAPON FIRST"); return; }
        if (p.cash < ammoFee) { showToast(`NEED $${ammoFee} FOR AMMO`); return; }
        p.cash -= ammoFee;
        p.ammo[param] = Math.min(spec.maxAmmo * 2, (p.ammo[param] || 0) + Math.round(spec.maxAmmo * 0.5));
        Audio.playCash();
        showToast("AMMO RESUPPLIED");
      }
      saveState();
      syncAndroidSnapshot();
    },
    selectCity(cityId) {
      const prof = RealCities.get(cityId);
      if (prof.playable3d) {
        selectCityInMap(cityId, true);
      } else {
        openFullMap("real");
        selectCityInMap(cityId, false);
      }
    },
    openMapModal(mode) {
      openFullMap(mode || null);
    },
    openMissionBriefing(missionId) {
      showMissionBriefing(missionId);
    },
    startMission(missionId) {
      Missions.startMission(missionId, World, Entities, CityMap, showToast);
      syncAndroidSnapshot();
    },
    claimMissionReward(missionId) {
      const item = Missions.claimReward(missionId, Entities, Audio, showToast);
      if (item) {
        saveState();
        syncAndroidSnapshot();
      }
    },
    restartActiveMission() {
      const mId = Missions.getLastMissionId();
      if (!mId) {
        showToast("NO MISSION TO RESTART");
        return;
      }
      Missions.abortActive(Entities);
      Missions.startMission(mId, World, Entities, CityMap, showToast);
      syncAndroidSnapshot();
    },
    abortMission() {
      Missions.abortActive(Entities);
      saveState();
      syncAndroidSnapshot();
      showToast("MISSION ABORTED");
    },
    upsertCustomMission(missionJson) {
      if (!ownerConfig.ownerUnlocked) { showToast("OWNER ACCESS REQUIRED"); return; }
      try {
        const m = typeof missionJson === "string" ? JSON.parse(missionJson) : missionJson;
        const saved = Missions.upsertCustomMission(m);
        saveState();
        syncAndroidSnapshot();
        showToast("SAVED MISSION: " + saved.title.toUpperCase());
      } catch (e) { console.warn(e); }
    },
    deleteCustomMission(missionId) {
      if (!ownerConfig.ownerUnlocked) { showToast("OWNER ACCESS REQUIRED"); return; }
      Missions.deleteCustomMission(missionId);
      saveState();
      syncAndroidSnapshot();
      showToast("CUSTOM MISSION DELETED");
    },
    ownerAction(action, payloadJson) {
      if (action === "set_unlocked") {
        ownerConfig.ownerUnlocked = payloadJson === "true";
        if (!ownerConfig.ownerUnlocked) {
          CityMap.view.editorMode = false;
          document.getElementById("btnMapEditorToggle").classList.remove("active");
          document.getElementById("mapEditorBar").classList.add("hidden");
        }
        return;
      }
      if (action === "reset_player_progress") {
        const startCash = (ownerConfig.economy && typeof ownerConfig.economy.startingCash === "number")
          ? ownerConfig.economy.startingCash : 3200;
        const p = Entities.player;
        p.cash = startCash;
        p.xp = 0;
        p.health = p.maxHealth || 100;
        p.stamina = 100;
        p.wanted = 0;
        p.arrestProgress = 0;
        p.vehicle = null;
        p.ownedVehicles = ["coupe", "superbike", "boat", "heli"];
        p.ownedWeapons = ["fists", "pistol"];
        p.weapon = "fists";
        p.ammo = { pistol: 36, smg: 0, rifle: 0 };
        p.upgrades = { turbo: 0, handling: 0 };
        Missions.abortActive(Entities);
        Missions.setCompletedIds([]);
        Missions.setPendingRewards([]);
        CityMap.clearDestination();
        saveState();
        syncAndroidSnapshot();
        showToast("PLAYER PROGRESS RESET");
        return;
      }
      if (!ownerConfig.ownerUnlocked) { showToast("UNLOCK OWNER PANEL FIRST"); return; }
      try {
        const payload = payloadJson ? JSON.parse(payloadJson) : {};
        if (action === "toggle_city_enabled") {
          const cid = payload.cityId;
          if (cid === "original") return;
          const disabled = new Set(ownerConfig.disabledCityIds || []);
          if (disabled.has(cid)) disabled.delete(cid); else disabled.add(cid);
          ownerConfig.disabledCityIds = Array.from(disabled);
          populateCitySelector();
          showToast("CITY AVAILABILITY UPDATED");
        } else if (action === "set_reward_multiplier") {
          const m = Math.max(0.5, Math.min(3.0, Number(payload.mult) || 1.0));
          ownerConfig.economy.rewardMultiplier = m;
          Missions.setRewardMultiplier(m);
          showToast(`REWARD SCALE: ${m.toFixed(1)}x`);
        } else if (action === "grant_cash") {
          Entities.player.cash += Number(payload.amount) || 1000;
          Audio.playCash();
          showToast("OWNER GRANT +$" + (payload.amount || 1000));
        } else if (action === "clear_wanted") {
          Entities.player.wanted = 0;
          Entities.player.arrestProgress = 0;
          showToast("WANTED CLEARED BY OWNER");
        } else if (action === "unlock_all_vehicles") {
          Entities.player.ownedVehicles = Object.keys(Entities.VEHICLE_SPECS).filter((k) => !k.startsWith("police"));
          showToast("ALL FLEET VEHICLES UNLOCKED");
        } else if (action === "add_building_here") {
          World.addCustomBuilding(payload.name || "Owner Tower", Entities.player.x + 120, Entities.player.z, 130, 130, 82, payload.facade || "glass");
          showToast("PLACED CUSTOM 3D BUILDING");
        } else if (action === "clear_custom_world") {
          World.setCustomWorld([], []);
          showToast("CLEARED CUSTOM BUILDINGS & ROADS");
        }
        saveState();
        syncAndroidSnapshot();
      } catch (e) { console.warn(e); }
    },
    setTimeMode(mode) {
      World.setTimeMode(mode);
      showToast("TIME SET: " + mode.toUpperCase());
    },
    setWeather(weather) {
      World.setWeather(weather);
      saveState();
      showToast("WEATHER: " + weather.toUpperCase());
    },
    setSettings(settingsJson) {
      try {
        const next = typeof settingsJson === "string" ? JSON.parse(settingsJson) : settingsJson;
        settings = {
          ...settings,
          ...next,
          customControls: next.customControls !== undefined ? (next.customControls || {}) : settings.customControls,
        };
        applySettingsToDomAndAudio();
        saveState();
        syncAndroidSnapshot();
      } catch (e) { console.warn("Invalid settings json", e); }
    },
    openControlEditor() {
      enterControlEditor();
    },
    resetCustomControls() {
      settings.customControls = {};
      settings.joystickPos = "mid";
      settings.buttonPos = "mid";
      settings.buttonSize = 1.0;
      settings.layout = "standard";
      applySettingsToDomAndAudio();
      saveState();
      syncAndroidSnapshot();
      showToast("CONTROLS RESET TO DEFAULT");
    },
    togglePause() {
      const pm = document.getElementById("pauseModal");
      if (pm.classList.contains("hidden")) openPauseMenu();
      else {
        paused = false;
        pm.classList.add("hidden");
      }
    },
    saveNow() {
      saveState();
      syncAndroidSnapshot();
      showToast("GAME PROGRESS SAVED");
    },
    getSnapshot() {
      return JSON.stringify(buildStatePayload());
    },
  };

  function setupControls() {
    // 1. Left Joystick
    const zone = document.getElementById("joystickZone");
    const knob = document.getElementById("joystickKnob");
    let joyPointerId = null;
    let originX = 0, originY = 0;
    const maxR = 42;

    zone.addEventListener("pointerdown", (e) => {
      if (editorActive) return;
      e.preventDefault();
      Audio.unlock();
      if (joyPointerId !== null) return;
      joyPointerId = e.pointerId;
      zone.setPointerCapture(e.pointerId);
      const rect = document.getElementById("joystickBase").getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
      updateJoy(e.clientX, e.clientY);
    });
    zone.addEventListener("pointermove", (e) => {
      if (e.pointerId !== joyPointerId) return;
      updateJoy(e.clientX, e.clientY);
    });
    function resetJoy(e) {
      if (e.pointerId !== joyPointerId) return;
      joyPointerId = null;
      input.joyX = 0;
      input.joyY = 0;
      knob.style.transform = "translate(0px, 0px)";
    }
    zone.addEventListener("pointerup", resetJoy);
    zone.addEventListener("pointercancel", resetJoy);

    function updateJoy(cx, cy) {
      let dx = cx - originX;
      let dy = cy - originY;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
      input.joyX = dx / maxR;
      input.joyY = dy / maxR;
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    // 2. Right Camera Orbit Touch Pad
    const camPad = document.getElementById("cameraTouchPad");
    let camPointerId = null;
    let lastCamX = 0, lastCamY = 0;
    camPad.addEventListener("pointerdown", (e) => {
      if (editorActive) return;
      e.preventDefault();
      Audio.unlock();
      if (camPointerId !== null) return;
      camPointerId = e.pointerId;
      lastCamX = e.clientX;
      lastCamY = e.clientY;
      camPad.setPointerCapture(e.pointerId);
    });
    camPad.addEventListener("pointermove", (e) => {
      if (e.pointerId !== camPointerId) return;
      const dx = e.clientX - lastCamX;
      const dy = e.clientY - lastCamY;
      lastCamX = e.clientX;
      lastCamY = e.clientY;
      const sens = settings.cameraSens || 1.0;
      camera.yaw -= dx * 0.0065 * sens;
      camera.pitch = Math.max(0.08, Math.min(0.76, camera.pitch + dy * 0.0045 * sens));
      camera.userOrbitCooldown = 2.2;
    });
    const endCam = (e) => { if (e.pointerId === camPointerId) camPointerId = null; };
    camPad.addEventListener("pointerup", endCam);
    camPad.addEventListener("pointercancel", endCam);

    // 3. Hold & Tap Action Buttons (On-Foot + Driving)
    function bindHoldBtn(id, prop) {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener("pointerdown", (e) => {
        if (editorActive) return;
        e.preventDefault();
        Audio.unlock();
        input[prop] = true;
        btn.classList.add("pressed");
      });
      const rel = () => {
        input[prop] = false;
        btn.classList.remove("pressed");
      };
      btn.addEventListener("pointerup", rel);
      btn.addEventListener("pointercancel", rel);
      btn.addEventListener("pointerleave", rel);
    }
    bindHoldBtn("btnSprint", "sprint");
    bindHoldBtn("btnGas", "gas");
    bindHoldBtn("btnBrake", "brake");
    bindHoldBtn("btnReverse", "reverse");
    bindHoldBtn("btnSteerLeft", "steerLeft");
    bindHoldBtn("btnSteerRight", "steerRight");
    bindHoldBtn("btnHandbrake", "handbrake");

    document.getElementById("btnJump").addEventListener("pointerdown", (e) => {
      if (editorActive) return;
      e.preventDefault(); Audio.unlock(); input.jumpPressed = true;
    });
    document.getElementById("btnPunch").addEventListener("pointerdown", (e) => {
      if (editorActive) return;
      e.preventDefault(); Audio.unlock(); input.punchPressed = true;
    });
    document.getElementById("btnFight").addEventListener("pointerdown", (e) => {
      if (editorActive) return;
      e.preventDefault(); Audio.unlock(); input.fightPressed = true;
    });

    document.getElementById("btnAim").addEventListener("click", () => {
      if (editorActive) return;
      Audio.unlock();
      input.aim = !input.aim;
      document.getElementById("btnAim").classList.toggle("active-toggle", input.aim);
      document.getElementById("aimReticle").classList.toggle("hidden", !input.aim || !!Entities.player.vehicle);
    });
    document.getElementById("btnCrouch").addEventListener("click", () => {
      if (editorActive) return;
      Audio.unlock();
      input.crouch = !input.crouch;
      document.getElementById("btnCrouch").classList.toggle("active-toggle", input.crouch);
      showToast(input.crouch ? "CROUCH / COVER ACTIVE" : "STANDING");
    });

    const cycleWeapFn = () => {
      if (editorActive) return;
      Audio.unlock();
      const wId = Entities.cycleWeapon();
      showToast("WEAPON: " + Entities.WEAPON_SPECS[wId].name.toUpperCase());
    };
    document.getElementById("btnWeaponCycle").addEventListener("click", cycleWeapFn);
    document.getElementById("btnWeaponQuick").addEventListener("click", cycleWeapFn);

    document.getElementById("btnCamViewQuick").addEventListener("click", () => { if (!editorActive) { Audio.unlock(); cycleCameraMode(); } });
    document.getElementById("btnCamViewDrive").addEventListener("click", () => { if (!editorActive) { Audio.unlock(); cycleCameraMode(); } });
    document.getElementById("btnHorn").addEventListener("pointerdown", (e) => {
      if (editorActive) return;
      e.preventDefault(); Audio.unlock(); Entities.honkHorn(Audio);
    });

    document.getElementById("btnEnterVehicle").addEventListener("click", () => {
      if (editorActive) return;
      Audio.unlock();
      if (Entities.toggleEnterExitVehicle(Audio, showToast)) {
        input.aim = false; input.crouch = false;
        document.getElementById("btnAim").classList.remove("active-toggle");
        document.getElementById("btnCrouch").classList.remove("active-toggle");
        document.getElementById("aimReticle").classList.add("hidden");
      }
    });
    document.getElementById("btnExitVehicle").addEventListener("click", () => {
      if (editorActive) return;
      Audio.unlock();
      Entities.toggleEnterExitVehicle(Audio, showToast);
    });

    document.getElementById("btnInteract").addEventListener("click", () => { Audio.unlock(); performInteractOrNearby(); });
    document.getElementById("btnOnFootInteract").addEventListener("click", () => { if (!editorActive) { Audio.unlock(); performInteractOrNearby(); } });

    document.getElementById("btnAbortMission").addEventListener("click", () => { window.CityGameAPI.abortMission(); });
    document.getElementById("btnClearGpsHud").addEventListener("click", () => { CityMap.clearDestination(); saveState(); showToast("GPS CLEARED"); });

    // Top GTA HUD Dock & Quick Actions
    document.getElementById("btnHudStory").addEventListener("click", () => { if (!editorActive) callAndroid("openStudioSheet", "missions_story", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnHudFree").addEventListener("click", () => { if (!editorActive) callAndroid("openStudioSheet", "missions_free", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnMissions").addEventListener("click", () => { if (!editorActive) callAndroid("openStudioSheet", "missions", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnHudGarage").addEventListener("click", () => { if (!editorActive) callAndroid("openStudioSheet", "garage", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnStudio").addEventListener("click", () => { if (!editorActive) callAndroid("openStudioSheet", "character", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnProfile").addEventListener("click", () => { if (!editorActive) callAndroid("openStudioSheet", "character", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnHudInventory").addEventListener("click", () => { if (!editorActive) callAndroid("openStudioSheet", "inventory", JSON.stringify(buildStatePayload())); });

    document.getElementById("btnMapQuick").addEventListener("click", () => { if (!editorActive) openFullMap(); });
    document.getElementById("btnExpandMap").addEventListener("click", () => { if (!editorActive) openFullMap(); });
    document.getElementById("btnGpsQuick").addEventListener("click", () => {
      if (editorActive) return;
      const gps = CityMap.getDestination();
      openFullMap();
      showToast(gps ? `ACTIVE GPS: ${gps.name.toUpperCase()}` : "TAP MAP TO SET GPS WAYPOINT");
    });
    document.getElementById("btnHudSettings").addEventListener("click", () => { if (!editorActive) callAndroid("openStudioSheet", "settings", JSON.stringify(buildStatePayload())); });

    const soundBtn = document.getElementById("btnSound");
    soundBtn.addEventListener("click", () => {
      const m = Audio.setMuted(!Audio.isMuted());
      soundBtn.textContent = m ? "🔇" : "🔊";
    });

    // 4. Custom Control Editor Drag & Resize Wiring
    document.querySelectorAll(".editable-hud").forEach((el) => {
      let dragId = null;
      let startX = 0, startY = 0, baseDx = 0, baseDy = 0;
      el.addEventListener("pointerdown", (e) => {
        if (!editorActive) return;
        e.preventDefault();
        e.stopPropagation();
        const id = el.dataset.ctrlId;
        selectEditorControl(id);
        dragId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        const cur = editorDraft[id] || { dx: 0, dy: 0, scale: 1.0 };
        baseDx = cur.dx || 0;
        baseDy = cur.dy || 0;
        el.setPointerCapture(e.pointerId);
      });
      el.addEventListener("pointermove", (e) => {
        if (!editorActive || e.pointerId !== dragId) return;
        const id = el.dataset.ctrlId;
        const cur = editorDraft[id] || { dx: 0, dy: 0, scale: 1.0 };
        cur.dx = Math.max(-220, Math.min(220, baseDx + (e.clientX - startX)));
        cur.dy = Math.max(-180, Math.min(140, baseDy + (e.clientY - startY)));
        editorDraft[id] = cur;
        applyCustomControlTransforms(editorDraft);
      });
      const stopDrag = (e) => { if (e.pointerId === dragId) dragId = null; };
      el.addEventListener("pointerup", stopDrag);
      el.addEventListener("pointercancel", stopDrag);
    });

    document.getElementById("editorScaleSlider").addEventListener("input", (e) => {
      if (!editorActive) return;
      const val = parseFloat(e.target.value) || 1.0;
      const cur = editorDraft[editorSelectedId] || { dx: 0, dy: 0, scale: 1.0 };
      cur.scale = val;
      editorDraft[editorSelectedId] = cur;
      document.getElementById("editorScaleVal").textContent = `${Math.round(val * 100)}%`;
      applyCustomControlTransforms(editorDraft);
    });
    document.getElementById("btnEditorPreviewMode").addEventListener("click", () => {
      editorPreviewDriving = !editorPreviewDriving;
      document.getElementById("btnEditorPreviewMode").textContent = editorPreviewDriving ? "PREVIEW: DRIVING" : "PREVIEW: WALKING";
      updateHUD();
    });
    document.getElementById("btnEditorReset").addEventListener("click", () => {
      editorDraft = {};
      applyCustomControlTransforms(editorDraft);
      selectEditorControl(editorSelectedId);
      showToast("LAYOUT RESET PREVIEW");
    });
    document.getElementById("btnEditorCancel").addEventListener("click", () => exitControlEditor(false));
    document.getElementById("btnEditorSave").addEventListener("click", () => exitControlEditor(true));

    // 5. Pause Menu & Main Menu Wiring
    const pauseModal = document.getElementById("pauseModal");
    const closePause = () => { paused = false; pauseModal.classList.add("hidden"); };
    document.getElementById("btnPause").addEventListener("click", () => { if (!editorActive) openPauseMenu(); });
    document.getElementById("btnResumePause").addEventListener("click", closePause);
    document.getElementById("btnPauseResume").addEventListener("click", closePause);
    document.getElementById("btnPauseRestartMission").addEventListener("click", () => {
      closePause();
      window.CityGameAPI.restartActiveMission();
    });
    document.getElementById("btnPauseMap").addEventListener("click", () => { closePause(); openFullMap(); });
    document.getElementById("btnPauseMissions").addEventListener("click", () => { closePause(); callAndroid("openStudioSheet", "missions", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnPauseSettings").addEventListener("click", () => { closePause(); callAndroid("openStudioSheet", "settings", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnPauseControlEditor").addEventListener("click", () => { enterControlEditor(); });
    document.getElementById("btnPauseSave").addEventListener("click", () => { saveState(); showToast("PROGRESS SAVED"); closePause(); });
    document.getElementById("btnPauseOwner").addEventListener("click", () => { closePause(); callAndroid("openStudioSheet", "owner", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnPauseMainMenu").addEventListener("click", () => {
      pauseModal.classList.add("hidden");
      paused = true;
      const ac = World.getActiveCity();
      document.getElementById("mainMenuCitySub").textContent =
        `${ac ? ac.name : "Metro City"} · Cash $${Entities.player.cash.toLocaleString()}`;
      document.getElementById("mainMenuModal").classList.remove("hidden");
    });

    const mainMenu = document.getElementById("mainMenuModal");
    const closeMainMenu = () => { mainMenu.classList.add("hidden"); paused = false; };
    document.getElementById("btnMenuContinue").addEventListener("click", closeMainMenu);
    document.getElementById("btnMenuStory").addEventListener("click", () => { closeMainMenu(); callAndroid("openStudioSheet", "missions_story", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnMenuFree").addEventListener("click", () => { closeMainMenu(); callAndroid("openStudioSheet", "missions_free", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnMenuMap").addEventListener("click", () => { closeMainMenu(); openFullMap(); });
    document.getElementById("btnMenuChar").addEventListener("click", () => { closeMainMenu(); callAndroid("openStudioSheet", "character", JSON.stringify(buildStatePayload())); });
    document.getElementById("btnMenuSettings").addEventListener("click", () => { closeMainMenu(); callAndroid("openStudioSheet", "settings", JSON.stringify(buildStatePayload())); });

    // 6. Dual Interactive Map & Real-World OSM Controls
    const fullMapModal = document.getElementById("fullMapModal");
    document.getElementById("btnCloseMap").addEventListener("click", () => fullMapModal.classList.add("hidden"));

    document.getElementById("btnMapModeOriginal").addEventListener("click", () => selectCityInMap("original", false));
    document.getElementById("btnMapModeReal").addEventListener("click", () => {
      const target = CityMap.view.selectedCityId === "original" ? "lahore" : CityMap.view.selectedCityId;
      selectCityInMap(target, false);
    });
    document.getElementById("citySelector").addEventListener("change", (e) => selectCityInMap(e.target.value, false));
    document.getElementById("btnEnterSelectedCity").addEventListener("click", () => {
      selectCityInMap(CityMap.view.selectedCityId, true);
      fullMapModal.classList.add("hidden");
    });

    document.getElementById("btnNavDrive").addEventListener("click", () => {
      CityMap.view.navMode = "driving";
      document.getElementById("btnNavDrive").classList.add("active-nav");
      document.getElementById("btnNavWalk").classList.remove("active-nav");
      CityMap.refreshRouteFromPlayer(World, Entities.player.x, Entities.player.z);
      renderFullMap();
    });
    document.getElementById("btnNavWalk").addEventListener("click", () => {
      CityMap.view.navMode = "walking";
      document.getElementById("btnNavWalk").classList.add("active-nav");
      document.getElementById("btnNavDrive").classList.remove("active-nav");
      CityMap.refreshRouteFromPlayer(World, Entities.player.x, Entities.player.z);
      renderFullMap();
    });

    document.getElementById("btnMapZoomIn").addEventListener("click", () => {
      if (CityMap.view.mode === "real") CityMap.view.realZoom = Math.min(17, CityMap.view.realZoom + 1);
      else CityMap.view.zoom = Math.min(3.5, CityMap.view.zoom * 1.28);
      renderFullMap();
    });
    document.getElementById("btnMapZoomOut").addEventListener("click", () => {
      if (CityMap.view.mode === "real") CityMap.view.realZoom = Math.max(5, CityMap.view.realZoom - 1);
      else CityMap.view.zoom = Math.max(0.95, CityMap.view.zoom / 1.28);
      renderFullMap();
    });
    document.getElementById("btnMapCenter").addEventListener("click", () => {
      const ac = RealCities.get(CityMap.view.selectedCityId);
      CityMap.view.centerX = Entities.player.x;
      CityMap.view.centerZ = Entities.player.z;
      if (ac) {
        if (ac.playable3d) {
          const ll = RealCities.worldToLatLng(ac, Entities.player.x, Entities.player.z);
          CityMap.view.realCenterLat = ll.lat;
          CityMap.view.realCenterLng = ll.lng;
        } else {
          CityMap.view.realCenterLat = ac.lat;
          CityMap.view.realCenterLng = ac.lng;
        }
      }
      renderFullMap();
    });

    document.getElementById("btnSaveFavorite").addEventListener("click", () => {
      const gps = CityMap.getDestination();
      if (!gps) { showToast("TAP MAP TO SET A DESTINATION FIRST"); return; }
      CityMap.addFavorite(gps.name, gps.x, gps.z, gps.lat, gps.lng, CityMap.view.selectedCityId);
      saveState();
      refreshFavoritesStrip();
      showToast("SAVED FAVORITE: " + gps.name.toUpperCase());
    });
    document.getElementById("btnMapClearGps").addEventListener("click", () => { CityMap.clearDestination(); saveState(); renderFullMap(); showToast("GPS CLEARED"); });

    // Search Cities & Locations (local + OpenStreetMap Nominatim)
    const searchInput = document.getElementById("mapSearchInput");
    const searchDrop = document.getElementById("mapSearchResults");
    async function runSearch() {
      const q = searchInput.value.trim();
      if (!q) { searchDrop.classList.add("hidden"); return; }
      searchDrop.innerHTML = '<div class="search-item"><div class="search-item-title">Searching OpenStreetMap & city landmarks...</div></div>';
      searchDrop.classList.remove("hidden");
      const activeCity = RealCities.get(CityMap.view.selectedCityId);
      const hits = await RealCities.searchPlaces(q, activeCity);
      searchDrop.innerHTML = "";
      if (hits.length === 0) {
        searchDrop.innerHTML = '<div class="search-item"><div class="search-item-title">No matching locations found</div></div>';
        return;
      }
      hits.forEach((h) => {
        const row = document.createElement("div");
        row.className = "search-item";
        row.innerHTML = `<div class="search-item-title"></div><div class="search-item-sub"></div>`;
        row.querySelector(".search-item-title").textContent = h.name;
        row.querySelector(".search-item-sub").textContent = h.subtitle;
        row.addEventListener("click", () => {
          searchDrop.classList.add("hidden");
          if (h.type === "city" && h.cityId) {
            selectCityInMap(h.cityId, false);
          } else if (h.type === "place") {
            if (typeof h.x === "number") {
              CityMap.view.centerX = h.x; CityMap.view.centerZ = h.z;
              CityMap.setDestination(World, Entities.player.x, Entities.player.z, h.x, h.z, h.name, h.lat, h.lng);
            } else {
              CityMap.view.realCenterLat = h.lat; CityMap.view.realCenterLng = h.lng;
              CityMap.setDestination(World, Entities.player.x, Entities.player.z, null, null, h.name, h.lat, h.lng);
            }
            renderFullMap();
          } else {
            CityMap.view.mode = "real";
            CityMap.view.realCenterLat = h.lat;
            CityMap.view.realCenterLng = h.lng;
            CityMap.view.realZoom = 14;
            document.getElementById("btnMapModeOriginal").classList.remove("active");
            document.getElementById("btnMapModeReal").classList.add("active");
            const curCity = RealCities.get(CityMap.view.selectedCityId);
            const wxz = curCity.playable3d ? RealCities.latLngToWorld(curCity, h.lat, h.lng) : { x: null, z: null };
            CityMap.setDestination(World, Entities.player.x, Entities.player.z, wxz.x, wxz.z, h.name, h.lat, h.lng);
            renderFullMap();
          }
          saveState();
        });
        searchDrop.appendChild(row);
      });
    }
    document.getElementById("btnMapSearch").addEventListener("click", runSearch);
    searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });

    // Owner Map Builder Toggle (Requires Owner Unlocked!)
    const editorBtn = document.getElementById("btnMapEditorToggle");
    const editorBar = document.getElementById("mapEditorBar");
    editorBtn.addEventListener("click", () => {
      if (!ownerConfig.ownerUnlocked) {
        showToast("OWNER LOCKED · UNLOCK IN OWNER CONTROL PANEL");
        callAndroid("openStudioSheet", "owner", JSON.stringify(buildStatePayload()));
        return;
      }
      CityMap.view.editorMode = !CityMap.view.editorMode;
      CityMap.view.pendingRoadStart = null;
      editorBtn.classList.toggle("active", CityMap.view.editorMode);
      editorBar.classList.toggle("hidden", !CityMap.view.editorMode);
    });

    document.querySelectorAll("#editorToolGroup .poi-cat").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#editorToolGroup .poi-cat").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        CityMap.view.editorTool = btn.dataset.tool;
        CityMap.view.pendingRoadStart = null;
      });
    });

    let mapDragId = null;
    let mapStartX = 0, mapStartY = 0;
    let mapMoved = false;
    fullMapCanvas.addEventListener("pointerdown", (e) => {
      searchDrop.classList.add("hidden");
      mapDragId = e.pointerId;
      mapStartX = e.clientX;
      mapStartY = e.clientY;
      mapMoved = false;
      fullMapCanvas.setPointerCapture(e.pointerId);
    });
    fullMapCanvas.addEventListener("pointermove", (e) => {
      if (e.pointerId !== mapDragId) return;
      const dx = e.clientX - mapStartX;
      const dy = e.clientY - mapStartY;
      if (Math.hypot(dx, dy) > 6) mapMoved = true;
      if (mapMoved) {
        const rect = fullMapCanvas.getBoundingClientRect();
        if (CityMap.view.mode === "real") {
          const degPerPx = 360 / (256 * Math.pow(2, CityMap.view.realZoom));
          CityMap.view.realCenterLng -= dx * (fullMapCanvas.width / rect.width) * degPerPx;
          CityMap.view.realCenterLat += dy * (fullMapCanvas.height / rect.height) * degPerPx * 0.78;
        } else {
          const span = 5200 / CityMap.view.zoom;
          CityMap.view.centerX = Math.max(0, Math.min(5200, CityMap.view.centerX - (dx / rect.width) * span));
          CityMap.view.centerZ = Math.max(0, Math.min(5200, CityMap.view.centerZ - (dy / rect.height) * span));
        }
        mapStartX = e.clientX;
        mapStartY = e.clientY;
        renderFullMap();
      }
    });
    fullMapCanvas.addEventListener("pointerup", (e) => {
      if (e.pointerId !== mapDragId) return;
      mapDragId = null;
      if (mapMoved) return;

      const curCity = RealCities.get(CityMap.view.selectedCityId);

      if (CityMap.view.mode === "real") {
        const ll = CityMap.screenToLatLng(fullMapCanvas, e.clientX, e.clientY);
        const wxz = curCity.playable3d ? RealCities.latLngToWorld(curCity, ll.lat, ll.lng) : { x: null, z: null };
        CityMap.setDestination(World, Entities.player.x, Entities.player.z, wxz.x, wxz.z, `Pin (${ll.lat.toFixed(3)}, ${ll.lng.toFixed(3)})`, ll.lat, ll.lng);
        saveState();
        renderFullMap();
        showToast("OSM GPS ROUTE CALCULATED");
        return;
      }

      const worldPt = CityMap.screenToWorld(fullMapCanvas, e.clientX, e.clientY);
      const hit = CityMap.findNearestMarker(World, worldPt.x, worldPt.z, 185);

      if (CityMap.view.editorMode && ownerConfig.ownerUnlocked) {
        const nameInput = document.getElementById("poiNameInput");
        const label = (nameInput.value || "").trim();
        const tool = CityMap.view.editorTool;

        if (tool === "poi" || tool === "mission_pt") {
          if (hit && hit.type === "poi") {
            CityMap.removeCustomPOI(hit.item.id);
            showToast("REMOVED CUSTOM MARKER");
          } else {
            const cat = tool === "mission_pt" ? "Mission Pt" : "Custom Spot";
            const poi = CityMap.addCustomPOI(label || cat, cat, worldPt.x, worldPt.z);
            nameInput.value = "";
            showToast("ADDED " + poi.name.toUpperCase());
          }
        } else if (tool === "building") {
          World.addCustomBuilding(label || "Owner Building", worldPt.x, worldPt.z, 140, 140, 76, "glass");
          nameInput.value = "";
          showToast("PLACED CUSTOM 3D BUILDING");
        } else if (tool === "road") {
          if (!CityMap.view.pendingRoadStart) {
            CityMap.view.pendingRoadStart = worldPt;
            showToast("TAP END POINT FOR ROAD");
          } else {
            World.addCustomRoad(label || "Custom Road", CityMap.view.pendingRoadStart.x, CityMap.view.pendingRoadStart.z, worldPt.x, worldPt.z);
            CityMap.view.pendingRoadStart = null;
            nameInput.value = "";
            showToast("BUILT CUSTOM 3D ROAD");
          }
        }
        saveState();
        renderFullMap();
        return;
      }

      if (hit) {
        CityMap.setDestination(World, Entities.player.x, Entities.player.z, hit.item.x, hit.item.z, hit.item.name);
        showToast("GPS ROUTE: " + hit.item.name.toUpperCase());
      } else {
        CityMap.setDestination(World, Entities.player.x, Entities.player.z, worldPt.x, worldPt.z, "Custom GPS Pin");
        showToast("GPS ROUTE CALCULATED");
      }
      saveState();
      renderFullMap();
    });

    // 7. Mission Briefing, Complete Claim & Retry Modals
    document.getElementById("btnCloseIntro").addEventListener("click", () => document.getElementById("missionIntroModal").classList.add("hidden"));
    document.getElementById("btnCancelIntro").addEventListener("click", () => document.getElementById("missionIntroModal").classList.add("hidden"));
    document.getElementById("btnConfirmStartMission").addEventListener("click", () => {
      document.getElementById("missionIntroModal").classList.add("hidden");
      if (pendingIntroMission) {
        window.CityGameAPI.startMission(pendingIntroMission.id);
        pendingIntroMission = null;
      }
    });

    const completeModal = document.getElementById("missionCompleteModal");
    document.getElementById("btnCloseComplete").addEventListener("click", () => completeModal.classList.add("hidden"));
    document.getElementById("btnClaimLater").addEventListener("click", () => {
      completeModal.classList.add("hidden");
      showToast("CLAIM PAYOUT IN MISSIONS MENU");
    });
    document.getElementById("btnClaimRewardNow").addEventListener("click", () => {
      completeModal.classList.add("hidden");
      if (lastCompletedMissionId) {
        window.CityGameAPI.claimMissionReward(lastCompletedMissionId);
        lastCompletedMissionId = null;
      }
    });

    document.getElementById("btnCloseFail").addEventListener("click", () => document.getElementById("missionFailModal").classList.add("hidden"));
    document.getElementById("btnDismissFail").addEventListener("click", () => document.getElementById("missionFailModal").classList.add("hidden"));
    document.getElementById("btnRetryMission").addEventListener("click", () => {
      document.getElementById("missionFailModal").classList.add("hidden");
      const failed = Missions.getLastFailed();
      if (failed && failed.mission) window.CityGameAPI.startMission(failed.mission.id);
    });
  }

  function updateThirdPersonCamera(dt) {
    const p = Entities.player;
    if (camera.userOrbitCooldown > 0) camera.userOrbitCooldown -= dt;

    if (p.vehicle && camera.camMode === 2) {
      // Hood / Cockpit View
      const v = p.vehicle;
      const eyeY = v.y + (v.isHeli ? 20 : 12);
      const eyeX = v.x + Math.sin(v.angle) * (v.isHeli ? 14 : 9);
      const eyeZ = v.z + Math.cos(v.angle) * (v.isHeli ? 14 : 9);
      const lookX = v.x + Math.sin(v.angle) * 95;
      const lookY = v.y + (v.isHeli ? 14 : 10);
      const lookZ = v.z + Math.cos(v.angle) * 95;
      camera.pos[0] = eyeX; camera.pos[1] = eyeY; camera.pos[2] = eyeZ;
      const aspect = glCanvas.width / Math.max(1, glCanvas.height);
      GL.mat4.perspective(projMat, (68 * Math.PI) / 180, aspect, 1.5, 1650);
      GL.mat4.lookAt(viewMat, camera.pos, [lookX, lookY, lookZ], [0, 1, 0]);
      return;
    }

    let targetDist = input.aim && !p.vehicle ? 34 : (camera.camMode === 1 ? 78 : camera.camMode === 2 ? 38 : 56);
    let targetHeight = input.aim && !p.vehicle ? 18 : (camera.camMode === 1 ? 28 : camera.camMode === 2 ? 15 : 20);
    let targetFov = input.aim && !p.vehicle ? 46 : (camera.camMode === 1 ? 64 : 58);

    if (p.vehicle) {
      const spdRatio = Math.min(1, Math.abs(p.vehicle.speed) / 550);
      const farBonus = camera.camMode === 1 ? 36 : 0;
      targetDist = (p.vehicle.isHeli ? 132 : p.vehicle.isMoto ? 82 + spdRatio * 14 : 104 + spdRatio * 20) + farBonus;
      targetHeight = (p.vehicle.isHeli ? 44 : p.vehicle.isMoto ? 26 : 33) + (camera.camMode === 1 ? 14 : 0);
      targetFov = 62 + spdRatio * 7 + (camera.camMode === 1 ? 4 : 0);

      if (camera.userOrbitCooldown <= 0 && Math.abs(p.vehicle.speed) > 45) {
        let diff = p.vehicle.angle - camera.yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        camera.yaw += diff * Math.min(1, dt * 2.6);
      }
    }

    camera.dist += (targetDist - camera.dist) * Math.min(1, dt * 4.5);
    camera.heightOffset += (targetHeight - camera.heightOffset) * Math.min(1, dt * 4.5);
    camera.fovDeg += (targetFov - camera.fovDeg) * Math.min(1, dt * 4.0);

    const lookX = p.x;
    const lookY = p.vehicle ? p.vehicle.y + 11 : (p.crouching ? 10 : 14) + p.jumpY * 0.5;
    const lookZ = p.z;

    const horizDist = Math.cos(camera.pitch) * camera.dist;
    const vertDist = Math.sin(camera.pitch) * camera.dist + camera.heightOffset * 0.45;

    let eyeX = lookX - Math.sin(camera.yaw) * horizDist;
    let eyeY = lookY + vertDist;
    let eyeZ = lookZ - Math.cos(camera.yaw) * horizDist;

    eyeY = Math.max(8, eyeY);
    const col = World.collideCircleWithBuildings(eyeX, eyeZ, 6, true, eyeY);
    if (col.hit && eyeY < 45) { eyeX = col.x; eyeZ = col.z; }

    camera.pos[0] = eyeX; camera.pos[1] = eyeY; camera.pos[2] = eyeZ;

    const aspect = glCanvas.width / Math.max(1, glCanvas.height);
    GL.mat4.perspective(projMat, (camera.fovDeg * Math.PI) / 180, aspect, 1.5, 1650);
    GL.mat4.lookAt(viewMat, camera.pos, [lookX, lookY, lookZ], [0, 1, 0]);
  }

  function onMissionCompleted(finished, pendingItem) {
    lastCompletedMissionId = finished ? finished.id : null;
    if (pendingItem) {
      document.getElementById("completeTitle").textContent = pendingItem.title.toUpperCase();
      document.getElementById("completeReward").textContent = `$${pendingItem.reward.toLocaleString()} + ${pendingItem.xp} XP`;
      document.getElementById("missionCompleteModal").classList.remove("hidden");
    }
    saveState();
    syncAndroidSnapshot();
  }

  function onMissionFailed(mission, reason) {
    Entities.clearMissionEnemies();
    document.getElementById("failTitle").textContent = mission.title.toUpperCase();
    document.getElementById("failReason").textContent = reason;
    document.getElementById("missionFailModal").classList.remove("hidden");
  }

  function onPlayerBusted() {
    if (Missions.getActive()) Missions.failMission("Arrested by Metro Police.", onMissionFailed);
    showToast("BUSTED! RELEASED AT PRECINCT (-$150)");
    saveState();
    syncAndroidSnapshot();
  }

  function updateMissionAndInteract(dt) {
    const p = Entities.player;
    Missions.update(dt, World, Entities, CityMap, Audio, showToast, onMissionCompleted, onMissionFailed);

    const active = Missions.getActive();
    const banner = document.getElementById("missionBanner");
    if (active) {
      const dist = Math.hypot(active.tx - p.x, active.tz - p.z);
      banner.classList.remove("hidden");
      document.getElementById("missionTitle").textContent = active.title.toUpperCase();
      document.getElementById("missionDesc").textContent = `${active.objective} · ${Math.round(dist / 4)}m`;
      if (active.hasTimer) {
        const sec = Math.max(0, Math.ceil(active.remaining));
        document.getElementById("missionTimer").textContent = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
      } else {
        document.getElementById("missionTimer").textContent = "OPEN";
      }
    } else {
      banner.classList.add("hidden");
    }

    const gps = CityMap.getDestination();
    const gpsBanner = document.getElementById("gpsBanner");
    if (gps && gps.x !== null) {
      const dGps = Math.hypot(gps.x - p.x, gps.z - p.z);
      if (dGps < 60) {
        CityMap.clearDestination();
        Audio.playCash();
        showToast("ARRIVED AT GPS DESTINATION");
        gpsBanner.classList.add("hidden");
      } else {
        gpsRefreshAccum += dt;
        if (gpsRefreshAccum > 1.0) {
          gpsRefreshAccum = 0;
          CityMap.refreshRouteFromPlayer(World, p.x, p.z);
        }
        const dir = CityMap.getDirectionSummary(p.angle, gps.route, p.x, p.z);
        const distTxt = gps.distMeters >= 1000 ? `${(gps.distMeters / 1000).toFixed(1)}km` : `${gps.distMeters}m`;
        const etaTxt = CityMap.formatEta(gps.etaSeconds, gps.etaAvailable);
        gpsBanner.classList.remove("hidden");
        document.getElementById("gpsDirArrow").textContent = dir.arrow;
        document.getElementById("gpsText").textContent = `${dir.label} · ${gps.name} · ${distTxt} · ${etaTxt}`;
      }
    } else if (gps) {
      gpsBanner.classList.remove("hidden");
      document.getElementById("gpsDirArrow").textContent = "OSM";
      const distTxt = gps.distMeters >= 1000 ? `${(gps.distMeters / 1000).toFixed(1)}km` : `${gps.distMeters}m`;
      document.getElementById("gpsText").textContent = `${gps.name} · ${distTxt} · ${CityMap.formatEta(gps.etaSeconds, gps.etaAvailable)}`;
    } else {
      gpsBanner.classList.add("hidden");
    }

    currentInteractTarget = null;
    for (let i = 0; i < World.shops.length; i++) {
      const s = World.shops[i];
      if (Math.hypot(s.x - p.x, s.z - p.z) < s.r + 22) {
        currentInteractTarget = { type: "shop", shop: s, label: s.name };
        break;
      }
    }
    if (!currentInteractTarget && !p.vehicle) {
      for (let i = 0; i < World.billboards.length; i++) {
        const bb = World.billboards[i];
        if (Math.hypot(bb.interactX - p.x, bb.interactZ - p.z) < 110) {
          currentInteractTarget = { type: "billboard", billboard: bb, label: `Upload Photo: ${bb.title}` };
          break;
        }
      }
    }

    const interactBtn = document.getElementById("btnInteract");
    const onFootInteractBtn = document.getElementById("btnOnFootInteract");
    if (currentInteractTarget) {
      interactBtn.classList.remove("hidden");
      document.getElementById("interactLabel").textContent = currentInteractTarget.label;
      onFootInteractBtn.classList.add("near-ready");
    } else {
      interactBtn.classList.add("hidden");
      onFootInteractBtn.classList.toggle("near-ready", !p.vehicle && !!Entities.findNearestVehicle(72));
    }
  }

  function updateHUD() {
    const p = Entities.player;
    const dict = I18N[settings.language] || I18N.en;
    const activeCity = World.getActiveCity();
    document.getElementById("hudCash").textContent = "$" + p.cash.toLocaleString();
    document.getElementById("hudHealth").style.width = `${Math.max(0, p.health)}%`;
    document.getElementById("hudStamina").style.width = `${Math.max(0, p.stamina)}%`;
    document.getElementById("hudClock").textContent = World.getClockString();

    const modeStr = p.vehicle
      ? p.vehicle.name.toUpperCase()
      : p.isSwimming ? "SWIMMING" : p.y > 1.5 ? "CLIMBING" : p.crouching ? "CROUCH" : "ON FOOT";
    const cityTag = activeCity && activeCity.id !== "original" ? activeCity.name.split(",")[0].toUpperCase() + " · " : "";
    document.getElementById("hudDistrict").textContent = `${cityTag}${World.getDistrictName(p.x, p.z)} · ${modeStr}`;

    const wantedEl = document.getElementById("hudWanted");
    wantedEl.classList.toggle("chasing", p.wanted > 0);
    wantedEl.querySelectorAll(".star").forEach((el) => {
      el.classList.toggle("active", parseInt(el.dataset.idx, 10) <= p.wanted);
    });

    const bustedBanner = document.getElementById("bustedBanner");
    if (p.wanted > 0 && p.arrestProgress > 0.05) {
      bustedBanner.classList.remove("hidden");
      document.getElementById("bustedFill").style.width = `${Math.round(p.arrestProgress * 100)}%`;
    } else {
      bustedBanner.classList.add("hidden");
    }
    document.getElementById("evadePill").classList.toggle("hidden", !(p.wanted > 0 && p.hiddenFromPolice));

    const wSpec = Entities.WEAPON_SPECS[p.weapon] || Entities.WEAPON_SPECS.fists;
    document.getElementById("hudWeaponName").textContent = wSpec.name.toUpperCase();
    document.getElementById("hudWeaponAmmo").textContent = wSpec.isMelee ? "MELEE" : `${p.ammo[p.weapon] || 0} AMMO`;
    document.getElementById("fightIcon").textContent = wSpec.isMelee ? "💥" : "🔫";
    document.getElementById("fightText").textContent = wSpec.isMelee ? dict.fight : dict.fire;
    document.getElementById("hudCamLabel").textContent = CAM_MODES[camera.camMode].label;

    const showDrivingControls = editorActive ? editorPreviewDriving : !!p.vehicle;
    const walkingLeft = document.getElementById("walkingLeftZone");
    const drivingLeft = document.getElementById("drivingLeftZone");
    const onFootGrid = document.getElementById("onFootActions");
    const drivingGrid = document.getElementById("drivingActions");
    const speedo = document.getElementById("hudSpeedo");
    const enterBtn = document.getElementById("btnEnterVehicle");

    if (showDrivingControls) {
      walkingLeft.classList.add("hidden");
      drivingLeft.classList.remove("hidden");
      onFootGrid.classList.add("hidden");
      drivingGrid.classList.remove("hidden");
      speedo.classList.remove("hidden");
      document.getElementById("btnWeaponCycle").classList.add("hidden");
      const v = p.vehicle;
      document.getElementById("speedVal").textContent = v ? Math.round(Math.abs(v.speed) * 0.32) : 0;
      document.getElementById("hudVehHp").textContent = v ? `${Math.round(v.hp)}% HP` : "100% HP";
      document.getElementById("gasText").textContent = v && v.isHeli ? "LIFT" : dict.gas;
      document.getElementById("revText").textContent = v && v.isHeli ? "DESC" : dict.reverse;
    } else {
      walkingLeft.classList.remove("hidden");
      drivingLeft.classList.add("hidden");
      onFootGrid.classList.remove("hidden");
      drivingGrid.classList.add("hidden");
      speedo.classList.add("hidden");
      document.getElementById("btnWeaponCycle").classList.remove("hidden");
      const nearVeh = Entities.findNearestVehicle(72);
      if (nearVeh) {
        enterBtn.classList.remove("hidden");
        enterBtn.querySelector(".ctrl-text").textContent = nearVeh.isHeli ? "FLY" : nearVeh.isBoat ? "SAIL" : nearVeh.isMoto ? "RIDE" : dict.enter;
      } else {
        enterBtn.classList.add("hidden");
      }
    }
  }

  function render3DNavigationMarkers() {
    const active = Missions.getActive();
    const gps = CityMap.getDestination();
    const route = active ? active.route : (gps && gps.route ? gps.route : null);
    const target = active ? { x: active.tx, z: active.tz } : (gps && gps.x !== null ? gps : null);
    const beaconCol = active ? [0.96, 0.65, 0.1] : [0.22, 0.74, 0.97];

    if (route && route.length > 1) {
      for (let i = 0; i < route.length - 1; i++) {
        const a = route[i], b = route[i + 1];
        const segLen = Math.hypot(b.x - a.x, b.z - a.z);
        const steps = Math.max(1, Math.floor(segLen / 180));
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          const mx = a.x + (b.x - a.x) * t;
          const mz = a.z + (b.z - a.z) * t;
          if (Math.hypot(mx - camera.pos[0], mz - camera.pos[2]) > 950) continue;
          GL.draw("cylinder", mx, 1.2, mz, 0, 0, 0, 8, 1.2, 8, [beaconCol[0], beaconCol[1], beaconCol[2], 0.75], null, 1, 1, beaconCol, true);
        }
      }
    }

    if (target) {
      GL.draw("cylinder", target.x, 45, target.z, 0, 0, 0, 22, 90, 22, [beaconCol[0], beaconCol[1], beaconCol[2], 0.3], null, 1, 1, beaconCol, true);
    }

    CityMap.getCustomPOIs().forEach((poi) => {
      if (poi.cityId && poi.cityId !== CityMap.view.selectedCityId) return;
      if (poi.x === null) return;
      if (Math.hypot(poi.x - camera.pos[0], poi.z - camera.pos[2]) < 1100) {
        const rgb = GL.hexToRgb(poi.color || "#f59e0b");
        GL.draw("cylinder", poi.x, 18, poi.z, 0, simTime * 2, 0, 10, 36, 10, [rgb[0], rgb[1], rgb[2], 0.4], null, 1, 1, rgb, true);
      }
    });
  }

  function frame(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    if (!paused) {
      simTime += dt;
      World.update(dt);
      Entities.updatePlayer(dt, input, camera.yaw, World, Audio, showToast, settings.drivingSens || 1.0);
      Entities.updateEnemies(dt, Audio);
      Entities.updateProjectiles(dt, World, Audio, showToast);
      Entities.updateTrafficAndPolice(dt, World, Audio, showToast, onPlayerBusted);
      Entities.updatePedestrians(dt, World, showToast);
      updateMissionAndInteract(dt);

      if (Entities.player.health <= 0) {
        Entities.player.health = 100;
        Entities.player.wanted = 0;
        Entities.player.vehicle = null;
        Entities.player.x = 2280;
        Entities.player.z = 2320;
        Entities.player.cash = Math.max(0, Entities.player.cash - 100);
        if (Missions.getActive()) Missions.failMission("You were knocked out and hospitalized.", onMissionFailed);
        showToast("TREATED AT HOSPITAL · -$100");
        saveState();
      }
    }

    updateThirdPersonCamera(dt);
    const atmo = World.getAtmosphere(settings.graphicsQuality);
    Audio.updateMusic(dt, atmo.isNight);
    GL.beginFrame(projMat, viewMat, atmo);
    World.renderWorld(GL, Textures, camera.pos, simTime, atmo, settings.graphicsQuality);
    render3DNavigationMarkers();
    Entities.renderAll(GL, Textures, atmo, simTime, camera.pos, settings.graphicsQuality);

    updateHUD();
    CityMap.renderMapCanvas(mctx, 108, 108, World, Entities, Missions.getActive(), simTime, true);

    if (settings.autoSave && simTime - lastSaveTs > 8) {
      lastSaveTs = simTime;
      saveState();
    }

    requestAnimationFrame(frame);
  }

  async function boot() {
    World.loadCityProfile(RealCities.get("original"));
    resizeCanvas();
    if (!GL.init(glCanvas)) {
      showToast("WEBGL NOT SUPPORTED");
      return;
    }
    await Textures.init(GL);
    loadSavedState();
    populateCitySelector();
    applySettingsToDomAndAudio();
    Entities.spawnInitialPopulation(World);
    setupControls();
    refreshAvatarPreview();
    callAndroid("requestInitialCustomPhotos");
    syncAndroidSnapshot();
    requestAnimationFrame(frame);
  }

  boot();
})();
