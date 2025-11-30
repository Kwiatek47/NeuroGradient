# 🌳 NeuroGradient

**NeuroGradient** to innowacyjna aplikacja do zarządzania czasem i skupieniem, która wykorzystuje neurofeedback z urządzeń EEG do wizualizacji poziomu koncentracji w czasie rzeczywistym. Aplikacja łączy techniki Pomodoro z gamifikacją, gdzie twoje skupienie rośnie jako wizualne drzewo.

## 📋 Spis treści

- [Funkcjonalności](#-funkcjonalności)
- [Technologie](#-technologie)
- [Instalacja](#-instalacja)
- [Uruchomienie](#-uruchomienie)
- [Konfiguracja](#-konfiguracja)
- [Struktura projektu](#-struktura-projektu)
- [Użycie](#-użycie)
- [Rozwiązywanie problemów](#-rozwiązywanie-problemów)

## ✨ Funkcjonalności

### 🎯 Główne funkcje

- **Neurofeedback w czasie rzeczywistym** - Wizualizacja poziomu skupienia na podstawie danych z urządzenia EEG
- **Wizualne drzewo** - Drzewo rośnie i kwitnie w zależności od twojego poziomu koncentracji
- **Sesje Pomodoro** - Zarządzanie czasem z konfigurowalnymi sesjami skupienia
- **Gamifikacja** - System nasion (waluta), sklep z przedmiotami i wyzwania
- **Kalendarz aktywności** - Wizualizacja aktywności jak na GitHubie (contribution graph)
- **Statystyki i analityka** - Szczegółowe wykresy i statystyki sesji
- **Blokada stron** - Rozszerzenie Chrome do blokowania rozpraszających stron podczas sesji

### 🎨 Dodatkowe funkcje

- **Ćwiczenia oddechowe** - Wspomaganie koncentracji przed sesją
- **Muzyka i atmosfera** - Różne opcje dźwiękowe do wyboru
- **Boostery** - Tymczasowe wzmocnienia tempa wzrostu drzewa
- **Widoki drzewa** - Różne style wizualne (zwykłe, choinka, kwitnąca wiśnia)
- **Osiągnięcia** - System odznak za różne osiągnięcia
- **Ranking** - Porównywanie wyników z innymi użytkownikami
- **Mapa 3D** - Wizualizacja posadzonych drzew na mapie

## 🛠 Technologie

### Frontend
- **React 18.2.0** - Framework UI
- **React Three Fiber** - Renderowanie 3D
- **Three.js** - Grafika 3D
- **Canvas API** - Rysowanie drzewa i wykresów

### Backend
- **Node.js** - Runtime
- **Express** - Framework serwera
- **CORS** - Obsługa cross-origin requests

### EEG Service
- **Python 3** - Przetwarzanie sygnałów EEG
- **BrainAccess SDK** - Integracja z urządzeniami EEG
- **NumPy, SciPy** - Analiza sygnałów
- **MNE-Python** - Przetwarzanie danych EEG

### Infrastruktura
- **Docker & Docker Compose** - Konteneryzacja
- **Chrome Extension** - Blokada stron

## 📦 Instalacja

### Wymagania

- **Node.js** 16+ i npm
- **Docker** i Docker Compose
- **Python 3.8+** (dla EEG service)
- **Urządzenie EEG** (opcjonalne, np. BrainAccess BA MINI)

### Krok 1: Sklonuj repozytorium

```bash
git clone <repository-url>
cd NeuroGradient
```

### Krok 2: Zainstaluj zależności

#### Frontend
```bash
cd frontend
npm install
cd ..
```

#### Backend
```bash
cd backend
npm install
cd ..
```

#### EEG Service
```bash
pip install -r eeg-service/requirements.txt
```

## 🚀 Uruchomienie

### Opcja 1: Uruchomienie z Dockerem (zalecane)

```bash
docker-compose up --build
```

Aplikacja będzie dostępna pod:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Opcja 2: Uruchomienie lokalne

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

#### Terminal 3 - EEG Service (opcjonalne)
```bash
# Windows
run-eeg.bat

# Lub bezpośrednio
cd eeg-service
python main.py
```

## ⚙️ Konfiguracja

### Zmienne środowiskowe

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
```

#### Backend
Backend używa domyślnych portów. Możesz zmienić port w `docker-compose.yml`.

#### EEG Service
```bash
# Windows PowerShell
$env:API_URL="http://localhost:3001/api/focus-data"
python eeg-service/main.py
```

### Konfiguracja urządzenia EEG

Edytuj `eeg-service/main.py`:
```python
DEVICE_NAME = "BA MINI 048"  # Nazwa twojego urządzenia
```

### Rozszerzenie Chrome

1. Otwórz Chrome i przejdź do `chrome://extensions/`
2. Włącz "Tryb deweloperski"
3. Kliknij "Załaduj rozpakowane"
4. Wybierz folder `chrome-extension`

Szczegółowe instrukcje: [chrome-extension/QUICK_START.md](chrome-extension/QUICK_START.md)

## 📁 Struktura projektu

```
NeuroGradient/
├── frontend/              # Aplikacja React
│   ├── src/
│   │   ├── App.js        # Główny komponent
│   │   ├── GrowingTree.js # Komponent drzewa
│   │   ├── Board3D.js    # Mapa 3D
│   │   └── IntroScreen.js # Ekran intro
│   ├── public/
│   │   └── music/        # Pliki muzyczne
│   └── package.json
│
├── backend/               # Serwer Express
│   ├── server.js         # Główny serwer
│   └── package.json
│
├── eeg-service/          # Serwis EEG (Python)
│   ├── main.py           # Główny skrypt
│   └── requirements.txt
│
├── chrome-extension/      # Rozszerzenie Chrome
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── blocked.html
│
├── docker-compose.yml     # Konfiguracja Docker
└── README.md             # Ten plik
```

## 🎮 Użycie

### Rozpoczęcie sesji

1. **Otwórz aplikację** w przeglądarce (http://localhost:3000)
2. **Kliknij "Rozpocznij sesję"**
3. **Wykonaj ćwiczenia oddechowe** (jeśli włączone)
4. **Obserwuj drzewo** - rośnie w zależności od twojego poziomu skupienia
5. **Zakończ sesję** - kliknij "Zakończ sesję"

### Sklep i przedmioty

- **Kup przedmioty** w sklepie za nasiona (waluta)
- **Aktywuj muzykę/atmosferę** przed lub podczas sesji
- **Użyj boosterów** dla szybszego wzrostu drzewa
- **Wybierz widok drzewa** - różne style wizualne

### Konfiguracja

Otwórz **Konfigurację** (ikona koła zębatego) aby:
- Ustawić muzykę do intro
- Skonfigurować sesję (czas trwania, auto-start, timer)
- Dodać zablokowane strony
- Wybrać efekty dla sesji (tylko kupione przedmioty)

### Kalendarz

- **Otwórz kalendarz** (ikona kalendarza)
- **Zobacz aktywność** - kolory jak na GitHubie:
  - Szary = brak aktywności
  - Jasny zielony = < 15 min
  - Zielony = 15-30 min
  - Ciemny zielony = 30-60 min
  - Najciemniejszy zielony = 60+ min
- **Kliknij dzień** aby zobaczyć szczegóły

### Wyzwania

- **Otwórz Wyzwania** (ikona tarczy)
- **Ukończ wyzwania** aby zdobyć nagrody
- **Odbierz nagrody** - kliknij "Odbierz nagrodę" po ukończeniu

### Blokada stron

1. **Dodaj URL** w Konfiguracji → Zablokowane strony
2. **Rozpocznij sesję**
3. **Zablokowane strony** będą przekierowane do strony blokady

## 🔧 Rozwiązywanie problemów

### Backend nie odpowiada

```bash
# Sprawdź logi
docker-compose logs backend

# Sprawdź czy działa
curl http://localhost:3001/api/health
```

### Frontend nie ładuje się

```bash
# Sprawdź logi
docker-compose logs frontend

# Sprawdź czy port 3000 jest wolny
netstat -ano | findstr :3000
```

### EEG Service nie łączy się

1. **Sprawdź połączenie Bluetooth** - urządzenie musi być sparowane
2. **Sprawdź nazwę urządzenia** w `eeg-service/main.py`
3. **Sprawdź logi** - powinny pokazywać status połączenia
4. **Upewnij się, że backend działa** - `http://localhost:3001/api/health`

### Rozszerzenie Chrome nie blokuje stron

1. **Sprawdź czy rozszerzenie jest włączone** w `chrome://extensions/`
2. **Sprawdź czy sesja jest aktywna** - rozszerzenie działa tylko podczas sesji
3. **Sprawdź konsolę rozszerzenia** - `chrome://extensions/` → Szczegóły → Service Worker
4. **Sprawdź czy aplikacja jest otwarta** na `localhost:3000`

### Muzyka nie gra

1. **Sprawdź konsolę przeglądarki** (F12) - mogą być błędy ładowania plików
2. **Sprawdź czy pliki istnieją** w `frontend/public/music/`
3. **Sprawdź autoplay policy** - niektóre przeglądarki wymagają interakcji użytkownika
4. **Sprawdź czy przedmiot jest kupiony i aktywowany**

### Kolory w kalendarzu nie są widoczne

1. **Sprawdź czy masz sesje w historii** - kolory pojawiają się tylko dla dni z aktywnością
2. **Odśwież stronę** (F5)
3. **Sprawdź konsolę** - mogą być błędy JavaScript

## 📊 System nagród

### Nasiona (waluta)
- **1 nasionko = 1 minuta sesji**
- Można wydać w sklepie na:
  - Muzykę
  - Atmosferę
  - Boostery
  - Widoki drzewa
  - Drzewa do obsadzenia

### Osiągnięcia
- **Pierwsza sesja** - 10 nasion
- **10 sesji** - 50 nasion
- **50 sesji** - 200 nasion
- **100 sesji** - 500 nasion
- **Godzina skupienia** - 100 nasion
- **3/7/30 dni z rzędu** - 75/200/1000 nasion
- **10/50 godzin nauki** - 150/500 nasion

### Wyzwania
- **Budowniczy Nawyków** - 7 sesji w tygodniu → 100 nasion
- **Nocny Marek** - Sesja po 20:00 → 50 nasion
- **Nowy Horyzont** - 3 różne widoki → Osiągnięcie
- **Skupienie Absolutne** - Sesja 45+ min → 75 nasion

## 🎨 Personalizacja

### Muzyka
- Muzyka klasyczna
- Dźwięki natury
- Binaural beats
- Ambient space

### Atmosfera
- Światło świec
- Deszcz za oknem
- Kominek

### Widoki drzewa
- Zwykłe drzewo (darmowe)
- Choinka
- Kwitnąca wiśnia

## 📝 Notatki dla deweloperów

### Dodawanie nowych przedmiotów

Edytuj `frontend/src/App.js` - tablica `shopItems`:
```javascript
{
  id: 'unique_id',
  category: 'music|atmosphere|boost|view|tree',
  name: 'Nazwa',
  price: 100,
  icon: '🎵',
  description: 'Opis',
  effect: 'focus+10%',
  audioPath: '/music/file.mp3' // opcjonalne
}
```

### Dodawanie nowych wyzwań

Edytuj `frontend/src/App.js` - tablica `challenges`:
```javascript
{
  id: 'challenge_id',
  name: 'Nazwa wyzwania',
  description: 'Opis',
  progress: currentProgress,
  target: targetValue,
  reward: 100,
  icon: '🎯',
  completed: false
}
```

### API Endpoints

#### Backend
- `POST /api/session/start` - Rozpocznij sesję
- `POST /api/session/stop` - Zakończ sesję
- `POST /api/focus-data` - Wyślij dane focus score
- `GET /api/focus-data` - Pobierz ostatni focus score
- `GET /api/health` - Status serwera

## 🤝 Wsparcie

W razie problemów:
1. Sprawdź sekcję [Rozwiązywanie problemów](#-rozwiązywanie-problemów)
2. Sprawdź logi w konsoli przeglądarki (F12)
3. Sprawdź logi Docker: `docker-compose logs`

## 📄 Licencja

[Określ licencję]

## 👥 Autorzy

[Twoje imię/nazwa zespołu]

---

**NeuroGradient** - Rośnij razem ze swoim skupieniem 🌳✨
