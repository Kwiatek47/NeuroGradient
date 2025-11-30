# Szybki start - Rozszerzenie Chrome

## Instalacja (3 minuty)

1. **Otwórz Chrome Extensions**
   - Wpisz w pasku adresu: `chrome://extensions/`
   - Włącz **"Tryb deweloperski"** (przełącznik w prawym górnym rogu)

2. **Załaduj rozszerzenie**
   - Kliknij **"Załaduj rozpakowane"** (Load unpacked)
   - Wybierz folder `chrome-extension`

3. **Gotowe!** ✅
   - Rozszerzenie jest zainstalowane
   - Ikona pojawi się w pasku narzędzi Chrome

## Jak używać

1. **Uruchom aplikację NeuroGradient** na `http://localhost:3000`

2. **Dodaj URL do zablokowania:**
   - Otwórz Ustawienia w aplikacji
   - Sekcja "Zablokowane strony"
   - Wpisz URL (np. `facebook.com`, `youtube.com`)
   - Kliknij "Dodaj"

3. **Rozpocznij sesję:**
   - Kliknij "Rozpocznij sesję" w aplikacji
   - Status zmieni się na "Sesja aktywna"

4. **Test blokowania:**
   - Spróbuj otworzyć zablokowaną stronę
   - Zostaniesz przekierowany do strony z komunikatem o blokadzie

## Jak działa

- ✅ Rozszerzenie synchronizuje się z aplikacją co sekundę
- ✅ Blokuje strony tylko gdy sesja jest aktywna
- ✅ Działa z domenami i subdomenami (np. `facebook.com` blokuje `www.facebook.com`, `m.facebook.com`)
- ✅ Pokazuje przyjazną stronę blokady z możliwością powrotu

## Rozwiązywanie problemów

**Rozszerzenie nie blokuje stron:**
- Sprawdź czy aplikacja jest uruchomiona na `localhost:3000`
- Sprawdź czy sesja jest aktywna (status w popup rozszerzenia)
- Sprawdź konsolę: `chrome://extensions/` → Szczegóły → Service Worker

**Błędy w konsoli:**
- Upewnij się, że aplikacja React jest uruchomiona
- Sprawdź czy localStorage zawiera `isActive` i `blockedUrls`

## Dodatkowe informacje

- Rozszerzenie działa tylko gdy aplikacja NeuroGradient jest otwarta
- Możesz zarządzać zablokowanymi URL-ami w ustawieniach aplikacji
- Lista zablokowanych URL-i jest synchronizowana automatycznie

