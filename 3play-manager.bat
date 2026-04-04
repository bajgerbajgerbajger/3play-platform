@echo off
TITLE 3Play App Manager
set PROJECT_DIR=%~dp0
cd /d %PROJECT_DIR%

echo ==========================================
echo       3Play - Enterprise Media Hub
echo ==========================================
echo.
echo 1. Spustit aplikaci (Next.js)
echo 2. Zastavit aplikaci
echo 3. Kontrola databáze (Prisma Studio)
echo 4. Konec
echo.

:menu
set /p choice="Vyberte akci (1-4): "

if "%choice%"=="1" goto start_app
if "%choice%"=="2" goto stop_app
if "%choice%"=="3" goto studio
if "%choice%"=="4" exit
goto menu

:start_app
echo Startuji Next.js server...
start "3Play-Server" npm run dev
echo Aplikace je dostupna na http://localhost:3000
echo (Pokud mate nastaveny Apache Proxy, tak i pres vasi XAMPP adresu)
pause
goto menu

:stop_app
echo Zastavuji vsechny Node.js procesy...
taskkill /F /IM node.exe /T
echo Hotovo.
pause
goto menu

:studio
echo Startuji Prisma Studio...
start "3Play-Studio" npx prisma studio
pause
goto menu
