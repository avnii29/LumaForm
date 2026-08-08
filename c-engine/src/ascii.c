#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#  include <windows.h>
#else
#  include <sys/ioctl.h>
#  include <unistd.h>
#endif

#include "ascii.h"
#include "edges.h"

/* ------------------------------------------------------------------ */
/* Character sets                                                       */
/* ------------------------------------------------------------------ */

/* Simple set — 11 characters, darkest to brightest. */
static const char SIMPLE[]   = " .-=+*X#$&@";
static const int  SIMPLE_LEN = sizeof(SIMPLE) - 1;   /* -1 to skip '\0' */

/* Detailed set — 70 characters, used in edge/hybrid modes. */
static const char DETAILED[]   = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
static const int  DETAILED_LEN = sizeof(DETAILED) - 1;

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

/* Map a brightness value (0-255) to an ASCII character. */
static char brightness_to_char(unsigned char brightness, int use_detailed) {
    if (use_detailed) {
        return DETAILED[(brightness * DETAILED_LEN) / 256];
    }
    return SIMPLE[(brightness * SIMPLE_LEN) / 256];
}

/* Return the fill character for a given FillStyle.
   Falls back to a normal brightness char when FILL_DEFAULT. */
static char fill_char(FillStyle style, unsigned char brightness, int use_detailed) {
    switch (style) {
        case FILL_STARS:   return '*';
        case FILL_PERCENT: return '%';
        case FILL_HASH:    return '#';
        case FILL_DOLLAR:  return '$';
        case FILL_TILDE:   return '~';
        case FILL_AT:      return '@';
        case FILL_PLUS:    return '+';
        default:           return brightness_to_char(brightness, use_detailed);
    }
}

/* Return the side-border character for a given row index.
   Alternating patterns flip between two chars each row. */
static char side_border_char(BorderPattern bp, int row) {
    switch (bp) {
        case BORDER_SLASH:     return '/';
        case BORDER_BACKSLASH: return '\\';
        case BORDER_PIPE:      return '|';
        case BORDER_DASH:      return '-';
        case BORDER_UNDERSCORE:return '_';
        case BORDER_DASH_STAR: return (row % 2 == 0) ? '-' : '*';
        case BORDER_DASH_DOT:  return (row % 2 == 0) ? '-' : '.';
        case BORDER_UNDER_DOT: return (row % 2 == 0) ? '_' : '.';
        default:               return ' ';
    }
}

/* Print a full horizontal border line (top or bottom). */
static void print_h_border(FILE* fp, BorderPattern bp, int inner_width) {
    if (bp == BORDER_NONE) return;

    char c1, c2;
    switch (bp) {
        case BORDER_SLASH:      c1 = c2 = '/';  break;
        case BORDER_BACKSLASH:  c1 = c2 = '\\'; break;
        case BORDER_PIPE:       c1 = c2 = '|';  break;
        case BORDER_DASH:       c1 = c2 = '-';  break;
        case BORDER_UNDERSCORE: c1 = c2 = '_';  break;
        case BORDER_DASH_STAR:  c1 = '-'; c2 = '*'; break;
        case BORDER_DASH_DOT:   c1 = '-'; c2 = '.'; break;
        case BORDER_UNDER_DOT:  c1 = '_'; c2 = '.'; break;
        default:                return;
    }

    /* Corner + fill + corner */
    fprintf(fp, "%c", c1);
    for (int i = 0; i < inner_width; i++) {
        fprintf(fp, "%c", (i % 2 == 0) ? c1 : c2);
    }
    fprintf(fp, "%c\n", c1);
}

/* ------------------------------------------------------------------ */

int get_terminal_width(void) {
#ifdef _WIN32
    CONSOLE_SCREEN_BUFFER_INFO csbi;
    if (GetConsoleScreenBufferInfo(GetStdHandle(STD_OUTPUT_HANDLE), &csbi)) {
        return csbi.srWindow.Right - csbi.srWindow.Left + 1;
    }
#else
    struct winsize w;
    if (ioctl(STDOUT_FILENO, TIOCGWINSZ, &w) == 0 && w.ws_col > 0) {
        return w.ws_col;
    }
#endif
    return 80;
}

/* ------------------------------------------------------------------ */
/* Core render function                                                 */
/* ------------------------------------------------------------------ */

void print_ascii_art(unsigned char* data, int width, int height,
                     int channels, AsciiOptions opts) {

    /* Open output destination — file or stdout. */
    FILE* fp = stdout;
    if (opts.output_path) {
        fp = fopen(opts.output_path, "w");
        if (!fp) {
            fprintf(stderr, "Error: could not open output file '%s'\n", opts.output_path);
            return;
        }
        /* When writing to a file, disable colour codes — they'd be garbage in a .txt. */
        opts.use_color = 0;
    }

    /* Centre the output in the terminal (only meaningful for stdout). */
    int term_w  = get_terminal_width();
    int padding = (fp == stdout && term_w > width + 2) ? (term_w - width - 2) / 2 : 0;
    char pad[256] = {0};
    if (padding > 0 && padding < (int)sizeof(pad)) {
        memset(pad, ' ', padding);
    }

    /* Run Sobel if we need edge data. */
    unsigned char* edges = NULL;
    if (opts.mode == MODE_EDGES || opts.mode == MODE_HYBRID) {
        edges = apply_sobel(data, width, height, channels);
        if (!edges) {
            fprintf(stderr, "Warning: edge detection failed, falling back to brightness mode.\n");
            opts.mode = MODE_BRIGHTNESS;
        }
    }

    /* Top border */
    if (opts.border != BORDER_NONE) {
        fprintf(fp, "%s", pad);
        print_h_border(fp, opts.border, width);
    }

    /* Render each row */
    for (int y = 0; y < height; y++) {
        fprintf(fp, "%s", pad);

        /* Left side border */
        if (opts.border != BORDER_NONE) {
            fprintf(fp, "%c", side_border_char(opts.border, y));
        }

        /* Pixels */
        for (int x = 0; x < width; x++) {
            int idx = (y * width + x) * channels;

            unsigned char r = data[idx];
            unsigned char g = (channels > 1) ? data[idx + 1] : r;
            unsigned char b = (channels > 2) ? data[idx + 2] : r;

            /* Perceptual luminance (ITU-R BT.709) */
            float lum = 0.2126f * r + 0.7152f * g + 0.0722f * b;

            /* Compute brightness value and choose character set based on mode. */
            unsigned char brightness;
            int use_detailed;

            switch (opts.mode) {
                case MODE_EDGES:
                    brightness   = edges[y * width + x];
                    use_detailed = 1;
                    break;

                case MODE_HYBRID: {
                    /* Blend brightness and edge strength, then boost contrast a bit. */
                    float blended = lum * 0.7f + edges[y * width + x] * 0.3f;
                    blended = ((blended / 255.0f - 0.5f) * 1.4f + 0.5f) * 255.0f;
                    if (blended < 0)   blended = 0;
                    if (blended > 255) blended = 255;
                    brightness   = (unsigned char)blended;
                    use_detailed = 1;
                    break;
                }

                case MODE_BRIGHTNESS:
                default: {
                    /* Mild contrast boost so dark images aren't all spaces. */
                    float boosted = ((lum / 255.0f - 0.5f) * 1.3f + 0.5f) * 255.0f;
                    if (boosted < 0)   boosted = 0;
                    if (boosted > 255) boosted = 255;
                    brightness   = (unsigned char)boosted;
                    use_detailed = 0;
                    break;
                }
            }

            char ch = fill_char(opts.fill, brightness, use_detailed);

            /* Colour output (stdout only). */
            if (opts.use_color && channels >= 3) {
                fprintf(fp, "\033[38;2;%d;%d;%dm%c", r, g, b, ch);
            } else {
                fprintf(fp, "%c", ch);
            }
        }

        /* Reset colour, right side border, newline. */
        if (opts.use_color) fprintf(fp, "\033[0m");
        if (opts.border != BORDER_NONE) {
            fprintf(fp, "%c", side_border_char(opts.border, y));
        }
        fprintf(fp, "\n");
    }

    /* Bottom border */
    if (opts.border != BORDER_NONE) {
        fprintf(fp, "%s", pad);
        print_h_border(fp, opts.border, width);
    }

    if (edges) free(edges);
    if (fp != stdout) fclose(fp);
}
