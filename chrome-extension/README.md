# NeuroGradient Chrome Extension

Rozszerzenie Chrome do blokowania wybranych stron podczas sesji skupienia.

## Instalacja

1. Otwórz Chrome i przejdź do `chrome://extensions/`
2. Włącz "Tryb deweloperski" (Developer mode) w prawym górnym rogu
3. Kliknij "Załaduj rozpakowane" (Load unpacked)
4. Wybierz folder `chrome-extension` z tego projektu
5. Rozszerzenie powinno być teraz zainstalowane

## Jak działa

1. Rozszerzenie synchronizuje się z aplikacją React przez localStorage
2. Gdy sesja jest aktywna (`isActive === true`), blokuje dostęp do zablokowanych URL-i
3. Przekierowuje użytkownika do strony `blocked.html` z komunikatem
4. Sprawdza zarówno pełne URL-e jak i domeny (np. `facebook.com` zablokuje `www.facebook.com`, `m.facebook.com`, etc.)

## Wymagania

- Aplikacja NeuroGradient musi być uruchomiona na `http://localhost:3000`
- Rozszerzenie automatycznie synchronizuje listę zablokowanych URL-i z aplikacji

## Funkcje

- ✅ Automatyczne blokowanie stron podczas sesji
- ✅ Synchronizacja z aplikacją React
- ✅ Blokowanie domen i subdomen
- ✅ Przyjazna strona blokady z możliwością powrotu
- ✅ Popup z informacją o statusie

## Uwagi

- Rozszerzenie działa tylko gdy sesja jest aktywna
- Możesz zarządzać zablokowanymi URL-ami w ustawieniach aplikacji NeuroGradient
- Rozszerzenie sprawdza zmiany co sekundę

## Ikony

Musisz dodać ikony:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

Możesz użyć prostych ikon lub logo aplikacji.

