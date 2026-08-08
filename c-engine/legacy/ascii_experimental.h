#ifndef ASCII_H
#define ASCII_H

// ASCII art modes
typedef enum {
    MODE_BRIGHTNESS,    // Standard brightness mapping
    MODE_EDGES,        // Edge detection only
    MODE_HYBRID        // Brightness + edges combined
} AsciiMode;

// Border pattern styles
typedef enum {
    BORDER_NONE,       // No border
    BORDER_SLASH,      // ////
    BORDER_BACKSLASH,  // backslash pattern
    BORDER_PIPE,       // ||||
    BORDER_DASH,       // ----
    BORDER_UNDERSCORE, // ____
    BORDER_DASH_STAR,  // -*-*-*-
    BORDER_DASH_DOT,   // -.-.-.-
    BORDER_UNDER_DOT,  // _._._._
    BORDER_COLON,      // ::::
    BORDER_DOT         // ....
} BorderPattern;

// Fill symbol styles
typedef enum {
    FILL_DEFAULT,      // Standard ASCII chars
    FILL_STARS,        // ***
    FILL_PERCENT,      // %%
    FILL_HASH,         // ###
    FILL_DOLLAR,       // $$$
    FILL_TILDE,        // ~~~~
    FILL_AT,           // @@@
    FILL_PLUS,         // ++++
    FILL_DOT,          // ... (dot matrix style)
    FILL_COLON         // ::: (dense dots)
} FillStyle;

// Convert brightness (0-255) to ASCII character
char brightness_to_ascii(unsigned char brightness, int use_detailed);

// Get fill character based on style
char get_fill_char(FillStyle style, unsigned char brightness);

// Print colored ASCII representation of an image
void print_ascii_art(unsigned char* data, int width, int height, int channels, AsciiMode mode);

// Print ASCII art with border and fill style
void print_ascii_art_styled(unsigned char* data, int width, int height, int channels, AsciiMode mode, BorderPattern border, FillStyle fill);

// Get terminal width for centering
int get_terminal_width(void);

// Apply edge detection to image
unsigned char* apply_edge_detection(unsigned char* data, int width, int height, int channels);

// Print border line
void print_border_line(int width, BorderPattern pattern);

// Detect edge intensity for intelligent border selection
unsigned char* detect_edge_intensity(unsigned char* data, int width, int height, int channels);

// Print ASCII art with intelligent per-region borders
void print_ascii_art_intelligent(unsigned char* data, int width, int height, int channels, AsciiMode mode, FillStyle fill);

// Print halftone dot matrix style ASCII art
void print_ascii_art_halftone(unsigned char* data, int width, int height, int channels);

#endif
