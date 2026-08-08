#include <stdio.h>
#include <stdlib.h>

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#include "image.h"

unsigned char* load_image(const char* path, int* width, int* height, int* channels) {
    unsigned char* data = stbi_load(path, width, height, channels, 0);
    if (!data) {
        fprintf(stderr, "Error loading image '%s': %s\n", path, stbi_failure_reason());
    }
    return data;
}

void free_image(unsigned char* data) {
    stbi_image_free(data);
}

/* Nearest-neighbour downscale — simple and easy to follow. */
unsigned char* resize_image(unsigned char* data,
                            int orig_w, int orig_h,
                            int new_w, int new_h,
                            int channels) {
    unsigned char* out = malloc(new_w * new_h * channels);
    if (!out) return NULL;

    for (int y = 0; y < new_h; y++) {
        for (int x = 0; x < new_w; x++) {
            /* Map each output pixel back to the nearest source pixel. */
            int src_x = x * orig_w / new_w;
            int src_y = y * orig_h / new_h;

            /* Clamp so we never read outside the source buffer. */
            if (src_x >= orig_w) src_x = orig_w - 1;
            if (src_y >= orig_h) src_y = orig_h - 1;

            int src = (src_y * orig_w + src_x) * channels;
            int dst = (y      * new_w  + x    ) * channels;

            for (int c = 0; c < channels; c++) {
                out[dst + c] = data[src + c];
            }
        }
    }

    return out;
}
