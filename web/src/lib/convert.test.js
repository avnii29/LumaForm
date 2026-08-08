/**
 * Lightweight unit checks (no browser / no canvas).
 * Run: npm test
 */
import { luminanceToChar, CHARSETS } from './characters.js';
import { adjustTone, pixelLuminance } from './luminance.js';
import { floydSteinberg } from './dither.js';
import { asciiDimensions, CHAR_ASPECT } from './resize.js';

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed += 1;
  } else {
    console.log('ok:', msg);
  }
}

// Dark → dense (default)
assert(luminanceToChar(0, 'standard', false) === '@', 'dark maps to densest (@)');
assert(luminanceToChar(255, 'standard', false) === ' ', 'bright maps to space');

// Invert flips that
assert(luminanceToChar(0, 'standard', true) === ' ', 'invert: dark → space');
assert(luminanceToChar(255, 'standard', true) === '@', 'invert: bright → @');

assert(CHARSETS.standard.length >= 10, 'standard charset length');
assert(CHARSETS.detailed.length > CHARSETS.standard.length, 'detailed is longer');

assert(Math.abs(pixelLuminance(255, 0, 0) - 54.213) < 0.1, 'BT.709 red luminance');

assert(adjustTone(128, 0, 0) === 128, 'tone identity');
assert(adjustTone(128, 100, 0) > 128, 'brightness increases');

const { cols, rows } = asciiDimensions(200, 100, 100);
assert(cols === 100, 'cols preserved');
assert(rows === Math.round(100 * 0.5 * CHAR_ASPECT), 'aspect-corrected rows');

const buf = new Float32Array([0, 128, 255, 64]);
floydSteinberg(buf, 2, 2, 4);
assert(buf.every((v) => v >= 0 && v <= 255), 'dither stays in range');

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log('\nAll checks passed.');
