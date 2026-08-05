@echo off
cd /d "%~dp0"
if not exist .env.local if not exist .env (
  echo File .env.local atau .env belum ada. Jalankan SETUP-WINDOWS.cmd terlebih dahulu.
  pause
  exit /b 1
)
call npm run routes:check
if errorlevel 1 goto :error
call npm run dev
exit /b %errorlevel%
:error
echo Proses berhenti. Baca petunjuk error di atas.
pause
exit /b 1
