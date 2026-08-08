# Border Patterns, Fill Styles, and Intelligent Edge Detection

## Overview
The img2ascii tool now supports custom border patterns, fill symbols, and **intelligent edge-based borders** for enhanced ASCII art visualization.

## Quick Start

### Default (Intelligent Borders)
```bash
.\img2ascii.exe
.\img2ascii.exe image.jpg
.\img2ascii.exe -w 80 image.jpg
```
By default, borders automatically adapt to image content:
- **Strong edges** (hair, defined features) → `|` (pipe)
- **Medium edges** (body outline) → `#` (hash)
- **Weak edges** (smooth areas) → `-` (dash)

## Border Patterns

### Fixed Border Patterns
Use `--border` to apply a consistent border style:

| Option | Pattern | Example |
|--------|---------|---------|
| `--border slash` | `////` | Slashes on all sides |
| `--border backslash` | `\\\\` | Backslashes on all sides |
| `--border pipe` | `\|\|\|\|` | Pipe characters on all sides |
| `--border dash` | `----` | Dashes on all sides |
| `--border underscore` | `____` | Underscores on all sides |
| `--border dash-star` | `-\*-\*-\*-` | Alternating dash and star (vertical variation) |
| `--border dash-dot` | `-.-.-.-` | Alternating dash and dot (vertical variation) |
| `--border under-dot` | `_._._._` | Alternating underscore and dot (vertical variation) |
| `--border none` | (no border) | No border at all |

### Intelligent Borders (Default)
The tool automatically detects edge intensity across the image and adapts the borders:
- Uses Sobel edge detection
- Different border characters for different feature regions
- Great for portraits, objects with defined outlines

## Fill Symbols

Replace the default ASCII character set with a single symbol:

| Option | Symbol | Character |
|--------|--------|-----------|
| `--fill stars` | `***` | Asterisk/star (*) |
| `--fill percent` | `%%` | Percent (%) |
| `--fill hash` | `###` | Hash (#) |
| `--fill dollar` | `$$$` | Dollar ($) |
| `--fill tilde` | `~~~~` | Tilde (~) |
| `--fill at` | `@@@` | At symbol (@) |
| `--fill plus` | `++++` | Plus (+) |

## Usage Examples

### Intelligent Borders (Default)
```bash
# Default: smart edge detection, adapts to image
.\img2ascii.exe image.jpg

# Control with explicit flag
.\img2ascii.exe --intelligent image.jpg
.\img2ascii.exe --no-intelligent --border dash image.jpg
```

### Fixed Borders
```bash
# Pipe border (consistent style)
.\img2ascii.exe --border pipe image.jpg

# Dash border
.\img2ascii.exe --border dash image.jpg

# Underscore border
.\img2ascii.exe --border underscore image.jpg

# Alternating pattern borders
.\img2ascii.exe --border dash-star image.jpg
.\img2ascii.exe --border dash-dot image.jpg
.\img2ascii.exe --border under-dot image.jpg
```

### Fill Symbols Only
```bash
# Hash fill (uses default intelligent borders)
.\img2ascii.exe --fill hash image.jpg

# Stars with fixed pipe border
.\img2ascii.exe --border pipe --fill stars image.jpg

# Dollars with dash-dot pattern
.\img2ascii.exe --border dash-dot --fill dollar image.jpg
```

### Combined Options
```bash
# Width + mode + border + fill
.\img2ascii.exe -w 100 --mode hybrid --border dash --fill hash image.jpg

# Edge detection mode with intelligent borders
.\img2ascii.exe -w 60 --mode edges image.jpg

# Brightness mode with fixed pipe border and percent fill
.\img2ascii.exe -w 80 --mode brightness --border pipe --fill percent image.jpg
```

## Advanced Features

### Intelligent Edge Detection
When no explicit border is specified, the tool:
1. Analyzes edge intensity across the entire image
2. Assigns different border characters based on local edge strength
3. Creates variation between image regions (hair vs body vs background)
4. Result: More interesting, content-aware ASCII art

### Alternating Borders
Pattern borders with two characters create vertical variation:
- **dash-star**: Lines alternate between `-` and `*`
- **dash-dot**: Lines alternate between `-` and `.`
- **under-dot**: Lines alternate between `_` and `.`

### Fill Symbols
- Replace all ASCII characters with a single symbol
- Still respects brightness variations through repetition
- Works with all ASCII modes and border styles
- Creates bold, uniform visual effects

## Examples Output

### Intelligent Borders (Default)
```
           ----------------
-Shows|mix of -, #, | based#
#on edge intensity in the|  
|image content!         -
           ----------------
```

### Pipe Border + Hash Fill
```
||||||||||||||||||||||||||||
|#########################|
|#########################|
|#########################|
||||||||||||||||||||||||||||
```

### Dash-Star Border + Dollar Fill
```
-*-*-*-*-*-*-*-*-*-*-*-*-*
-$$$$$$$$$$$$$$$$$$$$$$$$$-
*$$$$$$$$$$$$$$$$$$$$$$$$$*
-$$$$$$$$$$$$$$$$$$$$$$$$$-
-*-*-*-*-*-*-*-*-*-*-*-*-*
```

### Intelligent + Percent Fill
```
           --------
-Shows%%%|mix of borders%%%
#while%%|using single fill#
|symbol!           
           --------
```

## Command Reference

```
USAGE:
  .\img2ascii.exe [options] [image.jpg]

OPTIONS:
  -w WIDTH              Width in characters (default: 80)
  
  --mode MODE           Conversion mode:
                        brightness, edges, hybrid (default)
  
  --border PATTERN      Border style:
                        slash, backslash, pipe, dash, underscore,
                        dash-star, dash-dot, under-dot, none
  
  --fill SYMBOL         Fill symbol:
                        stars, percent, hash, dollar, tilde, at, plus
  
  --intelligent         Enable intelligent borders (default: on)
  --no-intelligent      Disable intelligent borders
  
IMAGE:
  If no image specified, uses assets/sample.jpg
```

## Tips & Tricks

1. **Best for portraits**: Use intelligent borders (default) for natural edge variation
2. **Bold effect**: Combine fixed borders with fill symbols for maximum visual impact
3. **Artistic look**: Use alternating borders (dash-star, dash-dot) for patterned frames
4. **Minimal**: Use `--border none --fill stars` for simple, bold ASCII art
5. **Experiment**: Try different width values with `--fill` to see how it changes appearance

## How Intelligent Borders Work

The algorithm:
1. Applies Sobel edge detection to find edges
2. Calculates edge magnitude at each pixel
3. For each line, examines the edges on the left and right sides
4. Assigns borders based on edge strength:
   - `>150`: Strong features (pipe `|`)
   - `100-150`: Medium features (hash `#`)
   - `<100`: Weak features (dash `-`)

Result: Automatically highlights defined features and creates visual distinction between different image regions!

