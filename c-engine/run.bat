@echo off
if "%~1"=="" (
    build\img2ascii.exe ..\assets\sample.jpg
) else (
    build\img2ascii.exe %1
)
