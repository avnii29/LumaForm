import { CELL_W, CELL_H } from './constants.js';

/**
 * Character-cell aspect ratio correction.
 *
 * Monospace glyphs are taller than they are wide. If we only scale by
 * image aspect ratio, ASCII looks vertically stretched.
 *
 * CHAR_ASPECT = CELL_W / CELL_H (canvas glyph box in AsciiCanvas).
 * The C CLI uses ~0.45 for typical terminal fonts — different environment.
 *
 * targetHeight = imageHeight / imageWidth * cols * CHAR_ASPECT
 */
export const CHAR_ASPECT = CELL_W / CELL_H;

export function asciiDimensions(imageWidth, imageHeight, cols, charAspect = CHAR_ASPECT) {
  const rows = Math.max(1, Math.round((imageHeight / imageWidth) * cols * charAspect));
  return { cols, rows };
}

/**
 * Draw a source image onto a canvas at cols×rows using the browser's
 * bilinear (or better) scaling — smoother than nearest-neighbour.
 * Returns ImageData (RGBA).
 */
export function sampleImageData(image, cols, rows) {
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, cols, rows);
  return ctx.getImageData(0, 0, cols, rows);
}
