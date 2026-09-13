/** Musical accents synchronized to the saved magician's six-second CSS routine.
 * No speech synthesis, asset fetch, or delayed playback after an autoplay block.
 */
export function scheduleJourneyMagic(context: AudioContext): () => void {
  if (context.state !== "running") return () => {};
  const output = context.createGain();
  output.gain.value = 0.22;
  output.connect(context.destination);
  const voices: OscillatorNode[] = [];
  const origin = context.currentTime;
  const note = (frequency: number, offset: number, duration: number, level = 0.35) => {
    const voice = context.createOscillator();
    const envelope = context.createGain();
    const start = origin + offset;
    voice.type = "sine";
    voice.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(level, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
    voice.connect(envelope);
    envelope.connect(output);
    voice.onended = () => { voice.disconnect(); envelope.disconnect(); };
    voice.start(start);
    voice.stop(start + duration);
    voices.push(voice);
  };
  // Wand flick at 32%, carrot reveal at 48%, musical ta-da at 75%.
  [784, 988, 1175, 1568].forEach((pitch, index) => note(pitch, 1.92 + index * 0.09, 0.42));
  note(1047, 2.88, 0.35, 0.25);
  [523, 659, 784].forEach((pitch) => note(pitch, 4.5, 0.65, 0.28));
  [659, 784, 1047].forEach((pitch) => note(pitch, 4.82, 0.9, 0.28));
  return () => {
    // Disconnect immediately on mute, skip, replay, or navigation.
    output.disconnect();
    voices.forEach((voice) => { try { voice.stop(); } catch {} });
  };
}
