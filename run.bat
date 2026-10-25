@echo off
title RepoJanitor Launcher
echo 🦥 Starting RepoJanitor Services...

set PATH=C:\Users\Rudra\AppData\Local\Programs\nodejs\node-v20.18.0-win-x64;C:\Users\Rudra\AppData\Local\Programs\Python\Python312;C:\Users\Rudra\AppData\Local\Programs\Python\Python312\Scripts;C:\Users\Rudra\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;%PATH%

start "RepoJanitor Backend" /D "%~dp0backend" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
timeout /t 2 /nobreak >nul

start "RepoJanitor Frontend" /D "%~dp0frontend" cmd /k "npm start"
timeout /t 2 /nobreak >nul

start http://localhost:3000
echo RepoJanitor is running at http://localhost:3000
