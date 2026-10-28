/* Bashayers Halloween Party Mixer: onset-strength tracker for tempo (BPM) detection.
   Runs as an AudioWorklet on the tab's own audio (shared by the user) and posts an
   "onset envelope" (how sharply the sound gets louder, per ~5 ms hop) to the page.
   The page turns that envelope into a BPM estimate. No audio leaves the browser. */

class OnsetEnvelope {
  constructor(sampleRate, hop = 256) {
    this.sr = sampleRate; this.hop = hop; this.n = 0;
    // Four bands: kick, bass/snare body, mids, hats. RBJ biquads (band-pass, constant 0 dB peak).
    this.bands = [[60, 1.0], [220, 1.0], [1000, 1.0], [5000, 0.9]].map(([f, q]) => this.bp(f, q));
    this.acc = new Float64Array(4); this.prev = new Float64Array(4);
  }
  bp(f0, q) {
    const w = 2 * Math.PI * f0 / this.sr, a = Math.sin(w) / (2 * q), c = Math.cos(w), a0 = 1 + a;
    return { b0: a / a0, b2: -a / a0, a1: -2 * c / a0, a2: (1 - a) / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
  }
  /* Feed mono samples; calls out(value) once per hop. */
  push(samples, out) {
    const B = this.bands, acc = this.acc;
    for (let i = 0; i < samples.length; i++) {
      const x = samples[i];
      for (let k = 0; k < 4; k++) {
        const f = B[k];
        const y = f.b0 * x + f.b2 * f.x2 - f.a1 * f.y1 - f.a2 * f.y2;
        f.x2 = f.x1; f.x1 = x; f.y2 = f.y1; f.y1 = y;
        acc[k] += y * y;
      }
      if (++this.n === this.hop) {
        let onset = 0;
        for (let k = 0; k < 4; k++) {
          const c = Math.log1p(60 * Math.sqrt(acc[k] / this.hop)); // compressed band loudness
          const d = c - this.prev[k];
          if (d > 0) onset += k === 0 ? 1.4 * d : d;                // only rises count; weight the kick
          this.prev[k] = c; acc[k] = 0;
        }
        this.n = 0; out(onset);
      }
    }
  }
}

if (typeof AudioWorkletProcessor !== "undefined") {
  class OnsetProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.env = new OnsetEnvelope(sampleRate);
      this.buf = []; this.mono = new Float32Array(128);
    }
    process(inputs) {
      const ch = inputs[0];
      if (ch && ch.length) {
        const n = ch[0].length;
        if (this.mono.length !== n) this.mono = new Float32Array(n);
        for (let i = 0; i < n; i++) { let s = 0; for (let c = 0; c < ch.length; c++) s += ch[c][i]; this.mono[i] = s / ch.length; }
        this.env.push(this.mono, v => this.buf.push(v));
        if (this.buf.length >= 32) {
          this.port.postMessage({ fs: sampleRate / this.env.hop, values: this.buf });
          this.buf = [];
        }
      }
      return true;
    }
  }
  registerProcessor("onset-envelope", OnsetProcessor);
}

if (typeof module !== "undefined") module.exports = { OnsetEnvelope };
