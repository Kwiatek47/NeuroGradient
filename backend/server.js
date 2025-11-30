const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- Przechowywanie danych z EEG ---
let lastFocusScore = 0;
let lastFocusTimestamp = null;
let sessionActive = false;
let sessionStartTime = null;

// Endpoint do rozpoczęcia sesji
app.post('/api/session/start', (req, res) => {
  sessionActive = true;
  sessionStartTime = Date.now();
  // Resetujemy score na początku sesji, aby drzewo zaczęło rosnąć od zera
  lastFocusScore = 0;
  lastFocusTimestamp = null;
  console.log(`[SESSION] Started at ${new Date(sessionStartTime).toISOString()}`);
  res.json({ success: true, sessionStartTime });
});

// Endpoint do zakończenia sesji
app.post('/api/session/stop', (req, res) => {
  sessionActive = false;
  const sessionDuration = sessionStartTime ? Date.now() - sessionStartTime : 0;
  console.log(`[SESSION] Stopped. Duration: ${Math.floor(sessionDuration / 1000)}s`);
  sessionStartTime = null;
  res.json({ success: true, duration: sessionDuration });
});

// Endpoint do odbierania danych z skryptu EEG (POST)
app.post('/api/focus-data', (req, res) => {
  const { score, timestamp } = req.body;
  
  if (typeof score !== 'number' || score < -1 || score > 1) {
    return res.status(400).json({ error: 'Invalid score. Must be between -1 and 1' });
  }
  
  lastFocusScore = score;
  lastFocusTimestamp = timestamp || Date.now();
  
  console.log(`[EEG] Focus score: ${score.toFixed(3)}`);
  res.json({ success: true });
});

// Endpoint do pobierania ostatniego score (GET) - dla frontendu
app.get('/api/focus-data', (req, res) => {
  res.json({
    score: lastFocusScore,
    timestamp: lastFocusTimestamp,
    isActive: lastFocusTimestamp && (Date.now() - lastFocusTimestamp < 5000) // Aktywny jeśli dane były w ciągu 5 sekund
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

