import { CHARSETS, luminanceToChar } from './characters.js';
import { pixelLuminance, adjustTone } from './luminance.js';
import { asciiDimensions, sampleImageData, CHAR_ASPECT } from './resize.js';
import { sobelEdges, EDGE_WEIGHTS } from './sobel.js';
import { floydSteinberg } from './dither.js';

/**
 * Convert an HTMLImageElement / ImageBitmap into ASCII.
 *
 * Returns:
 * {
 *   cols, rows,
 *   text: plain string with newlines (for copy / TXT download),
 *   cells: Uint8Array of char codes length cols*rows,
 *   colors: Uint8ClampedArray RGB triples length cols*rows*3
 * }
 */
export function imageToAscii(image, options) {
  const {
    width: cols = 100,
    charset = 'standard',
    brightness = 0,
    contrast = 0,
    edgeEnhancement = 'off',
    dithering = false,
    invert = false,
    charAspect = CHAR_ASPECT,
  } = options;

  const { rows } = asciiDimensions(image.width, image.height, cols, charAspect);
  const imageData = sampleImageData(image, cols, rows);
  const { data } = imageData;

  const lum = new Float32Array(cols * rows);
  const colors = new Uint8ClampedArray(cols * rows * 3);

  for (let i = 0; i < cols * rows; i++) {
    const p = i * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
    lum[i] = adjustTone(pixelLuminance(r, g, b), brightness, contrast);
  }

  const edgeWeight = EDGE_WEIGHTS[edgeEnhancement] ?? 0;
  if (edgeWeight > 0) {
    const edges = sobelEdges(data, cols, rows);
    const keep = 1 - edgeWeight;
    for (let i = 0; i < lum.length; i++) {
      lum[i] = lum[i] * keep + edges[i] * edgeWeight;
    }
  }

  if (dithering) {
    const levels = (CHARSETS[charset] || CHARSETS.standard).length;
    floydSteinberg(lum, cols, rows, levels);
  }

  const cells = new Uint8Array(cols * rows);
  const lines = new Array(rows);

  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      let v = lum[i];
      if (v < 0) v = 0;
      if (v > 255) v = 255;
      const ch = luminanceToChar(v, charset, invert);
      cells[i] = ch.charCodeAt(0);
      line += ch;
    }
    lines[y] = line;
  }

  return {
    cols,
    rows,
    text: lines.join('\n'),
    cells,
    colors,
  };
}
