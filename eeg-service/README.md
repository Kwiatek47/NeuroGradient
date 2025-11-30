# EEG Service

Serwis do przetwarzania danych z opaski EEG BrainAccess i wysyłania wyników do backendu.

## Konfiguracja

Serwis automatycznie łączy się z backendem przez sieć Docker używając zmiennej środowiskowej `API_URL`.

## Uruchomienie

Serwis jest automatycznie uruchamiany przez `docker-compose up`.

## Dostęp do urządzeń USB

Jeśli urządzenie EEG wymaga dostępu do portu USB, możesz:

1. **Dodać urządzenie do docker-compose.yml:**
   ```yaml
   devices:
     - /dev/ttyUSB0:/dev/ttyUSB0
   ```

2. **Lub użyć host network mode:**
   ```yaml
   network_mode: "host"
   ```

3. **Lub dodać uprawnienia użytkownika do grupy dialout:**
   ```bash
   sudo usermod -a -G dialout $USER
   ```

## Logi

Logi serwisu można zobaczyć przez:
```bash
docker-compose logs -f eeg-service
```

