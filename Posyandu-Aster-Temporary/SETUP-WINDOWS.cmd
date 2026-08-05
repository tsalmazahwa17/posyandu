@echo off
setlocal
cd /d "%~dp0"

echo ===============================================
echo   POSYANDU ASTER - SETUP SUPABASE REALTIME
echo ===============================================

if not exist package.json (
  echo ERROR: package.json tidak ditemukan.
  echo Jalankan file ini dari folder utama hasil ekstrak.
  pause
  exit /b 1
)

if not exist .env.local (
  copy .env.example .env.local >nul
  echo File .env.local telah dibuat.
  echo Isi lima nilai Supabase, JWT_SECRET, dan password seed.
  notepad .env.local
  echo Simpan file, lalu tekan tombol apa pun untuk melanjutkan.
  pause >nul
)

call npm ci
if errorlevel 1 goto :error

call npm run supabase:bootstrap
if errorlevel 1 goto :error

echo.
echo Setup selesai. Server pengembangan akan dijalankan.
call npm run dev
exit /b %errorlevel%

:error
echo.
echo Setup berhenti. Baca pesan error di atas dan buka:
echo SETUP-SUPABASE-STEP-BY-STEP.md
pause
exit /b 1
