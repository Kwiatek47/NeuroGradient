import React, { useEffect, useRef, useState } from 'react';

function GrowingTree({ inputP = 0, onStop = null, showTimer = true, sessionDuration = 0 }) {
  const canvasRef = useRef(null);
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
    lastInputP: 0 // Do śledzenia zmian
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

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // --- POBIERANIE DANYCH Z API EEG ---
    const fetchFocusData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/focus-data`);
        if (response.ok) {
          const data = await response.json();
          // Score z API jest w zakresie -1.0 do 1.0
          stateRef.current.inputP = data.score || 0;
          setEegConnected(data.isActive || false);
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
    
    // Pobierz dane od razu
    fetchFocusData();

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resize);
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
          gap: '12px',
          width: 'auto'
        }}>
          <button
            onClick={onStop}
            style={{
              padding: '12px 24px',
              background: '#4A90E2',
              color: '#FFFFE3',
              border: '3px solid #1E3A5F',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: "'Manrope', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
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
              padding: '10px 18px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '18px',
              fontWeight: 600,
              color: '#2d3e2d',
              width: 'fit-content',
              minWidth: '80px',
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
      
      {/* Wyświetlanie Input P (powiększone) */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontFamily: "'Segoe UI', sans-serif",
        color: '#444',
        background: 'rgba(255, 255, 255, 0.7)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '320px',
        zIndex: 1002
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Growing Mind Tree</h2>
        <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>Tryb Focus (EEG)</strong></p>
        <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.8 }}>
          Status EEG: <span style={{ color: eegConnected ? '#4CAF50' : '#F44336', fontWeight: 600 }}>
            {eegConnected ? '✓ Połączono' : '✗ Brak połączenia'}
          </span>
        </p>
        <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)' }} />
        <p style={{ margin: '10px 0', fontSize: '18px' }}>
          Focus Score: <span style={{ fontWeight: 600, color: inputPDisplay > 0 ? 'green' : inputPDisplay < 0 ? 'brown' : 'gray' }}>{inputPDisplay.toFixed(3)}</span>
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.7 }}>
          (Zakres: -1.0 do 1.0)
        </p>
      </div>
    </div>
  );
}

export default GrowingTree;

