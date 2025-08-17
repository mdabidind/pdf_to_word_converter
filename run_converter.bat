@echo off
title PDF to Word Converter - Always Active
cd /d G:\pdf_word_converter_lux

:loop
echo.
echo =====================================
echo  Starting PDF to Word Converter App
echo  (Press CTRL+C to stop)
echo =====================================
echo.

python app.py

echo.
echo *** The server stopped or crashed. Restarting in 5 seconds... ***
timeout /t 5 >nul
goto loop
