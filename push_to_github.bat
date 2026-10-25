@echo off
title Push RepoJanitor to GitHub
echo ========================================================
echo Pushing RepoJanitor commits to GitHub:
echo https://github.com/RudraMalvankar/RepoJanitor.git
echo ========================================================
echo.

set PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\bin;C:\Program Files\Git\ucrt64\bin;%PATH%

git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] RepoJanitor pushed successfully to GitHub!
) else (
    echo [ERROR] Push failed. Check your GitHub authentication.
)
pause
