#ifndef EDGES_H
#define EDGES_H

/* Run Sobel edge detection on pixel data.
   Returns a grayscale edge-magnitude buffer (1 byte per pixel, 0-255).
   Caller must free() the returned buffer. Returns NULL on allocation failure. */
unsigned char* apply_sobel(unsigned char* data, int width, int height, int channels);

#endif
