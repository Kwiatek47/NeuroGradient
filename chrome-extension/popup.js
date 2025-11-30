// Popup script - wyświetla status rozszerzenia

document.addEventListener('DOMContentLoaded', () => {
  updateStatus();
  
  // Aktualizuj co 2 sekundy
  setInterval(updateStatus, 2000);
});

function updateStatus() {
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      document.getElementById('status').textContent = 'Connection Error';
      document.getElementById('status').className = 'status inactive';
      return;
    }
    
    const statusEl = document.getElementById('status');
    const listEl = document.getElementById('blockedList');
    
    if (response.isSessionActive) {
      statusEl.textContent = 'Session Active';
      statusEl.className = 'status active';
    } else {
      statusEl.textContent = 'Session Inactive';
      statusEl.className = 'status inactive';
    }
    
    if (response.blockedUrls && response.blockedUrls.length > 0) {
      listEl.innerHTML = response.blockedUrls.map(url => 
        `<div class="blocked-item">${url}</div>`
      ).join('');
    } else {
      listEl.innerHTML = '<div class="empty">No blocked websites</div>';
    }
  });
}

