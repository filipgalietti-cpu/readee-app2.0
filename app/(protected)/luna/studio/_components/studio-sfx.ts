/**
 * Tiny Web-Audio synth for the Story Studio publish celebration — no audio
 * assets, just oscillators. Created on the publish click (a user gesture) so
 * autoplay policies are satisfied. Everything is best-effort: if the browser
 * has no AudioContext, every call is a silent no-op.
 */

type Sfx = {
  whoosh: () => void;
  stamp: () => void;
  fanfare: () => void;
  coin: () => void;
};

export function playPublishSfx(): Sfx {
  let ctx: AudioContext | null = null;
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (AC) ctx = new AC();
  } catch {
    ctx = null;
  }

  const now = () => ctx!.currentTime;

  // One shaped oscillator note.
  function tone(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType = "sine",
    gain = 0.18,
    freqEnd?: number,
  ) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (freqEnd != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  // Filtered noise burst (whoosh / stamp thud).
  function noise(start: number, dur: number, gain: number, cutoff: number) {
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.setValueAtTime(cutoff, start);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filt).connect(g).connect(ctx.destination);
    src.start(start);
    src.stop(start + dur);
  }

  const safe = (fn: () => void) => () => {
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    try {
      fn();
    } catch {
      /* ignore */
    }
  };

  return {
    whoosh: safe(() => noise(now(), 0.45, 0.12, 1400)),
    stamp: safe(() => {
      noise(now(), 0.14, 0.28, 700);
      tone(140, now(), 0.18, "square", 0.14, 60);
    }),
    fanfare: safe(() => {
      const t = now();
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.09, 0.32, "triangle", 0.16));
    }),
    coin: safe(() => {
      const t = now();
      tone(987.77, t, 0.09, "square", 0.14);
      tone(1318.5, t + 0.08, 0.22, "square", 0.14);
    }),
  };
}
