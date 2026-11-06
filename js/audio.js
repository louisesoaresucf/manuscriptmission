// All sound is synthesised with the Web Audio API: no audio files.
// A plucked "lute" (Karplus-Strong), bells in D Dorian, a soft drone and a
// slow modal melody. Audio starts on the first tap (required by iOS).

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
    this.music.gain.value = 0.28;
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
  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const t = this.ctx.currentTime;
    this.drone = [];
    for (const f of [D3 / 2, (D3 * 3) / 4]) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 380;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.07, t + 3);
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.09 + Math.random() * 0.05;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.025;
      lfo.connect(lfoGain).connect(g.gain);
      osc.connect(lp).connect(g).connect(this.music);
      osc.start(t);
      lfo.start(t);
      this.drone.push(osc, lfo, g);
    }
    let degree = 7;
    const phrase = () => {
      // A gentle random walk, resting now and then.
      const beat = 0.62;
      for (let i = 0; i < 8; i++) {
        if (Math.random() < 0.18) continue;
        degree = Math.max(3, Math.min(13, degree + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)]));
        this.pluck(noteFreq(degree, 0), i * beat, 0.32, this.music);
        if (i % 4 === 0) this.pluck(noteFreq(degree - 7, 0), i * beat, 0.18, this.music);
      }
    };
    phrase();
    this.musicTimer = setInterval(phrase, 0.62 * 8 * 1000 + 600);
  }
}

export const audio = new Audio();
