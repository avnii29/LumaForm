/** ITU-R BT.709 perceptual luminance (0–255). */
export function pixelLuminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Adjust brightness then contrast.
 * brightness: -100…100 (additive offset in luminance units, scaled)
 * contrast: -100…100 (0 = no change; maps to a multiplier around 1)
 */
export function adjustTone(luminance, brightness, contrast) {
  // brightness slider: ±100 → ±80 luminance units
  let value = luminance + (brightness / 100) * 80;

  // contrast around midpoint 127.5; factor 1.0 leaves values unchanged
  const factor = 1 + contrast / 100;
  value = (value - 127.5) * factor + 127.5;

  if (value < 0) return 0;
  if (value > 255) return 255;
  return value;
}
