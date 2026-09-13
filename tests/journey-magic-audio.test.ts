import { describe, expect, it, vi } from 'vitest';
import { scheduleJourneyMagic } from '@/lib/audio/journey-magic';

function audioContext(state = 'running') {
  const voices: Array<{ start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }> = [];
  const gains: Array<{ disconnect: ReturnType<typeof vi.fn> }> = [];
  const context = {
    state, currentTime: 10, destination: {},
    createGain: vi.fn(() => {
      const gain = { gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
      gains.push(gain); return gain;
    }),
    createOscillator: vi.fn(() => {
      const voice = { frequency: { value: 0 }, type: '', connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null };
      voices.push(voice); return voice;
    }),
  };
  return { context: context as unknown as AudioContext, voices, gains };
}

describe('Journey magician sound', () => {
  it('anchors the wand and ta-da to the actual CSS routine start', () => {
    const { context, voices } = audioContext();
    scheduleJourneyMagic(context);
    expect(voices).toHaveLength(11);
    expect(voices[0].start).toHaveBeenCalledWith(11.92);
    expect(voices[5].start).toHaveBeenCalledWith(14.5);
    expect(voices[10].stop).toHaveBeenCalledWith(15.72);
  });
  it('cancels every scheduled voice on skip, mute, or unmount', () => {
    const { context, voices, gains } = audioContext();
    const cancel = scheduleJourneyMagic(context);
    cancel();
    expect(gains[0].disconnect).toHaveBeenCalledOnce();
    voices.forEach((voice) => expect(voice.stop).toHaveBeenLastCalledWith());
  });
  it('does not queue surprise sounds in a browser that blocked autoplay', () => {
    const { context, voices } = audioContext('suspended');
    scheduleJourneyMagic(context)();
    expect(voices).toHaveLength(0);
  });
});
