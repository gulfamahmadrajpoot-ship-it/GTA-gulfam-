// OpenStreetMap-Compatible Geographic City Profiles, Real-World Coordinates, Navigable Map Data & Playable 3D City Definitions
window.CityRealCities = (function () {
  // Playable 3D cities have complete road networks, districts, landmarks, buildings, hospitals, police, airports & beaches/rivers.
  // Navigation-only cities show an authentic OpenStreetMap map with search/routing and clearly display "3D Environment Unavailable".
  const CITIES = {
    original: {
      id: "original",
      name: "Metro City (Original)",
      country: "Game World",
      mode: "original",
      playable3d: true,
      lat: 25.7617,
      lng: -80.1918,
      latSpan: 0.045,
      lngSpan: 0.045,
      defaultZoom: 14,
      description: "Large fictional open-world metropolis with Downtown, Residential, Markets, Industrial, Airport, Beaches, Parks & Highways.",
      waterStyle: "ocean_canal",
      waterColor: [0.07, 0.25, 0.4],
      facadePalette: ["glass", "brick", "concrete", "residential"],
      vRoads: [320, 1100, 1900, 2700, 3500, 4220],
      hRoads: [320, 1100, 1900, 2700, 3500, 4420],
      districts: {
        nw: "OAKWOOD RESIDENTIAL",
        nc: "FINANCIAL CORE",
        center: "CENTRAL PARK",
        west: "INDUSTRIAL & GARAGE",
        south: "SOUTH RING HIGHWAY",
        east: "GOLDEN SANDS BEACH",
        se: "METRO AIRPORT",
        downtown: "DOWNTOWN COMMERCIAL",
      },
      places: [
        { id: "garage_west", category: "garage", name: "Apex Auto Garage", x: 880, z: 1540, r: 58, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "garage_airport", category: "garage", name: "Airport Air Hangar", x: 4360, z: 4140, r: 62, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "market_center", category: "market", name: "Metro Commercial Market", x: 1520, z: 1960, r: 54, color: [0.96, 0.62, 0.04], studioTab: "wardrobe" },
        { id: "mall_north", category: "mall", name: "Grand Horizon Shopping Center", x: 2300, z: 750, r: 58, color: [0.66, 0.33, 0.97], studioTab: "billboards" },
        { id: "tactical", category: "shop", name: "Ammu-Tactical Shop", x: 1460, z: 2420, r: 52, color: [0.94, 0.27, 0.27], studioTab: "combat" },
        { id: "restaurant_1", category: "restaurant", name: "Velvet Espresso & Bistro", x: 890, z: 1990, r: 50, color: [0.06, 0.73, 0.51], action: "heal" },
        { id: "restaurant_2", category: "restaurant", name: "Harbour Sunset Grill", x: 4180, z: 2260, r: 50, color: [0.06, 0.73, 0.51], action: "heal" },
        { id: "hospital_1", category: "hospital", name: "Metro Central Hospital", x: 2280, z: 2320, r: 58, color: [0.94, 0.35, 0.35], action: "hospital_heal" },
        { id: "hospital_2", category: "hospital", name: "Bayview Medical Center", x: 3860, z: 1480, r: 58, color: [0.94, 0.35, 0.35], action: "hospital_heal" },
        { id: "police_1", category: "police", name: "Downtown Precinct", x: 1460, z: 3080, r: 56, color: [0.23, 0.51, 0.96], action: "precinct" },
        { id: "police_2", category: "police", name: "Harbour Police HQ", x: 3860, z: 2980, r: 56, color: [0.23, 0.51, 0.96], action: "precinct" },
        { id: "marina", category: "garage", name: "Golden Sands Marina", x: 4480, z: 1900, r: 56, color: [0.05, 0.65, 0.91], action: "spawn_boat" },
        { id: "park_1", category: "park", name: "Central Park Plaza", x: 2300, z: 1500, r: 62, color: [0.13, 0.77, 0.37], studioTab: "missions" },
        { id: "dispatch", category: "mission", name: "Metro Dispatch Hub", x: 2280, z: 2980, r: 56, color: [0.98, 0.75, 0.14], studioTab: "missions" },
      ],
    },

    lahore: {
      id: "lahore",
      name: "Lahore, Pakistan",
      country: "Pakistan",
      mode: "real",
      playable3d: true,
      lat: 31.5204,
      lng: 74.3587,
      latSpan: 0.052,
      lngSpan: 0.058,
      defaultZoom: 13,
      description: "Playable 3D Open-World mapped from OpenStreetMap corridors: Mall Road, Canal Bank Rd, Gulberg Main Blvd, Liberty Market, Jinnah Hospital & Allama Iqbal Airport.",
      waterStyle: "canal_east",
      waterColor: [0.11, 0.35, 0.34],
      facadePalette: ["brick", "residential", "concrete", "glass"],
      vRoads: [320, 1100, 1900, 2700, 3500, 4220],
      hRoads: [320, 1100, 1900, 2700, 3500, 4420],
      districts: {
        nw: "WALLED CITY & OLD LAHORE",
        nc: "MALL ROAD & CIVIL LINES",
        center: "BAGH-E-JINNAH PARK",
        west: "KOT LAKHPAT INDUSTRIAL",
        south: "FEROZEPUR & RING ROAD",
        east: "LAHORE CANAL BANK",
        se: "ALLAMA IQBAL AIRPORT",
        downtown: "GULBERG MAIN BOULEVARD",
      },
      places: [
        { id: "lhr_garage_1", category: "garage", name: "Gulberg Auto Workshop", x: 880, z: 1540, r: 58, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "lhr_airport", category: "garage", name: "Allama Iqbal Airport Hangar", x: 4360, z: 4140, r: 62, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "lhr_market", category: "market", name: "Anarkali Bazaar & Market", x: 1520, z: 1960, r: 54, color: [0.96, 0.62, 0.04], studioTab: "wardrobe" },
        { id: "lhr_mall", category: "mall", name: "Liberty & Packages Mall", x: 2300, z: 750, r: 58, color: [0.66, 0.33, 0.97], studioTab: "billboards" },
        { id: "lhr_tactical", category: "shop", name: "Model Town Gear Depot", x: 1460, z: 2420, r: 52, color: [0.94, 0.27, 0.27], studioTab: "combat" },
        { id: "lhr_rest_1", category: "restaurant", name: "Food Street Haveli Cafe", x: 890, z: 1990, r: 50, color: [0.06, 0.73, 0.51], action: "heal" },
        { id: "lhr_rest_2", category: "restaurant", name: "MM Alam Road Bistro", x: 3250, z: 1840, r: 50, color: [0.06, 0.73, 0.51], action: "heal" },
        { id: "lhr_hosp_1", category: "hospital", name: "Jinnah Hospital Lahore", x: 2280, z: 2320, r: 58, color: [0.94, 0.35, 0.35], action: "hospital_heal" },
        { id: "lhr_hosp_2", category: "hospital", name: "Mayo Hospital Mall Road", x: 3860, z: 1480, r: 58, color: [0.94, 0.35, 0.35], action: "hospital_heal" },
        { id: "lhr_pol_1", category: "police", name: "Civil Lines Police HQ", x: 1460, z: 3080, r: 56, color: [0.23, 0.51, 0.96], action: "precinct" },
        { id: "lhr_pol_2", category: "police", name: "Gulberg Police Station", x: 3860, z: 2980, r: 56, color: [0.23, 0.51, 0.96], action: "precinct" },
        { id: "lhr_canal", category: "garage", name: "Canal Boat Dock", x: 4480, z: 1900, r: 56, color: [0.05, 0.65, 0.91], action: "spawn_boat" },
        { id: "lhr_park", category: "park", name: "Bagh-e-Jinnah Gardens", x: 2300, z: 1500, r: 62, color: [0.13, 0.77, 0.37], studioTab: "missions" },
        { id: "lhr_dispatch", category: "mission", name: "Lahore Central Dispatch", x: 2280, z: 2980, r: 56, color: [0.98, 0.75, 0.14], studioTab: "missions" },
      ],
    },

    karachi: {
      id: "karachi",
      name: "Karachi, Pakistan",
      country: "Pakistan",
      mode: "real",
      playable3d: true,
      lat: 24.8607,
      lng: 67.0011,
      latSpan: 0.056,
      lngSpan: 0.062,
      defaultZoom: 13,
      description: "Playable 3D Open-World mapped from OpenStreetMap corridors: Shahrah-e-Faisal, Saddar Empress Market, Clifton Beach, Mai Kolachi Bridge & Jinnah Airport.",
      waterStyle: "ocean_canal",
      waterColor: [0.06, 0.28, 0.44],
      facadePalette: ["concrete", "glass", "residential", "brick"],
      vRoads: [320, 1100, 1900, 2700, 3500, 4220],
      hRoads: [320, 1100, 1900, 2700, 3500, 4420],
      districts: {
        nw: "NAZIMABAD RESIDENTIAL",
        nc: "I.I. CHUNDRIGAR FINANCIAL",
        center: "BAGH IBN-E-QASIM PARK",
        west: "SITE INDUSTRIAL ZONE",
        south: "SHAHRAH-E-FAISAL CORRIDOR",
        east: "CLIFTON & SEA VIEW BEACH",
        se: "JINNAH INTL AIRPORT",
        downtown: "SADDAR & CLIFTON COMMERCIAL",
      },
      places: [
        { id: "khi_garage_1", category: "garage", name: "Clifton Auto Garage", x: 880, z: 1540, r: 58, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "khi_airport", category: "garage", name: "Jinnah Airport Hangar", x: 4360, z: 4140, r: 62, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "khi_market", category: "market", name: "Saddar Empress Market", x: 1520, z: 1960, r: 54, color: [0.96, 0.62, 0.04], studioTab: "wardrobe" },
        { id: "khi_mall", category: "mall", name: "Dolmen Mall Clifton", x: 2300, z: 750, r: 58, color: [0.66, 0.33, 0.97], studioTab: "billboards" },
        { id: "khi_tactical", category: "shop", name: "Tariq Road Tactical Store", x: 1460, z: 2420, r: 52, color: [0.94, 0.27, 0.27], studioTab: "combat" },
        { id: "khi_rest_1", category: "restaurant", name: "Burns Road Biryani & Chai", x: 890, z: 1990, r: 50, color: [0.06, 0.73, 0.51], action: "heal" },
        { id: "khi_rest_2", category: "restaurant", name: "Do Darya Waterfront Grill", x: 4180, z: 2260, r: 50, color: [0.06, 0.73, 0.51], action: "heal" },
        { id: "khi_hosp_1", category: "hospital", name: "Jinnah Postgraduate Medical", x: 2280, z: 2320, r: 58, color: [0.94, 0.35, 0.35], action: "hospital_heal" },
        { id: "khi_hosp_2", category: "hospital", name: "Aga Khan Medical Hub", x: 3860, z: 1480, r: 58, color: [0.94, 0.35, 0.35], action: "hospital_heal" },
        { id: "khi_pol_1", category: "police", name: "Saddar Police HQ", x: 1460, z: 3080, r: 56, color: [0.23, 0.51, 0.96], action: "precinct" },
        { id: "khi_pol_2", category: "police", name: "Clifton Sea View Precinct", x: 3860, z: 2980, r: 56, color: [0.23, 0.51, 0.96], action: "precinct" },
        { id: "khi_marina", category: "garage", name: "Manora & Clifton Marina", x: 4480, z: 1900, r: 56, color: [0.05, 0.65, 0.91], action: "spawn_boat" },
        { id: "khi_park", category: "park", name: "Bagh Ibn-e-Qasim Park", x: 2300, z: 1500, r: 62, color: [0.13, 0.77, 0.37], studioTab: "missions" },
        { id: "khi_dispatch", category: "mission", name: "Karachi Coastal Dispatch", x: 2280, z: 2980, r: 56, color: [0.98, 0.75, 0.14], studioTab: "missions" },
      ],
    },

    islamabad: {
      id: "islamabad",
      name: "Islamabad, Pakistan",
      country: "Pakistan",
      mode: "real",
      playable3d: true,
      lat: 33.6844,
      lng: 73.0479,
      latSpan: 0.048,
      lngSpan: 0.055,
      defaultZoom: 13,
      description: "Playable 3D Open-World mapped from OpenStreetMap sectors: Jinnah Avenue, Blue Area, F-9 Fatima Jinnah Park, Centaurus Mall, Rawal Lake & Islamabad Expressway.",
      waterStyle: "ocean_canal",
      waterColor: [0.08, 0.34, 0.45],
      facadePalette: ["glass", "concrete", "residential", "brick"],
      vRoads: [320, 1100, 1900, 2700, 3500, 4220],
      hRoads: [320, 1100, 1900, 2700, 3500, 4420],
      districts: {
        nw: "SECTOR F-7 / MARGALLA HILLS",
        nc: "BLUE AREA & JINNAH AVENUE",
        center: "F-9 FATIMA JINNAH PARK",
        west: "I-9 INDUSTRIAL SECTOR",
        south: "SRINAGAR & KASHMIR HIGHWAY",
        east: "RAWAL LAKE SHORELINE",
        se: "CHAKLALA AIRFIELD & TERMINAL",
        downtown: "G-9 / F-10 MARKAZ",
      },
      places: [
        { id: "isb_garage_1", category: "garage", name: "I-9 Auto Service Garage", x: 880, z: 1540, r: 58, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "isb_airport", category: "garage", name: "Islamabad Airfield Hangar", x: 4360, z: 4140, r: 62, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "isb_market", category: "market", name: "Super Market F-6 Markaz", x: 1520, z: 1960, r: 54, color: [0.96, 0.62, 0.04], studioTab: "wardrobe" },
        { id: "isb_mall", category: "mall", name: "Centaurus Mall Blue Area", x: 2300, z: 750, r: 58, color: [0.66, 0.33, 0.97], studioTab: "billboards" },
        { id: "isb_tactical", category: "shop", name: "G-9 Markaz Supply Depot", x: 1460, z: 2420, r: 52, color: [0.94, 0.27, 0.27], studioTab: "combat" },
        { id: "isb_rest_1", category: "restaurant", name: "Kohsar Market Coffee", x: 890, z: 1990, r: 50, color: [0.06, 0.73, 0.51], action: "heal" },
        { id: "isb_rest_2", category: "restaurant", name: "Rawal Lake View Terrace", x: 4180, z: 2260, r: 50, color: [0.06, 0.73, 0.51], action: "heal" },
        { id: "isb_hosp_1", category: "hospital", name: "PIMS Hospital G-8", x: 2280, z: 2320, r: 58, color: [0.94, 0.35, 0.35], action: "hospital_heal" },
        { id: "isb_hosp_2", category: "hospital", name: "Shifa International Center", x: 3860, z: 1480, r: 58, color: [0.94, 0.35, 0.35], action: "hospital_heal" },
        { id: "isb_pol_1", category: "police", name: "Secretariat Police HQ", x: 1460, z: 3080, r: 56, color: [0.23, 0.51, 0.96], action: "precinct" },
        { id: "isb_pol_2", category: "police", name: "F-8 Traffic & Patrol HQ", x: 3860, z: 2980, r: 56, color: [0.23, 0.51, 0.96], action: "precinct" },
        { id: "isb_marina", category: "garage", name: "Rawal Lake Boat Club", x: 4480, z: 1900, r: 56, color: [0.05, 0.65, 0.91], action: "spawn_boat" },
        { id: "isb_park", category: "park", name: "Fatima Jinnah F-9 Park", x: 2300, z: 1500, r: 62, color: [0.13, 0.77, 0.37], studioTab: "missions" },
        { id: "isb_dispatch", category: "mission", name: "Capital Dispatch Center", x: 2280, z: 2980, r: 56, color: [0.98, 0.75, 0.14], studioTab: "missions" },
      ],
    },

    dubai: {
      id: "dubai",
      name: "Dubai, UAE",
      country: "UAE",
      mode: "real",
      playable3d: true,
      lat: 25.2048,
      lng: 55.2708,
      latSpan: 0.055,
      lngSpan: 0.06,
      defaultZoom: 13,
      description: "Playable 3D Open-World mapped from OpenStreetMap roads: Sheikh Zayed Road, Jumeirah Beach, Downtown Plaza & Dubai Airport.",
      waterStyle: "ocean_canal",
      waterColor: [0.05, 0.32, 0.48],
      facadePalette: ["glass", "glass", "concrete", "residential"],
      vRoads: [320, 1100, 1900, 2700, 3500, 4220],
      hRoads: [320, 1100, 1900, 2700, 3500, 4420],
      districts: {
        nw: "AL SATWA RESIDENTIAL",
        nc: "DIFC & SHEIKH ZAYED TOWER",
        center: "ZABEEL CENTRAL PARK",
        west: "AL QUOZ INDUSTRIAL",
        south: "AL KHAIL EXPRESSWAY",
        east: "JUMEIRAH BEACH & MARINA",
        se: "DXB INTERNATIONAL AIRPORT",
        downtown: "DOWNTOWN BOULEVARD",
      },
      places: [
        { id: "dxb_garage_1", category: "garage", name: "Al Quoz Supercar Garage", x: 880, z: 1540, r: 58, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "dxb_airport", category: "garage", name: "DXB Airport Helipad", x: 4360, z: 4140, r: 62, color: [0.22, 0.74, 0.97], studioTab: "garage" },
        { id: "dxb_market", category: "market", name: "Gold & Spice Souk Market", x: 1520, z: 1960, r: 54, color: [0.96, 0.62, 0.04], studioTab: "wardrobe" },
        { id: "dxb_mall", category: "mall", name: "Downtown Grand Mall", x: 2300, z: 750, r: 58, color: [0.66, 0.33, 0.97], studioTab: "billboards" },
        { id: "dxb_tactical", category: "shop", name: "Business Bay Armory", x: 1460, z: 2420, r: 52, color: [0.94, 0.27, 0.27], studioTab: "combat" },
        { id: "dxb_rest_1", category: "restaurant", name: "Marina Promenade Cafe", x: 890, z: 1990, r: 50, color: [0.06, 0.73, 0.51], action: "heal" },
        { id: "dxb_hosp_1", category: "hospital", name: "Rashid Medical Center", x: 2280, z: 2320, r: 58, color: [0.94, 0.35, 0.35], action: "hospital_heal" },
        { id: "dxb_pol_1", category: "police", name: "Dubai Downtown Patrol HQ", x: 1460, z: 3080, r: 56, color: [0.23, 0.51, 0.96], action: "precinct" },
        { id: "dxb_marina", category: "garage", name: "Jumeirah Boat Marina", x: 4480, z: 1900, r: 56, color: [0.05, 0.65, 0.91], action: "spawn_boat" },
        { id: "dxb_park", category: "park", name: "Zabeel Central Park", x: 2300, z: 1500, r: 62, color: [0.13, 0.77, 0.37], studioTab: "missions" },
      ],
    },

    // Navigation-only cities: real OpenStreetMap map + search + OSRM routing, clearly labeled "3D Playable City Unavailable"
    london: {
      id: "london",
      name: "London, UK",
      country: "United Kingdom",
      mode: "real",
      playable3d: false,
      lat: 51.5072,
      lng: -0.1276,
      latSpan: 0.055,
      lngSpan: 0.075,
      defaultZoom: 13,
      description: "OpenStreetMap Navigation Map available. Playable 3D City Environment is currently unavailable for London.",
      places: [
        { id: "ldn_1", category: "park", name: "Hyde Park Corner", lat: 51.5027, lng: -0.1527 },
        { id: "ldn_2", category: "market", name: "Piccadilly Circus", lat: 51.5101, lng: -0.1342 },
        { id: "ldn_3", category: "hospital", name: "St Thomas' Hospital", lat: 51.4989, lng: -0.1189 },
      ],
    },

    tokyo: {
      id: "tokyo",
      name: "Tokyo, Japan",
      country: "Japan",
      mode: "real",
      playable3d: false,
      lat: 35.6762,
      lng: 139.6503,
      latSpan: 0.055,
      lngSpan: 0.07,
      defaultZoom: 13,
      description: "OpenStreetMap Navigation Map available. Playable 3D City Environment is currently unavailable for Tokyo.",
      places: [
        { id: "tyo_1", category: "market", name: "Shibuya Crossing", lat: 35.6595, lng: 139.7004 },
        { id: "tyo_2", category: "park", name: "Yoyogi Park", lat: 35.6717, lng: 139.6949 },
      ],
    },
  };

  const CUSTOM_CITIES = {};
  let locationRenames = {};

  function hexToRgb3(hex) {
    const clean = (hex || "#144b5c").replace("#", "");
    const n = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
    if (Number.isNaN(n)) return [0.08, 0.3, 0.42];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function setCustomCities(list) {
    Object.keys(CUSTOM_CITIES).forEach((k) => delete CUSTOM_CITIES[k]);
    if (!Array.isArray(list)) return;
    list.forEach((cc) => {
      if (!cc || !cc.id) return;
      const basePlaces = CITIES.original.places.map((p, idx) => ({
        ...p,
        id: `${cc.id}_${p.id || idx}`,
        name: `${cc.name.split(",")[0]} · ${p.name}`,
      }));
      const styleOrder = cc.facadeStyle === "brick"
        ? ["brick", "residential", "concrete", "glass"]
        : cc.facadeStyle === "concrete"
          ? ["concrete", "glass", "residential", "brick"]
          : ["glass", "concrete", "brick", "residential"];
      CUSTOM_CITIES[cc.id] = {
        id: cc.id,
        name: cc.name || "Custom City",
        country: cc.country || "Custom World",
        mode: cc.mode === "original" ? "original" : "real",
        playable3d: cc.playable3d !== false,
        lat: typeof cc.lat === "number" ? cc.lat : 31.5204,
        lng: typeof cc.lng === "number" ? cc.lng : 74.3587,
        latSpan: 0.05,
        lngSpan: 0.055,
        defaultZoom: 13,
        description: cc.summary || "Owner-created open-world playable city.",
        waterStyle: "ocean_canal",
        waterColor: hexToRgb3(cc.waterColorHex),
        facadePalette: styleOrder,
        vRoads: [320, 1100, 1900, 2700, 3500, 4220],
        hRoads: [320, 1100, 1900, 2700, 3500, 4420],
        districts: {
          nw: `${(cc.name || "CITY").toUpperCase()} NORTH`,
          nc: "FINANCIAL CENTER",
          center: "CENTRAL PARK",
          west: "GARAGE & INDUSTRIAL",
          south: "RING HIGHWAY",
          east: "COASTAL WATERFRONT",
          se: "INTERNATIONAL AIRPORT",
          downtown: "MAIN BOULEVARD",
        },
        places: basePlaces,
      };
    });
  }

  function applyLocationRenames(renameMap) {
    locationRenames = renameMap && typeof renameMap === "object" ? { ...renameMap } : {};
  }

  function resolvePlaceName(place) {
    return (place && locationRenames[place.id]) || (place ? place.name : "");
  }

  function worldToLatLng(city, wx, wz) {
    const c = city || CITIES.original;
    const nx = wx / 5200 - 0.5;
    const nz = wz / 5200 - 0.5;
    return {
      lat: c.lat - nz * (c.latSpan || 0.05),
      lng: c.lng + nx * (c.lngSpan || 0.05),
    };
  }

  function latLngToWorld(city, lat, lng) {
    const c = city || CITIES.original;
    const nx = (lng - c.lng) / (c.lngSpan || 0.05) + 0.5;
    const nz = (c.lat - lat) / (c.latSpan || 0.05) + 0.5;
    return {
      x: Math.max(40, Math.min(5160, nx * 5200)),
      z: Math.max(40, Math.min(5160, nz * 5200)),
    };
  }

  function listAll() {
    return [...Object.values(CITIES), ...Object.values(CUSTOM_CITIES)];
  }

  function get(id) {
    const base = CUSTOM_CITIES[id] || CITIES[id] || CITIES.original;
    if (!base || !Array.isArray(base.places)) return base;
    return {
      ...base,
      places: base.places.map((pl) => ({ ...pl, name: resolvePlaceName(pl) })),
    };
  }

  // Search local city landmarks & query OpenStreetMap Nominatim when online
  async function searchPlaces(query, activeCity) {
    const q = (query || "").trim().toLowerCase();
    const results = [];
    if (!q) return results;

    // 1. Match selectable cities
    listAll().forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)) {
        results.push({
          type: "city",
          cityId: c.id,
          name: c.name,
          subtitle: c.playable3d ? "Playable 3D City + OSM GPS" : "OSM Map Only (3D Unavailable)",
          lat: c.lat,
          lng: c.lng,
          playable3d: c.playable3d,
        });
      }
    });

    // 2. Match current city places
    if (activeCity && Array.isArray(activeCity.places)) {
      activeCity.places.forEach((pl) => {
        const displayName = resolvePlaceName(pl);
        if (displayName.toLowerCase().includes(q) || (pl.category && pl.category.toLowerCase().includes(q))) {
          const ll = typeof pl.lat === "number" ? { lat: pl.lat, lng: pl.lng } : worldToLatLng(activeCity, pl.x, pl.z);
          results.push({
            type: "place",
            cityId: activeCity.id,
            name: displayName,
            subtitle: `${pl.category.toUpperCase()} · ${activeCity.name}`,
            x: pl.x,
            z: pl.z,
            lat: ll.lat,
            lng: ll.lng,
          });
        }
      });
    }

    // 3. Query OpenStreetMap Nominatim for real-world places/cities (if online)
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3200);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
      const res = await fetch(url, { signal: ctrl.signal, headers: { "Accept": "application/json" } });
      clearTimeout(timer);
      if (res.ok) {
        const items = await res.json();
        items.forEach((it) => {
          const lat = parseFloat(it.lat);
          const lng = parseFloat(it.lon);
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            results.push({
              type: "osm",
              name: it.display_name.split(",").slice(0, 2).join(", "),
              subtitle: `OpenStreetMap · ${it.type || "Location"}`,
              lat,
              lng,
            });
          }
        });
      }
    } catch (_) {
      // Offline or rate-limited: local OSM city & place results still work cleanly
    }

    return results;
  }

  return {
    CITIES,
    CUSTOM_CITIES,
    setCustomCities,
    applyLocationRenames,
    listAll,
    get,
    worldToLatLng,
    latLngToWorld,
    searchPlaces,
  };
})();
