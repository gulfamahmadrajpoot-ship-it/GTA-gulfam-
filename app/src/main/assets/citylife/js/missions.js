// Dual Mission System: Mode A = Connected Story Mode (20 Sequential Missions with Dialogue & Unlock Chain), Mode B = Free Mission Mode (9 Categories), Plus Custom Owner Missions
window.CityMissions = (function () {
  const STORY_CATALOG = [
    {
      id: "story_1", order: 1, track: "story", category: "Story Mode", unlockReqId: null,
      title: "01 · City Arrival",
      intro: "Your flight just landed in the city. Head to the main Auto Garage to meet your first contact.",
      dialogue: { speaker: "Tariq (Contact)", lines: ["Welcome to the city! Keep your head low and grab the coupe keys at the garage."] },
      objective: "Reach the Auto Garage", tx: 880, tz: 1540, time: 0, reward: 500, xp: 100, mode: "goto",
    },
    {
      id: "story_2", order: 2, track: "story", category: "Story Mode", unlockReqId: "story_1",
      title: "02 · Meet the Broker",
      intro: "Tariq wants you to meet Elena at the Commercial Market for your first paying contract.",
      dialogue: { speaker: "Elena (Broker)", lines: ["Good to see you on time. Let's put your driving skills to work right away."] },
      objective: "Meet Elena at Commercial Market", tx: 1520, tz: 1960, time: 110, reward: 650, xp: 130, mode: "goto",
    },
    {
      id: "story_3", order: 3, track: "story", category: "Story Mode", unlockReqId: "story_2",
      title: "03 · Urgent Espresso Run",
      intro: "A client at Central Park Plaza is waiting for confidential documents hidden in a coffee crate.",
      dialogue: { speaker: "Elena (Broker)", lines: ["No spills, no detours—get that crate across Central Park fast."] },
      objective: "Deliver Crate to Central Park", tx: 2300, tz: 1500, time: 75, reward: 750, xp: 140, mode: "goto",
    },
    {
      id: "story_4", order: 4, track: "story", category: "Story Mode", unlockReqId: "story_3",
      title: "04 · First Vehicle Delivery",
      intro: "Move an unmarked sports coupe from the Industrial Block to Financial Core cleanly.",
      dialogue: { speaker: "Tariq (Contact)", lines: ["Keep the bodywork clean—the buyer deducts every scratch."] },
      objective: "Deliver Vehicle to Financial Core (>50% HP)", tx: 2300, tz: 750, time: 90, reward: 900, xp: 170, mode: "nodamage",
    },
    {
      id: "story_5", order: 5, track: "story", category: "Story Mode", unlockReqId: "story_4",
      title: "05 · Street Syndicate Trial",
      intro: "Local racers control the downtown streets. Prove yourself across 3 midnight checkpoints.",
      dialogue: { speaker: "Raza (Racer)", lines: ["Think your coupe can keep pace? Hit all three gates before the clock dies."] },
      objective: "Complete 3 Street Race Checkpoints", tx: 2700, tz: 1100, time: 90, reward: 1100, xp: 200, mode: "race",
      checkpoints: [{ x: 1900, z: 1100 }, { x: 2700, z: 1100 }, { x: 2700, z: 1900 }],
    },
    {
      id: "story_6", order: 6, track: "story", category: "Story Mode", unlockReqId: "story_5",
      title: "06 · Precinct Leak",
      intro: "A rival crew tipped off patrol officers. Grab the ledger outside Police HQ and shake a 2-star chase.",
      dialogue: { speaker: "Elena (Broker)", lines: ["Grab the drop near the precinct and vanish down the side streets!"] },
      objective: "Reach Precinct & Escape 2-Star Police", tx: 1460, tz: 3080, time: 130, reward: 1200, xp: 220, mode: "evade", wantedReq: 2,
    },
    {
      id: "story_7", order: 7, track: "story", category: "Story Mode", unlockReqId: "story_6",
      title: "07 · Dockyard Trouble",
      intro: "Armed thugs hijacked Tariq's freight near the South Docks. Clear them out!",
      dialogue: { speaker: "Tariq (Contact)", lines: ["Grab a weapon at Tactical Shop if you need firepower—watch the crossfire."] },
      objective: "Defeat 4 Dockyard Raiders", tx: 750, tz: 2900, time: 140, reward: 1300, xp: 240, mode: "combat", enemyCount: 4,
    },
    {
      id: "story_8", order: 8, track: "story", category: "Story Mode", unlockReqId: "story_7",
      title: "08 · Medical Evacuation",
      intro: "A friendly courier was injured during the dock fight. Rush them from the Beach to City Hospital.",
      dialogue: { speaker: "Paramedic Dispatch", lines: ["Every second counts—get them to Central Hospital before time expires!"] },
      objective: "Pickup at Beach -> Central Hospital", tx: 4380, tz: 1480, time: 105, reward: 1350, xp: 250, mode: "race",
      checkpoints: [{ x: 4380, z: 1480 }, { x: 2280, z: 2320 }],
    },
    {
      id: "story_9", order: 9, track: "story", category: "Story Mode", unlockReqId: "story_8",
      title: "09 · Recovered Thunder V8",
      intro: "Rival guards locked a stolen Thunder V8 in the Midtown lot. Neutralize the guards!",
      dialogue: { speaker: "Tariq (Contact)", lines: ["Clear the lot so we can haul that V8 back to our garage."] },
      objective: "Defeat 4 Lot Guards", tx: 1460, tz: 2920, time: 130, reward: 1450, xp: 270, mode: "combat", enemyCount: 4,
    },
    {
      id: "story_10", order: 10, track: "story", category: "Story Mode", unlockReqId: "story_9",
      title: "10 · Coastal Boulevard Sprint",
      intro: "Run the beachfront circuit to draw rival scouts out of hiding.",
      dialogue: { speaker: "Raza (Racer)", lines: ["Full throttle down the coastal highway—don't miss a gate!"] },
      objective: "Finish 3 Coastal Checkpoints", tx: 4220, tz: 2700, time: 85, reward: 1500, xp: 280, mode: "race",
      checkpoints: [{ x: 4220, z: 1100 }, { x: 4220, z: 1900 }, { x: 4220, z: 3200 }],
    },
    {
      id: "story_11", order: 11, track: "story", category: "Story Mode", unlockReqId: "story_10",
      title: "11 · Gang Conflict: Alleyway",
      intro: "The Red Crescent gang ambushed our contacts behind the Commercial Plaza.",
      dialogue: { speaker: "Elena (Broker)", lines: ["Use cover behind buildings and neutralize every shooter!"] },
      objective: "Defeat 5 Gang Enforcers", tx: 1500, tz: 1500, time: 150, reward: 1650, xp: 300, mode: "combat", enemyCount: 5,
    },
    {
      id: "story_12", order: 12, track: "story", category: "Story Mode", unlockReqId: "story_11",
      title: "12 · Highway Lockdown",
      intro: "Police roadblocks have sealed the West Expressway. Break out of a 3-star pursuit!",
      dialogue: { speaker: "Tariq (Contact)", lines: ["Watch out for roadblocks at intersections—hide out of sight until heat drops!"] },
      objective: "Escape 3-Star Police Lockdown", tx: 320, tz: 2700, time: 150, reward: 1800, xp: 320, mode: "evade", wantedReq: 3,
    },
    {
      id: "story_13", order: 13, track: "story", category: "Story Mode", unlockReqId: "story_12",
      title: "13 · Marina Boat Intercept",
      intro: "Launch a speedboat from the Marina and collect floating intel buoys offshore.",
      dialogue: { speaker: "Elena (Broker)", lines: ["Grab a boat at the pier and sweep all three ocean coordinates!"] },
      objective: "Hit 3 Offshore Marine Coordinates", tx: 4720, tz: 2800, time: 120, reward: 1850, xp: 330, mode: "race",
      checkpoints: [{ x: 4720, z: 1200 }, { x: 4780, z: 2000 }, { x: 4720, z: 2800 }],
    },
    {
      id: "story_14", order: 14, track: "story", category: "Story Mode", unlockReqId: "story_13",
      title: "14 · Bridge Defense",
      intro: "Armed militants are holding the Grand Canal Bridge. Clear the crossing!",
      dialogue: { speaker: "Tariq (Contact)", lines: ["If they blow that bridge, we lose access to the airport!"] },
      objective: "Eliminate 5 Bridge Guards", tx: 3650, tz: 4420, time: 140, reward: 1950, xp: 350, mode: "combat", enemyCount: 5,
    },
    {
      id: "story_15", order: 15, track: "story", category: "Story Mode", unlockReqId: "story_14",
      title: "15 · Armored Bank Escort",
      intro: "Move the syndicate vault truck safely from Financial Core to Harbour HQ.",
      dialogue: { speaker: "Elena (Broker)", lines: ["Keep vehicle damage minimal all the way to the waterfront!"] },
      objective: "Reach Harbour HQ (>50% Vehicle HP)", tx: 3860, tz: 2980, time: 115, reward: 2050, xp: 360, mode: "nodamage",
    },
    {
      id: "story_16", order: 16, track: "story", category: "Story Mode", unlockReqId: "story_15",
      title: "16 · Midtown Last Stand",
      intro: "Hold Central Park Plaza against relentless gang waves for 50 seconds!",
      dialogue: { speaker: "Tariq (Contact)", lines: ["Stay in the plaza, watch your health, and survive until backup arrives!"] },
      objective: "Survive 50s at Central Park", tx: 2300, tz: 1500, time: 50, reward: 2200, xp: 390, mode: "survival", enemyCount: 5,
    },
    {
      id: "story_17", order: 17, track: "story", category: "Story Mode", unlockReqId: "story_16",
      title: "17 · Repo South Highway",
      intro: "Recover the cartel's armored SUV on South Ring Highway and bring it to Apex Garage.",
      dialogue: { speaker: "Raza (Racer)", lines: ["Grab it on the South Expressway and bring it straight home."] },
      objective: "South Expressway -> Auto Garage", tx: 1900, tz: 4420, time: 125, reward: 2350, xp: 410, mode: "race",
      checkpoints: [{ x: 1900, z: 4420 }, { x: 880, z: 1540 }],
    },
    {
      id: "story_18", order: 18, track: "story", category: "Story Mode", unlockReqId: "story_17",
      title: "18 · Airport Tarmac Assault",
      intro: "Cross the bridge into International Airport and neutralize the cartel security squad.",
      dialogue: { speaker: "Elena (Broker)", lines: ["Their private jet is fueling—clear the tarmac guards now!"] },
      objective: "Eliminate 6 Airport Guards", tx: 4520, tz: 4550, time: 175, reward: 2600, xp: 450, mode: "combat", enemyCount: 6,
    },
    {
      id: "story_19", order: 19, track: "story", category: "Story Mode", unlockReqId: "story_18",
      title: "19 · Chopper Pursuit Escape",
      intro: "Citywide 4-star alert! Police helicopters are tracking your heat signature.",
      dialogue: { speaker: "Tariq (Contact)", lines: ["Speed through tunnels and highways until the chopper loses your trail!"] },
      objective: "Escape 4-Star Chopper Pursuit", tx: 4360, tz: 4140, time: 180, reward: 2900, xp: 500, mode: "evade", wantedReq: 4,
    },
    {
      id: "story_20", order: 20, track: "story", category: "Story Mode", unlockReqId: "story_19",
      title: "20 · Final City Challenge",
      intro: "The ultimate citywide gauntlet: race from the Airport Runway across the Grand Bridge to Financial Core!",
      dialogue: { speaker: "Elena & Tariq", lines: ["This is it—claim the crown of the city in one final cross-metropolis run!"] },
      objective: "Airport -> Bridge -> Park -> Financial Core", tx: 4880, tz: 4720, time: 135, reward: 5000, xp: 900, mode: "race",
      checkpoints: [{ x: 4880, z: 4720 }, { x: 3840, z: 4420 }, { x: 2300, z: 1500 }, { x: 2300, z: 750 }],
    },
  ];

  // Mode B: Free Mission Mode — 18 Open-Access Missions Across All 9 Requested Categories
  const FREE_CATALOG = [
    // 1. Racing
    { id: "free_race_1", track: "free", category: "Racing", title: "Midnight Grid GP", intro: "High-speed downtown circuit through commercial blocks.", objective: "Hit All 3 Race Gates", tx: 1900, tz: 1100, time: 80, reward: 950, xp: 180, mode: "race", checkpoints: [{ x: 1900, z: 1100 }, { x: 2700, z: 1100 }, { x: 2700, z: 1900 }] },
    { id: "free_race_2", track: "free", category: "Racing", title: "Runway Drag Masters", intro: "Full-throttle drag sprint across the airport runway.", objective: "Clear 3 Runway Gates", tx: 4120, tz: 4720, time: 85, reward: 1250, xp: 220, mode: "race", checkpoints: [{ x: 4120, z: 4720 }, { x: 4520, z: 4720 }, { x: 4920, z: 4720 }] },

    // 2. Driving Challenges
    { id: "free_drive_1", track: "free", category: "Driving Challenges", title: "Slalom City Trial", intro: "Thread through 4 tight intersections without running out of time.", objective: "Clear 4 Slalom Checkpoints", tx: 1100, tz: 1100, time: 95, reward: 900, xp: 170, mode: "race", checkpoints: [{ x: 1100, z: 1100 }, { x: 1900, z: 1900 }, { x: 2700, z: 1900 }, { x: 2700, z: 2700 }] },
    { id: "free_drive_2", track: "free", category: "Driving Challenges", title: "Zero-Scratch Chauffeur", intro: "Arrive at Velvet Bistro with minimal vehicle damage.", objective: "Arrive with >50% Integrity", tx: 890, tz: 1990, time: 90, reward: 1050, xp: 200, mode: "nodamage" },

    // 3. Delivery
    { id: "free_deliv_1", track: "free", category: "Delivery", title: "Superbike Express", intro: "Rush a VIP parcel to the Coastal Marina.", objective: "Deliver to Boat Marina", tx: 4480, tz: 1900, time: 85, reward: 850, xp: 160, mode: "goto" },
    { id: "free_deliv_2", track: "free", category: "Delivery", title: "Airport Cargo Haul", intro: "Heavy freight delivery to the Airport Hangar.", objective: "Reach Airport Hangar", tx: 4360, tz: 4140, time: 110, reward: 1200, xp: 210, mode: "goto" },

    // 4. Police Chase
    { id: "free_chase_1", track: "free", category: "Police Chase", title: "Two-Star Breakout", intro: "Trigger a 2-star patrol pursuit and break line of sight.", objective: "Evade 2-Star Pursuit", tx: 1900, tz: 1900, time: 110, reward: 800, xp: 160, mode: "evade", wantedReq: 2 },
    { id: "free_chase_2", track: "free", category: "Police Chase", title: "Five-Star Chaos", intro: "Survive a citywide 5-star alert with choppers and roadblocks!", objective: "Evade 5-Star Lockdown", tx: 2700, tz: 2700, time: 200, reward: 2600, xp: 450, mode: "evade", wantedReq: 5 },

    // 5. Rescue
    { id: "free_rescue_1", track: "free", category: "Rescue", title: "Beach Lifeguard Dash", intro: "Pick up a stranded swimmer on the coast and rush to Medical Center.", objective: "Beach -> Bayview Medical", tx: 4460, tz: 1480, time: 95, reward: 900, xp: 175, mode: "race", checkpoints: [{ x: 4460, z: 1480 }, { x: 3860, z: 1480 }] },
    { id: "free_rescue_2", track: "free", category: "Rescue", title: "Runway Emergency Evac", intro: "Rescue stranded crew from the runway to Central Hospital.", objective: "Runway -> Central Hospital", tx: 4650, tz: 4720, time: 125, reward: 1250, xp: 230, mode: "race", checkpoints: [{ x: 4650, z: 4720 }, { x: 2280, z: 2320 }] },

    // 6. Exploration
    { id: "free_explore_1", track: "free", category: "Exploration", title: "City Landmarks Tour", intro: "Visit the Commercial Market, Central Park, and Coastal Boardwalk.", objective: "Tour 3 City Landmarks", tx: 1520, tz: 1960, time: 140, reward: 850, xp: 180, mode: "race", checkpoints: [{ x: 1520, z: 1960 }, { x: 2300, z: 1500 }, { x: 4100, z: 1805 }] },
    { id: "free_explore_2", track: "free", category: "Exploration", title: "Skyline Heli Recon", intro: "Fly or drive to inspect the Financial Rooftop Pad and Airport Terminal.", objective: "Survey 2 Major Hubs", tx: 2300, tz: 750, time: 130, reward: 1150, xp: 220, mode: "race", checkpoints: [{ x: 2300, z: 750 }, { x: 4360, z: 4140 }] },

    // 7. Survival
    { id: "free_surv_1", track: "free", category: "Survival", title: "Docks Arena Holdout", intro: "Survive 45 seconds against armed dock raiders!", objective: "Survive 45s in Docks", tx: 760, tz: 3100, time: 45, reward: 1300, xp: 250, mode: "survival", enemyCount: 4 },
    { id: "free_surv_2", track: "free", category: "Survival", title: "Industrial Siege", intro: "Outlast waves of syndicate fighters for 55 seconds!", objective: "Survive 55s at Industrial Yard", tx: 740, tz: 1620, time: 55, reward: 1600, xp: 300, mode: "survival", enemyCount: 5 },

    // 8. Combat
    { id: "free_combat_1", track: "free", category: "Combat", title: "Market Turf Cleanse", intro: "Clear out 4 armed gangsters shaking down shopkeepers.", objective: "Defeat 4 Hostiles", tx: 1520, tz: 1960, time: 130, reward: 1100, xp: 210, mode: "combat", enemyCount: 4 },
    { id: "free_combat_2", track: "free", category: "Combat", title: "Freight Yard Raid", intro: "Take down 6 heavy cartel enforcers at the West Freight Yard.", objective: "Defeat 6 Cartel Units", tx: 740, tz: 1620, time: 165, reward: 1750, xp: 330, mode: "combat", enemyCount: 6 },

    // 9. Time Challenges
    { id: "free_time_1", track: "free", category: "Time Challenges", title: "Cross-Town Blitz", intro: "Sprint from anywhere to Harbour Police HQ under 75 seconds.", objective: "Reach Harbour HQ in 75s", tx: 3860, tz: 2980, time: 75, reward: 950, xp: 185, mode: "goto" },
    { id: "free_time_2", track: "free", category: "Time Challenges", title: "Grand Bridge Dash", intro: "Speed across the Grand Canal Bridge to the Airport Hangar in 80 seconds.", objective: "Airport Hangar in 80s", tx: 4360, tz: 4140, time: 80, reward: 1200, xp: 230, mode: "goto" },
  ];

  let customMissions = [];
  let active = null;
  let completedIds = new Set();
  let lastFailed = null;
  let lastMissionId = null;
  let pendingRewards = []; // [{ id, title, reward, xp }]
  let rewardMultiplier = 1.0;
  let disabledMissionIds = new Set();
  let missionOverrides = {};
  let globalDifficulty = "normal";
  let enabledModes = new Set(["story", "free", "freeroam"]);

  function applyOverride(def) {
    const ov = missionOverrides[def.id];
    if (!ov) return def;
    return {
      ...def,
      title: ov.title || def.title,
      intro: ov.description || def.intro,
      objective: ov.objective || def.objective,
      reward: typeof ov.reward === "number" ? ov.reward : def.reward,
      xp: typeof ov.xp === "number" ? ov.xp : def.xp,
      time: typeof ov.time === "number" ? ov.time : def.time,
      difficulty: ov.difficulty || def.difficulty,
      tx: typeof ov.tx === "number" && ov.tx > 0 ? ov.tx : def.tx,
      tz: typeof ov.tz === "number" && ov.tz > 0 ? ov.tz : def.tz,
    };
  }

  function getAllCatalog() {
    return [...STORY_CATALOG, ...FREE_CATALOG, ...customMissions]
      .filter((m) => !disabledMissionIds.has(m.id))
      .map(applyOverride);
  }

  function isMissionUnlocked(def) {
    if (!def) return false;
    if (disabledMissionIds.has(def.id)) return false;
    if (def.track !== "story" || !def.unlockReqId) return true;
    return completedIds.has(def.unlockReqId) || disabledMissionIds.has(def.unlockReqId);
  }

  function getUnlockedStoryIds() {
    return STORY_CATALOG.filter((m) => isMissionUnlocked(m)).map((m) => m.id);
  }

  function startMission(missionId, World, Entities, CityMap, showToast) {
    const def = getAllCatalog().find((m) => m.id === missionId);
    if (!def) {
      if (showToast) showToast("MISSION DISABLED BY OWNER");
      return null;
    }
    if ((def.track === "story" && !enabledModes.has("story")) || (def.track === "free" && !enabledModes.has("free"))) {
      if (showToast) showToast(`${def.track.toUpperCase()} MODE DISABLED BY OWNER`);
      return null;
    }
    if (!isMissionUnlocked(def)) {
      if (showToast) showToast("COMPLETE PREVIOUS STORY MISSION FIRST");
      return null;
    }

    lastFailed = null;
    lastMissionId = missionId;

    // If custom mission has explicit start location, relocate player cleanly to start
    if (def.track === "custom" && typeof def.startX === "number" && typeof def.startZ === "number" && def.startX > 0) {
      Entities.player.vehicle = null;
      Entities.player.x = def.startX;
      Entities.player.z = def.startZ;
    }

    const firstTarget = def.checkpoints && def.checkpoints.length > 0 ? def.checkpoints[0] : { x: def.tx, z: def.tz };
    const diffTimeScale = globalDifficulty === "hard" ? 0.82 : globalDifficulty === "extreme" ? 0.72 : globalDifficulty === "easy" ? 1.25 : 1.0;
    const rawTime = def.time > 0 ? Math.max(15, Math.round(def.time * diffTimeScale)) : 0;

    active = {
      ...def,
      tx: firstTarget.x,
      tz: firstTarget.z,
      cpIdx: 0,
      remaining: rawTime > 0 ? rawTime : 9999,
      hasTimer: rawTime > 0,
      enemiesSpawned: false,
      route: CityMap.computeRoadRoute(World, Entities.player.x, Entities.player.z, firstTarget.x, firstTarget.z),
    };

    if (def.mode === "evade") {
      Entities.addWanted(def.wantedReq || 2, showToast);
      active.evadeArmed = true;
    }

    if (def.mode === "combat" || def.mode === "survival") {
      Entities.spawnMissionEnemies(def.tx, def.tz, def.enemyCount || 4);
      active.enemiesSpawned = true;
    }

    showToast(`MISSION: ${def.title.toUpperCase()}`);
    return active;
  }

  function failMission(reason, onFailed) {
    if (!active) return;
    lastFailed = { mission: active, reason };
    const failedRef = active;
    active = null;
    if (onFailed) onFailed(failedRef, reason);
  }

  function update(dt, World, Entities, CityMap, Audio, showToast, onComplete, onFailed) {
    if (!active) return;
    const p = Entities.player;

    if (active.hasTimer) {
      active.remaining -= dt;
      if (active.remaining <= 0) {
        if (active.mode === "survival") {
          completeCurrent(Entities, Audio, showToast, onComplete);
          return;
        }
        failMission("Time ran out before completing the objective.", onFailed);
        return;
      }
    }

    if (active.mode === "nodamage" && p.vehicle && p.vehicle.hp < 50) {
      failMission("Vehicle took too much damage!", onFailed);
      return;
    }

    if (active.mode === "evade") {
      if (p.wanted === 0 && active.evadeArmed) {
        completeCurrent(Entities, Audio, showToast, onComplete);
      }
      return;
    }

    if (active.mode === "combat") {
      const alive = Entities.getAliveEnemyCount();
      if (active.enemiesSpawned && alive === 0) {
        completeCurrent(Entities, Audio, showToast, onComplete);
      }
      return;
    }

    if (active.mode === "survival") {
      const dist = Math.hypot(active.tx - p.x, active.tz - p.z);
      if (dist > 320) showToast("STAY NEAR THE SURVIVAL ZONE!");
      return;
    }

    const dist = Math.hypot(active.tx - p.x, active.tz - p.z);
    if (dist < 68) {
      if (active.checkpoints && active.cpIdx < active.checkpoints.length - 1) {
        active.cpIdx++;
        const nxt = active.checkpoints[active.cpIdx];
        active.tx = nxt.x;
        active.tz = nxt.z;
        active.route = CityMap.computeRoadRoute(World, p.x, p.z, nxt.x, nxt.z);
        Audio.playCash();
        showToast(`CHECKPOINT ${active.cpIdx}/${active.checkpoints.length}`);
      } else {
        completeCurrent(Entities, Audio, showToast, onComplete);
      }
    }
  }

  function completeCurrent(Entities, Audio, showToast, onComplete) {
    if (!active) return;
    const finished = active;
    completedIds.add(finished.id);
    const finalReward = Math.round(finished.reward * rewardMultiplier);
    const pendingItem = {
      id: finished.id,
      title: finished.title,
      reward: finalReward,
      xp: finished.xp,
    };
    if (!pendingRewards.some((r) => r.id === finished.id)) {
      pendingRewards.push(pendingItem);
    }
    Entities.clearMissionEnemies();
    Audio.playCash();
    showToast(`MISSION COMPLETE · CLAIM $${finalReward}`);
    active = null;
    if (onComplete) onComplete(finished, pendingItem);
  }

  function claimReward(missionId, Entities, Audio, showToast) {
    const idx = pendingRewards.findIndex((r) => r.id === missionId);
    if (idx === -1) return null;
    const item = pendingRewards.splice(idx, 1)[0];
    Entities.player.cash += item.reward;
    Entities.player.xp += item.xp;
    Audio.playCash();
    if (showToast) showToast(`REWARD CLAIMED: +$${item.reward.toLocaleString()} (+${item.xp} XP)`);
    return item;
  }

  function upsertCustomMission(m) {
    const clean = {
      id: m.id || "custom_" + Date.now(),
      track: "custom",
      category: "Custom (" + (m.difficulty || "Normal") + ")",
      title: m.title || "Custom Mission",
      intro: m.description || m.intro || "Owner custom contract.",
      dialogue: { speaker: "City Owner", lines: [m.description || "Complete the objective to earn your reward."] },
      objective: m.objective || "Reach Destination",
      startX: typeof m.startX === "number" ? m.startX : null,
      startZ: typeof m.startZ === "number" ? m.startZ : null,
      tx: typeof m.tx === "number" ? m.tx : 2300,
      tz: typeof m.tz === "number" ? m.tz : 1500,
      time: typeof m.time === "number" ? m.time : 90,
      reward: typeof m.reward === "number" ? m.reward : 1000,
      xp: typeof m.xp === "number" ? m.xp : 200,
      difficulty: m.difficulty || "Normal",
      mode: m.mode || "goto",
      enemyCount: m.difficulty === "Extreme" ? 6 : m.difficulty === "Hard" ? 5 : 4,
    };
    const idx = customMissions.findIndex((x) => x.id === clean.id);
    if (idx >= 0) customMissions[idx] = clean;
    else customMissions.push(clean);
    return clean;
  }

  function deleteCustomMission(id) {
    customMissions = customMissions.filter((m) => m.id !== id);
  }

  function setAdminConfig(disabledIds, overridesMap, difficulty, modes) {
    disabledMissionIds = new Set(Array.isArray(disabledIds) ? disabledIds : []);
    missionOverrides = overridesMap && typeof overridesMap === "object" ? { ...overridesMap } : {};
    globalDifficulty = difficulty || "normal";
    enabledModes =
      Array.isArray(modes) && modes.length > 0
        ? new Set(modes)
        : new Set(["story", "free", "freeroam"]);
  }

  return {
    getStoryCatalog: () => STORY_CATALOG,
    getFreeCatalog: () => FREE_CATALOG,
    getRawCatalog: () => [...STORY_CATALOG, ...FREE_CATALOG, ...customMissions],
    getCustomMissions: () => customMissions,
    setCustomMissions: (list) => {
      customMissions = Array.isArray(list) ? list : [];
    },
    upsertCustomMission,
    deleteCustomMission,
    getCatalog: getAllCatalog,
    isMissionUnlocked,
    getUnlockedStoryIds,
    setAdminConfig,
    getCompletedIds: () => Array.from(completedIds),
    setCompletedIds: (list) => { completedIds = new Set(Array.isArray(list) ? list : []); },
    getPendingRewards: () => pendingRewards,
    setPendingRewards: (list) => { pendingRewards = Array.isArray(list) ? list : []; },
    claimReward,
    setRewardMultiplier: (mult) => { rewardMultiplier = Math.max(0.5, Math.min(3.0, Number(mult) || 1.0)); },
    getRewardMultiplier: () => rewardMultiplier,
    getActive: () => active,
    getLastFailed: () => lastFailed,
    getLastMissionId: () => (active ? active.id : lastMissionId),
    abortActive: (Entities) => {
      active = null;
      Entities.clearMissionEnemies();
    },
    startMission,
    failMission,
    update,
  };
})();
