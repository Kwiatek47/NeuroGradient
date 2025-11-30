Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EEG Service - Uruchamianie na hoście" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Upewnij się, że backend działa na localhost:3001" -ForegroundColor Yellow
Write-Host "(uruchom: docker-compose up backend frontend)" -ForegroundColor Yellow
Write-Host ""
Read-Host "Naciśnij Enter aby kontynuować"

Write-Host ""
Write-Host "Uruchamianie skryptu EEG..." -ForegroundColor Green
Write-Host ""

Set-Location eeg-service

try {
    python main.py
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  BŁĄD: Skrypt zakończył się niepowodzeniem" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Sprawdź:" -ForegroundColor Yellow
    Write-Host "1. Czy masz zainstalowane wszystkie zależności: pip install -r eeg-service/requirements.txt"
    Write-Host "2. Czy backend działa: docker-compose ps"
    Write-Host "3. Czy urządzenie EEG jest podłączone i Bluetooth włączony"
    Write-Host ""
    Read-Host "Naciśnij Enter aby zamknąć"
}

