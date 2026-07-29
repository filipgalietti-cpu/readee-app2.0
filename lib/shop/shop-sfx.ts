/* Readee shop audio — a faithful port of the Claude Design `sfx.js`.
   Everything is synthesised with Web Audio, so there are no asset files
   to ship and nothing to preload. Each cue is a short arrangement: a
   riser for the charge, a brass-and-bells hit for the reveal (scaled by
   rarity), a whoosh + chime for the outfit swap, a small confirm blip.

   Mute is driven by the app-wide audio store (useAudioStore.isMuted) —
   the shop page calls `shopSfx.setMuted()` on mount and whenever it
   changes, so this module never keeps its own source of truth.

   Browsers only allow audio after a user gesture; every cue is fired
   from a click, and ctx.resume() covers the first one. */

type ToneOpts = {
  glideTo?: number;
  detune?: number;
  attack?: number;
  filter?: [number, number];
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let chargeVoices: AudioScheduledSourceNode[] = [];

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function noiseBuffer(sec: number): AudioBuffer {
  const c = ctx!;
  const n = Math.floor(c.sampleRate * sec);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/* One voice: osc → gain envelope → (optional filter) → master */
function tone(type: OscillatorType, freq: number, t0: number, dur: number, peak: number, opts?: ToneOpts): OscillatorNode {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (opts && opts.glideTo) o.frequency.exponentialRampToValueAtTime(opts.glideTo, t0 + dur);
  if (opts && opts.detune) o.detune.value = opts.detune;
  const attack = (opts && opts.attack) || 0.012;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let last: AudioNode = g;
  if (opts && opts.filter) {
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(opts.filter[0], t0);
    f.frequency.exponentialRampToValueAtTime(opts.filter[1], t0 + dur * 0.7);
    f.Q.value = 1.2;
    g.connect(f);
    last = f;
  }
  last.connect(master!);
  o.connect(g);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
  return o;
}

function noise(t0: number, dur: number, peak: number, from: number, to: number, q?: number): AudioBufferSourceNode {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(dur + 0.1);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q || 1.1;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + dur * 0.55);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master!);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
  return src;
}

const N = {
  C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9,
  C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568,
};

export const shopSfx = {
  get muted() {
    return muted;
  },

  /** Sync mute with the app-wide audio store. */
  setMuted(v: boolean) {
    muted = v;
    if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.05);
  },

  /* Tension riser under the shaking box: pitch climbs, noise swells,
     heartbeat thumps get faster. */
  charge(dur?: number) {
    if (muted || !ac()) return;
    const c = ctx!;
    const t = c.currentTime;
    const d = dur || 1.75;
    shopSfx.stopCharge();

    const o = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(700, t + d);
    f.type = "lowpass";
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(4200, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + d * 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.12);
    o.connect(f);
    f.connect(g);
    g.connect(master!);
    o.start(t);
    o.stop(t + d + 0.2);

    const sh = noise(t, d, 0.1, 400, 6000, 0.8);
    chargeVoices = [o, sh];

    // Accelerating heartbeat. The gap shrinks geometrically, so its sum
    // converges below (t + d) — without a floor on `gap` the loop never
    // reaches the cutoff and spins forever (freeze). Stop once the beat is
    // fast enough (gap tiny) or we've run out of time.
    let beat = t + 0.1;
    let gap = 0.42;
    while (beat < t + d - 0.05 && gap > 0.06) {
      tone("sine", 58, beat, 0.16, 0.5, { attack: 0.005 });
      beat += gap;
      gap *= 0.72;
    }
  },

  stopCharge() {
    if (!ctx) return;
    for (const v of chargeVoices) {
      try {
        v.stop(ctx.currentTime + 0.03);
      } catch {
        /* already stopped */
      }
    }
    chargeVoices = [];
  },

  /* The lid goes: impact, then a brass swell and a bell arpeggio whose
     size depends on what fell out. */
  reveal(tier: string) {
    if (muted || !ac()) return;
    shopSfx.stopCharge();
    const t = ctx!.currentTime;
    const big = tier === "legendary" || tier === "epic";

    // Impact
    tone("sine", 110, t, 0.5, 0.75, { glideTo: 42, attack: 0.004 });
    noise(t, 0.34, 0.34, 1800, 260, 0.7);

    // Brass swell — root, fifth, octave
    const root = big ? N.C4 : N.A4;
    [1, 1.5, 2].forEach((mult, i) => {
      tone("sawtooth", root * mult, t + 0.02 + i * 0.012, big ? 1.5 : 0.9, big ? 0.13 : 0.09, {
        attack: 0.05,
        filter: [700, big ? 3600 : 2400],
        detune: i * 4,
      });
    });

    // Bell arpeggio
    const arp = big ? [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6] : [N.A4, N.C5, N.E5, N.A5];
    arp.forEach((f, i) => {
      tone("triangle", f, t + 0.14 + i * 0.075, 0.85, 0.2, { attack: 0.006 });
      tone("sine", f * 2, t + 0.14 + i * 0.075, 0.5, 0.07, { attack: 0.006 });
    });

    // Legendary gets a shimmer tail
    if (tier === "legendary") {
      for (let i = 0; i < 10; i++) {
        const f = 1200 + Math.random() * 2600;
        tone("sine", f, t + 0.5 + Math.random() * 0.9, 0.4, 0.05, { attack: 0.004 });
      }
      tone("sawtooth", N.C4 / 2, t + 0.1, 2.0, 0.1, { attack: 0.1, filter: [400, 2000] });
    }
  },

  /* Outfit swap: the old look whooshes off, the new one lands on a
     bright major chime. */
  swap() {
    if (muted || !ac()) return;
    const t = ctx!.currentTime;

    // Spin-out whoosh
    noise(t, 0.55, 0.26, 2600, 380, 1.6);
    tone("sine", 520, t, 0.5, 0.14, { glideTo: 130, attack: 0.01 });

    // Arrival thump on the landing
    tone("sine", 96, t + 0.52, 0.4, 0.6, { glideTo: 48, attack: 0.004 });
    noise(t + 0.5, 0.22, 0.2, 900, 200, 0.9);

    // Major chime triad + sparkle
    [N.D5, N.G5, N.B4 * 2].forEach((f, i) => {
      tone("triangle", f, t + 0.54 + i * 0.05, 1.0, 0.19, { attack: 0.006 });
      tone("sine", f * 2, t + 0.54 + i * 0.05, 0.55, 0.06, { attack: 0.006 });
    });
    for (let i = 0; i < 6; i++) {
      tone("sine", 1600 + Math.random() * 1800, t + 0.6 + Math.random() * 0.5, 0.35, 0.045, { attack: 0.004 });
    }
  },

  /* Small confirmation blip for buy/equip taps. */
  blip() {
    if (muted || !ac()) return;
    const t = ctx!.currentTime;
    tone("triangle", N.E5, t, 0.14, 0.14, { attack: 0.004 });
    tone("triangle", N.A5, t + 0.07, 0.16, 0.1, { attack: 0.004 });
  },
};
