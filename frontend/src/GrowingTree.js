import React, { useEffect, useRef, useState } from 'react';

function GrowingTree({ inputP = 0, onStop = null, showTimer = true, sessionDuration = 0 }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [treeMaturityDisplay, setTreeMaturityDisplay] = useState(0);
  const [accumulatedFocusScore, setAccumulatedFocusScore] = useState(0);
  const stateRef = useRef({
    inputP: 0,
    accumulatedFocusScore: 0, // Akumulowany focus score
    treeMaturity: 0,
    focusLevel: 0,
    currentTreeSize: 0,
    currentBloomLevel: 0,
    time: 0,
    fallingLeaves: [],
    branchBloomState: new Map(),
    lastInputP: 0 // Do śledzenia zmian
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    // --- KONFIGURACJA PRĘDKOŚCI ---
    const CONSTANT_GROWTH = 0.002; // Stała wartość wzrostu przy każdym dodatnim inputP
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

      // Aktualizuj inputP i akumuluj focus score
      if (stateRef.current.lastInputP !== inputP) {
        // Dodaj nową wartość do akumulowanego focus score
        if (inputP > 0) {
          stateRef.current.accumulatedFocusScore += inputP;
          setAccumulatedFocusScore(stateRef.current.accumulatedFocusScore);
          
          // --- GŁÓWNA LOGIKA WZROSTU OPARTA NA INPUT P ---
          // Tylko dodatnie wartości zwiększają drzewo o STAŁĄ wartość
          stateRef.current.treeMaturity += CONSTANT_GROWTH;
        }
        // Ujemne wartości nie zmniejszają akumulowanego score ani drzewa
        
        console.log('[GrowingTree] inputP:', inputP, 'accumulated:', stateRef.current.accumulatedFocusScore.toFixed(3), 'treeMaturity:', stateRef.current.treeMaturity.toFixed(3));
        stateRef.current.lastInputP = inputP;
      }
      stateRef.current.inputP = inputP;
      
      if (stateRef.current.treeMaturity > 1.0) stateRef.current.treeMaturity = 1.0;
      if (stateRef.current.treeMaturity < 0.0) stateRef.current.treeMaturity = 0.0;

      // Aktualizuj wyświetlaną wartość dojrzałości (co kilka klatek dla wydajności)
      if (Math.floor(stateRef.current.time * 10) % 5 === 0) {
        setTreeMaturityDisplay(stateRef.current.treeMaturity);
      }

      // Mapowanie na wizualia
      stateRef.current.focusLevel = stateRef.current.treeMaturity;
      let targetSize = MIN_TREE_SIZE + (stateRef.current.treeMaturity * (MAX_TREE_SIZE - MIN_TREE_SIZE));
      // Zwiększono szybkość animacji rozmiaru z 0.1 na 0.5 dla szybkiej reakcji
      stateRef.current.currentTreeSize += (targetSize - stateRef.current.currentTreeSize) * 0.5;

      let targetBloom = 0;
      if (stateRef.current.treeMaturity > 0.8) {
        targetBloom = (stateRef.current.treeMaturity - 0.8) * 5;
      }
      // Zwiększono szybkość animacji kwiatów z 0.05 na 0.3
      stateRef.current.currentBloomLevel += (targetBloom - stateRef.current.currentBloomLevel) * 0.3;

      if (stateRef.current.currentTreeSize > 10) {
        drawTree(width / 2, height, stateRef.current.currentTreeSize, 0, 22, 'S');
      }

      // Spadanie liści - tylko przy bardzo niskim skupieniu (ale nie zmniejszamy drzewa)
      // Usunięto logikę spadania liści przy ujemnych wartościach, bo drzewo nie zmniejsza się

      updateLeaves();

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Usunięto [inputP] - animacja nie restartuje się przy każdej zmianie

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
      
      {/* Wyświetlanie aktualnej wartości outputu na środku ekranu */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '20px 30px',
        borderRadius: '12px',
        color: '#FFFFE3',
        fontFamily: "'Manrope', sans-serif",
        fontSize: '32px',
        fontWeight: 600,
        textAlign: 'center',
        zIndex: 1002,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        minWidth: '200px'
      }}>
        <div style={{
          fontSize: '14px',
          marginBottom: '12px',
          opacity: 0.8,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Focus Score
        </div>
        <div style={{
          color: inputP > 0 ? '#4CAF50' : inputP < 0 ? '#F44336' : '#9E9E9E',
          fontSize: '48px',
          fontWeight: 700,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          marginBottom: '12px'
        }}>
          {accumulatedFocusScore.toFixed(3)}
        </div>
        <div style={{
          fontSize: '12px',
          marginBottom: '12px',
          opacity: 0.6
        }}>
          Aktualne: {inputP.toFixed(3)} {inputP > 0 ? '↑' : inputP < 0 ? '↓' : '—'}
        </div>
        <div style={{
          fontSize: '14px',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          opacity: 0.8
        }}>
          Stan Drzewa
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#87CEEB',
          marginTop: '4px'
        }}>
          {(treeMaturityDisplay * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export default GrowingTree;

