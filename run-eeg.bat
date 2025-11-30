@echo off
echo ========================================
echo   EEG Service - Uruchamianie na hoście
echo ========================================
echo.
echo Upewnij sie, ze backend dziala na localhost:3001
echo (uruchom: docker-compose up backend frontend)
echo.
pause
echo.
echo Uruchamianie skryptu EEG...
echo.

cd eeg-service
python main.py

if errorlevel 1 (
    echo.
    echo ========================================
    echo   BLAD: Skrypt zakonczyl sie niepowodzeniem
    echo ========================================
    echo.
    echo Sprawdz:
    echo 1. Czy masz zainstalowane wszystkie zaleznosci: pip install -r eeg-service/requirements.txt
    echo 2. Czy backend dziala: docker-compose ps
    echo 3. Czy urzadzenie EEG jest podlaczone i Bluetooth wlaczony
    echo.
    pause
)

