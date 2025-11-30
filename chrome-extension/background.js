// Service Worker dla rozszerzenia Chrome
// Sprawdza czy sesja jest aktywna i synchronizuje zablokowane URL-e

let isSessionActive = false;
let blockedUrls = [];

// Nasłuchuj wiadomości z aplikacji React (przez localStorage)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.blockedUrls) {
    blockedUrls = changes.blockedUrls.newValue || [];
    updateBlockingRules();
  }
  if (namespace === 'local' && changes.isSessionActive) {
    isSessionActive = changes.isSessionActive.newValue || false;
    updateBlockingRules();
  }
});

// Funkcja do normalizacji URL (bez protokołu, www, etc.)
function normalizeUrl(url) {
  if (!url) return '';
  // Usuń protokół, www, trailing slash
  let normalized = url.toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
  return normalized;
}

// Funkcja sprawdzająca czy URL jest zablokowany
function isUrlBlocked(url) {
  if (!isSessionActive || blockedUrls.length === 0) {
    return false;
  }
  
  const normalizedUrl = normalizeUrl(url);
  
  return blockedUrls.some(blockedUrl => {
    const normalizedBlocked = normalizeUrl(blockedUrl);
    // Sprawdź czy URL zawiera zablokowaną domenę
    return normalizedUrl.includes(normalizedBlocked) || 
           normalizedBlocked.includes(normalizedUrl);
  });
}

// Aktualizuj reguły blokowania
function updateBlockingRules() {
  // Używamy webNavigation API do przechwytywania i przekierowywania
  // Alternatywnie możemy użyć declarativeNetRequest (wymaga więcej uprawnień)
}

// Nasłuchuj prób nawigacji
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return; // Tylko główna ramka
  
  if (isUrlBlocked(details.url)) {
    // Przekieruj do strony blokady
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(details.url)
    });
  }
}, {
  url: [{ urlMatches: '.*' }]
});

// Nasłuchuj wiadomości z content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkBlocked') {
    const blocked = isUrlBlocked(request.url || sender.tab?.url);
    sendResponse({ blocked });
  } else if (request.action === 'getStatus') {
    sendResponse({ 
      isSessionActive, 
      blockedUrls,
      count: blockedUrls.length 
    });
  } else if (request.action === 'updateData') {
    // Aktualizuj dane bezpośrednio z aplikacji React
    if (request.blockedUrls) {
      blockedUrls = request.blockedUrls;
      chrome.storage.local.set({ blockedUrls });
    }
    if (request.isSessionActive !== undefined) {
      isSessionActive = request.isSessionActive;
      chrome.storage.local.set({ isSessionActive });
    }
    sendResponse({ success: true });
  }
  return true; // Asynchroniczna odpowiedź
});

// Synchronizuj z localStorage aplikacji React co sekundę
setInterval(() => {
  // Pobierz dane z localStorage aplikacji (przez content script)
  chrome.tabs.query({ url: ['http://localhost:3000/*', 'http://127.0.0.1:3000/*'] }, (tabs) => {
    if (tabs.length > 0) {
      // Wyślij wiadomość do pierwszego dostępnego taba
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getBlockedData' }, (response) => {
        if (chrome.runtime.lastError) {
          // Tab może nie być jeszcze gotowy, spróbuj ponownie później
          return;
        }
        if (response) {
          if (response.blockedUrls && JSON.stringify(response.blockedUrls) !== JSON.stringify(blockedUrls)) {
            blockedUrls = response.blockedUrls;
            chrome.storage.local.set({ blockedUrls });
            console.log('Blocked URLs updated:', blockedUrls);
          }
          if (response.isSessionActive !== undefined && response.isSessionActive !== isSessionActive) {
            isSessionActive = response.isSessionActive;
            chrome.storage.local.set({ isSessionActive });
            console.log('Session status updated:', isSessionActive);
          }
        }
      });
    }
  });
}, 1000);

// Inicjalizacja przy starcie
chrome.storage.local.get(['blockedUrls', 'isSessionActive'], (result) => {
  blockedUrls = result.blockedUrls || [];
  isSessionActive = result.isSessionActive || false;
});

console.log('NeuroGradient Extension: Background script loaded');

