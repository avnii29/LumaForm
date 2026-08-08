/**
 * Character sets ordered from least dense → most dense.
 * Default mapping: dark pixels → dense chars, bright pixels → light chars.
 */

export const CHARSETS = {
  standard: ' .:-=+*#%@',
  detailed:
    " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
};

/**
 * Map luminance 0–255 to a character.
 * invert=false (default): dark → dense, bright → light
 * invert=true: opposite
 */
export function luminanceToChar(luminance, charset, invert = false) {
  const set = CHARSETS[charset] || CHARSETS.standard;
  const len = set.length;
  let value = luminance;
  if (!invert) {
    value = 255 - luminance;
  }
  const index = Math.min(len - 1, Math.floor((value * len) / 256));
  return set[index];
}
