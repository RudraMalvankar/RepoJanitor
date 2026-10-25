@echo off
title GitHub Login and Push - RepoJanitor
echo ========================================================
echo  Step 1: Signing in to GitHub via Browser...
echo ========================================================

set PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\ucrt64\bin;%PATH%

"C:\Program Files\Git\ucrt64\bin\git-credential-manager.exe" github login --browser

echo.
echo ========================================================
echo  Step 2: Pushing RepoJanitor to GitHub (origin main)...
echo ========================================================

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] RepoJanitor pushed successfully to GitHub!
) else (
    echo [ERROR] Push failed.
)
pause
