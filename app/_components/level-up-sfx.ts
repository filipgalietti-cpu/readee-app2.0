/**
 * Synthesized celebration sounds for the Level-Up Burst — a faithful port of
 * the Claude Design `sfx.js`. All Web Audio, no asset files. Lazy singleton
 * context that unlocks on first use (works once the page has any prior user
 * gesture, which the practice/lesson flow always has by completion time).
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext
      || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function env(node: GainNode, t0: number, a: number, peak: number, d: number) {
  node.gain.setValueAtTime(0.0001, t0);
  node.gain.linearRampToValueAtTime(peak, t0 + a);
  node.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
}

type ToneOpts = {
  type?: OscillatorType;
  dur?: number;
  vol?: number;
  attack?: number;
  glideTo?: number | null;
  delay?: number;
};

function tone(freq: number, o: ToneOpts = {}) {
  const c = ac();
  if (!c || !master) return;
  const { type = "sine", dur = 0.3, vol = 0.3, attack = 0.01, glideTo = null, delay = 0 } = o;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  env(g, t0, attack, vol, dur);
  osc.connect(g); g.connect(master);
  osc.start(t0); osc.stop(t0 + attack + dur + 0.05);
}

type NoiseOpts = { dur?: number; vol?: number; delay?: number; hp?: number; lpFrom?: number | null; lpTo?: number | null };

function noise(o: NoiseOpts = {}) {
  const c = ac();
  if (!c || !master) return;
  const { dur = 0.4, vol = 0.2, delay = 0, hp = 1000, lpFrom = null, lpTo = null } = o;
  const t0 = c.currentTime + delay;
  const len = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "highpass"; f.frequency.value = hp;
  let node: AudioNode = src;
  node.connect(f); node = f;
  if (lpFrom) {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(lpFrom, t0);
    lp.frequency.exponentialRampToValueAtTime(lpTo || lpFrom, t0 + dur);
    node.connect(lp); node = lp;
  }
  const g = c.createGain();
  env(g, t0, 0.01, vol, dur);
  node.connect(g); g.connect(master);
  src.start(t0); src.stop(t0 + dur + 0.05);
}

export const LevelUpSFX = {
  unlock() { ac(); },

  /** rising rocket whoosh — badge launches up */
  whoosh() {
    noise({ dur: 0.55, vol: 0.28, hp: 400, lpFrom: 600, lpTo: 6000 });
    tone(180, { type: "sine", dur: 0.55, vol: 0.12, glideTo: 900 });
  },

  /** badge lock-in: thump + shimmer */
  impact() {
    tone(120, { type: "sine", dur: 0.25, vol: 0.5, glideTo: 55 });
    noise({ dur: 0.35, vol: 0.14, hp: 2500 });
    [783.99, 987.77, 1174.66, 1318.51].forEach((f, i) =>
      tone(f, { type: "sine", dur: 0.4, vol: 0.06, delay: 0.05 + i * 0.05 }));
  },

  /** LEVEL UP! fanfare — warm major triad run (C4 E4 G4 C5) + final chord */
  fanfare() {
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((f, i) => {
      tone(f, { type: "triangle", dur: 0.5, vol: 0.26, delay: i * 0.09 });
      tone(f * 2, { type: "sine", dur: 0.4, vol: 0.05, delay: i * 0.09 });
    });
    [261.63, 329.63, 392.0, 523.25].forEach((f) =>
      tone(f, { type: "triangle", dur: 0.9, vol: 0.11, delay: 0.36 }));
    tone(130.81, { type: "sine", dur: 0.9, vol: 0.14, delay: 0.36 });
  },

  /** number tick-up pop */
  pop() {
    tone(440, { type: "square", dur: 0.12, vol: 0.14, glideTo: 880 });
    tone(1760, { type: "sine", dur: 0.25, vol: 0.12, delay: 0.04 });
  },

  /** reward pill lands */
  thump() {
    tone(200, { type: "sine", dur: 0.18, vol: 0.35, glideTo: 90 });
    noise({ dur: 0.12, vol: 0.1, hp: 2000 });
  },

  /** carrots popping out */
  carrotPop(i: number) {
    const f = 500 + i * 90;
    tone(f, { type: "square", dur: 0.09, vol: 0.1, glideTo: f * 1.8 });
  },

  /** one counter tick — pentatonic climb with progress p (0..1) */
  tick(p: number) {
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5, 1568, 1760];
    const f = scale[Math.min(scale.length - 1, Math.floor(p * scale.length))];
    const c = ac();
    if (!c || !master) return;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f * 0.94, t0);
    o.frequency.exponentialRampToValueAtTime(f, t0 + 0.02);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.16, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + 0.12);
    tone(f * 2, { type: "sine", dur: 0.06, vol: 0.05 * (1 - p * 0.5) });
  },

  /** count lands on final number — satisfying ding */
  ding() {
    tone(1318.5, { type: "sine", dur: 0.7, vol: 0.22 });
    tone(1975.5, { type: "sine", dur: 0.8, vol: 0.12, delay: 0.03 });
    tone(659.25, { type: "triangle", dur: 0.5, vol: 0.1 });
  },

  /** soft settle chime at the end */
  settle() {
    [783.99, 1046.5].forEach((f, i) =>
      tone(f, { type: "sine", dur: 1.2, vol: 0.07, delay: i * 0.12 }));
  },
};
