// Procedural Web Audio API sound effects & ambient synth (offline, zero external audio assets)
window.CityAudio = (function () {
  let ctx = null;
  let muted = false;
  let soundVolume = 0.85;
  let musicVolume = 0.45;
  let engineOsc = null;
  let engineGain = null;
  let sirenTimer = 0;
  let musicTimer = 0;
  let musicStep = 0;

  const CHORD_NOTES = [130.81, 164.81, 196.0, 246.94, 146.83, 174.61, 220.0, 261.63];

  function ensureCtx() {
    if (muted) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function unlock() {
    ensureCtx();
  }

  function setMuted(val) {
    muted = !!val;
    if (muted && engineGain && ctx) {
      engineGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    }
    return muted;
  }

  function isMuted() {
    return muted;
  }

  function setSoundVolume(v) {
    soundVolume = Math.max(0, Math.min(1, Number(v)));
    return soundVolume;
  }

  function setMusicVolume(v) {
    musicVolume = Math.max(0, Math.min(1, Number(v)));
    return musicVolume;
  }

  function playTone(freq, duration, type = "sine", vol = 0.08, slideTo = null, isMusic = false) {
    const scale = isMusic ? musicVolume : soundVolume;
    if (scale <= 0.01) return;
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), now + duration);
    }
    g.gain.setValueAtTime(Math.max(0.001, vol * scale), now);
    g.gain.exponentialRampToValueAtTime(0.0005, now + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  function playFootstep(sprinting) {
    playTone(sprinting ? 140 : 105, 0.045, "triangle", sprinting ? 0.045 : 0.028, 55);
  }

  function playJump() {
    playTone(190, 0.16, "sine", 0.075, 420);
  }

  function playHorn() {
    const c = ensureCtx();
    if (!c) return;
    playTone(340, 0.18, "sawtooth", 0.06);
    playTone(425, 0.18, "sawtooth", 0.05);
  }

  function playCash() {
    playTone(784, 0.11, "sine", 0.085);
    setTimeout(() => playTone(1046, 0.18, "sine", 0.095), 70);
  }

  function playCrash(intensity = 1) {
    const vol = Math.min(0.15, 0.045 + intensity * 0.085);
    playTone(120, 0.14, "sawtooth", vol, 38);
  }

  function playDoor() {
    playTone(160, 0.07, "square", 0.045, 90);
  }

  function playPunch() {
    playTone(230, 0.09, "triangle", 0.065, 75);
  }

  function playHit() {
    playTone(135, 0.12, "sawtooth", 0.095, 45);
  }

  function updateEngine(active, speedRatio, isMoto) {
    if (muted || soundVolume <= 0.01 || !ctx) {
      if (engineGain && ctx) {
        engineGain.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
      }
      return;
    }
    if (!engineOsc) {
      engineOsc = ctx.createOscillator();
      engineGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 320;
      engineOsc.type = isMoto ? "sawtooth" : "triangle";
      engineOsc.frequency.value = 55;
      engineGain.gain.value = 0;
      engineOsc.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(ctx.destination);
      engineOsc.start();
    }
    if (active) {
      const base = isMoto ? 78 : 48;
      const targetFreq = base + Math.min(1.4, Math.abs(speedRatio)) * (isMoto ? 140 : 88);
      engineOsc.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.06);
      engineGain.gain.setTargetAtTime((0.032 + Math.abs(speedRatio) * 0.025) * soundVolume, ctx.currentTime, 0.08);
    } else {
      engineGain.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
    }
  }

  function updateSiren(active, dt) {
    if (!active || muted || soundVolume <= 0.01 || !ctx) return;
    sirenTimer += dt;
    if (sirenTimer > 0.45) {
      sirenTimer = 0;
      const hi = Math.floor(performance.now() / 450) % 2 === 0;
      playTone(hi ? 780 : 590, 0.36, "sine", 0.028);
    }
  }

  function updateMusic(dt, isNight) {
    if (muted || musicVolume <= 0.02 || !ctx) return;
    musicTimer += dt;
    if (musicTimer >= 1.8) {
      musicTimer = 0;
      const note = CHORD_NOTES[musicStep % CHORD_NOTES.length];
      musicStep++;
      playTone(isNight ? note : note * 1.25, 1.5, "sine", 0.022, null, true);
    }
  }

  return {
    unlock,
    setMuted,
    isMuted,
    setSoundVolume,
    setMusicVolume,
    getSoundVolume: () => soundVolume,
    getMusicVolume: () => musicVolume,
    playFootstep,
    playJump,
    playHorn,
    playCash,
    playCrash,
    playDoor,
    playPunch,
    playHit,
    updateEngine,
    updateSiren,
    updateMusic,
  };
})();
