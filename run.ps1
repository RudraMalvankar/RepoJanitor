# RepoJanitor Startup Script
$ErrorActionPreference = "Stop"

Write-Host "🦥 Starting RepoJanitor..." -ForegroundColor Green

# Setup PATH for Node and Python
$env:PATH = "C:\Users\Rudra\AppData\Local\Programs\nodejs\node-v20.18.0-win-x64;C:\Users\Rudra\AppData\Local\Programs\Python\Python312;C:\Users\Rudra\AppData\Local\Programs\Python\Python312\Scripts;C:\Users\Rudra\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;" + $env:PATH

# Start Backend
Write-Host "1. Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -WorkingDirectory "$PSScriptRoot\backend" -WindowStyle Normal

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "2. Launching Next.js Frontend on http://localhost:3000..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "$PSScriptRoot\frontend" -WindowStyle Normal

# Open Browser
Start-Sleep -Seconds 2
Write-Host "3. Opening http://localhost:3000 in your browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "RepoJanitor is now running!" -ForegroundColor Green
