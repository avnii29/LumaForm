#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#ifdef _WIN32
#include <windows.h>
#else
#include <sys/ioctl.h>
#include <unistd.h>
#endif
#include "ascii.h"

// ASCII characters from darkest to brightest - from reference image
static const char ASCII_CHARS[] = " .-=+*X#$&@";
static const int ASCII_CHARS_LEN = sizeof(ASCII_CHARS) - 1;

// Extended character set for more detail
static const char ASCII_CHARS_DETAILED[] = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
static const int ASCII_CHARS_DETAILED_LEN = sizeof(ASCII_CHARS_DETAILED) - 1;

char brightness_to_ascii(unsigned char brightness, int use_detailed) {
    if (use_detailed) {
        int index = (brightness * ASCII_CHARS_DETAILED_LEN) / 256;
        return ASCII_CHARS_DETAILED[index];
    } else {
        int index = (brightness * ASCII_CHARS_LEN) / 256;
        return ASCII_CHARS[index];
    }
}

char get_fill_char(FillStyle style, unsigned char brightness) {
    switch (style) {
        case FILL_STARS:
            return '*';
        case FILL_PERCENT:
            return '%';
        case FILL_HASH:
            return '#';
        case FILL_DOLLAR:
            return '$';
        case FILL_TILDE:
            return '~';
        case FILL_AT:
            return '@';
        case FILL_PLUS:
            return '+';
        case FILL_DOT:
            return '.';
        case FILL_COLON:
            return ':';
        case FILL_DEFAULT:
        default:
            return brightness_to_ascii(brightness, 0);
    }
}

void print_border_line(int width, BorderPattern pattern) {
    switch (pattern) {
        case BORDER_SLASH:
            printf("/");
            for (int i = 0; i < width; i++) printf("/");
            printf("/\n");
            return;
        case BORDER_BACKSLASH:
            printf("\\");
            for (int i = 0; i < width; i++) printf("\\");
            printf("\\\n");
            return;
        case BORDER_PIPE:
            printf("|");
            for (int i = 0; i < width; i++) printf("|");
            printf("|\n");
            return;
        case BORDER_DASH:
            printf("-");
            for (int i = 0; i < width; i++) printf("-");
            printf("-\n");
            return;
        case BORDER_UNDERSCORE:
            printf("_");
            for (int i = 0; i < width; i++) printf("_");
            printf("_\n");
            return;
        case BORDER_DASH_STAR:
            printf("-*");
            for (int i = 0; i < width; i++) {
                printf("%c", (i % 2 == 0) ? '-' : '*');
            }
            printf("-*\n");
            return;
        case BORDER_DASH_DOT:
            printf("-.");
            for (int i = 0; i < width; i++) {
                printf("%c", (i % 2 == 0) ? '-' : '.');
            }
            printf("-.\n");
            return;
        case BORDER_UNDER_DOT:
            printf("_.");
            for (int i = 0; i < width; i++) {
                printf("%c", (i % 2 == 0) ? '_' : '.');
            }
            printf("_.\n");
            return;
        case BORDER_COLON:
            printf(":");
            for (int i = 0; i < width; i++) printf(":");
            printf(":\n");
            return;
        case BORDER_DOT:
            printf(".");
            for (int i = 0; i < width; i++) printf(".");
            printf(".\n");
            return;
        case BORDER_NONE:
        default:
            return;
    }
}

// Sobel edge detection - returns edge magnitude
unsigned char* apply_edge_detection(unsigned char* data, int width, int height, int channels) {
    unsigned char* edges = (unsigned char*)malloc(width * height);
    if (!edges) return NULL;
    
    // Sobel kernels (as shown in reference images)
    int sobel_x[3][3] = {{-1, 0, 1}, {-2, 0, 2}, {-1, 0, 1}};
    int sobel_y[3][3] = {{-1, -2, -1}, {0, 0, 0}, {1, 2, 1}};
    
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int gx = 0, gy = 0;
            
            // Apply convolution
            for (int ky = -1; ky <= 1; ky++) {
                for (int kx = -1; kx <= 1; kx++) {
                    int px = x + kx;
                    int py = y + ky;
                    
                    // Handle borders
                    if (px < 0) px = 0;
                    if (px >= width) px = width - 1;
                    if (py < 0) py = 0;
                    if (py >= height) py = height - 1;
                    
                    int idx = (py * width + px) * channels;
                    
                    // Convert to grayscale
                    unsigned char r = data[idx];
                    unsigned char g = (channels > 1) ? data[idx + 1] : r;
                    unsigned char b = (channels > 2) ? data[idx + 2] : r;
                    unsigned char gray = (unsigned char)(0.2126f * r + 0.7152f * g + 0.0722f * b);
                    
                    gx += sobel_x[ky + 1][kx + 1] * gray;
                    gy += sobel_y[ky + 1][kx + 1] * gray;
                }
            }
            
            // Calculate gradient magnitude
            int magnitude = (int)sqrt((float)(gx * gx + gy * gy));
            if (magnitude > 255) magnitude = 255;
            
            edges[y * width + x] = (unsigned char)magnitude;
        }
    }
    
    return edges;
}

int get_terminal_width(void) {
#ifdef _WIN32
    CONSOLE_SCREEN_BUFFER_INFO csbi;
    if (GetConsoleScreenBufferInfo(GetStdHandle(STD_OUTPUT_HANDLE), &csbi)) {
        return csbi.srWindow.Right - csbi.srWindow.Left + 1;
    }
#else
    struct winsize w;
    if (ioctl(STDOUT_FILENO, TIOCGWINSZ, &w) == 0) {
        return w.ws_col;
    }
#endif
    return 80;  // Default fallback
}

void print_ascii_art_styled(unsigned char* data, int width, int height, int channels, AsciiMode mode, BorderPattern border, FillStyle fill) {
    int terminal_width = get_terminal_width();
    int padding = (terminal_width > width) ? (terminal_width - width) / 2 : 0;
    
    // Print top border
    if (border != BORDER_NONE) {
        for (int p = 0; p < padding; p++) printf(" ");
        print_border_line(width, border);
    }
    
    // Apply edge detection if needed
    unsigned char* edges = NULL;
    if (mode == MODE_EDGES || mode == MODE_HYBRID) {
        edges = apply_edge_detection(data, width, height, channels);
        if (!edges) mode = MODE_BRIGHTNESS; // Fallback if edge detection fails
    }
    
    for (int y = 0; y < height; y++) {
        // Add left border
        if (border != BORDER_NONE) {
            switch (border) {
                case BORDER_SLASH: printf("/"); break;
                case BORDER_BACKSLASH: printf("\\"); break;
                case BORDER_PIPE: printf("|"); break;
                case BORDER_DASH: printf("-"); break;
                case BORDER_UNDERSCORE: printf("_"); break;
                case BORDER_DASH_STAR: printf("%c", (y % 2 == 0) ? '-' : '*'); break;
                case BORDER_DASH_DOT: printf("%c", (y % 2 == 0) ? '-' : '.'); break;
                case BORDER_UNDER_DOT: printf("%c", (y % 2 == 0) ? '_' : '.'); break;
                default: break;
            }
        }
        
        for (int x = 0; x < width; x++) {
            int idx = (y * width + x) * channels;
            
            // Calculate brightness (grayscale)
            unsigned char r = data[idx];
            unsigned char g = (channels > 1) ? data[idx + 1] : r;
            unsigned char b = (channels > 2) ? data[idx + 2] : r;
            
            // Enhanced luminance formula (as per reference)
            float luminance = 0.2126f * r + 0.7152f * g + 0.0722f * b;
            
            unsigned char brightness;
            int use_detailed = 0;
            
            switch (mode) {
                case MODE_EDGES:
                    // Pure edge mode - show only edges
                    brightness = edges[y * width + x];
                    use_detailed = 1;
                    break;
                    
                case MODE_HYBRID:
                    // Hybrid mode - combine brightness and edges
                    {
                        unsigned char edge_val = edges[y * width + x];
                        // Weight: 70% brightness, 30% edges for detail enhancement
                        float combined = luminance * 0.7f + edge_val * 0.3f;
                        
                        // Apply contrast enhancement
                        float contrast = 1.4f;
                        combined = ((combined / 255.0f - 0.5f) * contrast + 0.5f) * 255.0f;
                        
                        if (combined < 0) combined = 0;
                        if (combined > 255) combined = 255;
                        
                        brightness = (unsigned char)combined;
                        use_detailed = 1;
                    }
                    break;
                    
                case MODE_BRIGHTNESS:
                default:
                    // Standard brightness mode with contrast boost
                    {
                        float contrast = 1.3f;
                        luminance = ((luminance / 255.0f - 0.5f) * contrast + 0.5f) * 255.0f;
                        
                        if (luminance < 0) luminance = 0;
                        if (luminance > 255) luminance = 255;
                        
                        brightness = (unsigned char)luminance;
                        use_detailed = 0; // Use simple character set
                    }
                    break;
            }
            
            // Get ASCII character for this brightness
            char ascii_char;
            if (fill == FILL_DEFAULT) {
                ascii_char = brightness_to_ascii(brightness, use_detailed);
            } else {
                ascii_char = get_fill_char(fill, brightness);
            }
            
            // Print with ANSI 24-bit true color
            if (channels >= 3) {
                // Color boost for vibrant output
                int r_boost = (r < 230) ? r + (255 - r) / 8 : r;
                int g_boost = (g < 230) ? g + (255 - g) / 8 : g;
                int b_boost = (b < 230) ? b + (255 - b) / 8 : b;
                printf("\033[38;2;%d;%d;%dm%c", r_boost, g_boost, b_boost, ascii_char);
            } else {
                printf("%c", ascii_char);
            }
        }
        
        // Add right border
        if (border != BORDER_NONE) {
            switch (border) {
                case BORDER_SLASH: printf("/"); break;
                case BORDER_BACKSLASH: printf("\\"); break;
                case BORDER_PIPE: printf("|"); break;
                case BORDER_DASH: printf("-"); break;
                case BORDER_UNDERSCORE: printf("_"); break;
                case BORDER_DASH_STAR: printf("%c", (y % 2 == 0) ? '-' : '*'); break;
                case BORDER_DASH_DOT: printf("%c", (y % 2 == 0) ? '-' : '.'); break;
                case BORDER_UNDER_DOT: printf("%c", (y % 2 == 0) ? '_' : '.'); break;
                default: break;
            }
        }
        printf("\033[0m\n");  // Reset color at end of line
    }
    
    // Print bottom border
    if (border != BORDER_NONE) {
        for (int p = 0; p < padding; p++) printf(" ");
        print_border_line(width, border);
    }
    
    // Cleanup
    if (edges) free(edges);
}

void print_ascii_art(unsigned char* data, int width, int height, int channels, AsciiMode mode) {
    print_ascii_art_styled(data, width, height, channels, mode, BORDER_NONE, FILL_DEFAULT);
}

// Detect edge intensity for intelligent border selection
unsigned char* detect_edge_intensity(unsigned char* data, int width, int height, int channels) {
    unsigned char* edge_intensity = (unsigned char*)malloc(width * height);
    if (!edge_intensity) return NULL;
    
    // Sobel kernels for edge detection
    int sobel_x[3][3] = {{-1, 0, 1}, {-2, 0, 2}, {-1, 0, 1}};
    int sobel_y[3][3] = {{-1, -2, -1}, {0, 0, 0}, {1, 2, 1}};
    
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int gx = 0, gy = 0;
            
            // Apply convolution
            for (int ky = -1; ky <= 1; ky++) {
                for (int kx = -1; kx <= 1; kx++) {
                    int px = x + kx;
                    int py = y + ky;
                    
                    // Handle borders
                    if (px < 0) px = 0;
                    if (px >= width) px = width - 1;
                    if (py < 0) py = 0;
                    if (py >= height) py = height - 1;
                    
                    int idx = (py * width + px) * channels;
                    
                    // Convert to grayscale
                    unsigned char r = data[idx];
                    unsigned char g = (channels > 1) ? data[idx + 1] : r;
                    unsigned char b = (channels > 2) ? data[idx + 2] : r;
                    unsigned char gray = (unsigned char)(0.2126f * r + 0.7152f * g + 0.0722f * b);
                    
                    gx += sobel_x[ky + 1][kx + 1] * gray;
                    gy += sobel_y[ky + 1][kx + 1] * gray;
                }
            }
            
            // Calculate gradient magnitude
            int magnitude = (int)sqrt((float)(gx * gx + gy * gy));
            if (magnitude > 255) magnitude = 255;
            
            edge_intensity[y * width + x] = (unsigned char)magnitude;
        }
    }
    
    return edge_intensity;
}

// Print ASCII art with intelligent per-region borders
void print_ascii_art_intelligent(unsigned char* data, int width, int height, int channels, AsciiMode mode, FillStyle fill) {
    int terminal_width = get_terminal_width();
    int padding = (terminal_width > width) ? (terminal_width - width) / 2 : 0;
    
    // Detect edge intensity for intelligent border selection
    unsigned char* edge_intensity = detect_edge_intensity(data, width, height, channels);
    if (!edge_intensity) {
        print_ascii_art_styled(data, width, height, channels, mode, BORDER_DASH, fill);
        return;
    }
    
    // Apply edge detection if needed
    unsigned char* edges = NULL;
    if (mode == MODE_EDGES || mode == MODE_HYBRID) {
        edges = apply_edge_detection(data, width, height, channels);
        if (!edges) mode = MODE_BRIGHTNESS;
    }
    
    // Print top border
    for (int p = 0; p < padding; p++) printf(" ");
    print_border_line(width, BORDER_DASH);
    
    for (int y = 0; y < height; y++) {
        // Left border - varies based on edge intensity
        unsigned char left_edge = edge_intensity[y * width + 0];
        if (left_edge > 150) {
            printf("|");  // Strong edge = pipe
        } else if (left_edge > 100) {
            printf("#");  // Medium edge = hash
        } else {
            printf("-");  // Weak edge = dash
        }
        
        for (int x = 0; x < width; x++) {
            int idx = (y * width + x) * channels;
            
            // Calculate brightness (grayscale)
            unsigned char r = data[idx];
            unsigned char g = (channels > 1) ? data[idx + 1] : r;
            unsigned char b = (channels > 2) ? data[idx + 2] : r;
            
            // Enhanced luminance formula
            float luminance = 0.2126f * r + 0.7152f * g + 0.0722f * b;
            
            unsigned char brightness;
            int use_detailed = 0;
            
            switch (mode) {
                case MODE_EDGES:
                    brightness = edges[y * width + x];
                    use_detailed = 1;
                    break;
                    
                case MODE_HYBRID:
                {
                    unsigned char edge_val = edges[y * width + x];
                    float combined = luminance * 0.7f + edge_val * 0.3f;
                    float contrast = 1.4f;
                    combined = ((combined / 255.0f - 0.5f) * contrast + 0.5f) * 255.0f;
                    
                    if (combined < 0) combined = 0;
                    if (combined > 255) combined = 255;
                    
                    brightness = (unsigned char)combined;
                    use_detailed = 1;
                }
                    break;
                    
                case MODE_BRIGHTNESS:
                default:
                {
                    float contrast = 1.3f;
                    luminance = ((luminance / 255.0f - 0.5f) * contrast + 0.5f) * 255.0f;
                    
                    if (luminance < 0) luminance = 0;
                    if (luminance > 255) luminance = 255;
                    
                    brightness = (unsigned char)luminance;
                    use_detailed = 0;
                }
                    break;
            }
            
            // Get ASCII character for this brightness
            char ascii_char;
            if (fill == FILL_DEFAULT) {
                ascii_char = brightness_to_ascii(brightness, use_detailed);
            } else {
                ascii_char = get_fill_char(fill, brightness);
            }
            
            // Print with ANSI 24-bit true color
            if (channels >= 3) {
                int r_boost = (r < 230) ? r + (255 - r) / 8 : r;
                int g_boost = (g < 230) ? g + (255 - g) / 8 : g;
                int b_boost = (b < 230) ? b + (255 - b) / 8 : b;
                printf("\033[38;2;%d;%d;%dm%c", r_boost, g_boost, b_boost, ascii_char);
            } else {
                printf("%c", ascii_char);
            }
        }
        
        // Right border - varies based on edge intensity
        unsigned char right_edge = edge_intensity[y * width + (width - 1)];
        if (right_edge > 150) {
            printf("|");  // Strong edge = pipe
        } else if (right_edge > 100) {
            printf("#");  // Medium edge = hash
        } else {
            printf("-");  // Weak edge = dash
        }
        printf("\033[0m\n");
    }
    
    // Print bottom border
    for (int p = 0; p < padding; p++) printf(" ");
    print_border_line(width, BORDER_DASH);
    
    // Cleanup
    if (edges) free(edges);
    free(edge_intensity);
}

// Print halftone dot matrix style ASCII art (like the YouTube video)
void print_ascii_art_halftone(unsigned char* data, int width, int height, int channels) {
    int terminal_width = get_terminal_width();
    int padding = (terminal_width > width) ? (terminal_width - width) / 2 : 0;
    
    // Apply edge detection for color highlights
    unsigned char* edges = apply_edge_detection(data, width, height, channels);
    
    // Print top border with asterisks
    for (int p = 0; p < padding; p++) printf(" ");
    printf("*");
    for (int i = 0; i < width; i++) printf("*");
    printf("*\n");
    
    for (int y = 0; y < height; y++) {
        // Left border
        for (int p = 0; p < padding; p++) printf(" ");
        printf("*");
        
        for (int x = 0; x < width; x++) {
            int idx = (y * width + x) * channels;
            
            // Calculate brightness
            unsigned char r = data[idx];
            unsigned char g = (channels > 1) ? data[idx + 1] : r;
            unsigned char b = (channels > 2) ? data[idx + 2] : r;
            float luminance = 0.2126f * r + 0.7152f * g + 0.0722f * b;
            
            // Determine if this is a highlight (high saturation of red)
            unsigned char edge_val = (edges) ? edges[y * width + x] : 0;
            
            // Check if it's reddish (skin tone or actual red)
            int red_diff = r - ((int)g + (int)b) / 2;
            int is_warm_tone = (red_diff > 20) && (r > 80);  // Skin tone or red highlight
            
            // Rendering based on brightness and color - denser pattern
            if (luminance > 220) {
                // Very bright = spaces
                printf("  ");
            } else if (luminance > 200) {
                // Bright = sparse dots
                printf(" .");
            } else if (luminance > 180) {
                // Light = dots
                if (is_warm_tone && channels >= 3) {
                    printf("\033[38;2;255;120;20m..\033[0m");  // Light orange
                } else {
                    printf(". ");
                }
            } else if (luminance > 160) {
                // Medium-light
                if (is_warm_tone && channels >= 3) {
                    printf("\033[38;2;255;100;0m**\033[0m");  // Orange
                } else {
                    printf("**");  // White
                }
            } else if (luminance > 130) {
                // Medium
                if (is_warm_tone && channels >= 3) {
                    printf("\033[38;2;255;80;0m**\033[0m");  // Orange-red
                } else {
                    printf("**");
                }
            } else if (luminance > 100) {
                // Medium-dark
                if (is_warm_tone && channels >= 3) {
                    printf("\033[38;2;220;60;0m**\033[0m");  // Red-orange
                } else if (edge_val > 120) {
                    printf("\033[38;2;200;50;0m**\033[0m");  // Edge highlight in red
                } else {
                    printf("**");
                }
            } else if (luminance > 70) {
                // Dark
                if (is_warm_tone && channels >= 3) {
                    printf("\033[38;2;180;40;0m**\033[0m");  // Dark red
                } else if (edge_val > 100) {
                    printf("\033[38;2;150;30;0m**\033[0m");  // Edge in dark red
                } else {
                    printf("**");
                }
            } else if (luminance > 40) {
                // Very dark
                if (edge_val > 80) {
                    printf("\033[38;2;100;20;0m**\033[0m");  // Very dark red edges
                } else {
                    printf("**");
                }
            } else {
                // Darkest
                printf("**");  // Dense asterisks for darkest areas
            }
        }
        
        // Right border
        printf("*\n");
    }
    
    // Print bottom border with asterisks
    for (int p = 0; p < padding; p++) printf(" ");
    printf("*");
    for (int i = 0; i < width; i++) printf("*");
    printf("*\n");
    
    // Cleanup
    if (edges) free(edges);
}
