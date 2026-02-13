# Quick Start Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Intrusion Detection System - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Start Backend in a new PowerShell window
$backendScript = @"
cd 'e:\Projects 101\IntrusionDetectionSystem\backend'
Write-Host 'Installing backend dependencies...' -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host ''
Write-Host 'Starting FastAPI backend on http://localhost:8000' -ForegroundColor Green
Write-Host 'API Documentation: http://localhost:8000/docs' -ForegroundColor Green
Write-Host ''
python main.py
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Start Frontend in a new PowerShell window
$frontendScript = @"
cd 'e:\Projects 101\IntrusionDetectionSystem\frontend'
Write-Host 'Installing frontend dependencies...' -ForegroundColor Yellow
npm install
Write-Host ''
Write-Host 'Starting React frontend on http://localhost:5173' -ForegroundColor Green
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Services are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs:     http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend:     http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
