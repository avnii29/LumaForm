@echo off
echo Building LumaForm...
if not exist build mkdir build
gcc -Wall -Wextra -std=c99 -Iinclude src/main.c src/image.c src/ascii.c src/edges.c -o build/lumaform.exe -lm

if %errorlevel% equ 0 (
    echo Build successful: build\lumaform.exe
) else (
    echo Build failed!
    exit /b 1
)
