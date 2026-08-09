@echo off
if "%~1"=="" (
    build\lumaform.exe ..\assets\sample.jpg
) else (
    build\lumaform.exe %1
)
