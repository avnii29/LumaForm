import { pixelLuminance } from './luminance.js';

/**
 * Sobel edge magnitudes for an RGBA ImageData buffer.
 * Returns a Float32Array of length width*height, values 0–255.
 */
export function sobelEdges(data, width, height) {
  const out = new Float32Array(width * height);

  const gxK = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
  const gyK = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nx = Math.min(width - 1, Math.max(0, x + kx));
          const ny = Math.min(height - 1, Math.max(0, y + ky));
          const i = (ny * width + nx) * 4;
          const gray = pixelLuminance(data[i], data[i + 1], data[i + 2]);
          gx += gxK[ky + 1][kx + 1] * gray;
          gy += gyK[ky + 1][kx + 1] * gray;
        }
      }

      let mag = Math.sqrt(gx * gx + gy * gy);
      if (mag > 255) mag = 255;
      out[y * width + x] = mag;
    }
  }

  return out;
}

/** Blend weights for edge enhancement levels. */
export const EDGE_WEIGHTS = {
  off: 0,
  low: 0.15,
  medium: 0.3,
  high: 0.5,
};
