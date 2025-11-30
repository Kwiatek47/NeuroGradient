import React, { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import Board3D from './Board3D';
import GrowingTree from './GrowingTree';
import IntroScreen from './IntroScreen';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [challengesOpen, setChallengesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // {year, month, day}
  const [isActive, setIsActive] = useState(false); // czy aktywność jest w toku
  const [isPaused, setIsPaused] = useState(false); // czy sesja jest wstrzymana
  const [pausedAt, setPausedAt] = useState(null); // czas rozpoczęcia pauzy
  const [coins, setCoins] = useState(() => {
    // Ładowanie nasion z localStorage - dla testów ustawiamy minimum 1000
    const saved = localStorage.getItem('coins');
    const currentCoins = saved ? parseInt(saved, 10) : 0;
    const testCoins = Math.max(currentCoins, 1000); // Minimum 1000 nasion dla testów
    if (testCoins !== currentCoins) {
      localStorage.setItem('coins', testCoins.toString());
    }
    return testCoins;
  });
  const [ownedItems, setOwnedItems] = useState(() => {
    // Ładowanie posiadanych przedmiotów z localStorage
    const saved = localStorage.getItem('ownedItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeMusic, setActiveMusic] = useState(null); // aktywna muzyka
  const [activeTreeView, setActiveTreeView] = useState('default'); // aktywny widok drzewa
  const [activeBoosts, setActiveBoosts] = useState([]); // aktywne boostery
  const [activeAtmosphere, setActiveAtmosphere] = useState([]); // aktywna atmosfera
  const [activeShopTab, setActiveShopTab] = useState('music'); // aktywna zakładka w sklepie
  const audioRef = useRef(null); // referencja do elementu audio (muzyka)
  const atmosphereAudioRef = useRef(null); // referencja do elementu audio (atmosfera)
  const [sessionStartTime, setSessionStartTime] = useState(null); // czas rozpoczęcia sesji
  const [sessionDuration, setSessionDuration] = useState(0); // czas trwania sesji w sekundach
  const [focusScore, setFocusScore] = useState(0); // Score z EEG (-1.0 do 1.0)
  const [eegConnected, setEegConnected] = useState(false); // Status połączenia z EEG
  const [sessionsHistory, setSessionsHistory] = useState(() => {
    // Ładowanie historii sesji z localStorage
    const saved = localStorage.getItem('sessionsHistory');
    return saved ? JSON.parse(saved) : {};
  });
  const [achievements, setAchievements] = useState(() => {
    // Ładowanie osiągnięć z localStorage
    const saved = localStorage.getItem('achievements');
    return saved ? JSON.parse(saved) : {};
  });
  const [purchasingItem, setPurchasingItem] = useState(null); // ID przedmiotu w trakcie animacji zakupu
  const [plantedTrees, setPlantedTrees] = useState(() => {
    // Ładowanie posadzonych drzew z localStorage
    const saved = localStorage.getItem('plantedTrees');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTreeType, setSelectedTreeType] = useState(null); // Typ drzewa wybrany do obsadzenia
  
  // Ustawienia konfiguracji
  const [introMusic, setIntroMusic] = useState(() => {
    const saved = localStorage.getItem('introMusic');
    return saved || '';
  });
  const [breathingExercises, setBreathingExercises] = useState(() => {
    const saved = localStorage.getItem('breathingExercises');
    return saved ? JSON.parse(saved) : { enabled: true, duration: 60 };
  });
  const [sessionConfig, setSessionConfig] = useState(() => {
    const saved = localStorage.getItem('sessionConfig');
    return saved ? JSON.parse(saved) : { defaultDuration: 25, autoStart: false, showTimer: true };
  });
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionSummaryData, setSessionSummaryData] = useState(null);
  const [showIntro, setShowIntro] = useState(false);
  const introAudioRef = useRef(null);
  const [blockedUrls, setBlockedUrls] = useState(() => {
    const saved = localStorage.getItem('blockedUrls');
    return saved ? JSON.parse(saved) : [];
  });
  const [newUrl, setNewUrl] = useState('');
  
  // Leaderboard i spectating
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [spectatingUserId, setSpectatingUserId] = useState(null);
  const [leaderboardSortBy, setLeaderboardSortBy] = useState('trees'); // 'trees' lub 'coins'
  
  // Symulacja danych użytkowników dla leaderboard (w prawdziwej aplikacji byłoby to z backendu)
  const [leaderboardUsers] = useState(() => {
    const saved = localStorage.getItem('leaderboardUsers');
    if (saved) return JSON.parse(saved);
    
    // Generuj przykładowych użytkowników
    const users = [
      { id: 'current', name: 'Ty', trees: plantedTrees.length, coins: coins, avatar: '👤' },
      { id: 'user1', name: 'Anna', trees: 45, coins: 2500, avatar: '🌺' },
      { id: 'user2', name: 'Marek', trees: 38, coins: 3200, avatar: '🌳' },
      { id: 'user3', name: 'Kasia', trees: 52, coins: 1800, avatar: '🌸' },
      { id: 'user4', name: 'Tomek', trees: 29, coins: 4100, avatar: '🌲' },
      { id: 'user5', name: 'Ola', trees: 67, coins: 1500, avatar: '🌿' },
      { id: 'user6', name: 'Piotr', trees: 34, coins: 2800, avatar: '🍃' },
      { id: 'user7', name: 'Magda', trees: 41, coins: 2200, avatar: '🌴' },
    ];
    localStorage.setItem('leaderboardUsers', JSON.stringify(users));
    return users;
  });
  
  // Aktualizuj dane aktualnego użytkownika w leaderboard
  useEffect(() => {
    const saved = localStorage.getItem('leaderboardUsers');
    if (!saved) return;
    
    const users = JSON.parse(saved);
    const currentUserIndex = users.findIndex(u => u.id === 'current');
    if (currentUserIndex !== -1) {
      users[currentUserIndex] = {
        ...users[currentUserIndex],
        trees: plantedTrees.length,
        coins: coins
      };
      localStorage.setItem('leaderboardUsers', JSON.stringify(users));
    }
  }, [plantedTrees.length, coins]);

  // Definicja przedmiotów sklepu - użyj useMemo aby uniknąć problemów z useEffect
  const shopItems = useMemo(() => [
    // Muzyka do skupienia
    { id: 'music1', category: 'music', name: 'Muzyka klasyczna', price: 80, icon: '🎵', description: 'Spokojna muzyka klasyczna dla lepszego skupienia', effect: 'focus+10%', audioPath: '/music/muzyka-klasyczna.mp3' },
    { id: 'music2', category: 'music', name: 'Dźwięki natury', price: 100, icon: '🌿', description: 'Odgłosy lasu i natury dla głębokiego flow', effect: 'flow+15%', audioPath: '/music/dzwieki-natury.mp3' },
    { id: 'music3', category: 'music', name: 'Binaural beats', price: 150, icon: '🧠', description: 'Fale mózgowe dla maksymalnej koncentracji', effect: 'focus+20%', audioPath: '/music/binaural-beats.mp3' },
    { id: 'music4', category: 'music', name: 'Ambient space', price: 120, icon: '🌌', description: 'Kosmiczne dźwięki dla kreatywnego flow', effect: 'creativity+15%', audioPath: '/music/ambient-space.mp3' },
    
    // Widoki drzewa
    { id: 'view1', category: 'view', name: 'Zwykłe drzewo', price: 0, icon: '🌳', description: 'Klasyczny widok drzewa', effect: 'visual', treeType: 'normal' },
    { id: 'view2', category: 'view', name: 'Choinka', price: 100, icon: '🎄', description: 'Świąteczna choinka z ozdobami', effect: 'visual', treeType: 'christmas' },
    { id: 'view3', category: 'view', name: 'Kwitnąca wiśnia', price: 120, icon: '🌸', description: 'Delikatne kwiaty wiśni', effect: 'visual', treeType: 'cherry' },
    
    // Boostery do skupienia
    { id: 'boost1', category: 'boost', name: 'Booster skupienia', price: 80, icon: '⚡', description: '+20% do tempa wzrostu przez 30 min', effect: 'growth+20%' },
    { id: 'boost2', category: 'boost', name: 'Eliksir flow', price: 150, icon: '🧪', description: 'Podwaja tempo wzrostu przez 1 godzinę', effect: 'growth+100%' },
    { id: 'boost3', category: 'boost', name: 'Kapsuła czasu', price: 200, icon: '⏰', description: 'Zwiększa czas efektywnej nauki o 25%', effect: 'time+25%' },
    
    // Atmosfera
    { id: 'atmo1', category: 'atmosphere', name: 'Światło świec', price: 60, icon: '🕯️', description: 'Ciepłe światło świec dla relaksu', effect: 'relax+10%' },
    { id: 'atmo2', category: 'atmosphere', name: 'Deszcz za oknem', price: 70, icon: '🌧️', description: 'Relaksujący dźwięk deszczu', effect: 'focus+12%' },
    { id: 'atmo3', category: 'atmosphere', name: 'Kominek', price: 90, icon: '🔥', description: 'Przytulna atmosfera kominka', effect: 'comfort+15%', audioPath: '/music/fireplace_sound.wav' },
    
    // Powiadomienia i przypomnienia
    { id: 'notif1', category: 'notification', name: 'Mądre przypomnienia', price: 50, icon: '🔔', description: 'Inteligentne przypomnienia o przerwach', effect: 'reminders' },
    { id: 'notif2', category: 'notification', name: 'Motywacyjne cytaty', price: 40, icon: '💬', description: 'Inspirujące cytaty podczas nauki', effect: 'motivation' },
    
    // Drzewa do obsadzenia na mapie
    { id: 'tree1', category: 'tree', name: 'Zwykłe drzewo', price: 50, icon: '🌳', description: 'Klasyczne drzewo do obsadzenia', effect: 'dekoracja', treeType: 'normal' },
    { id: 'tree2', category: 'tree', name: 'Choinka', price: 100, icon: '🎄', description: 'Świąteczna choinka z ozdobami', effect: 'dekoracja', treeType: 'christmas' },
    { id: 'tree3', category: 'tree', name: 'Kwitnąca wiśnia', price: 120, icon: '🌸', description: 'Delikatne kwiaty wiśni', effect: 'dekoracja', treeType: 'cherry' }
  ], []);

  const buyItem = (item) => {
    // Dla drzew pozwól na wielokrotne zakupy (każdy zakup = jedno drzewo do posadzenia)
    const isTree = item.category === 'tree';
    const canBuy = isTree 
      ? coins >= item.price 
      : coins >= item.price && !ownedItems.find(owned => owned.id === item.id);
    
    if (canBuy) {
      // Animacja zakupu
      setPurchasingItem(item.id);
      setTimeout(() => {
        setPurchasingItem(null);
      }, 600);
      
      const newCoins = coins - item.price;
      setCoins(newCoins);
      localStorage.setItem('coins', newCoins.toString());
      
      // Dla drzew nie dodawaj do ownedItems (pozwól na wielokrotne zakupy)
      if (!isTree) {
        const newOwnedItems = [...ownedItems, item];
        setOwnedItems(newOwnedItems);
        localStorage.setItem('ownedItems', JSON.stringify(newOwnedItems));
      }
      
      // Aktywuj przedmiot automatycznie po zakupie
      if (item.category === 'music') {
        setActiveMusic(item.id);
      } else if (item.category === 'view') {
        setActiveTreeView(item.id);
      } else if (item.category === 'boost') {
        setActiveBoosts([...activeBoosts, item.id]);
      } else if (item.category === 'atmosphere' || item.category === 'notification') {
        setActiveAtmosphere([...activeAtmosphere, item.id]);
      } else if (item.category === 'tree') {
        // Dla drzew - ustaw jako wybrane do obsadzenia
        setSelectedTreeType(item.treeType);
      }
    }
  };

  // Funkcja do obsadzania drzewa na mapie
  const plantTree = (row, col) => {
    if (!selectedTreeType) return;
    
    // Pozwól na obsadzanie drzew na każdym polu (nawet jeśli już jest drzewo)
    const newTree = {
      row,
      col,
      type: selectedTreeType,
      id: Date.now() // Unikalne ID
    };
    
    const newPlantedTrees = [...plantedTrees, newTree];
    setPlantedTrees(newPlantedTrees);
    localStorage.setItem('plantedTrees', JSON.stringify(newPlantedTrees));
    
    // Usuń wybór po obsadzeniu
    setSelectedTreeType(null);
  };

  const activateItem = (item) => {
    if (item.category === 'music') {
      setActiveMusic(item.id);
    } else if (item.category === 'view') {
      setActiveTreeView(item.id);
    } else if (item.category === 'boost') {
      if (!activeBoosts.includes(item.id)) {
        setActiveBoosts([...activeBoosts, item.id]);
      }
    } else if (item.category === 'atmosphere' || item.category === 'notification') {
      if (!activeAtmosphere.includes(item.id)) {
        setActiveAtmosphere([...activeAtmosphere, item.id]);
      }
    }
  };

  const deactivateItem = (itemId, category) => {
    if (category === 'music') {
      setActiveMusic(null);
    } else if (category === 'view') {
      setActiveTreeView('default');
    } else if (category === 'boost') {
      setActiveBoosts(activeBoosts.filter(id => id !== itemId));
    } else if (category === 'atmosphere' || category === 'notification') {
      setActiveAtmosphere(activeAtmosphere.filter(id => id !== itemId));
    }
  };

  const getItemsByCategory = (category) => {
    return shopItems.filter(item => item.category === category);
  };

  // Odtwarzanie muzyki gdy activeMusic się zmienia
  useEffect(() => {
    if (audioRef.current) {
      if (activeMusic) {
        const musicItem = shopItems.find(item => item.id === activeMusic);
        if (musicItem && musicItem.audioPath) {
          audioRef.current.src = musicItem.audioPath;
          audioRef.current.loop = true;
          audioRef.current.volume = 0.5; // 50% głośności
          audioRef.current.play().catch(error => {
            console.log('Błąd odtwarzania muzyki:', error);
          });
        }
      } else {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
  }, [activeMusic, shopItems]);

  // Odtwarzanie dźwięków atmosfery gdy activeAtmosphere się zmienia
  useEffect(() => {
    if (atmosphereAudioRef.current) {
      // Znajdź pierwszą aktywną atmosferę z audioPath
      const atmosphereItem = shopItems.find(item => 
        activeAtmosphere.includes(item.id) && item.audioPath
      );
      
      if (atmosphereItem && atmosphereItem.audioPath) {
        console.log('Odtwarzanie atmosfery:', atmosphereItem.name, atmosphereItem.audioPath);
        console.log('Aktywne atmosfery:', activeAtmosphere);
        
        // Użyj process.env.PUBLIC_URL jeśli jest dostępny, w przeciwnym razie użyj ścieżki względnej
        const audioPath = atmosphereItem.audioPath.startsWith('/') 
          ? atmosphereItem.audioPath 
          : `${process.env.PUBLIC_URL || ''}${atmosphereItem.audioPath}`;
        
        atmosphereAudioRef.current.src = audioPath;
        atmosphereAudioRef.current.loop = true;
        atmosphereAudioRef.current.volume = 0.5; // Zwiększam głośność do 50% dla testów
        
        // Sprawdź czy plik się ładuje
        atmosphereAudioRef.current.addEventListener('loadeddata', () => {
          console.log('Plik audio załadowany:', audioPath);
        });
        
        atmosphereAudioRef.current.addEventListener('error', (e) => {
          console.error('Błąd ładowania pliku audio:', e);
          console.error('Ścieżka:', audioPath);
        });
        
        atmosphereAudioRef.current.play().then(() => {
          console.log('Odtwarzanie rozpoczęte:', audioPath);
        }).catch(error => {
          console.error('Błąd odtwarzania atmosfery:', error);
          console.error('Ścieżka:', audioPath);
          console.error('Kod błędu:', error.code);
        });
      } else {
        if (atmosphereAudioRef.current.src) {
          console.log('Zatrzymywanie atmosfery');
        }
        atmosphereAudioRef.current.pause();
        atmosphereAudioRef.current.src = '';
      }
    }
  }, [activeAtmosphere, shopItems]);

  // Sprawdzanie osiągnięć przy zmianie historii sesji
  useEffect(() => {
    if (Object.keys(sessionsHistory).length > 0) {
      const allSessions = Object.values(sessionsHistory).flat();
      const totalSessions = allSessions.length;
      const totalTime = allSessions.reduce((sum, s) => sum + s.duration, 0);
      
      // Obliczanie dni z rzędu
      const dates = Object.keys(sessionsHistory).sort();
      let maxConsecutive = 0;
      if (dates.length > 0) {
        let consecutiveDays = 1;
        maxConsecutive = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            consecutiveDays++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
          } else {
            consecutiveDays = 1;
          }
        }
      }
      
      const currentAchievements = { ...achievements };
      let coinsEarned = 0;
      let hasNewAchievements = false;
      
      // Definicja osiągnięć
      const achievementDefs = [
        { id: 'first_session', name: 'Pierwsza sesja', icon: '🌱', condition: () => totalSessions >= 1, reward: 10 },
        { id: '10_sessions', name: '10 sesji', icon: '⭐', condition: () => totalSessions >= 10, reward: 50 },
        { id: '50_sessions', name: '50 sesji', icon: '🌟', condition: () => totalSessions >= 50, reward: 200 },
        { id: '100_sessions', name: '100 sesji', icon: '💫', condition: () => totalSessions >= 100, reward: 500 },
        { id: 'hour_session', name: 'Godzina skupienia', icon: '⏰', condition: () => allSessions.some(s => s.duration >= 3600), reward: 100 },
        { id: '3_days_streak', name: '3 dni z rzędu', icon: '🔥', condition: () => maxConsecutive >= 3, reward: 75 },
        { id: '7_days_streak', name: '7 dni z rzędu', icon: '🔥🔥', condition: () => maxConsecutive >= 7, reward: 200 },
        { id: '30_days_streak', name: '30 dni z rzędu', icon: '🔥🔥🔥', condition: () => maxConsecutive >= 30, reward: 1000 },
        { id: 'total_10h', name: '10 godzin nauki', icon: '📚', condition: () => totalTime >= 36000, reward: 150 },
        { id: 'total_50h', name: '50 godzin nauki', icon: '📖', condition: () => totalTime >= 180000, reward: 500 },
      ];
      
      achievementDefs.forEach(achievement => {
        if (!currentAchievements[achievement.id] && achievement.condition()) {
          currentAchievements[achievement.id] = {
            unlocked: true,
            unlockedAt: Date.now(),
            ...achievement
          };
          coinsEarned += achievement.reward;
          hasNewAchievements = true;
        }
      });
      
      if (hasNewAchievements) {
        if (coinsEarned > 0) {
          setCoins(prev => {
            const newCoins = prev + coinsEarned;
            localStorage.setItem('coins', newCoins.toString());
            return newCoins;
          });
        }
        setAchievements(currentAchievements);
        localStorage.setItem('achievements', JSON.stringify(currentAchievements));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionsHistory]);

  // Timer sesji - liczy tylko gdy aktywna i nie wstrzymana
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const duration = Math.floor((now - sessionStartTime) / 1000);
        setSessionDuration(duration);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, sessionStartTime]);

  const startActivity = () => {
    // Najpierw pokaż intro
    setShowIntro(true);
  };
  
  const handleIntroComplete = () => {
    // Po zakończeniu intro rozpocznij właściwą sesję
    setShowIntro(false);
    setIsActive(true);
    setIsPaused(false);
    setSessionStartTime(Date.now());
    setSessionDuration(0);
    
    // Zatrzymaj muzykę intro jeśli była odtwarzana
    if (introAudioRef.current) {
      introAudioRef.current.pause();
      introAudioRef.current.src = '';
    }
  };

  // Funkcja do pobierania danych z backendu (EEG)
  useEffect(() => {
    if (!isActive) {
      setFocusScore(0);
      setEegConnected(false);
      return;
    }

    // Użyj zmiennej środowiskowej lub fallback do localhost
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    // Polling - pobieraj dane co 200ms (zgodnie z UPDATE_INTERVAL w skrypcie EEG)
    const focusInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/focus-data`);
        const data = await response.json();
        
        if (data.isActive && data.score !== undefined) {
          setFocusScore(data.score);
          setEegConnected(true);
        } else {
          setFocusScore(0);
          setEegConnected(false);
        }
      } catch (error) {
        console.error('Error fetching focus data:', error);
        setFocusScore(0);
        setEegConnected(false);
      }
    }, 200); // Polling co 200ms

    return () => clearInterval(focusInterval);
  }, [isActive]);

  const pauseActivity = () => {
    setIsPaused(true);
    setPausedAt(Date.now());
  };

  const resumeActivity = () => {
    if (pausedAt && sessionStartTime) {
      // Przesuń czas rozpoczęcia sesji o czas pauzy, aby timer kontynuował od właściwego momentu
      const pauseDuration = Date.now() - pausedAt;
      setSessionStartTime(prev => prev + pauseDuration);
      setPausedAt(null);
    }
    setIsPaused(false);
  };

  const stopActivity = () => {
    if (sessionStartTime && sessionDuration > 0) {
      // Zapisanie sesji
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const sessionData = {
        startTime: sessionStartTime,
        duration: sessionDuration,
        endTime: Date.now()
      };
      
      const newSessions = { ...sessionsHistory };
      if (!newSessions[dateKey]) {
        newSessions[dateKey] = [];
      }
      
      newSessions[dateKey].push(sessionData);
      
      setSessionsHistory(newSessions);
      localStorage.setItem('sessionsHistory', JSON.stringify(newSessions));
      
      // Przyznaj nasionka za czas trwania sesji (1 minuta = 1 nasionko)
      const coinsEarned = Math.floor(sessionDuration / 60); // Zaokrąglij w dół do pełnych minut
      if (coinsEarned > 0) {
        setCoins(prev => {
          const newCoins = prev + coinsEarned;
          localStorage.setItem('coins', newCoins.toString());
          return newCoins;
        });
      }
      
      // Pokaż podsumowanie sesji
      const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
          return `${hours}h ${minutes}min ${secs}s`;
        }
        return `${minutes}min ${secs}s`;
      };
      
      // Oblicz statystyki dnia (po dodaniu nowej sesji)
      const dayStats = getDayStats(today.getFullYear(), today.getMonth(), today.getDate());
      
      setSessionSummaryData({
        duration: sessionDuration,
        durationFormatted: formatTime(sessionDuration),
        date: dateKey,
        startTime: new Date(sessionStartTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(Date.now()).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
        coinsEarned: coinsEarned,
        // Statystyki dnia
        totalSessions: dayStats.totalSessions,
        totalTimeFormatted: dayStats.totalTimeFormatted,
        longestFormatted: dayStats.longestFormatted,
        averageFormatted: dayStats.averageFormatted
      });
      setShowSessionSummary(true);
    }
    
    setIsActive(false);
    setIsPaused(false);
    setSessionStartTime(null);
    setSessionDuration(0);
    setPausedAt(null);
    setFocusScore(0); // Resetuj focus score
    setEegConnected(false);
  };

  // Funkcja do obliczania statystyk dla danego dnia
  const getDayStats = (year, month, day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySessions = sessionsHistory[dateKey] || [];
    
    if (daySessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        longestSession: 0,
        averageDuration: 0,
        totalTimeFormatted: '0 min',
        longestFormatted: '0 min',
        averageFormatted: '0 min'
      };
    }
    
    const totalSessions = daySessions.length;
    const totalDuration = daySessions.reduce((sum, session) => sum + session.duration, 0);
    const longestSession = Math.max(...daySessions.map(s => s.duration));
    const averageDuration = Math.round(totalDuration / totalSessions);
    
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${minutes}min`;
    };
    
    return {
      totalSessions,
      totalDuration,
      longestSession,
      averageDuration,
      totalTimeFormatted: formatTime(totalDuration),
      longestFormatted: formatTime(longestSession),
      averageFormatted: formatTime(averageDuration)
    };
  };

  const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Puste komórki na początku miesiąca
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Dni miesiąca
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  
  const currentYear = new Date().getFullYear();
  const today = new Date();

  return (
    <div className="app">
      {/* Element audio do odtwarzania muzyki */}
      <audio ref={audioRef} />
      <audio ref={atmosphereAudioRef} />
      <audio ref={introAudioRef} />
      
      {/* Profil w lewym górnym rogu */}
      <button 
        className="profile-header-btn"
        onClick={() => {
          setProfileOpen(!profileOpen);
          setMenuOpen(false);
          setCalendarOpen(false);
          setChallengesOpen(false);
        }}
        title="Profil"
      >
        <div className="profile-avatar-small">
          <span>👤</span>
        </div>
      </button>

      {/* Nasiona w prawym górnym rogu */}
      <div className="coins-display">
        <span className="coins-icon">🌱</span>
        <span className="coins-amount">{coins}</span>
      </div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {/* Wyświetlacz aktywnych efektów - tylko muzyka i boostery */}
      {(activeMusic || activeBoosts.length > 0) && (
        <div className="active-effects">
          <div className="active-effects-content">
            {activeMusic && (
              <div className="effect-item">
                <span className="effect-icon">
                  {shopItems.find(item => item.id === activeMusic)?.icon || '🎵'}
                </span>
                <div className="effect-info">
                  <div className="effect-name">
                    {shopItems.find(item => item.id === activeMusic)?.name || 'Muzyka'}
                  </div>
                </div>
                <button 
                  className="effect-remove-btn"
                  onClick={() => deactivateItem(activeMusic, 'music')}
                  title="Zatrzymaj"
                >
                  ×
                </button>
              </div>
            )}

            {activeBoosts.map(boostId => {
              const boost = shopItems.find(item => item.id === boostId);
              if (!boost) return null;
              return (
                <div key={boostId} className="effect-item">
                  <span className="effect-icon">{boost.icon}</span>
                  <div className="effect-info">
                    <div className="effect-name">{boost.name}</div>
                  </div>
                  <button 
                    className="effect-remove-btn"
                    onClick={() => deactivateItem(boostId, 'boost')}
                    title="Wyłącz"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bottom-nav">
        <button 
          className={`nav-item ${menuOpen ? 'active' : ''}`}
          onClick={() => {
            setMenuOpen(!menuOpen);
            setCalendarOpen(false);
            setProfileOpen(false);
            setChallengesOpen(false);
            setSettingsOpen(false);
          }}
        >
          <span className="icon-shop"></span>
          <span>Sklep</span>
        </button>
        <button 
          className={`nav-item ${calendarOpen ? 'active' : ''}`}
          onClick={() => {
            setCalendarOpen(!calendarOpen);
            setMenuOpen(false);
            setProfileOpen(false);
            setChallengesOpen(false);
            setSettingsOpen(false);
          }}
        >
          <span className="icon-calendar"></span>
          <span>Kalendarz</span>
        </button>
        <button 
          className={`nav-item ${challengesOpen ? 'active' : ''}`}
          onClick={() => {
            setChallengesOpen(!challengesOpen);
            setMenuOpen(false);
            setCalendarOpen(false);
            setProfileOpen(false);
            setSettingsOpen(false);
            setLeaderboardOpen(false);
          }}
        >
          <span className="icon-challenges"></span>
          <span>Wyzwania</span>
        </button>
        <button 
          className={`nav-item ${leaderboardOpen ? 'active' : ''}`}
          onClick={() => {
            setLeaderboardOpen(!leaderboardOpen);
            setMenuOpen(false);
            setCalendarOpen(false);
            setProfileOpen(false);
            setChallengesOpen(false);
            setSettingsOpen(false);
          }}
        >
          <span className="icon-leaderboard"></span>
          <span>Ranking</span>
        </button>
        <button 
          className={`nav-item ${settingsOpen ? 'active' : ''}`}
          onClick={() => {
            setSettingsOpen(!settingsOpen);
            setMenuOpen(false);
            setCalendarOpen(false);
            setProfileOpen(false);
            setChallengesOpen(false);
            setLeaderboardOpen(false);
          }}
        >
          <span className="icon-settings"></span>
          <span>Konfiguracja</span>
        </button>
      </div>

      {/* Sklep w menu bocznym */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-content">
          <h2>Sklep</h2>
          <div className="shop-coins-display">
            <span className="shop-coins-icon">🌱</span>
            <span className="shop-coins-amount">{coins}</span>
            </div>
          
          <div className="shop-tabs">
            <button 
              className={`shop-tab ${activeShopTab === 'music' ? 'active' : ''}`} 
              onClick={() => setActiveShopTab('music')}
            >
              Muzyka
            </button>
            <button 
              className={`shop-tab ${activeShopTab === 'views' ? 'active' : ''}`} 
              onClick={() => setActiveShopTab('views')}
            >
              Widoki
            </button>
            <button 
              className={`shop-tab ${activeShopTab === 'boosts' ? 'active' : ''}`} 
              onClick={() => setActiveShopTab('boosts')}
            >
              Boostery
            </button>
            <button 
              className={`shop-tab ${activeShopTab === 'atmosphere' ? 'active' : ''}`} 
              onClick={() => setActiveShopTab('atmosphere')}
            >
              Atmosfera
            </button>
            <button 
              className={`shop-tab ${activeShopTab === 'trees' ? 'active' : ''}`} 
              onClick={() => setActiveShopTab('trees')}
            >
              Drzewa
            </button>
          </div>

          {activeShopTab === 'music' && (
            <div className="shop-tab-content">
              <h3 className="shop-category-title">Muzyka do skupienia</h3>
              <div className="shop-items-grid">
                {getItemsByCategory('music').map(item => {
                  const isOwned = ownedItems.find(owned => owned.id === item.id);
                  const isActive = activeMusic === item.id;
                  return (
                    <div key={item.id} className={`shop-item-card ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''} ${purchasingItem === item.id ? 'purchasing' : ''}`}>
                      <div className="shop-item-icon">{item.icon}</div>
                      <div className="shop-item-name">{item.name}</div>
                      <div className="shop-item-description">{item.description}</div>
                      <div className="shop-item-effect">{item.effect}</div>
                      <div className="shop-item-price">
                        <span className="shop-price-icon">🌱</span>
                        <span className="shop-price-amount">{item.price}</span>
                      </div>
                      {isOwned ? (
                        <button 
                          className={`shop-buy-btn ${isActive ? 'active-btn' : 'use-btn'}`}
                          onClick={() => activateItem(item)}
                        >
                          {isActive ? '✓ Aktywna' : 'Użyj'}
                        </button>
                      ) : (
                        <button 
                          className={`shop-buy-btn ${coins >= item.price ? '' : 'disabled'}`}
                          onClick={() => buyItem(item)}
                          disabled={coins < item.price}
                        >
                          {coins >= item.price ? 'Kup' : 'Za mało nasion'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeShopTab === 'views' && (
            <div className="shop-tab-content">
              <h3 className="shop-category-title">Widoki drzewa</h3>
              <div className="shop-items-grid">
                {getItemsByCategory('view').map(item => {
                  const isOwned = ownedItems.find(owned => owned.id === item.id) || item.price === 0; // Zwykłe drzewo jest darmowe
                  const isActive = activeTreeView === item.id;
                  return (
                    <div key={item.id} className={`shop-item-card ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''} ${purchasingItem === item.id ? 'purchasing' : ''}`}>
                      <div className="shop-item-icon">{item.icon}</div>
                      <div className="shop-item-name">{item.name}</div>
                      <div className="shop-item-description">{item.description}</div>
                      {item.price > 0 && (
                        <div className="shop-item-price">
                          <span className="shop-price-icon">🌱</span>
                          <span className="shop-price-amount">{item.price}</span>
                        </div>
                      )}
                      {item.price === 0 && (
                        <div className="shop-item-price" style={{ color: '#87AE73', fontWeight: 'bold' }}>
                          Darmowe
                        </div>
                      )}
                      {isOwned ? (
                        <button 
                          className={`shop-buy-btn ${isActive ? 'active-btn' : 'use-btn'}`}
                          onClick={() => activateItem(item)}
                        >
                          {isActive ? '✓ Aktywny' : 'Użyj'}
                        </button>
                      ) : (
                        <button 
                          className={`shop-buy-btn ${coins >= item.price ? '' : 'disabled'}`}
                          onClick={() => buyItem(item)}
                          disabled={coins < item.price}
                        >
                          {coins >= item.price ? 'Kup' : 'Za mało nasion'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeShopTab === 'boosts' && (
            <div className="shop-tab-content">
              <h3 className="shop-category-title">Boostery do skupienia</h3>
              <div className="shop-items-grid">
                {getItemsByCategory('boost').map(item => {
                  const isOwned = ownedItems.find(owned => owned.id === item.id);
                  const isActive = activeBoosts.includes(item.id);
                  return (
                    <div key={item.id} className={`shop-item-card ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''} ${purchasingItem === item.id ? 'purchasing' : ''}`}>
                      <div className="shop-item-icon">{item.icon}</div>
                      <div className="shop-item-name">{item.name}</div>
                      <div className="shop-item-description">{item.description}</div>
                      <div className="shop-item-effect">{item.effect}</div>
                      <div className="shop-item-price">
                        <span className="shop-price-icon">🌱</span>
                        <span className="shop-price-amount">{item.price}</span>
            </div>
                      {isOwned ? (
                        <button 
                          className={`shop-buy-btn ${isActive ? 'active-btn' : 'use-btn'}`}
                          onClick={() => isActive ? deactivateItem(item.id, 'boost') : activateItem(item)}
                        >
                          {isActive ? '✓ Aktywny' : 'Użyj'}
                        </button>
                      ) : (
            <button 
                          className={`shop-buy-btn ${coins >= item.price ? '' : 'disabled'}`}
                          onClick={() => buyItem(item)}
                          disabled={coins < item.price}
            >
                          {coins >= item.price ? 'Kup' : 'Za mało nasion'}
            </button>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
          )}

          {activeShopTab === 'atmosphere' && (
            <div className="shop-tab-content">
              <h3 className="shop-category-title">Atmosfera</h3>
              <div className="shop-items-grid">
                {getItemsByCategory('atmosphere').concat(getItemsByCategory('notification')).map(item => {
                  const isOwned = ownedItems.find(owned => owned.id === item.id);
                  const isActive = activeAtmosphere.includes(item.id);
                  return (
                    <div key={item.id} className={`shop-item-card ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''} ${purchasingItem === item.id ? 'purchasing' : ''}`}>
                      <div className="shop-item-icon">{item.icon}</div>
                      <div className="shop-item-name">{item.name}</div>
                      <div className="shop-item-description">{item.description}</div>
                      <div className="shop-item-effect">{item.effect}</div>
                      <div className="shop-item-price">
                        <span className="shop-price-icon">🌱</span>
                        <span className="shop-price-amount">{item.price}</span>
            </div>
                      {isOwned ? (
                        <button 
                          className={`shop-buy-btn ${isActive ? 'active-btn' : 'use-btn'}`}
                          onClick={() => isActive ? deactivateItem(item.id, item.category) : activateItem(item)}
                        >
                          {isActive ? '✓ Aktywny' : 'Użyj'}
                        </button>
                      ) : (
            <button 
                          className={`shop-buy-btn ${coins >= item.price ? '' : 'disabled'}`}
                          onClick={() => buyItem(item)}
                          disabled={coins < item.price}
            >
                          {coins >= item.price ? 'Kup' : 'Za mało nasion'}
            </button>
                      )}
                    </div>
                  );
                })}
          </div>
            </div>
          )}

          {activeShopTab === 'trees' && (
            <div className="shop-tab-content">
              <h3 className="shop-category-title">Drzewa do obsadzenia</h3>
              {selectedTreeType && (
                <div className="tree-selection-hint" style={{ 
                  padding: '10px', 
                  marginBottom: '15px', 
                  background: '#87AE73', 
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  Wybrano drzewo! Kliknij na mapie, aby je obsadzić.
                  <button 
                    onClick={() => setSelectedTreeType(null)}
                    style={{ 
                      marginLeft: '10px', 
                      padding: '5px 10px', 
                      background: 'white', 
                      color: '#87AE73',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Anuluj
                  </button>
                </div>
              )}
              <div className="shop-items-grid">
                {getItemsByCategory('tree').map(item => {
                  const isSelected = selectedTreeType === item.treeType;
                  return (
                    <div key={item.id} className={`shop-item-card ${isSelected ? 'active' : ''} ${purchasingItem === item.id ? 'purchasing' : ''}`}>
                      <div className="shop-item-icon">{item.icon}</div>
                      <div className="shop-item-name">{item.name}</div>
                      <div className="shop-item-description">{item.description}</div>
                      <div className="shop-item-effect">{item.effect}</div>
                      <div className="shop-item-price">
                        <span className="shop-price-icon">🌱</span>
                        <span className="shop-price-amount">{item.price}</span>
                      </div>
                      <button 
                        className={`shop-buy-btn ${isSelected ? 'active-btn' : ''} ${coins >= item.price ? '' : 'disabled'}`}
                        onClick={() => buyItem(item)}
                        disabled={coins < item.price}
                      >
                        {isSelected ? '✓ Wybrane' : coins >= item.price ? 'Kup i obsadź' : 'Za mało nasion'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {(menuOpen || calendarOpen || profileOpen || challengesOpen || settingsOpen || leaderboardOpen) && (
        <div 
          className="overlay" 
          onClick={() => {
            setMenuOpen(false);
            setCalendarOpen(false);
            setProfileOpen(false);
            setChallengesOpen(false);
            setSettingsOpen(false);
            setLeaderboardOpen(false);
            setSpectatingUserId(null);
          }} 
        />
      )}

      {/* Intro Screen */}
      {showIntro && (
        <IntroScreen
          onComplete={handleIntroComplete}
          introMusic={introMusic}
          breathingEnabled={breathingExercises.enabled}
          breathingDuration={breathingExercises.duration}
          shopItems={shopItems}
        />
      )}

      {/* Drzewo podczas sesji */}
      {isActive && !showIntro && (
        <GrowingTree 
          inputP={focusScore} 
          onStop={stopActivity}
          showTimer={sessionConfig.showTimer}
          sessionDuration={sessionDuration}
        />
      )}

      {/* Plansza 3D - ukryta podczas sesji */}
      {!isActive && (
        <div className={`board-container ${spectatingUserId ? 'spectating-mode' : ''}`}>
          {spectatingUserId ? (
            <div className="spectating-wrapper">
              <div className="spectating-header">
                <button 
                  type="button"
                  className="spectating-back-btn"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSpectatingUserId(null);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSpectatingUserId(null);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSpectatingUserId(null);
                  }}
                  title="Powrót do mojego lasu"
                >
                  🌳 Mój las
                </button>
                <div className="spectating-user-info">
                  {(() => {
                    const user = leaderboardUsers.find(u => u.id === spectatingUserId);
                    return user ? (
                      <>
                        <span className="spectating-avatar">{user.avatar}</span>
                        <span className="spectating-name">{user.name}</span>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
              <Board3D
                plantedTrees={(() => {
                  // Symulacja drzew użytkownika (w prawdziwej aplikacji byłoby z backendu)
                  const user = leaderboardUsers.find(u => u.id === spectatingUserId);
                  if (!user) return [];
                  // Generuj przykładowe drzewa dla spectating
                  const mockTrees = [];
                  for (let i = 0; i < Math.min(user.trees, 64); i++) {
                    mockTrees.push({
                      id: `spectating-${i}`,
                      row: Math.floor(i / 8),
                      col: i % 8,
                      type: ['normal', 'christmas', 'cherry'][Math.floor(Math.random() * 3)]
                    });
                  }
                  return mockTrees;
                })()}
                onSquareClick={null}
                selectedTreeType={null}
                isSpectating={true}
              />
            </div>
          ) : (
            <Board3D 
              plantedTrees={plantedTrees} 
              onSquareClick={plantTree}
              selectedTreeType={selectedTreeType}
              isSpectating={false}
            />
          )}
        </div>
      )}

      {/* Box aktywności */}
      <div className="activity-container">
        <div className="activity-display">
          {!isActive ? (
            <>
              <div className="activity-slogan">Let your mind grow</div>
              <button 
                className="activity-btn start" 
                onClick={startActivity}
              >
                <span className="activity-icon">🌱</span>
                <span className="activity-label">Rozpocznij</span>
              </button>
            </>
          ) : (
            <>
              <div className="activity-slogan">Let your mind grow</div>
              <div className="activity-controls">
                {isPaused ? (
                  <button className="control-btn-icon resume" onClick={resumeActivity} title="Wznów">
                    <div className="icon-play-animated"></div>
                  </button>
                ) : (
                  <button className="control-btn-icon pause" onClick={pauseActivity} title="Wstrzymaj">
                    <div className="icon-pause-animated"></div>
                  </button>
                )}
                <button className="control-btn-icon stop" onClick={stopActivity} title="Zakończ">
                  <div className="icon-stop-animated"></div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Panel Kalendarza */}
      <div className={`side-panel calendar-panel ${calendarOpen ? 'open' : ''}`}>
        <div className="panel-content">
          <button className="panel-close" onClick={() => setCalendarOpen(false)}>×</button>
          <div className="calendar-year">{currentYear}</div>
          <div className="calendar-grid">
            {monthNames.map((monthName, monthIndex) => {
              const days = getMonthDays(currentYear, monthIndex);
              const isCurrentMonth = today.getMonth() === monthIndex && today.getFullYear() === currentYear;
              
              return (
                <div key={monthIndex} className="calendar-month">
                  <div className="calendar-month-header">{monthName}</div>
                  <div className="calendar-weekdays">
                    {dayNames.map((day, idx) => (
                      <div key={idx} className="calendar-weekday">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {days.map((day, dayIndex) => {
                      const isToday = isCurrentMonth && day === today.getDate();
                      return (
                        <div 
                          key={dayIndex} 
                          className={`calendar-day ${day ? '' : 'empty'} ${isToday ? 'today' : ''}`}
                          onClick={() => {
                            if (day) {
                              setSelectedDate({ year: currentYear, month: monthIndex, day });
                            }
                          }}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel Profilu */}
      <div className={`side-panel profile-panel ${profileOpen ? 'open' : ''}`}>
        <div className="panel-content">
          <button className="panel-close" onClick={() => setProfileOpen(false)}>×</button>
          <div className="profile-content">
            <div className="profile-header">
              <div className="profile-avatar">
                <div className="profile-avatar-placeholder">
                  <span>👤</span>
                </div>
                <button className="profile-avatar-edit">✏️</button>
              </div>
              <h2 className="profile-name">Jan Kowalski</h2>
              <p className="profile-email">jan.kowalski@example.com</p>
            </div>

            <div className="profile-stats">
              <h3>Statystyki</h3>
              <div className="profile-stats-grid">
                {(() => {
                  const allSessions = Object.values(sessionsHistory).flat();
                  const totalSessions = allSessions.length;
                  const totalTime = allSessions.reduce((sum, s) => sum + s.duration, 0);
                  const totalHours = Math.floor(totalTime / 3600);
                  const totalMinutes = Math.floor((totalTime % 3600) / 60);
                  
                  // Obliczanie dni z rzędu
                  const dates = Object.keys(sessionsHistory).sort();
                  let maxConsecutive = 0;
                  if (dates.length > 0) {
                    let consecutiveDays = 1;
                    maxConsecutive = 1;
                    for (let i = 1; i < dates.length; i++) {
                      const prevDate = new Date(dates[i - 1]);
                      const currDate = new Date(dates[i]);
                      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
                      if (diffDays === 1) {
                        consecutiveDays++;
                        maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
                      } else {
                        consecutiveDays = 1;
                      }
                    }
                  }
                  
                  const unlockedAchievements = Object.values(achievements).filter(a => a.unlocked).length;
                  
                  return (
                    <>
                      <div className="profile-stat-card">
                        <span className="stat-icon">📊</span>
                        <span className="stat-number">{totalSessions}</span>
                        <span className="stat-label">Ukończone sesje</span>
                      </div>
                      <div className="profile-stat-card">
                        <span className="stat-icon">⏱️</span>
                        <span className="stat-number">{totalHours}h {totalMinutes}min</span>
                        <span className="stat-label">Czas nauki</span>
                      </div>
                      <div className="profile-stat-card">
                        <span className="stat-icon">🔥</span>
                        <span className="stat-number">{maxConsecutive}</span>
                        <span className="stat-label">Dni z rzędu</span>
                      </div>
                      <div className="profile-stat-card">
                        <span className="stat-icon">⭐</span>
                        <span className="stat-number">{unlockedAchievements}</span>
                        <span className="stat-label">Osiągnięcia</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="profile-achievements">
              <h3>Osiągnięcia</h3>
              <div className="achievements-grid">
                {(() => {
                  const allSessions = Object.values(sessionsHistory).flat();
                  const totalSessions = allSessions.length;
                  const totalTime = allSessions.reduce((sum, s) => sum + s.duration, 0);
                  
                  // Obliczanie dni z rzędu
                  const dates = Object.keys(sessionsHistory).sort();
                  let maxConsecutive = 0;
                  if (dates.length > 0) {
                    let consecutiveDays = 1;
                    maxConsecutive = 1;
                    for (let i = 1; i < dates.length; i++) {
                      const prevDate = new Date(dates[i - 1]);
                      const currDate = new Date(dates[i]);
                      const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
                      if (diffDays === 1) {
                        consecutiveDays++;
                        maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
                      } else {
                        consecutiveDays = 1;
                      }
                    }
                  }
                  
                  const achievementDefs = [
                    { id: 'first_session', name: 'Pierwsza sesja', icon: '🌱', condition: () => totalSessions >= 1, reward: 10 },
                    { id: '10_sessions', name: '10 sesji', icon: '⭐', condition: () => totalSessions >= 10, reward: 50 },
                    { id: '50_sessions', name: '50 sesji', icon: '🌟', condition: () => totalSessions >= 50, reward: 200 },
                    { id: '100_sessions', name: '100 sesji', icon: '💫', condition: () => totalSessions >= 100, reward: 500 },
                    { id: 'hour_session', name: 'Godzina skupienia', icon: '⏰', condition: () => allSessions.some(s => s.duration >= 3600), reward: 100 },
                    { id: '3_days_streak', name: '3 dni z rzędu', icon: '🔥', condition: () => maxConsecutive >= 3, reward: 75 },
                    { id: '7_days_streak', name: '7 dni z rzędu', icon: '🔥🔥', condition: () => maxConsecutive >= 7, reward: 200 },
                    { id: '30_days_streak', name: '30 dni z rzędu', icon: '🔥🔥🔥', condition: () => maxConsecutive >= 30, reward: 1000 },
                    { id: 'total_10h', name: '10 godzin nauki', icon: '📚', condition: () => totalTime >= 36000, reward: 150 },
                    { id: 'total_50h', name: '50 godzin nauki', icon: '📖', condition: () => totalTime >= 180000, reward: 500 },
                  ];
                  
                  return achievementDefs.map(achievement => {
                    const isUnlocked = achievements[achievement.id]?.unlocked || achievement.condition();
                    return (
                      <div key={achievement.id} className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                        <div className="achievement-icon">{achievement.icon}</div>
                        <div className="achievement-name">{achievement.name}</div>
                        {isUnlocked && (
                          <div className="achievement-reward">+{achievement.reward} 🌱</div>
                        )}
                        {!isUnlocked && (
                          <div className="achievement-locked">🔒</div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="profile-settings">
              <h3>Ustawienia konta</h3>
              <div className="profile-setting-item">
                <span>Powiadomienia</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="profile-setting-item">
                <span>Eksport danych</span>
                <button className="profile-action-btn">Eksportuj</button>
              </div>
              <div className="profile-setting-item">
                <span>Wyloguj się</span>
                <button className="profile-action-btn logout">Wyloguj</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Wyzwań */}
      <div className={`side-panel challenges-panel ${challengesOpen ? 'open' : ''}`}>
        <div className="panel-content">
          <button className="panel-close" onClick={() => setChallengesOpen(false)}>×</button>
          <div className="challenges-content">
            <div className="challenges-header">
              <h2>Wyzwania</h2>
              <p className="challenges-subtitle">Ukończ wyzwania i zdobądź nagrody!</p>
            </div>

            <div className="challenges-list">
              {(() => {
                const allSessions = Object.values(sessionsHistory).flat();
                
                // Obliczanie sesji w tym tygodniu
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                weekStart.setHours(0, 0, 0, 0);
                
                const weekSessions = allSessions.filter(session => {
                  const sessionDate = new Date(session.startTime);
                  return sessionDate >= weekStart;
                }).length;
                
                // Obliczanie sesji po 20:00
                const nightSessions = allSessions.filter(session => {
                  const sessionDate = new Date(session.startTime);
                  return sessionDate.getHours() >= 20;
                }).length;
                
                // Obliczanie różnych widoków
                const uniqueViews = new Set(ownedItems.filter(item => item.category === 'view').map(item => item.id));
                const viewsCount = uniqueViews.size;
                
                // Obliczanie sesji >= 45 minut
                const longSessions = allSessions.filter(session => session.duration >= 2700).length;
                
                const challenges = [
                  {
                    id: 'habit_builder',
                    name: 'Budowniczy Nawyków',
                    description: 'Ukończ 7 sesji w tygodniu',
                    progress: Math.min(weekSessions, 7),
                    target: 7,
                    reward: 100,
                    icon: '📅',
                    completed: weekSessions >= 7
                  },
                  {
                    id: 'night_owl',
                    name: 'Nocny Marek',
                    description: 'Ukończ 1 sesję po 20:00',
                    progress: Math.min(nightSessions, 1),
                    target: 1,
                    reward: 50,
                    icon: '🌙',
                    completed: nightSessions >= 1
                  },
                  {
                    id: 'new_horizon',
                    name: 'Nowy Horyzont',
                    description: 'Wypróbuj 3 różne widoki',
                    progress: Math.min(viewsCount, 3),
                    target: 3,
                    reward: 'Osiągnięcie',
                    icon: '🌟',
                    completed: viewsCount >= 3
                  },
                  {
                    id: 'absolute_focus',
                    name: 'Skupienie Absolutne',
                    description: 'Ukończ sesję trwającą co najmniej 45 minut',
                    progress: Math.min(longSessions, 1),
                    target: 1,
                    reward: 75,
                    icon: '🎯',
                    completed: longSessions >= 1
                  }
                ];
                
                return challenges.map(challenge => {
                  const progressPercent = (challenge.progress / challenge.target) * 100;
                  return (
                    <div key={challenge.id} className={`challenge-card ${challenge.completed ? 'completed' : ''}`}>
                      <div className="challenge-header">
                        <div className="challenge-icon">{challenge.icon}</div>
                        <div className="challenge-info">
                          <h3 className="challenge-name">{challenge.name}</h3>
                          <p className="challenge-description">{challenge.description}</p>
                        </div>
                        <div className="challenge-reward">
                          {typeof challenge.reward === 'number' ? (
                            <span>+{challenge.reward} 🌱</span>
                          ) : (
                            <span>{challenge.reward}</span>
                          )}
                        </div>
                      </div>
                      <div className="challenge-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {challenge.progress} / {challenge.target}
                        </div>
                      </div>
                      {challenge.completed && (
                        <div className="challenge-badge">✓ Ukończone</div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Panel Leaderboard */}
      <div className={`side-panel leaderboard-panel ${leaderboardOpen ? 'open' : ''}`}>
        <div className="panel-content">
          <button className="panel-close" onClick={() => {
            setLeaderboardOpen(false);
            setSpectatingUserId(null);
          }}>×</button>
          <div className="leaderboard-content">
            <div className="leaderboard-header">
              <h2>🏆 Ranking</h2>
              <p className="leaderboard-subtitle">Zobacz najlepszych użytkowników</p>
            </div>

            <div className="leaderboard-tabs">
              <button 
                className={`leaderboard-tab ${leaderboardSortBy === 'trees' ? 'active' : ''}`}
                onClick={() => setLeaderboardSortBy('trees')}
              >
                🌳 Drzewka
              </button>
              <button 
                className={`leaderboard-tab ${leaderboardSortBy === 'coins' ? 'active' : ''}`}
                onClick={() => setLeaderboardSortBy('coins')}
              >
                🌱 Nasionka
              </button>
            </div>

            <div className="leaderboard-list">
              {(() => {
                const sorted = [...leaderboardUsers].sort((a, b) => {
                  if (leaderboardSortBy === 'trees') {
                    return b.trees - a.trees;
                  } else {
                    return b.coins - a.coins;
                  }
                });

                return sorted.map((user, index) => {
                  const isCurrentUser = user.id === 'current';
                  const isSpectating = spectatingUserId === user.id;
                  
                  return (
                    <div 
                      key={user.id} 
                      className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''} ${isSpectating ? 'spectating' : ''}`}
                    >
                      <div className="leaderboard-rank">
                        {index + 1}
                      </div>
                      <div className="leaderboard-avatar">
                        {user.avatar}
                      </div>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">
                          {user.name}
                          {isCurrentUser && <span className="current-badge">Ty</span>}
                        </div>
                        <div className="leaderboard-stats">
                          <span>🌳 {user.trees}</span>
                          <span>🌱 {user.coins}</span>
                        </div>
                      </div>
                      {!isCurrentUser && (
                        <button 
                          className="leaderboard-spectate-btn"
                          onClick={() => {
                            setSpectatingUserId(user.id);
                            setLeaderboardOpen(false);
                          }}
                        >
                          👁️ Obejrzyj
                        </button>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Panel Konfiguracji */}
      <div className={`side-panel settings-panel ${settingsOpen ? 'open' : ''}`}>
        <div className="panel-content">
          <button className="panel-close" onClick={() => setSettingsOpen(false)}>×</button>
          <div className="settings-content">
            <div className="settings-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="icon-settings" style={{ width: '32px', height: '32px' }}></span>
                <h2 style={{ margin: 0 }}>Konfiguracja</h2>
              </div>
              <p className="settings-subtitle">Dostosuj aplikację do swoich potrzeb</p>
            </div>

            <div className="settings-sections">
              {/* Sekcja 1: Intro Flow */}
              <div className="settings-section">
                <h3 className="settings-section-title">1. Intro Flow</h3>
                
                <div className="settings-item">
                  <div className="settings-item-info">
                    <span className="settings-item-label">Muzyka do intro</span>
                    <span className="settings-item-description">Wybierz muzykę odtwarzaną przed rozpoczęciem sesji</span>
                  </div>
                  <select 
                    value={introMusic} 
                    onChange={(e) => {
                      setIntroMusic(e.target.value);
                      localStorage.setItem('introMusic', e.target.value);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '2px solid #87AE73',
                      background: '#FFFFE3',
                      color: '#2d3e2d',
                      fontSize: '12px',
                      fontFamily: 'Manrope, sans-serif',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Brak muzyki</option>
                    {getItemsByCategory('music').map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <span className="settings-item-label">Ćwiczenia oddechowe</span>
                    <span className="settings-item-description">Włącz ćwiczenia oddechowe przed sesją</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={breathingExercises.enabled}
                      onChange={(e) => {
                        const newValue = { ...breathingExercises, enabled: e.target.checked };
                        setBreathingExercises(newValue);
                        localStorage.setItem('breathingExercises', JSON.stringify(newValue));
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {breathingExercises.enabled && (
                  <div className="settings-item">
                    <div className="settings-item-info">
                      <span className="settings-item-label">Czas trwania ćwiczeń (sekundy)</span>
                      <span className="settings-item-description">Długość ćwiczeń oddechowych</span>
                    </div>
                    <input 
                      type="number" 
                      min="30" 
                      max="300" 
                      step="10"
                      value={breathingExercises.duration}
                      onChange={(e) => {
                        const newValue = { ...breathingExercises, duration: parseInt(e.target.value) };
                        setBreathingExercises(newValue);
                        localStorage.setItem('breathingExercises', JSON.stringify(newValue));
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '2px solid #87AE73',
                        background: '#FFFFE3',
                        color: '#2d3e2d',
                        fontSize: '12px',
                        fontFamily: 'Manrope, sans-serif',
                        width: '100px'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Sekcja 2: Sesja */}
              <div className="settings-section">
                <h3 className="settings-section-title">2. Sesja</h3>
                
                <div className="settings-item">
                  <div className="settings-item-info">
                    <span className="settings-item-label">Domyślny czas trwania (minuty)</span>
                    <span className="settings-item-description">Standardowy czas trwania sesji</span>
                  </div>
                  <input 
                    type="number" 
                    min="5" 
                    max="120" 
                    step="5"
                    value={sessionConfig.defaultDuration}
                    onChange={(e) => {
                      const newValue = { ...sessionConfig, defaultDuration: parseInt(e.target.value) };
                      setSessionConfig(newValue);
                      localStorage.setItem('sessionConfig', JSON.stringify(newValue));
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '2px solid #87AE73',
                      background: '#FFFFE3',
                      color: '#2d3e2d',
                      fontSize: '12px',
                      fontFamily: 'Manrope, sans-serif',
                      width: '100px'
                    }}
                  />
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <span className="settings-item-label">Automatyczne rozpoczęcie</span>
                    <span className="settings-item-description">Sesja rozpoczyna się automatycznie po intro</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={sessionConfig.autoStart}
                      onChange={(e) => {
                        const newValue = { ...sessionConfig, autoStart: e.target.checked };
                        setSessionConfig(newValue);
                        localStorage.setItem('sessionConfig', JSON.stringify(newValue));
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <span className="settings-item-label">Wyświetlaj timer</span>
                    <span className="settings-item-description">Pokaż timer podczas sesji</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={sessionConfig.showTimer !== false}
                      onChange={(e) => {
                        const newValue = { ...sessionConfig, showTimer: e.target.checked };
                        setSessionConfig(newValue);
                        localStorage.setItem('sessionConfig', JSON.stringify(newValue));
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {/* Sekcja 3: Zablokowane strony */}
              <div className="settings-section">
                <h3 className="settings-section-title">3. Zablokowane strony</h3>
                
                <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                  <div className="settings-item-info" style={{ width: '100%' }}>
                    <span className="settings-item-label">Dodaj URL do zablokowania</span>
                    <span className="settings-item-description">Wpisz adres strony, którą chcesz zablokować podczas sesji</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <input 
                      type="text" 
                      placeholder="np. facebook.com"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newUrl.trim()) {
                          const updated = [...blockedUrls, newUrl.trim()];
                          setBlockedUrls(updated);
                          localStorage.setItem('blockedUrls', JSON.stringify(updated));
                          setNewUrl('');
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '2px solid #87AE73',
                        background: '#FFFFE3',
                        color: '#2d3e2d',
                        fontSize: '12px',
                        fontFamily: 'Manrope, sans-serif'
                      }}
                    />
                    <button 
                      className="settings-action-btn"
                      onClick={() => {
                        if (newUrl.trim()) {
                          const updated = [...blockedUrls, newUrl.trim()];
                          setBlockedUrls(updated);
                          localStorage.setItem('blockedUrls', JSON.stringify(updated));
                          setNewUrl('');
                        }
                      }}
                    >
                      Dodaj
                    </button>
                  </div>
                </div>

                {blockedUrls.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <div className="settings-item-info" style={{ marginBottom: '10px' }}>
                      <span className="settings-item-label">Zablokowane URL:</span>
                    </div>
                    {blockedUrls.map((url, index) => (
                      <div 
                        key={index} 
                        className="settings-item"
                        style={{ padding: '10px 0' }}
                      >
                        <div className="settings-item-info">
                          <span className="settings-item-label" style={{ fontSize: '13px' }}>{url}</span>
                        </div>
                        <button 
                          className="settings-action-btn danger"
                          onClick={() => {
                            const updated = blockedUrls.filter((_, i) => i !== index);
                            setBlockedUrls(updated);
                            localStorage.setItem('blockedUrls', JSON.stringify(updated));
                          }}
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                        >
                          Usuń
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="day-details-overlay" onClick={() => setSelectedDate(null)}>
          <div className="day-details" onClick={(e) => e.stopPropagation()}>
            <button className="day-details-close" onClick={() => setSelectedDate(null)}>×</button>
            <div className="day-details-header">
              <h2>{selectedDate.day} {monthNames[selectedDate.month]} {selectedDate.year}</h2>
            </div>
            
            <div className="stats-section">
              {(() => {
                const dayStats = getDayStats(selectedDate.year, selectedDate.month, selectedDate.day);
                
                // Obliczanie wykresu tygodniowego (ostatnie 7 dni)
                const weekData = [];
                for (let i = 6; i >= 0; i--) {
                  const date = new Date(selectedDate.year, selectedDate.month, selectedDate.day - i);
                  const stats = getDayStats(date.getFullYear(), date.getMonth(), date.getDate());
                  weekData.push({
                    date: `${date.getDate()}/${date.getMonth() + 1}`,
                    duration: stats.totalDuration
                  });
                }
                
                // Obliczanie wykresu miesięcznego (ostatnie 30 dni)
                const monthData = [];
                for (let i = 29; i >= 0; i--) {
                  const date = new Date(selectedDate.year, selectedDate.month, selectedDate.day - i);
                  const stats = getDayStats(date.getFullYear(), date.getMonth(), date.getDate());
                  monthData.push({
                    date: `${date.getDate()}/${date.getMonth() + 1}`,
                    duration: stats.totalDuration
                  });
                }
                
                const maxWeek = Math.max(...weekData.map(d => d.duration), 1);
                const maxMonth = Math.max(...monthData.map(d => d.duration), 1);
                
                return (
                  <>
                    <h3 className="stats-section-title">Statystyki dnia</h3>
                    <div className="stat-item">
                      <span className="stat-label">Timer sesji (czas trwania)</span>
                      <span className="stat-value">{dayStats.totalTimeFormatted}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Licznik ukończonych sesji</span>
                      <span className="stat-value">{dayStats.totalSessions}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Najdłuższa sesja</span>
                      <span className="stat-value">{dayStats.longestFormatted}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Średni czas sesji</span>
                      <span className="stat-value">{dayStats.averageFormatted}</span>
                    </div>
                    
                    <h3 className="stats-section-title" style={{ marginTop: '30px' }}>Wykres tygodniowy</h3>
                    <div className="chart-container">
                      <div className="chart-bars">
                        {weekData.map((data, index) => (
                          <div key={index} className="chart-bar-wrapper">
                            <div 
                              className="chart-bar" 
                              style={{ 
                                height: `${(data.duration / maxWeek) * 100}%`,
                                minHeight: data.duration > 0 ? '5px' : '0'
                              }}
                              title={`${data.date}: ${Math.floor(data.duration / 60)}min`}
                            ></div>
                            <div className="chart-label">{data.date.split('/')[0]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <h3 className="stats-section-title" style={{ marginTop: '30px' }}>Wykres miesięczny</h3>
                    <div className="chart-container">
                      <div className="chart-bars monthly">
                        {monthData.map((data, index) => (
                          <div key={index} className="chart-bar-wrapper">
                            <div 
                              className="chart-bar" 
                              style={{ 
                                height: `${(data.duration / maxMonth) * 100}%`,
                                minHeight: data.duration > 0 ? '3px' : '0'
                              }}
                              title={`${data.date}: ${Math.floor(data.duration / 60)}min`}
                            ></div>
                            {index % 5 === 0 && (
                              <div className="chart-label small">{data.date.split('/')[0]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Podsumowanie sesji */}
      {showSessionSummary && sessionSummaryData && (
        <div className="session-summary-overlay" onClick={() => setShowSessionSummary(false)}>
          <div className="session-summary" onClick={(e) => e.stopPropagation()}>
            <button 
              className="session-summary-close" 
              onClick={() => setShowSessionSummary(false)}
            >
              ×
            </button>
            <div className="session-summary-header">
              <div className="session-summary-icon">🌳</div>
              <h2>Sesja zakończona!</h2>
              <p className="session-summary-subtitle">Świetna robota!</p>
            </div>
            
            <div className="session-summary-stats">
              <div className="session-summary-stat-card main">
                <div className="session-summary-stat-icon">⏱️</div>
                <div className="session-summary-stat-value">{sessionSummaryData.durationFormatted}</div>
                <div className="session-summary-stat-label">Czas trwania</div>
              </div>
              
              {sessionSummaryData.coinsEarned > 0 && (
                <div className="session-summary-stat-card coins-earned">
                  <div className="session-summary-stat-icon">🌱</div>
                  <div className="session-summary-stat-value">+{sessionSummaryData.coinsEarned}</div>
                  <div className="session-summary-stat-label">Zdobyte nasionka</div>
                </div>
              )}
              
              <div className="session-summary-stats-grid">
                <div className="session-summary-stat-card">
                  <div className="session-summary-stat-icon">🕐</div>
                  <div className="session-summary-stat-value">{sessionSummaryData.startTime}</div>
                  <div className="session-summary-stat-label">Rozpoczęcie</div>
                </div>
                
                <div className="session-summary-stat-card">
                  <div className="session-summary-stat-icon">🕐</div>
                  <div className="session-summary-stat-value">{sessionSummaryData.endTime}</div>
                  <div className="session-summary-stat-label">Zakończenie</div>
                </div>
              </div>

              <div className="session-summary-section-divider">
                <h3 className="session-summary-section-title">Statystyki dnia</h3>
              </div>

              <div className="session-summary-stats-grid">
                <div className="session-summary-stat-card">
                  <div className="session-summary-stat-icon">📊</div>
                  <div className="session-summary-stat-value">{sessionSummaryData.totalSessions || 1}</div>
                  <div className="session-summary-stat-label">Ukończone sesje</div>
                </div>
                
                <div className="session-summary-stat-card">
                  <div className="session-summary-stat-icon">⏰</div>
                  <div className="session-summary-stat-value">{sessionSummaryData.totalTimeFormatted || '0 min'}</div>
                  <div className="session-summary-stat-label">Całkowity czas</div>
                </div>
              </div>

              <div className="session-summary-stats-grid">
                <div className="session-summary-stat-card">
                  <div className="session-summary-stat-icon">🏆</div>
                  <div className="session-summary-stat-value">{sessionSummaryData.longestFormatted || '0 min'}</div>
                  <div className="session-summary-stat-label">Najdłuższa sesja</div>
                </div>
                
                <div className="session-summary-stat-card">
                  <div className="session-summary-stat-icon">📈</div>
                  <div className="session-summary-stat-value">{sessionSummaryData.averageFormatted || '0 min'}</div>
                  <div className="session-summary-stat-label">Średni czas</div>
                </div>
              </div>
            </div>

            <div className="session-summary-footer">
              <button 
                className="session-summary-btn"
                onClick={() => setShowSessionSummary(false)}
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

