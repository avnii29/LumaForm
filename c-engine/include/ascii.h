#ifndef ASCII_H
#define ASCII_H

/* --- Rendering modes --- */
typedef enum {
    MODE_BRIGHTNESS,  /* map pixel brightness directly to a character */
    MODE_EDGES,       /* show only Sobel edges                        */
    MODE_HYBRID       /* 70% brightness + 30% edges (default)         */
} AsciiMode;

/* --- Border styles (top/bottom/sides of the output) --- */
typedef enum {
    BORDER_NONE,
    BORDER_SLASH,      /* //// */
    BORDER_BACKSLASH,  /* \\\\ */
    BORDER_PIPE,       /* |||| */
    BORDER_DASH,       /* ---- */
    BORDER_UNDERSCORE, /* ____ */
    BORDER_DASH_STAR,  /* -*-* (alternates per row) */
    BORDER_DASH_DOT,   /* -.-. (alternates per row) */
    BORDER_UNDER_DOT   /* _._. (alternates per row) */
} BorderPattern;

/* --- Optional single-character fill (replaces the ASCII gradient) --- */
typedef enum {
    FILL_DEFAULT,  /* normal ASCII gradient  */
    FILL_STARS,    /* *  */
    FILL_PERCENT,  /* %  */
    FILL_HASH,     /* #  */
    FILL_DOLLAR,   /* $  */
    FILL_TILDE,    /* ~  */
    FILL_AT,       /* @  */
    FILL_PLUS      /* +  */
} FillStyle;

/* Options bundle passed to print functions. */
typedef struct {
    AsciiMode    mode;
    BorderPattern border;
    FillStyle    fill;
    int          use_color;   /* 1 = ANSI 24-bit colour, 0 = plain text */
    const char*  output_path; /* NULL = print to stdout, else write to file */
} AsciiOptions;

/* Print (or save) ASCII art with the given options. */
void print_ascii_art(unsigned char* data, int width, int height,
                     int channels, AsciiOptions opts);

/* Query the current terminal column width (falls back to 80). */
int get_terminal_width(void);

#endif
