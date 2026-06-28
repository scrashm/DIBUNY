@echo off
setlocal
cd /d "%~dp0"

where gh >nul 2>&1
if %errorlevel% equ 0 (
  echo Creating GitHub repo and pushing...
  gh repo create DIBUNY --public --source=. --remote=origin --push
  gh api repos/{owner}/DIBUNY/pages -X POST -f build_type=workflow
  gh api repos/{owner}/DIBUNY/pages -X PUT -f build_type=workflow
  echo.
  echo Done. Open: https://github.com/YOUR_USER/DIBUNY/settings/pages
  echo Game URL: https://YOUR_USER.github.io/DIBUNY/
  goto :eof
)

echo GitHub CLI (gh) not found.
echo.
echo Manual steps:
echo 1. Create repo: https://github.com/new  name: DIBUNY  public
echo 2. Run:
echo    git remote add origin https://github.com/YOUR_USER/DIBUNY.git
echo    git push -u origin main
echo 3. Settings - Pages - Source: GitHub Actions
echo 4. Play: https://YOUR_USER.github.io/DIBUNY/
