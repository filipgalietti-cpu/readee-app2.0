/**
 * Browser audio helpers for Gemini Live.
 *
 * Live expects 16-bit PCM at 16 kHz, mono. Browser AudioContext usually
 * runs at 48 kHz, so we downsample. Live sends back 24-kHz PCM that we
 * decode and queue into a streaming AudioBuffer for low-latency
 * playback.
 */

export const LIVE_INPUT_SAMPLE_RATE = 16000;
export const LIVE_OUTPUT_SAMPLE_RATE = 24000;

/** Downsample Float32 mono PCM from sourceRate to targetRate (linear). */
export function downsampleFloat32(
  input: Float32Array,
  sourceRate: number,
  targetRate: number,
): Float32Array {
  if (sourceRate === targetRate) return input;
  const ratio = sourceRate / targetRate;
  const newLen = Math.floor(input.length / ratio);
  const out = new Float32Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const idx = i * ratio;
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, input.length - 1);
    const frac = idx - lo;
    out[i] = input[lo] * (1 - frac) + input[hi] * frac;
  }
  return out;
}

/** Convert Float32 [-1, 1] to little-endian 16-bit PCM. */
export function floatTo16BitPCM(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

export function int16ToBase64(arr: Int16Array): string {
  const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  return btoa(binary);
}

export function base64ToInt16(b64: string): Int16Array {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
}

/** Convert int16 PCM at sampleRate → AudioBuffer in the given AudioContext. */
export function int16PcmToAudioBuffer(
  ctx: AudioContext,
  pcm: Int16Array,
  sampleRate: number,
): AudioBuffer {
  const buffer = ctx.createBuffer(1, pcm.length, sampleRate);
  const ch = buffer.getChannelData(0);
  for (let i = 0; i < pcm.length; i++) {
    ch[i] = pcm[i] / 0x8000;
  }
  return buffer;
}

/**
 * Streaming player: queue chunks; each new chunk schedules itself right
 * after the previous one for gapless playback. Returns a small handle
 * that lets the caller stop/clear (used when the kid interrupts).
 */
export class StreamingPcmPlayer {
  private ctx: AudioContext;
  private nextStartTime = 0;
  private active = new Set<AudioBufferSourceNode>();
  private sampleRate: number;

  constructor(ctx: AudioContext, sampleRate: number) {
    this.ctx = ctx;
    this.sampleRate = sampleRate;
  }

  enqueue(pcm: Int16Array) {
    const buffer = int16PcmToAudioBuffer(this.ctx, pcm, this.sampleRate);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    const now = this.ctx.currentTime;
    const start = Math.max(now, this.nextStartTime);
    source.start(start);
    this.nextStartTime = start + buffer.duration;
    this.active.add(source);
    source.onended = () => this.active.delete(source);
  }

  /** Stop everything that's currently scheduled or playing (interrupt). */
  stop() {
    for (const src of this.active) {
      try {
        src.stop();
      } catch {}
    }
    this.active.clear();
    this.nextStartTime = this.ctx.currentTime;
  }

  isPlaying(): boolean {
    return this.active.size > 0 || this.nextStartTime > this.ctx.currentTime + 0.05;
  }
}
