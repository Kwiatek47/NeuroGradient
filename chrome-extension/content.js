// Content Script - działa na każdej stronie
// Sprawdza czy strona jest zablokowana i przekierowuje jeśli potrzeba

(function() {
  'use strict';
  
  // Sprawdź czy strona jest zablokowana przed załadowaniem
  const currentUrl = window.location.href;
  
  // Wyślij wiadomość do background script
  chrome.runtime.sendMessage(
    { action: 'checkBlocked', url: currentUrl },
    (response) => {
      if (chrome.runtime.lastError) {
        // Rozszerzenie może nie być dostępne
        return;
      }
      
      if (response && response.blocked) {
        // Przekieruj do strony blokady
        window.location.href = chrome.runtime.getURL('blocked.html') + 
          '?url=' + encodeURIComponent(currentUrl);
      }
    }
  );
  
  // Nasłuchuj prób nawigacji (dla SPA)
  let lastUrl = currentUrl;
  const checkUrl = () => {
    const current = window.location.href;
    if (current !== lastUrl) {
      lastUrl = current;
      chrome.runtime.sendMessage(
        { action: 'checkBlocked', url: current },
        (response) => {
          if (response && response.blocked) {
            window.location.href = chrome.runtime.getURL('blocked.html') + 
              '?url=' + encodeURIComponent(current);
          }
        }
      );
    }
  };
  
  // Sprawdzaj zmiany URL (dla React Router, Vue Router, etc.)
  setInterval(checkUrl, 500);
  
  // Przechwyć próby nawigacji przez pushState/replaceState
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(checkUrl, 100);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    setTimeout(checkUrl, 100);
  };
  
  // Nasłuchuj wiadomości z background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getBlockedData') {
      // Pobierz dane z localStorage aplikacji React
      try {
        const blockedUrls = JSON.parse(localStorage.getItem('blockedUrls') || '[]');
        const isActive = localStorage.getItem('isActive') === 'true';
        
        sendResponse({ 
          blockedUrls, 
          isSessionActive: isActive 
        });
      } catch (e) {
        console.error('Error reading localStorage:', e);
        sendResponse({ blockedUrls: [], isSessionActive: false });
      }
    }
    return true; // Asynchroniczna odpowiedź
  });
  
  // Nasłuchuj custom eventów z aplikacji React
  window.addEventListener('neurogradient-session-change', (event) => {
    if (event.detail) {
      chrome.runtime.sendMessage({
        action: 'updateData',
        blockedUrls: event.detail.blockedUrls,
        isSessionActive: event.detail.isActive
      });
    }
  });
  
  // Blokuj próby otwarcia zablokowanych linków
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
      chrome.runtime.sendMessage(
        { action: 'checkBlocked', url: link.href },
        (response) => {
          if (response && response.blocked) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = chrome.runtime.getURL('blocked.html') + 
              '?url=' + encodeURIComponent(link.href);
          }
        }
      );
    }
  }, true);
  
})();

