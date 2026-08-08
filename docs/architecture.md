# Architecture

img2ascii-c has two implementations that share the same *ideas*, not the same binary:

1. **`c-engine/`** — terminal CLI (C99 + stb_image)
2. **`web/`** — browser app (React + Vite), all processing local

Images are never uploaded to a server in the web app.

## C CLI pipeline

```
file path
  → stbi_load (RGB/RGBA)
  → nearest-neighbour resize
  → height *= CHAR_ASPECT (0.45)   # terminal glyph correction
  → optional Sobel (edges / hybrid)
  → BT.709 luminance → character
  → ANSI true-color (optional)
  → stdout or .txt
```

Modules:

| File | Responsibility |
|------|----------------|
| `image.c` | load, free, resize |
| `edges.c` | Sobel magnitude |
| `ascii.c` | modes, borders, fills, print/save |
| `main.c` | CLI |

## Web pipeline

```
File / clipboard / sample
  → createImageBitmap
  → canvas downsample to cols × rows
       rows = (h/w) * cols * (CELL_W/CELL_H)
  → luminance + brightness/contrast
  → optional Sobel blend (off/low/medium/high)
  → optional Floyd–Steinberg dither
  → character map (± invert)
  → canvas glyph render (mono or color)
  → copy / TXT / PNG
```

Key modules under `web/src/lib/`:

| File | Responsibility |
|------|----------------|
| `resize.js` | aspect correction + canvas sampling |
| `luminance.js` | BT.709 + tone controls |
| `sobel.js` | edge magnitudes + blend weights |
| `dither.js` | Floyd–Steinberg |
| `characters.js` | charset + mapping |
| `convert.js` | orchestrates the pipeline |
| `download.js` | TXT / PNG helpers |

## Character aspect ratio

Glyph cells are taller than wide. Without correction, geometry stretches vertically.

- **CLI:** `CHAR_ASPECT = 0.45` (empirical for common terminal fonts)
- **Web:** `CHAR_ASPECT = CELL_W / CELL_H` (8/14), matching the canvas font box

## Character mapping

Sets are ordered **light → dense**. Default mapping:

- dark luminance → dense character (`@`, `#`, …)
- bright luminance → light character (` `, `.`, …)

`invert` flips this. The CLI historically maps the other way for light-on-dark ANSI terminals; the web defaults match dark-on-light paper/UI.

## Why not WASM / remote C?

A browser-native pipeline keeps the app:

- private (pixels never leave the device)
- cheap to host (static files on Vercel)
- fast enough for typical photos at ≤220 columns

The C engine remains the offline / terminal tool.
