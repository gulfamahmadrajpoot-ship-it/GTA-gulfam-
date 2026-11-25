// Zero-Dependency WebGL 1.0 Third-Person 3D Rendering Core
window.CityGL = (function () {
  let gl = null;
  let prog = null;
  let locs = {};
  const meshes = {};

  const VS_SRC = `
    attribute vec3 aPos;
    attribute vec3 aNorm;
    attribute vec2 aUv;
    uniform mat4 uProj;
    uniform mat4 uView;
    uniform mat4 uModel;
    uniform vec2 uUvScale;
    varying vec3 vNorm;
    varying vec2 vUv;
    varying float vDist;
    varying vec3 vWorldPos;
    void main() {
      vec4 wp = uModel * vec4(aPos, 1.0);
      vec4 vp = uView * wp;
      gl_Position = uProj * vp;
      vNorm = normalize(mat3(uModel) * aNorm);
      vUv = aUv * uUvScale;
      vDist = length(vp.xyz);
      vWorldPos = wp.xyz;
    }
  `;

  const FS_SRC = `
    precision mediump float;
    varying vec3 vNorm;
    varying vec2 vUv;
    varying float vDist;
    varying vec3 vWorldPos;

    uniform vec4 uColor;
    uniform vec3 uEmissive;
    uniform float uUseTex;
    uniform float uUnlit;
    uniform sampler2D uTex;

    uniform vec3 uSunDir;
    uniform vec3 uSunColor;
    uniform vec3 uSkyColor;
    uniform vec3 uGroundColor;
    uniform vec3 uFogColor;
    uniform vec2 uFogRange;

    void main() {
      vec4 base = uColor;
      if (uUseTex > 0.5) {
        base *= texture2D(uTex, vUv);
      }
      if (base.a < 0.05) discard;

      vec3 lit = base.rgb;
      if (uUnlit < 0.5) {
        vec3 n = normalize(vNorm);
        float ndl = max(dot(n, normalize(uSunDir)), 0.0);
        float hemi = n.y * 0.5 + 0.5;
        vec3 ambient = mix(uGroundColor, uSkyColor, hemi);
        lit = base.rgb * (ambient + uSunColor * ndl) + uEmissive;
      } else {
        lit = base.rgb + uEmissive;
      }

      float fogFactor = clamp((vDist - uFogRange.x) / max(1.0, (uFogRange.y - uFogRange.x)), 0.0, 1.0);
      vec3 finalColor = mix(lit, uFogColor, fogFactor);
      gl_FragColor = vec4(finalColor, base.a);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(s));
    }
    return s;
  }

  function createMesh(positions, normals, uvs, indices) {
    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const vboNorm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNorm);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const vboUv = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboUv);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return { vboPos, vboNorm, vboUv, ibo, count: indices.length };
  }

  function buildPlane() {
    return createMesh(
      [-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5],
      [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      [0, 0, 1, 0, 1, 1, 0, 1],
      [0, 2, 1, 0, 3, 2]
    );
  }

  function buildQuad() {
    return createMesh(
      [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
      [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      [0, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 2, 0, 2, 3]
    );
  }

  function buildBox() {
    const p = [], n = [], uv = [], idx = [];
    const faces = [
      // +Z
      { n: [0, 0, 1], v: [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]] },
      // -Z
      { n: [0, 0, -1], v: [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]] },
      // +X
      { n: [1, 0, 0], v: [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]] },
      // -X
      { n: [-1, 0, 0], v: [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]] },
      // +Y
      { n: [0, 1, 0], v: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]] },
      // -Y
      { n: [0, -1, 0], v: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]] },
    ];
    faces.forEach((f, fi) => {
      const base = fi * 4;
      f.v.forEach((vert) => {
        p.push(vert[0], vert[1], vert[2]);
        n.push(f.n[0], f.n[1], f.n[2]);
      });
      uv.push(0, 1, 1, 1, 1, 0, 0, 0);
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    });
    return createMesh(p, n, uv, idx);
  }

  function buildCylinder(segs = 14) {
    const p = [], n = [], uv = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const cx = Math.cos(a);
      const cz = Math.sin(a);
      p.push(cx * 0.5, -0.5, cz * 0.5);
      n.push(cx, 0, cz);
      uv.push(i / segs, 1);

      p.push(cx * 0.5, 0.5, cz * 0.5);
      n.push(cx, 0, cz);
      uv.push(i / segs, 0);
    }
    for (let i = 0; i < segs; i++) {
      const k = i * 2;
      idx.push(k, k + 1, k + 3, k, k + 3, k + 2);
    }
    // Top & bottom caps
    const topCenter = p.length / 3;
    p.push(0, 0.5, 0); n.push(0, 1, 0); uv.push(0.5, 0.5);
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      p.push(Math.cos(a) * 0.5, 0.5, Math.sin(a) * 0.5);
      n.push(0, 1, 0);
      uv.push(0.5 + Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5);
    }
    for (let i = 1; i <= segs; i++) {
      idx.push(topCenter, topCenter + i + 1, topCenter + i);
    }

    const botCenter = p.length / 3;
    p.push(0, -0.5, 0); n.push(0, -1, 0); uv.push(0.5, 0.5);
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      p.push(Math.cos(a) * 0.5, -0.5, Math.sin(a) * 0.5);
      n.push(0, -1, 0);
      uv.push(0.5 + Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5);
    }
    for (let i = 1; i <= segs; i++) {
      idx.push(botCenter, botCenter + i, botCenter + i + 1);
    }
    return createMesh(p, n, uv, idx);
  }

  function buildSphere(lat = 10, lon = 14) {
    const p = [], n = [], uv = [], idx = [];
    for (let y = 0; y <= lat; y++) {
      const v = y / lat;
      const phi = v * Math.PI;
      for (let x = 0; x <= lon; x++) {
        const u = x / lon;
        const theta = u * Math.PI * 2;
        const nx = Math.sin(phi) * Math.cos(theta);
        const ny = Math.cos(phi);
        const nz = Math.sin(phi) * Math.sin(theta);
        p.push(nx * 0.5, ny * 0.5, nz * 0.5);
        n.push(nx, ny, nz);
        uv.push(u, v);
      }
    }
    for (let y = 0; y < lat; y++) {
      for (let x = 0; x < lon; x++) {
        const a = y * (lon + 1) + x;
        const b = a + lon + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return createMesh(p, n, uv, idx);
  }

  // Matrix helpers (Float32Array column-major)
  const mat4 = {
    create: () => new Float32Array(16),
    identity(out) {
      out.fill(0);
      out[0] = out[5] = out[10] = out[15] = 1;
      return out;
    },
    perspective(out, fovy, aspect, near, far) {
      const f = 1.0 / Math.tan(fovy / 2);
      out.fill(0);
      out[0] = f / aspect;
      out[5] = f;
      out[10] = (far + near) / (near - far);
      out[11] = -1;
      out[14] = (2 * far * near) / (near - far);
      return out;
    },
    lookAt(out, eye, center, up) {
      let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
      let len = Math.hypot(zx, zy, zz) || 1;
      zx /= len; zy /= len; zz /= len;
      let xx = up[1] * zz - up[2] * zy;
      let xy = up[2] * zx - up[0] * zz;
      let xz = up[0] * zy - up[1] * zx;
      len = Math.hypot(xx, xy, xz) || 1;
      xx /= len; xy /= len; xz /= len;
      const yx = zy * xz - zz * xy;
      const yy = zz * xx - zx * xz;
      const yz = zx * xy - zy * xx;
      out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
      out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
      out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
      out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
      out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
      out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
      out[15] = 1;
      return out;
    },
    compose(out, x, y, z, rx, ry, rz, sx, sy, sz) {
      // T * Ry * Rx * Rz * S
      const cy = Math.cos(ry), syA = Math.sin(ry);
      const cx = Math.cos(rx), sxA = Math.sin(rx);
      const cz = Math.cos(rz), szA = Math.sin(rz);

      const m00 = cy * cz + syA * sxA * szA;
      const m01 = cx * szA;
      const m02 = -syA * cz + cy * sxA * szA;
      const m10 = -cy * szA + syA * sxA * cz;
      const m11 = cx * cz;
      const m12 = syA * szA + cy * sxA * cz;
      const m20 = syA * cx;
      const m21 = -sxA;
      const m22 = cy * cx;

      out[0] = m00 * sx; out[1] = m01 * sx; out[2] = m02 * sx; out[3] = 0;
      out[4] = m10 * sy; out[5] = m11 * sy; out[6] = m12 * sy; out[7] = 0;
      out[8] = m20 * sz; out[9] = m21 * sz; out[10] = m22 * sz; out[11] = 0;
      out[12] = x; out[13] = y; out[14] = z; out[15] = 1;
      return out;
    },
  };

  const tmpModel = mat4.create();
  let lastBoundMesh = null;

  function init(canvas) {
    gl = canvas.getContext("webgl", { antialias: true, alpha: false, powerPreference: "high-performance" });
    if (!gl) return null;

    const vs = compileShader(gl.VERTEX_SHADER, VS_SRC);
    const fs = compileShader(gl.FRAGMENT_SHADER, FS_SRC);
    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    locs = {
      aPos: gl.getAttribLocation(prog, "aPos"),
      aNorm: gl.getAttribLocation(prog, "aNorm"),
      aUv: gl.getAttribLocation(prog, "aUv"),
      uProj: gl.getUniformLocation(prog, "uProj"),
      uView: gl.getUniformLocation(prog, "uView"),
      uModel: gl.getUniformLocation(prog, "uModel"),
      uColor: gl.getUniformLocation(prog, "uColor"),
      uEmissive: gl.getUniformLocation(prog, "uEmissive"),
      uUseTex: gl.getUniformLocation(prog, "uUseTex"),
      uUnlit: gl.getUniformLocation(prog, "uUnlit"),
      uTex: gl.getUniformLocation(prog, "uTex"),
      uUvScale: gl.getUniformLocation(prog, "uUvScale"),
      uSunDir: gl.getUniformLocation(prog, "uSunDir"),
      uSunColor: gl.getUniformLocation(prog, "uSunColor"),
      uSkyColor: gl.getUniformLocation(prog, "uSkyColor"),
      uGroundColor: gl.getUniformLocation(prog, "uGroundColor"),
      uFogColor: gl.getUniformLocation(prog, "uFogColor"),
      uFogRange: gl.getUniformLocation(prog, "uFogRange"),
    };

    gl.enableVertexAttribArray(locs.aPos);
    gl.enableVertexAttribArray(locs.aNorm);
    gl.enableVertexAttribArray(locs.aUv);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    meshes.plane = buildPlane();
    meshes.quad = buildQuad();
    meshes.box = buildBox();
    meshes.cylinder = buildCylinder(14);
    meshes.sphere = buildSphere(10, 14);

    return gl;
  }

  function createTexture(source, repeat = false) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    const isPOT = (source.width & (source.width - 1)) === 0 && (source.height & (source.height - 1)) === 0;
    if (isPOT) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  function updateTexture(tex, source) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  function beginFrame(projMat, viewMat, atmo) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(atmo.sky[0], atmo.sky[1], atmo.sky[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);
    lastBoundMesh = null;

    gl.uniformMatrix4fv(locs.uProj, false, projMat);
    gl.uniformMatrix4fv(locs.uView, false, viewMat);
    gl.uniform3fv(locs.uSunDir, atmo.sunDir);
    gl.uniform3fv(locs.uSunColor, atmo.sunColor);
    gl.uniform3fv(locs.uSkyColor, atmo.hemiSky);
    gl.uniform3fv(locs.uGroundColor, atmo.hemiGround);
    gl.uniform3fv(locs.uFogColor, atmo.sky);
    gl.uniform2f(locs.uFogRange, atmo.fogNear, atmo.fogFar);
    gl.uniform1i(locs.uTex, 0);
  }

  function bindMesh(mesh) {
    if (lastBoundMesh === mesh) return;
    lastBoundMesh = mesh;
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vboPos);
    gl.vertexAttribPointer(locs.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vboNorm);
    gl.vertexAttribPointer(locs.aNorm, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vboUv);
    gl.vertexAttribPointer(locs.aUv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
  }

  function draw(meshName, x, y, z, rx, ry, rz, sx, sy, sz, rgba, tex = null, uvX = 1, uvY = 1, emissive = [0, 0, 0], unlit = false) {
    const mesh = meshes[meshName];
    if (!mesh) return;
    bindMesh(mesh);

    mat4.compose(tmpModel, x, y, z, rx, ry, rz, sx, sy, sz);
    gl.uniformMatrix4fv(locs.uModel, false, tmpModel);
    gl.uniform4f(locs.uColor, rgba[0], rgba[1], rgba[2], rgba[3] !== undefined ? rgba[3] : 1.0);
    gl.uniform3f(locs.uEmissive, emissive[0], emissive[1], emissive[2]);
    gl.uniform2f(locs.uUvScale, uvX, uvY);
    gl.uniform1f(locs.uUnlit, unlit ? 1.0 : 0.0);

    if (tex) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1f(locs.uUseTex, 1.0);
    } else {
      gl.uniform1f(locs.uUseTex, 0.0);
    }

    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  return {
    init,
    mat4,
    createTexture,
    updateTexture,
    beginFrame,
    draw,
    hexToRgb,
    getGl: () => gl,
  };
})();
