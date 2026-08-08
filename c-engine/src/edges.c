#include <stdlib.h>
#include <math.h>
#include "edges.h"

/*
 * Sobel edge detection.
 *
 * For each pixel we convolve two 3x3 kernels:
 *   Gx detects horizontal changes (left-right gradients)
 *   Gy detects vertical  changes (top-bottom gradients)
 *
 * Edge magnitude = sqrt(Gx^2 + Gy^2), clamped to 0-255.
 */
unsigned char* apply_sobel(unsigned char* data, int width, int height, int channels) {
    unsigned char* out = malloc(width * height);
    if (!out) return NULL;

    /* Sobel kernels */
    int Gx[3][3] = { {-1, 0, 1},
                     {-2, 0, 2},
                     {-1, 0, 1} };

    int Gy[3][3] = { {-1, -2, -1},
                     { 0,  0,  0},
                     { 1,  2,  1} };

    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int gx = 0, gy = 0;

            for (int ky = -1; ky <= 1; ky++) {
                for (int kx = -1; kx <= 1; kx++) {
                    /* Clamp neighbour coordinates to image bounds. */
                    int nx = x + kx;
                    int ny = y + ky;
                    if (nx < 0)       nx = 0;
                    if (nx >= width)  nx = width  - 1;
                    if (ny < 0)       ny = 0;
                    if (ny >= height) ny = height - 1;

                    int idx = (ny * width + nx) * channels;

                    /* Convert the neighbour pixel to grayscale. */
                    unsigned char r = data[idx];
                    unsigned char g = (channels > 1) ? data[idx + 1] : r;
                    unsigned char b = (channels > 2) ? data[idx + 2] : r;
                    unsigned char gray = (unsigned char)(0.2126f * r + 0.7152f * g + 0.0722f * b);

                    gx += Gx[ky + 1][kx + 1] * gray;
                    gy += Gy[ky + 1][kx + 1] * gray;
                }
            }

            int magnitude = (int)sqrtf((float)(gx * gx + gy * gy));
            if (magnitude > 255) magnitude = 255;

            out[y * width + x] = (unsigned char)magnitude;
        }
    }

    return out;
}
