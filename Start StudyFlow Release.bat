@echo off
setlocal

cd /d "%~dp0"

echo.
echo Starting StudyFlow release build...
echo.
echo When the server is ready, open this URL in your browser:
echo http://localhost:3001
echo.
echo Keep this window open while using the app.
echo Press Ctrl+C in this window to stop StudyFlow.
echo.

npm start

echo.
echo StudyFlow has stopped.
pause
