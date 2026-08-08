@echo off
echo Building img2ascii...
if not exist build mkdir build
gcc -Wall -Wextra -std=c99 -Iinclude src/main.c src/image.c src/ascii.c src/edges.c -o build/img2ascii.exe -lm

if %errorlevel% equ 0 (
    echo Build successful: build\img2ascii.exe
) else (
    echo Build failed!
    exit /b 1
)
