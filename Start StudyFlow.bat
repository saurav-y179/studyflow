@echo off
setlocal

cd /d "%~dp0"

echo.
echo Starting StudyFlow...
echo.
echo When the server is ready, this will open your browser.
echo Keep this window open while using the app.
echo Press Ctrl+C to stop StudyFlow.
echo.

node dev.js

echo.
echo StudyFlow has stopped.
pause
