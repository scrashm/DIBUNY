@echo off
setlocal
cd /d "%~dp0"

set GH=%TEMP%\gh-cli\bin\gh.exe
set USER=scrashm
set REPO=DIBUNY

if exist "%GH%" (
  "%GH%" auth status >nul 2>&1
  if errorlevel 1 (
    echo Log in to GitHub first:
    echo   "%GH%" auth login --web
    exit /b 1
  )
  "%GH%" repo create %USER%/%REPO% --public --source=. --remote=origin --push 2>nul
  if errorlevel 1 git push -u origin main
  echo.
  echo Game: https://%USER%.github.io/%REPO%/
  echo Enable Pages: https://github.com/%USER%/%REPO%/settings/pages
  goto :eof
)

echo 1. Create repo: https://github.com/new  name: %REPO%  public  no README
echo 2. git push -u origin main
echo 3. Settings - Pages - Source: GitHub Actions
echo 4. https://%USER%.github.io/%REPO%/
