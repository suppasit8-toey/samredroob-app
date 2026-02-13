@echo off
chcp 65001 >nul
echo ----------------------------------------
echo  SAMREDROOB GITHUB PUSHER (Fix & Push)
echo ----------------------------------------
echo.
echo [IMPORTANT] If you have 'npm run dev' running, please STOP it now (Ctrl+C).
echo Press any key to continue when ready...
pause >nul
echo.
echo 1. Removing compiled files from git cache...
git rm -r --cached .next >nul 2>&1
git rm -r --cached node_modules >nul 2>&1
echo.
echo 2. Adding changes...
git add .
echo.
echo 3. Committing changes...
git commit -m "Auto-update: Fix git config and update project"
echo.
echo 4. Pushing to GitHub...
git push
echo.
echo Done!
pause
