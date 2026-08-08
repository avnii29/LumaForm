#ifndef IMAGE_H
#define IMAGE_H

/* Load an image from disk. Returns pixel data (RGB or RGBA), or NULL on failure.
   Caller must free with free_image(). */
unsigned char* load_image(const char* path, int* width, int* height, int* channels);

/* Free pixel data returned by load_image(). */
void free_image(unsigned char* data);

/* Nearest-neighbour resize. Returns a new buffer the caller must free(). */
unsigned char* resize_image(unsigned char* data,
                            int orig_width, int orig_height,
                            int new_width, int new_height,
                            int channels);

#endif
