#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "image.h"
#include "ascii.h"

static void print_usage(const char* prog) {
    printf("Usage: %s [OPTIONS] <image>\n\n", prog);
    printf("OPTIONS:\n");
    printf("  -w <width>          Output width in characters (default: 80)\n");
    printf("  --mode <mode>       brightness | edges | hybrid  (default: hybrid)\n");
    printf("  --border <style>    none | slash | backslash | pipe | dash |\n");
    printf("                      underscore | dash-star | dash-dot | under-dot\n");
    printf("                      (default: none)\n");
    printf("  --fill <symbol>     stars | percent | hash | dollar | tilde | at | plus\n");
    printf("                      (default: standard ASCII gradient)\n");
    printf("  --no-color          Disable ANSI colour output\n");
    printf("  --output <file>     Save output to a .txt file instead of printing\n");
    printf("\nEXAMPLES:\n");
    printf("  %s photo.jpg\n", prog);
    printf("  %s -w 100 photo.jpg\n", prog);
    printf("  %s --mode edges --border pipe photo.jpg\n", prog);
    printf("  %s --no-color --output out.txt photo.jpg\n", prog);
}

int main(int argc, char** argv) {
    if (argc < 2) {
        print_usage(argv[0]);
        return 0;
    }

    /* Defaults */
    const char* image_path  = NULL;
    int         target_width = 80;
    AsciiOptions opts = {
        .mode        = MODE_HYBRID,
        .border      = BORDER_NONE,
        .fill        = FILL_DEFAULT,
        .use_color   = 1,
        .output_path = NULL
    };

    /* Parse arguments */
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-w") == 0 && i + 1 < argc) {
            target_width = atoi(argv[++i]);
            if (target_width <= 0) {
                fprintf(stderr, "Error: width must be a positive number.\n");
                return 1;
            }

        } else if (strcmp(argv[i], "--mode") == 0 && i + 1 < argc) {
            i++;
            if      (strcmp(argv[i], "brightness") == 0) opts.mode = MODE_BRIGHTNESS;
            else if (strcmp(argv[i], "edges")       == 0) opts.mode = MODE_EDGES;
            else if (strcmp(argv[i], "hybrid")      == 0) opts.mode = MODE_HYBRID;
            else {
                fprintf(stderr, "Error: unknown mode '%s'. Use brightness, edges, or hybrid.\n", argv[i]);
                return 1;
            }

        } else if (strcmp(argv[i], "--border") == 0 && i + 1 < argc) {
            i++;
            if      (strcmp(argv[i], "none")       == 0) opts.border = BORDER_NONE;
            else if (strcmp(argv[i], "slash")      == 0) opts.border = BORDER_SLASH;
            else if (strcmp(argv[i], "backslash")  == 0) opts.border = BORDER_BACKSLASH;
            else if (strcmp(argv[i], "pipe")       == 0) opts.border = BORDER_PIPE;
            else if (strcmp(argv[i], "dash")       == 0) opts.border = BORDER_DASH;
            else if (strcmp(argv[i], "underscore") == 0) opts.border = BORDER_UNDERSCORE;
            else if (strcmp(argv[i], "dash-star")  == 0) opts.border = BORDER_DASH_STAR;
            else if (strcmp(argv[i], "dash-dot")   == 0) opts.border = BORDER_DASH_DOT;
            else if (strcmp(argv[i], "under-dot")  == 0) opts.border = BORDER_UNDER_DOT;
            else {
                fprintf(stderr, "Error: unknown border '%s'.\n", argv[i]);
                return 1;
            }

        } else if (strcmp(argv[i], "--fill") == 0 && i + 1 < argc) {
            i++;
            if      (strcmp(argv[i], "stars")   == 0) opts.fill = FILL_STARS;
            else if (strcmp(argv[i], "percent") == 0) opts.fill = FILL_PERCENT;
            else if (strcmp(argv[i], "hash")    == 0) opts.fill = FILL_HASH;
            else if (strcmp(argv[i], "dollar")  == 0) opts.fill = FILL_DOLLAR;
            else if (strcmp(argv[i], "tilde")   == 0) opts.fill = FILL_TILDE;
            else if (strcmp(argv[i], "at")      == 0) opts.fill = FILL_AT;
            else if (strcmp(argv[i], "plus")    == 0) opts.fill = FILL_PLUS;
            else {
                fprintf(stderr, "Error: unknown fill '%s'.\n", argv[i]);
                return 1;
            }

        } else if (strcmp(argv[i], "--no-color") == 0) {
            opts.use_color = 0;

        } else if (strcmp(argv[i], "--output") == 0 && i + 1 < argc) {
            opts.output_path = argv[++i];

        } else if (argv[i][0] != '-') {
            image_path = argv[i];

        } else {
            fprintf(stderr, "Error: unknown option '%s'.\n", argv[i]);
            print_usage(argv[0]);
            return 1;
        }
    }

    if (!image_path) {
        fprintf(stderr, "Error: no image path provided.\n");
        print_usage(argv[0]);
        return 1;
    }

    /* Load image */
    int width, height, channels;
    unsigned char* data = load_image(image_path, &width, &height, &channels);
    if (!data) return 1;

    /* Character cells are taller than they are wide (~2:1). Without correction,
       circles look like ovals. CHAR_ASPECT ≈ cell_width / cell_height.
       0.45 matches typical monospace terminals (slightly under 0.5 for a bit of
       vertical tightness). Adjust if your font looks stretched. */
    const float CHAR_ASPECT = 0.45f;
    int target_height = (int)((float)height / width * target_width * CHAR_ASPECT);
    if (target_height < 1) target_height = 1;

    /* Resize to render dimensions */
    unsigned char* resized = resize_image(data, width, height, target_width, target_height, channels);
    free_image(data);

    if (!resized) {
        fprintf(stderr, "Error: failed to resize image.\n");
        return 1;
    }

    /* Render */
    print_ascii_art(resized, target_width, target_height, channels, opts);

    if (opts.output_path) {
        printf("Saved to %s\n", opts.output_path);
    }

    free(resized);
    return 0;
}

