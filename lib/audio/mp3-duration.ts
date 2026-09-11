/** Read MPEG Layer III frame durations without decoding audio or requiring a server binary. */
export function mp3DurationSeconds(audio: Uint8Array): number | null {
  let offset = 0,
    seconds = 0,
    frames = 0;
  if (audio[0] === 73 && audio[1] === 68 && audio[2] === 51) {
    if (audio.length < 10) return null;
    offset =
      10 +
      ((audio[6] & 127) << 21) +
      ((audio[7] & 127) << 14) +
      ((audio[8] & 127) << 7) +
      (audio[9] & 127);
    if (audio[5] & 16) offset += 10;
  }
  while (offset + 4 <= audio.length) {
    const a = audio[offset],
      b = audio[offset + 1],
      c = audio[offset + 2];
    if (a !== 255 || (b & 224) !== 224) {
      // A trailing ID3v1 tag is metadata, not speech.
      if (frames && audio.length - offset === 128 && a === 84 && b === 65 && c === 71) break;
      return null;
    }
    const version = (b >> 3) & 3,
      layer = (b >> 1) & 3,
      bitrateIndex = c >> 4,
      rateIndex = (c >> 2) & 3;
    if (
      version === 1 ||
      layer !== 1 ||
      bitrateIndex === 0 ||
      bitrateIndex === 15 ||
      rateIndex === 3
    )
      return null;
    const bitrates =
      version === 3
        ? [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
        : [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
    const rate = [44100, 48000, 32000][rateIndex] / (version === 3 ? 1 : version === 2 ? 2 : 4);
    const length =
      Math.floor(((version === 3 ? 144 : 72) * bitrates[bitrateIndex] * 1000) / rate) +
      ((c >> 1) & 1);
    if (offset + length > audio.length) return null;
    seconds += (version === 3 ? 1152 : 576) / rate;
    frames++;
    offset += length;
  }
  return frames ? seconds : null;
}
