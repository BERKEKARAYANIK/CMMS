@echo off
setlocal
cd /d "%~dp0"

echo [CMMS] Ilk kurulum ve otomatik baslatma basliyor...
echo [CMMS] Gerekirse yonetici izni isteyecektir.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\bootstrap-new-pc.ps1"
set EXIT_CODE=%ERRORLEVEL%

echo.
if %EXIT_CODE% EQU 190 (
  echo [CMMS] Yonetici penceresi acildi. Kurulum oradan devam ediyor.
  echo [CMMS] Bu pencereyi kapatabilirsiniz.
) else if %EXIT_CODE% EQU 0 (
  echo [CMMS] Islem tamamlandi.
) else (
  echo [CMMS] Hata olustu. Kod: %EXIT_CODE%
  echo [CMMS] Loglari kontrol edin: "%~dp0service-logs"
)

echo.
pause
