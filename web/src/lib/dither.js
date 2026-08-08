/**
 * Floyd–Steinberg error diffusion on a Float32 luminance buffer (mutates in place).
 * Quantizes each sample toward the nearest of `levels` steps (default = charset length).
 */
export function floydSteinberg(buffer, width, height, levels) {
  const n = Math.max(2, levels);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = buffer[i];
      const step = 255 / (n - 1);
      const neu = Math.round(old / step) * step;
      buffer[i] = neu;
      const err = old - neu;

      if (x + 1 < width) buffer[i + 1] += (err * 7) / 16;
      if (y + 1 < height) {
        if (x > 0) buffer[i + width - 1] += (err * 3) / 16;
        buffer[i + width] += (err * 5) / 16;
        if (x + 1 < width) buffer[i + width + 1] += (err * 1) / 16;
      }
    }
  }

  // Clamp after diffusion
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] < 0) buffer[i] = 0;
    else if (buffer[i] > 255) buffer[i] = 255;
  }
}
