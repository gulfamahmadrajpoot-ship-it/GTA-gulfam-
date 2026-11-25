// Real Photographic Textures, Architectural Facades, Custom Character Photo & 6 Billboard/Wall Poster WebGL Textures
window.CityTextures = (function () {
  const glTex = {
    asphalt: null,
    rooftop: null,
    sidewalk: null,
    grass: null,
    sand: null,
    facadeGlass: null,
    facadeBrick: null,
    facadeConcrete: null,
    facadeResidential: null,
    billboards: {
      bb_0: null,
      bb_1: null,
      bb_2: null,
      bb_3: null,
      bb_4: null,
      bb_5: null,
    },
    customChar: null,
    customChars: {},
    customVehicles: {},
  };

  let customCharacterImg = null;
  const customCharImgs = {};
  const defaultImgs = {};

  function loadImg(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  function createSidewalkCanvas() {
    const c = makeCanvas(256, 256);
    const g = c.getContext("2d");
    g.fillStyle = "#8c929a";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3200; i++) {
      const v = 115 + Math.floor(Math.random() * 50);
      g.fillStyle = `rgba(${v},${v + 2},${v + 4},0.32)`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    g.strokeStyle = "rgba(35,40,48,0.45)";
    g.lineWidth = 2;
    for (let p = 0; p <= 256; p += 64) {
      g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 256); g.stroke();
      g.beginPath(); g.moveTo(0, p); g.lineTo(256, p); g.stroke();
    }
    return c;
  }

  function createGrassCanvas() {
    const c = makeCanvas(256, 256);
    const g = c.getContext("2d");
    g.fillStyle = "#31542c";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4200; i++) {
      const r = Math.random();
      g.fillStyle = r > 0.6 ? "rgba(78,125,65,0.35)" : r > 0.25 ? "rgba(38,72,33,0.4)" : "rgba(105,146,80,0.22)";
      g.fillRect(Math.random() * 256, Math.random() * 256, 2.5, 2.5);
    }
    return c;
  }

  function createSandCanvas() {
    const c = makeCanvas(256, 256);
    const g = c.getContext("2d");
    g.fillStyle = "#d8c39a";
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) {
      const shade = Math.random() > 0.5 ? "rgba(255,245,220,0.28)" : "rgba(170,145,105,0.28)";
      g.fillStyle = shade;
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    return c;
  }

  function createArchitecturalFacade(style) {
    const c = makeCanvas(512, 512);
    const g = c.getContext("2d");

    if (style === "glass") {
      g.fillStyle = "#192536";
      g.fillRect(0, 0, 512, 512);
      const cols = 8, rows = 10, cw = 512 / cols, rh = 512 / rows;
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cw + 4, y = r * rh + 5, w = cw - 8, h = rh - 10;
          const lit = (r * 7 + col * 13) % 5 === 0;
          const grad = g.createLinearGradient(x, y, x + w, y + h);
          if (lit) { grad.addColorStop(0, "#fbbf24"); grad.addColorStop(1, "#78350f"); }
          else { grad.addColorStop(0, "#334d6e"); grad.addColorStop(0.5, "#1e324a"); grad.addColorStop(1, "#0f1926"); }
          g.fillStyle = grad;
          g.fillRect(x, y, w, h);
          g.fillStyle = "rgba(255,255,255,0.08)";
          g.fillRect(x, y, w, 4);
        }
      }
      g.fillStyle = "#0f172a";
      g.fillRect(0, 445, 512, 67);
      g.fillStyle = "rgba(251, 191, 36, 0.35)";
      g.fillRect(24, 456, 464, 44);
    } else if (style === "brick") {
      g.fillStyle = "#5c3a2e";
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 3500; i++) {
        g.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,200,170,0.08)";
        g.fillRect(Math.random() * 512, Math.random() * 512, 8, 4);
      }
      const cols = 6, rows = 6, cw = 512 / cols, rh = 440 / rows;
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cw + 14, y = r * rh + 14, w = cw - 28, h = rh - 24;
          g.fillStyle = "#d6d3d1";
          g.fillRect(x - 3, y - 3, w + 6, h + 7);
          const lit = (r * 5 + col * 3) % 4 === 1;
          g.fillStyle = lit ? "#fcd34d" : "#1e293b";
          g.fillRect(x, y, w, h);
          g.fillStyle = "rgba(255,255,255,0.16)";
          g.fillRect(x, y, w / 2, h);
        }
      }
      g.fillStyle = "#292524";
      g.fillRect(0, 440, 512, 72);
      g.fillStyle = "#d97706";
      g.fillRect(16, 440, 480, 12);
      g.fillStyle = "rgba(254, 243, 199, 0.38)";
      g.fillRect(28, 460, 200, 44);
      g.fillRect(284, 460, 200, 44);
    } else if (style === "residential") {
      g.fillStyle = "#9e8f7c";
      g.fillRect(0, 0, 512, 512);
      const cols = 4, rows = 4, cw = 512 / cols, rh = 440 / rows;
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cw + 18, y = r * rh + 18, w = cw - 36, h = rh - 36;
          g.fillStyle = "#f5f5f4";
          g.fillRect(x - 4, y - 4, w + 8, h + 8);
          g.fillStyle = (r + col) % 3 === 0 ? "#fde68a" : "#1e293b";
          g.fillRect(x, y, w, h);
          g.fillStyle = "#44403c";
          g.fillRect(x - 6, y + h + 2, w + 12, 8);
        }
      }
      g.fillStyle = "#57534e";
      g.fillRect(0, 440, 512, 72);
    } else {
      g.fillStyle = "#4b5563";
      g.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 64) {
        g.fillStyle = "#374151";
        g.fillRect(0, y, 512, 10);
        g.fillStyle = "#1f2937";
        g.fillRect(18, y + 16, 476, 38);
        g.fillStyle = "rgba(147, 197, 253, 0.22)";
        for (let x = 26; x < 480; x += 66) {
          g.fillRect(x, y + 19, 52, 32);
        }
      }
    }
    return c;
  }

  function createEditorialAdCanvas(title, subtitle, accent, bg1, bg2) {
    const c = makeCanvas(512, 288);
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 512, 288);
    grad.addColorStop(0, bg1);
    grad.addColorStop(1, bg2);
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 288);

    for (let i = 0; i < 20; i++) {
      g.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.06})`;
      g.beginPath();
      g.arc(Math.random() * 512, Math.random() * 288, 18 + Math.random() * 44, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = accent;
    g.fillRect(36, 48, 10, 192);
    g.fillStyle = "#f8fafc";
    g.font = "bold 38px sans-serif";
    g.fillText(title, 66, 134);
    g.fillStyle = "#cbd5e1";
    g.font = "600 20px sans-serif";
    g.fillText(subtitle, 66, 178);
    g.fillStyle = accent;
    g.font = "bold 15px sans-serif";
    g.fillText("CITY LIFE METROPOLITAN", 66, 224);
    return c;
  }

  async function init(CityGL) {
    const [asphaltImg, rooftopImg, bb0Img, bb1Img] = await Promise.all([
      loadImg("img/asphalt_tile.jpg"),
      loadImg("img/rooftop_tile.jpg"),
      loadImg("img/billboard_espresso.jpg"),
      loadImg("img/billboard_motors.jpg"),
    ]);

    defaultImgs.bb_0 = bb0Img || createEditorialAdCanvas("ESPRESSO & CO", "ROASTED DAILY · DOWNTOWN", "#f59e0b", "#1c1917", "#451a03");
    defaultImgs.bb_1 = bb1Img || createEditorialAdCanvas("APEX GT COUPÉ", "HARBOUR SHOWROOM", "#38bdf8", "#0f172a", "#1e293b");
    defaultImgs.bb_2 = createEditorialAdCanvas("METRO THREADS", "AUTUMN TAILORED COLLECTION", "#fbbf24", "#18181b", "#27272a");
    defaultImgs.bb_3 = createEditorialAdCanvas("HARBOUR LIVING", "BEACHFRONT PENTHOUSES", "#10b981", "#064e3b", "#0f172a");
    defaultImgs.bb_4 = createEditorialAdCanvas("METRO AIRWAYS", "DIRECT FLIGHTS DAILY", "#38bdf8", "#0c4a6e", "#0f172a");
    defaultImgs.bb_5 = createEditorialAdCanvas("NIGHTCLUB APEX", "LIVE DJ EVERY FRIDAY", "#ec4899", "#3b0764", "#0f172a");

    glTex.asphalt = CityGL.createTexture(asphaltImg || createSidewalkCanvas(), true);
    glTex.rooftop = CityGL.createTexture(rooftopImg || createSidewalkCanvas(), true);
    glTex.sidewalk = CityGL.createTexture(createSidewalkCanvas(), true);
    glTex.grass = CityGL.createTexture(createGrassCanvas(), true);
    glTex.sand = CityGL.createTexture(createSandCanvas(), true);
    glTex.facadeGlass = CityGL.createTexture(createArchitecturalFacade("glass"), false);
    glTex.facadeBrick = CityGL.createTexture(createArchitecturalFacade("brick"), false);
    glTex.facadeConcrete = CityGL.createTexture(createArchitecturalFacade("concrete"), false);
    glTex.facadeResidential = CityGL.createTexture(createArchitecturalFacade("residential"), false);

    Object.keys(glTex.billboards).forEach((k) => {
      glTex.billboards[k] = CityGL.createTexture(defaultImgs[k], false);
    });
  }

  function ensureBillboardTexture(slotId, title, CityGL) {
    if (!glTex.billboards[slotId]) {
      const fallback = defaultImgs[slotId] || createEditorialAdCanvas((title || "SPONSORED AD").slice(0, 20).toUpperCase(), "CUSTOM OWNER POSTER", "#f59e0b", "#0f172a", "#1e293b");
      defaultImgs[slotId] = fallback;
      if (CityGL) glTex.billboards[slotId] = CityGL.createTexture(fallback, false);
    }
    return glTex.billboards[slotId];
  }

  function setCustomBillboardImage(slotId, dataUrl, CityGL, fallbackTitle = "AD POSTER") {
    ensureBillboardTexture(slotId, fallbackTitle, CityGL);
    const tex = glTex.billboards[slotId];
    if (!tex) return;
    if (!dataUrl) {
      CityGL.updateTexture(tex, defaultImgs[slotId]);
      return;
    }
    loadImg(dataUrl).then((img) => {
      // Preserve uploaded poster pixels verbatim without altering text or distortion
      if (img) CityGL.updateTexture(tex, img);
    });
  }

  function setCustomCharacterImage(dataUrl, CityGL, charId = "player") {
    if (!dataUrl) {
      if (charId === "player") {
        customCharacterImg = null;
      } else {
        delete customCharImgs[charId];
        delete glTex.customChars[charId];
      }
      return Promise.resolve(null);
    }
    return loadImg(dataUrl).then((img) => {
      if (img && CityGL) {
        if (charId === "player") {
          customCharacterImg = img;
          if (!glTex.customChar) glTex.customChar = CityGL.createTexture(img, false);
          else CityGL.updateTexture(glTex.customChar, img);
        } else {
          customCharImgs[charId] = img;
          if (!glTex.customChars[charId]) glTex.customChars[charId] = CityGL.createTexture(img, false);
          else CityGL.updateTexture(glTex.customChars[charId], img);
        }
      }
      return img;
    });
  }

  function setCustomVehicleImage(kind, dataUrl, CityGL) {
    if (!dataUrl) {
      delete glTex.customVehicles[kind];
      return Promise.resolve(null);
    }
    return loadImg(dataUrl).then((img) => {
      if (img && CityGL) {
        if (!glTex.customVehicles[kind]) glTex.customVehicles[kind] = CityGL.createTexture(img, false);
        else CityGL.updateTexture(glTex.customVehicles[kind], img);
      }
      return img;
    });
  }

  return {
    init,
    glTex,
    ensureBillboardTexture,
    setCustomBillboardImage,
    setCustomCharacterImage,
    setCustomVehicleImage,
    getCustomCharacterImg: (charId = "player") => customCharImgs[charId] || customCharacterImg,
  };
})();
