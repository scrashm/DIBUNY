@echo off
cd /d "%~dp0"
git add -A
git -c user.name="scrashm" -c user.email="scrashm@users.noreply.github.com" commit -m "%~1" 2>nul
git push origin main
echo.
echo Pages: Settings - Pages - Deploy from a branch - main - / (root)
echo Game: https://scrashm.github.io/DIBUNY/
