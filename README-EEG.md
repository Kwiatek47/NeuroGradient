# Instrukcja uruchomienia EEG Service

## Konfiguracja

Skrypt EEG działa **na hoście** (poza Dockerem), aby mieć dostęp do Bluetooth i urządzenia EEG.

## Krok 1: Uruchom Backend i Frontend w Dockerze

```powershell
docker-compose up --build backend frontend
```

Lub w tle:
```powershell
docker-compose up -d --build backend frontend
```

## Krok 2: Zainstaluj zależności Python (jeśli jeszcze nie masz)

```powershell
pip install -r eeg-service/requirements.txt
```

## Krok 3: Uruchom skrypt EEG na hoście

### Opcja A: Używając skryptu uruchomieniowego (Windows)

**PowerShell:**
```powershell
.\run-eeg.ps1
```

**CMD:**
```cmd
run-eeg.bat
```

### Opcja B: Bezpośrednio

```powershell
cd eeg-service
python main.py
```

## Weryfikacja

1. **Backend działa?** Sprawdź: `http://localhost:3001/api/health`
2. **Frontend działa?** Sprawdź: `http://localhost:3000`
3. **EEG wysyła dane?** W konsoli skryptu EEG powinny pojawiać się komunikaty:
   ```
   FOCUS: 0.123 |████░░░░░░░░░░░░░░░░|
   ```

## Rozwiązywanie problemów

### Błąd: "Bluetooth not enabled"
- Upewnij się, że Bluetooth jest włączony w systemie
- Sprawdź, czy urządzenie EEG jest sparowane

### Błąd: "Connection refused" przy wysyłaniu danych
- Sprawdź, czy backend działa: `docker-compose ps`
- Sprawdź logi backendu: `docker-compose logs backend`

### Błąd: Brak modułu (np. `brainaccess`)
- Zainstaluj zależności: `pip install -r eeg-service/requirements.txt`
- Jeśli `brainaccess` nie jest w PyPI, sprawdź dokumentację instalacji

## Konfiguracja

Możesz zmienić URL backendu ustawiając zmienną środowiskową:
```powershell
$env:API_URL="http://localhost:3001/api/focus-data"
python eeg-service/main.py
```

