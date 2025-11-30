# Instrukcja instalacji rozszerzenia Chrome

## Krok 1: Przygotowanie plików

1. Upewnij się, że masz wszystkie pliki w folderze `chrome-extension`:
   - manifest.json
   - background.js
   - content.js
   - blocked.html
   - popup.html
   - popup.js
   - README.md

## Krok 2: Dodanie ikon (opcjonalne)

Rozszerzenie wymaga ikon. Możesz:
- Użyć prostych ikon PNG (16x16, 48x48, 128x128)
- Utworzyć je w dowolnym edytorze graficznym
- Lub tymczasowo usunąć sekcję `icons` z manifest.json

## Krok 3: Instalacja w Chrome

1. Otwórz przeglądarkę Google Chrome
2. W pasku adresu wpisz: `chrome://extensions/`
3. W prawym górnym rogu włącz **"Tryb deweloperski"** (Developer mode)
4. Kliknij przycisk **"Załaduj rozpakowane"** (Load unpacked)
5. Wybierz folder `chrome-extension` z tego projektu
6. Rozszerzenie powinno pojawić się na liście

## Krok 4: Weryfikacja

1. Sprawdź czy rozszerzenie jest włączone (przełącznik powinien być niebieski)
2. Kliknij ikonę rozszerzenia w pasku narzędzi Chrome
3. Powinieneś zobaczyć popup z informacją o statusie

## Krok 5: Testowanie

1. Uruchom aplikację NeuroGradient na `http://localhost:3000`
2. Dodaj URL do zablokowania w ustawieniach (np. `facebook.com`)
3. Rozpocznij sesję
4. Spróbuj otworzyć zablokowaną stronę - powinna zostać zablokowana

## Rozwiązywanie problemów

### Rozszerzenie nie działa
- Sprawdź czy aplikacja React jest uruchomiona na `localhost:3000`
- Sprawdź konsolę rozszerzenia: `chrome://extensions/` → Szczegóły → Sprawdź widok: service worker
- Sprawdź czy localStorage zawiera `isActive` i `blockedUrls`

### Strony nie są blokowane
- Upewnij się, że sesja jest aktywna (`isActive === true`)
- Sprawdź czy URL jest poprawnie dodany do listy
- Sprawdź czy rozszerzenie ma uprawnienia do wszystkich stron

### Błędy w konsoli
- Otwórz DevTools (F12) na stronie aplikacji
- Sprawdź zakładkę Console pod kątem błędów
- Sprawdź zakładkę Network czy są problemy z komunikacją

## Uwagi

- Rozszerzenie działa tylko gdy aplikacja NeuroGradient jest otwarta
- Synchronizacja odbywa się co sekundę
- Możesz zarządzać zablokowanymi URL-ami w ustawieniach aplikacji

