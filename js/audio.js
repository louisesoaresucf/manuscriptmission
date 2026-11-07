// All sound is synthesised with the Web Audio API: no audio files.
// A plucked "lute" (Karplus-Strong), bells in D Dorian, a soft drone and a
// slow modal melody. Audio starts on the first tap (required by iOS).

import { TUNE, notesOf, freq } from './music.js';

const DORIAN = [0, 2, 3, 5, 7, 9, 10]; // D Dorian intervals
const D3 = 146.83;

function noteFreq(degree, octave = 0) {
  const len = DORIAN.length;
  const o = Math.floor(degree / len) + octave;
  const step = DORIAN[((degree % len) + len) % len];
  return D3 * Math.pow(2, o + step / 12);
}

class Audio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.plucks = new Map();
    this.musicTimer = null;
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.master.connect(this.ctx.destination);
    this.sfx = this.ctx.createGain();
    this.sfx.gain.value = 0.9;
    this.sfx.connect(this.master);
    this.music = this.ctx.createGain();
    this.music.gain.value = 0.55;
    this.music.connect(this.master);
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.05);
  }

  // Karplus-Strong plucked string, rendered once per pitch and cached.
  pluckBuffer(freq) {
    const key = Math.round(freq * 10);
    if (this.plucks.has(key)) return this.plucks.get(key);
    const sr = this.ctx.sampleRate, dur = 1.6;
    const buf = this.ctx.createBuffer(1, Math.floor(sr * dur), sr);
    const data = buf.getChannelData(0);
    const n = Math.max(2, Math.round(sr / freq));
    const ring = new Float32Array(n);
    for (let i = 0; i < n; i++) ring[i] = Math.random() * 2 - 1;
    let idx = 0;
    for (let i = 0; i < data.length; i++) {
      const next = (idx + 1) % n;
      const v = 0.497 * (ring[idx] + ring[next]);
      data[i] = ring[idx];
      ring[idx] = v;
      idx = next;
    }
    this.plucks.set(key, buf);
    return buf;
  }

  pluck(freq, when = 0, gain = 0.5, dest = this.sfx) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource();
    src.buffer = this.pluckBuffer(freq);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    src.connect(lp).connect(g).connect(dest);
    src.start(t);
    src.stop(t + 1.6);
  }

  bell(freq, when = 0, gain = 0.25) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    for (const [ratio, amp, decay] of [[1, 1, 1.6], [2.01, 0.5, 1.1], [2.76, 0.35, 0.8], [5.4, 0.15, 0.4]]) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain * amp, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      osc.connect(g).connect(this.sfx);
      osc.start(t);
      osc.stop(t + decay + 0.05);
    }
  }

  // ---- game sounds ----
  pickUp() { this.pluck(noteFreq(4, 1), 0, 0.45); }

  correct() {
    this.bell(noteFreq(0, 2), 0, 0.22);
    this.bell(noteFreq(4, 2), 0.1, 0.18);
    this.bell(noteFreq(7, 2), 0.2, 0.16);
  }

  wrong() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.25);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g).connect(this.sfx);
    osc.start(t);
    osc.stop(t + 0.32);
    this.pluck(noteFreq(1, 0), 0.02, 0.25);
  }

  hint() {
    [0, 2, 4, 7, 9].forEach((d, i) => this.bell(noteFreq(d, 2), i * 0.07, 0.08));
  }

  bookFull() {
    [0, 4, 7].forEach((d, i) => this.pluck(noteFreq(d, 1), i * 0.09, 0.4));
  }

  fanfare() {
    [0, 2, 4, 5, 7, 9, 11, 14].forEach((d, i) => this.pluck(noteFreq(d, 1), i * 0.12, 0.45));
    this.bell(noteFreq(0, 2), 0.96, 0.2);
    this.bell(noteFreq(7, 1), 0.96, 0.15);
  }

  page() {
    if (!this.ctx) return;
    // A short burst of filtered noise: a turning page.
    const t = this.ctx.currentTime, sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, Math.floor(sr * 0.25), sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2500;
    bp.Q.value = 0.7;
    const g = this.ctx.createGain();
    g.gain.value = 0.35;
    src.connect(bp).connect(g).connect(this.sfx);
    src.start(t);
  }

  // ---- the illustrations' own voices when tapped ----
  react(kind) {
    if (!this.ctx || !kind) return;
    const f = (d, o = 1) => noteFreq(d, o);
    switch (kind) {
      case 'roar': this.growl(70, 0.9, 0.5); break;
      case 'dragonfire': this.growl(65, 0.7, 0.45); setTimeout(() => this.noiseBursts(6, 0.16, 900, 0.3, 'bandpass', true), 550); break;
      case 'bloom': [0, 2, 4, 7].forEach((d, i) => this.bell(f(d, 2), 0.15 + i * 0.11, 0.06)); this.noiseBursts(2, 0.15, 3500, 0.08, 'highpass'); break;
      case 'screech': this.sweep(1400, 900, 0.35, 'sawtooth', 0.12); break;
      case 'neigh': this.sweep(700, 420, 0.6, 'sawtooth', 0.1, 9); break;
      case 'flap': this.noiseBursts(4, 0.11, 900, 0.25); break;
      case 'hiss': this.noiseBursts(1, 0.7, 5000, 0.18, 'highpass'); break;
      case 'sing': [4, 6, 7, 9].forEach((d, i) => this.bell(f(d, 2), i * 0.18, 0.08)); break;
      case 'chirp': [0, 0.12, 0.24].forEach((w) => this.sweep(2200, 3200, 0.07, 'sine', 0.12, 0, w)); break;
      case 'crow': this.sweep(600, 900, 0.5, 'square', 0.06, 6); break;
      case 'fire': this.noiseBursts(6, 0.12, 1200, 0.18); break;
      case 'splash': this.noiseBursts(1, 0.45, 2500, 0.3); [7, 9].forEach((d, i) => this.bell(f(d, 2), 0.05 + i * 0.06, 0.06)); break;
      case 'bubble': [0, 2, 4, 2, 5].forEach((d, i) => this.sweep(300 + d * 60, 600 + d * 80, 0.08, 'sine', 0.12, 0, i * 0.11)); break;
      case 'rumble': this.growl(45, 1.0, 0.45); break;
      case 'wind': this.noiseBursts(1, 1.3, 700, 0.3, 'bandpass', true); break;
      case 'thunder': this.growl(38, 1.2, 0.6); this.noiseBursts(1, 0.2, 3000, 0.25); break;
      case 'chime': [0, 4, 7, 11].forEach((d, i) => this.bell(f(d, 2), i * 0.09, 0.09)); break;
      case 'twinkle': [7, 9, 11, 14].forEach((d, i) => this.bell(f(d, 2), i * 0.07, 0.07)); break;
      case 'magnet': this.sweep(220, 880, 0.5, 'triangle', 0.1); break;
      case 'scream': this.sweep(900, 1600, 0.6, 'sawtooth', 0.09, 14); break;
      case 'rustle': this.noiseBursts(3, 0.12, 3500, 0.14, 'highpass'); break;
      default: break;
    }
  }

  // ---- the villains ----
  // A warning before each visit, sounds that follow the villain while it is in
  // the room, its mischief, and its retreat when shooed.
  villain(kind, moment) {
    if (!this.ctx) return;
    const out = this.villainBus();
    if (moment === 'shoo') {
      [7, 4, 2, 0].forEach((d, i) => this.pluck(noteFreq(d, 1), i * 0.07, 0.3));
      if (kind === 'broom') { this.swish(0, 0.35, 1200, 4200, 0.3, 0, out); this.swish(0.3, 0.3, 3000, 5000, 0.15, 0.8, out); }
      if (kind === 'owl') { this.hoot(0, 520, 0.12, 0.2, out); this.hoot(0.14, 540, 0.12, 0.2, out); this.hoot(0.28, 500, 0.16, 0.18, out); this.wingbeat(0.1, 0.25, -0.6, out); this.wingbeat(0.4, 0.18, -0.9, out); }
      if (kind === 'witch') { this.syllable(0, 300, 210, 0.32, 'u', 0.22, out); this.cackle(0.45, 0.6, out); }
      return;
    }
    if (kind === 'broom') {
      if (moment === 'warn') [0, 0.55, 1.1].forEach((w, i) => this.swish(w, 0.42, i % 2 ? 2800 : 900, i % 2 ? 900 : 2800, 0.16 + i * 0.07, i % 2 ? 0.4 : -0.4, out));
      else { this.swish(0, 0.6, 600, 4000, 0.4, 0, out); this.scatter(0.25, out); }
    } else if (kind === 'owl') {
      if (moment === 'warn') { this.hoot(0, 410, 0.42, 0.26, out); this.hoot(0.75, 380, 0.16, 0.22, out); this.hoot(0.95, 360, 0.7, 0.28, out); }
      else { this.hoot(0, 390, 0.5, 0.24, out); [0.2, 0.55, 0.9].forEach((w) => this.wingbeat(w, 0.3, 0, out)); }
    } else if (kind === 'witch') {
      if (moment === 'warn') this.cackle(0, 1, out);
      else { this.sweep(200, 1800, 0.5, 'sawtooth', 0.07); [0, 3, 6, 9].forEach((d, i) => this.bell(noteFreq(d, 2), 0.2 + i * 0.06, 0.07)); this.cackle(0.55, 1.1, out); }
    }
  }

  // Sounds that follow the villain through its visit. Returns a handle whose
  // stop() fades them out (when the villain is shooed or leaves).
  villainVisit(kind, ms, clock = 0) {
    if (!this.ctx) return { stop() {} };
    const bus = this.ctx.createGain();
    bus.connect(this.villainBus());
    const dur = ms / 1000;
    if (kind === 'broom') {
      // One swish for each swing of the broom, as it crosses the room left to right.
      const swing = (2 * Math.PI) / 40 * dur / 2;
      for (let w = 0.05, i = 0; w < dur - 0.2; w += swing, i++) {
        const pan = -0.9 + 1.8 * (w / dur);
        this.swish(w, swing * 0.95, i % 2 ? 2600 : 800, i % 2 ? 800 : 2600, 0.22, pan, bus);
      }
    } else if (kind === 'owl') {
      // A wingbeat on every downstroke (three beats, then a glide), right to left.
      // `clock` is the game time the visit began: the wings beat on that clock.
      const T = 0.36, lead = T - (clock % T);
      for (let w = lead % T; w < dur - 0.1; w += T) {
        const beat = Math.floor((clock + w + 0.01) / T) % 4;
        if (beat !== 3) this.wingbeat(w, 0.24, 0.9 - 1.8 * (w / dur), bus);
      }
      this.hoot(dur * 0.35, 400, 0.4, 0.22, bus);
    } else if (kind === 'witch') {
      // A low, magical hum while she is here, and a quiet laugh.
      const t = this.ctx.currentTime;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.035, t + 0.6);
      g.gain.setValueAtTime(0.035, t + dur - 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 420;
      for (const f of [110, 110 * 1.5, 220.6]) {
        const o = this.ctx.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = f;
        o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
      }
      lp.connect(g).connect(bus);
      this.cackle(dur * 0.22, 0.7, bus);
    }
    return {
      stop: () => {
        const t = this.ctx.currentTime;
        bus.gain.cancelScheduledValues(t);
        bus.gain.setValueAtTime(bus.gain.value, t);
        bus.gain.linearRampToValueAtTime(0, t + 0.25);
        setTimeout(() => bus.disconnect(), 400);
      },
    };
  }

  villainBus() {
    if (!this.vbus) {
      this.vbus = this.ctx.createGain();
      this.vbus.gain.value = 1;
      this.vbus.connect(this.sfx);
      // A little of the library's echo.
      const send = this.ctx.createGain();
      send.gain.value = 0.25;
      this.vbus.connect(send).connect(this.reverb());
    }
    return this.vbus;
  }

  noise() {
    if (!this.noiseBuf) {
      const sr = this.ctx.sampleRate, buf = this.ctx.createBuffer(1, sr * 2, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    }
    return this.noiseBuf;
  }

  panned(pan, dest) {
    if (!this.ctx.createStereoPanner) return dest;
    const p = this.ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    p.connect(dest);
    return p;
  }

  // Bristles sweeping through the air: noise through a band that slides.
  swish(when, dur, from, to, gain, pan = 0, dest = this.sfx) {
    const t = this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 2.6;
    bp.frequency.setValueAtTime(from, t);
    bp.frequency.exponentialRampToValueAtTime(to, t + dur);
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 400;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain * 3.6, t + dur * 0.55);
    g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(bp).connect(hp).connect(g).connect(this.panned(pan, dest));
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }

  // Pages and dust scattered by the broom.
  scatter(when, dest) {
    for (let i = 0; i < 6; i++) {
      const t = this.ctx.currentTime + when + i * 0.05 + Math.random() * 0.04;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise();
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 3000 + Math.random() * 2000;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      src.connect(hp).connect(g).connect(this.panned((Math.random() - 0.5) * 1.2, dest));
      src.start(t, Math.random()); src.stop(t + 0.08);
    }
  }

  // An owl's hoot: a soft, round voice that slides a little down, with breath.
  hoot(when, f, dur, gain, dest = this.sfx) {
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(f * 1.04, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    o.frequency.exponentialRampToValueAtTime(f * 0.9, t + dur);
    const lfo = this.ctx.createOscillator(), lg = this.ctx.createGain();
    lfo.frequency.value = 6; lg.gain.value = f * 0.012;
    lfo.connect(lg).connect(o.frequency);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = f * 2.2; lp.Q.value = 2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.08, dur * 0.3));
    g.gain.setValueAtTime(gain, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp).connect(g).connect(dest);
    // breath
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 3;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(gain * 0.25, t + 0.05);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp).connect(ng).connect(dest);
    o.start(t); lfo.start(t); n.start(t, Math.random());
    o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05); n.stop(t + dur + 0.05);
  }

  // One downstroke of big, soft wings.
  wingbeat(when, gain, pan = 0, dest = this.sfx) {
    const t = this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise();
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(350, t);
    lp.frequency.exponentialRampToValueAtTime(900, t + 0.06);
    lp.frequency.exponentialRampToValueAtTime(300, t + 0.18);
    const lp2 = this.ctx.createBiquadFilter();
    lp2.type = 'lowpass'; lp2.frequency.value = 1100;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(lp).connect(lp2).connect(g).connect(this.panned(pan, dest));
    src.start(t, Math.random()); src.stop(t + 0.25);
  }

  // One syllable of a voice: a buzzing source shaped by two vowel formants,
  // with a breathy "h" at the start.
  syllable(when, f0, f1, dur, vowel, gain, dest = this.sfx) {
    const F = { a: [850, 1250], e: [560, 1900], i: [380, 2300], u: [400, 900] }[vowel];
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const lfo = this.ctx.createOscillator(), lg = this.ctx.createGain();
    lfo.frequency.value = 7.5; lg.gain.value = f0 * 0.035;
    lfo.connect(lg).connect(o.frequency);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.025);
    g.gain.exponentialRampToValueAtTime(gain * 0.6, t + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const [fc, q, level] of [[F[0], 6, 1], [F[1], 9, 0.55], [3000, 4, 0.15]]) {
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = fc; bp.Q.value = q;
      const lv = this.ctx.createGain(); lv.gain.value = level * 2.2;
      o.connect(bp).connect(lv).connect(g);
    }
    g.connect(dest);
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise();
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'bandpass'; hp.frequency.value = 2200; hp.Q.value = 0.8;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(gain * 0.5, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    n.connect(hp).connect(ng).connect(dest);
    o.start(t); lfo.start(t); n.start(t, Math.random());
    o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05); n.stop(t + 0.07);
  }

  // The witch's cackle: quick "heh-heh-heh" falling in pitch, then a long "haaa".
  cackle(when = 0, size = 1, dest = this.sfx) {
    const n = Math.round(4 + 2 * size);
    let w = when, gap = 0.15;
    for (let i = 0; i < n; i++) {
      const f = 640 - i * 22 + Math.random() * 20;
      this.syllable(w, f, f * 0.86, 0.11, i % 2 ? 'e' : 'a', 0.13, dest);
      w += gap;
      gap = Math.max(0.105, gap * 0.94);
    }
    this.syllable(w + 0.04, 700, 470, 0.5 + 0.2 * size, 'a', 0.15, dest);
  }

  // ---- the witch's voice ----
  // A glottal source (a buzz whose harmonics fall away like a real voice),
  // with unsteady pitch, a raspy crackle and breath, shaped by the vowel's
  // formants. Each syllable starts with an aspirated "h".
  glottal() {
    if (!this.glottalWave) {
      const n = 40, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) im[k] = 1 / Math.pow(k, 1.15);
      this.glottalWave = this.ctx.createPeriodicWave(re, im);
    }
    return this.glottalWave;
  }

  // f: [start, peak, end] pitch in Hz; the peak comes at `peakAt` (0–1).
  voice(when, dur, f, vowel, { gain = 0.2, rasp = 0.3, breath = 0.15, jitter = 0.03, vibrato = 0, peakAt = 0.25, h = 0.05 } = {}, dest = this.sfx) {
    const FORMANTS = {
      ee: [[300, 60, 1], [2300, 120, 0.5], [3000, 180, 0.35], [3600, 250, 0.2]],
      ih: [[400, 70, 1], [2000, 110, 0.5], [2600, 160, 0.3], [3500, 250, 0.15]],
      eh: [[560, 80, 1], [1850, 110, 0.5], [2500, 160, 0.3], [3500, 250, 0.15]],
      ae: [[720, 90, 1], [1700, 120, 0.55], [2450, 160, 0.3], [3500, 250, 0.15]],
      ah: [[800, 90, 1], [1200, 110, 0.6], [2550, 160, 0.3], [3500, 250, 0.15]],
      uh: [[600, 80, 1], [1100, 100, 0.45], [2400, 160, 0.2], [3400, 250, 0.1]],
    }[vowel];
    const ctx = this.ctx, t = ctx.currentTime + when;
    // Pitch contour with jitter, as a curve.
    const N = 48, curve = new Float32Array(N), half = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const base = x < peakAt ? f[0] + (f[1] - f[0]) * Math.sin((x / peakAt) * Math.PI / 2) : f[1] + (f[2] - f[1]) * Math.pow((x - peakAt) / (1 - peakAt), 0.8);
      const vib = vibrato ? 1 + vibrato * Math.sin(x * dur * 2 * Math.PI * 6.5) : 1;
      curve[i] = base * vib * (1 + (Math.random() - 0.5) * jitter);
      half[i] = curve[i] / 2;
    }
    const src = ctx.createOscillator();
    src.setPeriodicWave(this.glottal());
    src.frequency.setValueCurveAtTime(curve, t, dur);
    // Rasp: the voice's level wobbles at half the pitch (a cracked, fried edge).
    const raspGain = ctx.createGain();
    raspGain.gain.value = 1 - rasp / 2;
    const sub = ctx.createOscillator();
    sub.type = 'square';
    sub.frequency.setValueCurveAtTime(half, t, dur);
    const subDepth = ctx.createGain();
    subDepth.gain.value = rasp / 2;
    sub.connect(subDepth).connect(raspGain.gain);
    src.connect(raspGain);
    // Breath and the "h": noise through the same mouth shape.
    const noise = ctx.createBufferSource();
    noise.buffer = this.noise();
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(1.4, t + 0.008);
    ng.gain.linearRampToValueAtTime(breath, t + h);
    ng.gain.setValueAtTime(breath, t + dur * 0.8);
    ng.gain.linearRampToValueAtTime(0, t + dur);
    noise.connect(ng);
    // Voicing starts after the "h".
    const vg = ctx.createGain();
    vg.gain.setValueAtTime(0, t);
    vg.gain.setValueAtTime(0, t + h * 0.6);
    vg.gain.linearRampToValueAtTime(1, t + h + 0.02);
    vg.gain.setValueAtTime(1, t + dur * 0.7);
    vg.gain.linearRampToValueAtTime(0, t + dur);
    raspGain.connect(vg);
    // The mouth: formant filters in parallel.
    const mouth = ctx.createGain();
    mouth.gain.value = gain;
    for (const [fc, bw, level] of FORMANTS) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = fc; bp.Q.value = fc / bw;
      const lv = ctx.createGain(); lv.gain.value = level * 4;
      vg.connect(bp); ng.connect(bp);
      bp.connect(lv).connect(mouth);
    }
    mouth.connect(dest);
    src.start(t); sub.start(t); noise.start(t, Math.random());
    src.stop(t + dur + 0.02); sub.stop(t + dur + 0.02); noise.stop(t + dur + 0.02);
  }

  // A sharp breath in through the teeth, at the end of a laugh.
  inhale(when, dur, gain, dest = this.sfx) {
    const t = this.ctx.currentTime + when;
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise();
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 2.5;
    bp.frequency.setValueAtTime(1800, t);
    bp.frequency.linearRampToValueAtTime(3200, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + dur * 0.7);
    g.gain.linearRampToValueAtTime(0, t + dur);
    n.connect(bp).connect(g).connect(dest);
    n.start(t, Math.random()); n.stop(t + dur + 0.02);
  }

  // Three versions of the witch's evil laugh, for choosing one.
  //   A: the classic hag: a high, nasal "hee-hee-hee-hee… heeeeee!" with a trembling end.
  //   B: the slow build: low, menacing "heh… heh… heh…" that rises into "HA-HA-HA-HAAA!".
  //   C: the shriek: a fast, crackling "ah-ha-ha-ha-ha" that breaks into a scream.
  witchLaugh(variant = 'A', when = 0, size = 1, dest = this.sfx) {
    const syl = (w, d, f, v, o) => this.voice(when + w, d, f, v, o, dest);
    let w = 0;
    if (variant === 'A') {
      const n = Math.round(5 + 3 * size);
      let gap = 0.16;
      for (let i = 0; i < n; i++) {
        const p = 880 - i * 18;
        syl(w, 0.12, [p * 0.92, p * 1.06, p * 0.8], i % 3 === 2 ? 'ih' : 'ee', { gain: 0.42, rasp: 0.35, breath: 0.2, jitter: 0.05, h: 0.035 });
        w += gap; gap = Math.max(0.112, gap * 0.95);
      }
      syl(w + 0.03, 0.75 + 0.3 * size, [900, 1080, 620], 'ee', { gain: 0.46, rasp: 0.45, breath: 0.2, jitter: 0.06, vibrato: 0.05, peakAt: 0.15, h: 0.04 });
      this.inhale(when + w + 0.95 + 0.3 * size, 0.32, 0.2, dest);
    } else if (variant === 'B') {
      for (let i = 0; i < 3; i++) {
        syl(w, 0.2, [230, 245, 200], 'eh', { gain: 0.22, rasp: 0.7, breath: 0.25, jitter: 0.06, h: 0.06 });
        w += 0.42 - i * 0.06;
      }
      const n = Math.round(4 + 2 * size);
      for (let i = 0; i < n; i++) {
        const p = 300 + i * 55;
        syl(w, 0.13, [p * 0.95, p * 1.08, p * 0.82], 'ah', { gain: 0.2, rasp: 0.45, breath: 0.15, jitter: 0.05, h: 0.03 });
        w += 0.15;
      }
      syl(w + 0.02, 0.85 + 0.3 * size, [620, 720, 360], 'ah', { gain: 0.22, rasp: 0.5, breath: 0.15, jitter: 0.05, vibrato: 0.04, peakAt: 0.2, h: 0.035 });
    } else {
      const n = Math.round(7 + 3 * size);
      for (let i = 0; i < n; i++) {
        const p = 620 + Math.sin(i * 1.7) * 60 + i * 12;
        syl(w, 0.085, [p * 0.9, p * 1.12, p * 0.75], i % 2 ? 'ah' : 'ae', { gain: 0.17, rasp: 0.6, breath: 0.22, jitter: 0.08, h: 0.022 });
        w += 0.095;
      }
      syl(w + 0.02, 0.55 + 0.2 * size, [900, 1400, 1100], 'ae', { gain: 0.16, rasp: 0.55, breath: 0.3, jitter: 0.09, vibrato: 0.06, peakAt: 0.3, h: 0.02 });
      syl(w + 0.6 + 0.2 * size, 0.35, [1050, 1100, 520], 'ah', { gain: 0.13, rasp: 0.6, breath: 0.3, jitter: 0.08, peakAt: 0.1, h: 0.02 });
    }
  }

  sweep(from, to, dur, type = 'sine', gain = 0.12, vibrato = 0, when = 0) {
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    if (vibrato) {
      const lfo = this.ctx.createOscillator();
      const lg = this.ctx.createGain();
      lfo.frequency.value = vibrato;
      lg.gain.value = from * 0.05;
      lfo.connect(lg).connect(osc.frequency);
      lfo.start(t); lfo.stop(t + dur);
    }
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(lp).connect(g).connect(this.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  growl(freq, dur, gain) {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 1.4, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + dur);
    const lfo = this.ctx.createOscillator();
    const lg = this.ctx.createGain();
    lfo.frequency.value = 23;
    lg.gain.value = gain * 0.6;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lfo.connect(lg).connect(g.gain);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    osc.connect(lp).connect(g).connect(this.sfx);
    osc.start(t); lfo.start(t);
    osc.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
  }

  noiseBursts(n, len, freq, gain, type = 'bandpass', swell = false) {
    const sr = this.ctx.sampleRate;
    for (let k = 0; k < n; k++) {
      const t = this.ctx.currentTime + k * len * 0.9;
      const buf = this.ctx.createBuffer(1, Math.floor(sr * len), sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const x = i / d.length;
        d[i] = (Math.random() * 2 - 1) * (swell ? Math.sin(Math.PI * x) : Math.pow(1 - x, 2));
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.value = gain;
      src.connect(f).connect(g).connect(this.sfx);
      src.start(t);
    }
  }

  // ---- music: a drone on D and A with a wandering Dorian melody ----
  // A long, cathedral-like reverb, generated rather than recorded.
  reverb() {
    if (this.verb) return this.verb;
    const sr = this.ctx.sampleRate, len = Math.floor(sr * 3.2);
    const ir = this.ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) * (i < sr * 0.012 ? i / (sr * 0.012) : 1);
    }
    const conv = this.ctx.createConvolver();
    conv.buffer = ir;
    const wet = this.ctx.createGain();
    wet.gain.value = 0.55;
    conv.connect(wet).connect(this.music);
    this.verb = conv;
    return conv;
  }

  // A breathy, recorder-like voice: sine with a little body and breath noise.
  recorder(f, when, dur, gain = 0.2) {
    const t = this.ctx.currentTime + when;
    const out = this.ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(gain, t + 0.07);
    out.gain.setValueAtTime(gain * 0.85, t + Math.max(0.08, dur - 0.12));
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    const o1 = this.ctx.createOscillator();
    o1.frequency.value = f;
    const o2 = this.ctx.createOscillator();
    o2.type = 'triangle';
    o2.frequency.value = f * 2;
    const g2 = this.ctx.createGain();
    g2.gain.value = 0.12;
    // gentle vibrato that blooms after the attack
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 5.2;
    const lg = this.ctx.createGain();
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(f * 0.004, t + Math.min(0.4, dur));
    lfo.connect(lg);
    lg.connect(o1.frequency);
    lg.connect(o2.frequency);
    o1.connect(out);
    o2.connect(g2).connect(out);
    // breath
    const sr = this.ctx.sampleRate, n = Math.floor(sr * (dur + 0.1));
    const buf = this.ctx.createBuffer(1, n, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const br = this.ctx.createBufferSource();
    br.buffer = buf;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f * 2;
    bp.Q.value = 2;
    const bg = this.ctx.createGain();
    bg.gain.value = 0.05;
    br.connect(bp).connect(bg).connect(out);
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3200;
    out.connect(lp);
    lp.connect(this.music);
    lp.connect(this.reverb());
    for (const node of [o1, o2, lfo, br]) { node.start(t); node.stop(t + dur + 0.1); }
  }

  frameDrum(when, gain = 0.12) {
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.25);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(g);
    g.connect(this.music);
    g.connect(this.reverb());
    osc.start(t);
    osc.stop(t + 0.45);
  }

  // ---- music: an estampie for recorder, harp and drone (see music.js) ----
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const t = this.ctx.currentTime;
    this.reverb();
    // Drone on D and A that breathes slowly, like a hurdy-gurdy far away.
    for (const [f, g0] of [[73.42, 0.06], [110, 0.045], [146.83, 0.025]]) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 420;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(g0, t + 4);
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.07 + Math.random() * 0.05;
      const lg = this.ctx.createGain();
      lg.gain.value = g0 * 0.4;
      lfo.connect(lg).connect(g.gain);
      osc.connect(lp).connect(g);
      g.connect(this.music);
      g.connect(this.reverb());
      osc.start(t);
      lfo.start(t);
    }
    // The tune, scheduled a little ahead of time so it never stutters.
    const notes = notesOf(TUNE);
    const eighth = 60 / TUNE.bpm;
    let i = 0, beat = 0;
    let nextAt = this.ctx.currentTime + 3;
    const schedule = () => {
      while (nextAt < this.ctx.currentTime + 0.6) {
        const [deg, len] = notes[i];
        const when = nextAt - this.ctx.currentTime;
        const dur = len * eighth;
        if (deg !== null) this.recorder(freq(deg), when, dur * 0.95);
        // Harp: an open fifth arpeggio at the start of each 6/8 bar.
        for (let b = 0; b < len; b++) {
          if ((beat + b) % 6 === 0) {
            const at = when + b * eighth;
            this.pluck(freq(-7), at, 0.22, this.music);
            this.pluck(freq(-3), at + eighth, 0.16, this.music);
            this.pluck(freq(0), at + eighth * 2, 0.14, this.music);
            this.frameDrum(at, 0.07);
          }
        }
        beat += len;
        nextAt += dur;
        i++;
        if (i >= notes.length) { i = 0; beat = 0; nextAt += eighth * 12; }
      }
    };
    schedule();
    this.musicTimer = setInterval(schedule, 150);
  }
}

export const audio = new Audio();
