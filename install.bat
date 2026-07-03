@echo off
title Mainframe Computers Installer
echo ===================================================
echo    Installing Mainframe Computers Dashboard...
echo ===================================================
echo.

:: Define installation directory in local user profile
set "INSTALL_DIR=%LOCALAPPDATA%\MainframeComputers"

:: Ensure the release folder or release.zip is here
if not exist "%~dp0release" (
    if exist "%~dp0release.zip" (
        echo Extracting release package...
        powershell -Command "Expand-Archive -Path '%~dp0release.zip' -DestinationPath '%~dp0' -Force"
    ) else (
        echo Error: "release" folder or "release.zip" not found!
        echo Please make sure you copied the release folder or release.zip next to this installer.
        pause
        exit /b
    )
)

echo [1/4] Copying application files to %INSTALL_DIR%...
if exist "%INSTALL_DIR%" (
    echo Updating existing installation...
    rmdir /s /q "%INSTALL_DIR%" 2>nul
)
mkdir "%INSTALL_DIR%"
xcopy /s /e /y /q "%~dp0release" "%INSTALL_DIR%\" >nul

echo [2/4] Downloading and setting up portable Node.js environment...
echo This may take a moment depending on your internet speed...
powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v22.11.0/node-v22.11.0-win-x64.zip -OutFile '%INSTALL_DIR%\node-portable.zip'"
echo Extracting Node.js...
powershell -Command "Expand-Archive -Path '%INSTALL_DIR%\node-portable.zip' -DestinationPath '%INSTALL_DIR%\node-temp' -Force"
move "%INSTALL_DIR%\node-temp\node-v22.11.0-win-x64" "%INSTALL_DIR%\node" >nul
del "%INSTALL_DIR%\node-portable.zip"
rmdir /s /q "%INSTALL_DIR%\node-temp"

echo [3/4] Installing business database and chatbot engines...
cd /d "%INSTALL_DIR%\server"
set "PATH=%INSTALL_DIR%\node;%PATH%"
call "%INSTALL_DIR%\node\npm.cmd" install --omit=dev --no-audit --no-fund

echo [4/4] Creating Desktop and Start Menu Shortcuts...
powershell -NoProfile -Command ^
    "$s=(New-Object -COM WScript.Shell).CreateShortcut('%userprofile%\Desktop\Mainframe Computers.lnk');" ^
    "$s.TargetPath='%INSTALL_DIR%\launch_app.bat';" ^
    "$s.WorkingDirectory='%INSTALL_DIR%';" ^
    "$s.IconLocation='imageres.dll,109';" ^
    "$s.Description='Mainframe Computers Sales & Expenses Dashboard';" ^
    "$s.Save()"

powershell -NoProfile -Command ^
    "$s=(New-Object -COM WScript.Shell).CreateShortcut('%appdata%\Microsoft\Windows\Start Menu\Programs\Mainframe Computers.lnk');" ^
    "$s.TargetPath='%INSTALL_DIR%\launch_app.bat';" ^
    "$s.WorkingDirectory='%INSTALL_DIR%';" ^
    "$s.IconLocation='imageres.dll,109';" ^
    "$s.Description='Mainframe Computers Sales & Expenses Dashboard';" ^
    "$s.Save()"

echo.
echo ===================================================
echo SUCCESS: Installation Complete!
echo ===================================================
echo.
echo Mainframe Computers has been installed successfully.
echo.
echo - A shortcut has been added to your Desktop.
echo - A shortcut has been added to your Start Menu.
echo.
echo You can close this installer now and launch the application.
echo.
pause
