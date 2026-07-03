#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "==================================================="
echo "    Mainframe Computers Windows Release Packager   "
echo "==================================================="
echo

# Ensure we are in the project root directory
cd "$(dirname "$0")"

echo "[1/4] Creating release directory structure..."
rm -rf release release.zip
mkdir -p release/server
mkdir -p release/database
mkdir -p release/backup

echo "[2/4] Building client frontend assets..."
cd client
npm run build
cd ..
mkdir -p release/client/dist
cp -r client/dist/* release/client/dist/

echo "[3/4] Copying server backend files..."
cp server/package.json release/server/
cp server/package-lock.json release/server/
if [ -f server/.env ]; then
  cp server/.env release/server/
fi
cp -r server/src release/server/

echo "[4/4] Generating launch_app.bat launcher..."
cat << 'EOF' > release/launch_app.bat
@echo off
title Mainframe Computers Launcher
echo Starting Mainframe Computers...
set NODE_ENV=production
set PORT=3001

:: Start backend server using portable Node
set "PATH=%~dp0node;%PATH%"
start /b "" "%~dp0node\node.exe" "%~dp0server\src\index.js" >nul 2>&1
timeout /t 2 /nobreak >nul

echo Launching standalone app window...
where chrome >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start /wait chrome --app=http://localhost:3001
) else (
    where msedge >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        start /wait msedge --app=http://localhost:3001
    ) else (
        start http://localhost:3001
        echo Browser running. Press any key in this window to stop...
        pause >nul
    )
)

echo Stopping Mainframe Computers Server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)
EOF

echo
echo "==================================================="
echo "SUCCESS: Standalone Windows release files generated!"
echo "==================================================="
echo
echo "Creating release.zip archive..."
if command -v zip &> /dev/null; then
  zip -r release.zip release > /dev/null
  echo "Created release.zip successfully!"
else
  echo "Please zip the 'release' folder manually and name it 'release.zip'."
fi
echo
