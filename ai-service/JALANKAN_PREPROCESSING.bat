@echo off
cd /d "%~dp0"
python preprocess.py
if errorlevel 1 goto gagal
python test_data.py
if errorlevel 1 goto gagal
echo Selesai. Buka data\processed\summary.json
pause
exit /b 0
:gagal
echo Proses gagal. Salin pesan error untuk diperiksa.
pause
exit /b 1
