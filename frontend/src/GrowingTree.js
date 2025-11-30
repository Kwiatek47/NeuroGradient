import React, { useEffect, useRef, useState } from 'react';

function GrowingTree({ inputP = 0, onStop = null, showTimer = true, sessionDuration = 0, onLowFocus = null }) {
  const canvasRef = useRef(null);
  const chartCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [inputPDisplay, setInputPDisplay] = useState(0);
  const [eegConnected, setEegConnected] = useState(false);
  const stateRef = useRef({
    inputP: 0,
    treeMaturity: 0,
    currentTreeSize: 0,
    currentBloomLevel: 0,
    time: 0,
    fallingLeaves: [],
    branchBloomState: new Map(),
    lastInputP: 0, // Do śledzenia zmian
    lowFocusStartTime: null, // Czas rozpoczęcia braku skupienia
    lowFocusCallbackTriggered: false, // Czy callback został już wywołany
    lowFocusThreshold: 30000, // 30 sekund w milisekundach
    focusHistory: [], // Historia focus score dla wykresu
    maxHistoryLength: 300 // Maksymalna liczba punktów (60 sekund przy 5 punktów/sekundę)
  });
  
  // API URL - można skonfigurować przez zmienną środowiskową
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    // Zwiększona prędkość wzrostu - szybsze rośnięcie drzewa
    const GROWTH_SPEED = 0.001; // ~10x szybsze niż oryginalne 0.000111
    const MAX_TREE_SIZE = 180;
    const MIN_TREE_SIZE = 80;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    window.addEventListener('resize', resize);
    resize();

    // --- ORGANIC TREE DRAWING ---
    function drawTree(x, y, len, angle, width, key) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      let curveX = width * 0.3;
      ctx.quadraticCurveTo(curveX, -len/2, 0, -len);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.translate(0, -len);

      if (len < 15) {
        if (stateRef.current.treeMaturity > 0.2) {
          drawNaturalLeaf();
          
          // LOGIKA KWIATÓW (STATYCZNE)
          let hasBloom = stateRef.current.branchBloomState.has(key);
          if (hasBloom) {
            drawFlower(stateRef.current.currentBloomLevel);
            // Usychanie
            if (stateRef.current.currentBloomLevel < 0.1) {
              stateRef.current.branchBloomState.delete(key);
            }
          } else if (stateRef.current.currentBloomLevel > 0.6 && Math.random() < stateRef.current.currentBloomLevel * 0.005) {
            // Powstawanie
            drawFlower(stateRef.current.currentBloomLevel);
            stateRef.current.branchBloomState.set(key, true);
          }
        }
        ctx.restore();
        return;
      }

      // CALCULATE ANGLES & WIND
      let wind = Math.sin(stateRef.current.time + len * 0.05) * (2 + (1 - stateRef.current.treeMaturity) * 3);
      let spread = 25 + (stateRef.current.treeMaturity * 15);
      drawTree(0, 0, len * 0.8, spread + wind, width * 0.7, key + 'R');
      drawTree(0, 0, len * 0.65, -spread - 10 + wind, width * 0.7, key + 'L');
      if (len > 40) {
        drawTree(0, 0, len * 0.5, wind, width * 0.6, key + 'C');
      }
      ctx.restore();
    }

    function drawNaturalLeaf() {
      let size = (stateRef.current.treeMaturity * 8) + 2;
      let r = 180 + (stateRef.current.treeMaturity * -150);
      let g = 255 + (stateRef.current.treeMaturity * -75);
      let b = 110 + (stateRef.current.treeMaturity * -90);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size/2, Math.PI/4, 0, Math.PI*2);
      ctx.fill();
    }

    function drawFlower(bloomFactor) {
      const petalCount = 5;
      const petalLength = 2 + (bloomFactor * 10);
      const petalColor = 'rgba(255, 192, 203, 0.9)';
      const centerColor = '#FFD700';

      ctx.save();
      ctx.fillStyle = petalColor;
      for (let i = 0; i < petalCount; i++) {
        ctx.rotate((2 * Math.PI) / petalCount);
        ctx.beginPath();
        ctx.ellipse(petalLength / 3, 0, petalLength * 0.5, petalLength * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = centerColor;
      ctx.beginPath();
      ctx.arc(0, 0, petalLength * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // --- FALLING LEAVES ---
    function spawnLeaf() {
      stateRef.current.fallingLeaves.push({
        x: width/2 + (Math.random() - 0.5) * 500,
        y: height - (stateRef.current.currentTreeSize * 0.8) - Math.random() * 100,
        size: Math.random() * 6 + 4,
        speedY: Math.random() * 1.5 + 0.5,
        swayFreq: Math.random() * 0.1,
        swayAmp: Math.random() * 2,
        angle: Math.random() * 360,
        color: Math.random() > 0.5 ? '#FFD700' : '#FFA07A'
      });
    }

    function updateLeaves() {
      for (let i = stateRef.current.fallingLeaves.length - 1; i >= 0; i--) {
        let l = stateRef.current.fallingLeaves[i];
        l.y += l.speedY;
        l.x += Math.sin(stateRef.current.time + l.y * l.swayFreq) * l.swayAmp;
        l.angle += 0.05;
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.angle);
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size, l.size/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        if (l.y > height) stateRef.current.fallingLeaves.splice(i, 1);
      }
    }

    // --- MAIN LOOP ---
    function animate() {
      ctx.clearRect(0, 0, width, height);
      stateRef.current.time += 0.03;

      // --- GŁÓWNA LOGIKA WZROSTU OPARTA NA INPUT P ---
      // Drzewo rośnie tylko przy dodatnich wartościach, nie zmniejsza się
      if (stateRef.current.inputP > 0) {
        stateRef.current.treeMaturity += stateRef.current.inputP * GROWTH_SPEED;
      }
      
      if (stateRef.current.treeMaturity > 1.0) stateRef.current.treeMaturity = 1.0;
      if (stateRef.current.treeMaturity < 0.0) stateRef.current.treeMaturity = 0.0;

      // Aktualizuj wyświetlaną wartość Input P (co kilka klatek dla wydajności)
      if (Math.floor(stateRef.current.time * 10) % 5 === 0) {
        setInputPDisplay(stateRef.current.inputP);
      }

      // Mapowanie na wizualia
      let targetSize = MIN_TREE_SIZE + (stateRef.current.treeMaturity * (MAX_TREE_SIZE - MIN_TREE_SIZE));
      // Szybkość animacji rozmiaru (jak w kodzie HTML)
      stateRef.current.currentTreeSize += (targetSize - stateRef.current.currentTreeSize) * 0.1;

      let targetBloom = 0;
      if (stateRef.current.treeMaturity > 0.8) {
        targetBloom = (stateRef.current.treeMaturity - 0.8) * 5;
      }
      stateRef.current.currentBloomLevel += (targetBloom - stateRef.current.currentBloomLevel) * 0.05;

      if (stateRef.current.currentTreeSize > 10) {
        drawTree(width / 2, height, stateRef.current.currentTreeSize, 0, 22, 'S');
      }

      // Spadanie liści - rzadziej, bo proces jest wolniejszy
      if (stateRef.current.inputP < -0.1 && stateRef.current.treeMaturity < 0.5) {
        if (Math.random() > 0.95) spawnLeaf(); // Jeszcze rzadziej
      }

      updateLeaves();

      // Rysuj wykres focus score
      drawChart();

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // --- POBIERANIE DANYCH Z API EEG ---
    const fetchFocusData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/focus-data`);
        if (response.ok) {
          const data = await response.json();
          // Score z API jest w zakresie -1.0 do 1.0
          const newInputP = data.score || 0;
          const previousInputP = stateRef.current.inputP;
          stateRef.current.inputP = newInputP;
          setEegConnected(data.isActive || false);
          
          // Dodaj do historii focus score dla wykresu
          const timestamp = Date.now();
          stateRef.current.focusHistory.push({
            score: newInputP,
            timestamp: timestamp
          });
          
          // Ogranicz długość historii
          if (stateRef.current.focusHistory.length > stateRef.current.maxHistoryLength) {
            stateRef.current.focusHistory.shift();
          }
          
          // --- WYKRYWANIE DŁUGOTRWAŁEGO BRAKU SKUPIENIA ---
          // Uznajemy brak skupienia gdy score < 0.1 (blisko zera lub ujemne)
          const isLowFocus = newInputP < 0.1;
          const now = timestamp;
          
          if (isLowFocus) {
            // Jeśli brak skupienia, zacznij lub kontynuuj liczenie czasu
            if (stateRef.current.lowFocusStartTime === null) {
              stateRef.current.lowFocusStartTime = now;
            } else {
              // Sprawdź czy przekroczono próg
              const lowFocusDuration = now - stateRef.current.lowFocusStartTime;
              if (lowFocusDuration >= stateRef.current.lowFocusThreshold && onLowFocus) {
                // Wywołaj callback tylko raz
                if (!stateRef.current.lowFocusCallbackTriggered) {
                  stateRef.current.lowFocusCallbackTriggered = true;
                  onLowFocus();
                }
              }
            }
          } else {
            // Jeśli skupienie wróciło, zresetuj licznik
            if (stateRef.current.lowFocusStartTime !== null) {
              stateRef.current.lowFocusStartTime = null;
              stateRef.current.lowFocusCallbackTriggered = false;
            }
          }
        } else {
          setEegConnected(false);
        }
      } catch (error) {
        // Cichy błąd - nie spamuj konsoli
        setEegConnected(false);
      }
    };

    // Polling co 200ms (zgodnie z UPDATE_INTERVAL w main.py)
    const focusDataInterval = setInterval(fetchFocusData, 200);
    
    // Reset flagi przy starcie
    stateRef.current.lowFocusStartTime = null;
    stateRef.current.lowFocusCallbackTriggered = false;
    stateRef.current.focusHistory = [];
    
    // Pobierz dane od razu
    fetchFocusData();

    // --- RYSOWANIE WYKRESU FOCUS SCORE ---
    const chartCanvas = chartCanvasRef.current;
    let chartCtx = null;
    let chartWidth = 0;
    let chartHeight = 0;

    const resizeChart = () => {
      if (!chartCanvas) return;
      chartWidth = Math.min(400, window.innerWidth * 0.4);
      chartHeight = 120;
      chartCanvas.width = chartWidth;
      chartCanvas.height = chartHeight;
      chartCtx = chartCanvas.getContext('2d');
    };

    const drawChart = () => {
      if (!chartCtx || !chartCanvas) return;
      
      const history = stateRef.current.focusHistory;
      if (history.length < 2) return;

      // Wyczyść canvas
      chartCtx.clearRect(0, 0, chartWidth, chartHeight);

      // Tło wykresu
      chartCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      chartCtx.fillRect(0, 0, chartWidth, chartHeight);

      // Linia środkowa (zero)
      chartCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      chartCtx.lineWidth = 1;
      chartCtx.beginPath();
      chartCtx.moveTo(0, chartHeight / 2);
      chartCtx.lineTo(chartWidth, chartHeight / 2);
      chartCtx.stroke();

      // Rysuj linię wykresu
      const padding = 10;
      const graphWidth = chartWidth - padding * 2;
      const graphHeight = chartHeight - padding * 2;
      const centerY = chartHeight / 2;

      chartCtx.beginPath();
      let firstPoint = true;

      history.forEach((point, index) => {
        const x = padding + (index / (history.length - 1)) * graphWidth;
        // Mapuj score z -1..1 na wysokość wykresu
        const y = centerY - (point.score * (graphHeight / 2));

        if (firstPoint) {
          chartCtx.moveTo(x, y);
          firstPoint = false;
        } else {
          chartCtx.lineTo(x, y);
        }
      });

      // Określ kolor na podstawie ostatniego punktu
      const lastScore = history[history.length - 1].score;
      let lineColor;
      if (lastScore > 0.3) {
        lineColor = '#4CAF50'; // Zielony - wysokie skupienie
      } else if (lastScore > -0.3) {
        lineColor = '#FFC107'; // Żółty - średnie skupienie
      } else {
        lineColor = '#F44336'; // Czerwony - niskie skupienie
      }

      chartCtx.strokeStyle = lineColor;
      chartCtx.lineWidth = 2;
      chartCtx.stroke();

      // Rysuj wypełnienie pod wykresem
      chartCtx.lineTo(padding + graphWidth, centerY);
      chartCtx.lineTo(padding, centerY);
      chartCtx.closePath();
      chartCtx.fillStyle = lineColor + '40'; // 40 = 25% opacity
      chartCtx.fill();

      // Rysuj punkty na wykresie (co kilka punktów dla wydajności)
      chartCtx.fillStyle = lineColor;
      for (let i = 0; i < history.length; i += Math.max(1, Math.floor(history.length / 20))) {
        const point = history[i];
        const x = padding + (i / (history.length - 1)) * graphWidth;
        const y = centerY - (point.score * (graphHeight / 2));
        chartCtx.beginPath();
        chartCtx.arc(x, y, 2, 0, Math.PI * 2);
        chartCtx.fill();
      }
    };

    resizeChart();
    window.addEventListener('resize', resizeChart);

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', resizeChart);
      clearInterval(focusDataInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [API_URL]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%)',
      overflow: 'hidden',
      zIndex: 1000
    }}>
      {onStop && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          width: 'auto',
          minWidth: '300px'
        }}>
          <button
            onClick={onStop}
            style={{
              padding: '20px 40px',
              background: '#4A90E2',
              color: '#FFFFE3',
              border: '4px solid #1E3A5F',
              borderRadius: '16px',
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: "'Manrope', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              whiteSpace: 'nowrap',
              minWidth: '280px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#357ABD';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(74, 144, 226, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#4A90E2';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
            }}
          >
            <span>🏠</span>
            <span>Zakończ sesję</span>
          </button>
          
          {showTimer && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '18px 36px',
              borderRadius: '16px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: '#2d3e2d',
              width: 'fit-content',
              minWidth: '150px',
              textAlign: 'center'
            }}>
              {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      )}
      <canvas 
        ref={canvasRef}
        style={{ display: 'block' }}
      />
      
      {/* Wykres focus score w czasie rzeczywistym */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '12px',
        padding: '12px',
        zIndex: 1002,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          color: '#FFFFE3',
          fontSize: '12px',
          fontFamily: "'Manrope', sans-serif",
          marginBottom: '8px',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Focus Score
        </div>
        <canvas 
          ref={chartCanvasRef}
          style={{ display: 'block', borderRadius: '8px' }}
        />
        <div style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '10px',
          fontFamily: "'Manrope', sans-serif",
          marginTop: '6px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <span style={{ color: '#F44336' }}>Niski</span>
          <span style={{ color: '#FFC107' }}>Średni</span>
          <span style={{ color: '#4CAF50' }}>Wysoki</span>
        </div>
      </div>
    </div>
  );
}

export default GrowingTree;

