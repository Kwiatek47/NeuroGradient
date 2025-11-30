import React, { useState, useEffect, useRef } from 'react';

function IntroScreen({ onComplete, introMusic, breathingEnabled, breathingDuration = 60, shopItems = [], isLowFocusReturn = false }) {
  const [phase, setPhase] = useState('inhale'); // inhale, hold1, exhale, hold2
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(breathingDuration);
  const [cycleCount, setCycleCount] = useState(0);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Czas trwania każdej fazy (w sekundach) - oddechanie kwadratowe
  const PHASE_DURATION = 4; // 4 sekundy na każdą fazę
  
  useEffect(() => {
    // Odtwarzaj muzykę intro jeśli jest skonfigurowana
    const audio = audioRef.current;
    if (introMusic && audio) {
      const musicItem = shopItems?.find(item => item.id === introMusic);
      if (musicItem && musicItem.audioPath) {
        audio.src = musicItem.audioPath;
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(error => {
          console.log('Błąd odtwarzania muzyki intro:', error);
        });
      }
    }
    
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [introMusic, shopItems]);
  
  useEffect(() => {
    if (!breathingEnabled) {
      // Jeśli ćwiczenia oddechowe są wyłączone, tylko odliczaj czas
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
    
    // Ćwiczenia oddechowe - oddechanie kwadratowe
    const phases = ['inhale', 'hold1', 'exhale', 'hold2'];
    let currentPhaseIndex = 0;
    let phaseStartTime = Date.now();
    
    const updateBreathing = () => {
      const now = Date.now();
      const elapsed = (now - phaseStartTime) / 1000;
      const progressPercent = (elapsed / PHASE_DURATION) * 100;
      
      setProgress(Math.min(progressPercent, 100));
      
      if (elapsed >= PHASE_DURATION) {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        setPhase(phases[currentPhaseIndex]);
        phaseStartTime = now;
        setProgress(0);
        
        // Zliczaj cykle (pełny cykl = 4 fazy)
        if (currentPhaseIndex === 0) {
          setCycleCount(prev => prev + 1);
        }
      }
    };
    
    intervalRef.current = setInterval(updateBreathing, 50);
    
    // Timer całkowity
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(timer);
    };
  }, [breathingEnabled, breathingDuration, onComplete]);
  
  const getPhaseText = () => {
    switch(phase) {
      case 'inhale': return 'Wdech';
      case 'hold1': return 'Wstrzymaj';
      case 'exhale': return 'Wydech';
      case 'hold2': return 'Wstrzymaj';
      default: return '';
    }
  };
  
  const getPhaseInstruction = () => {
    switch(phase) {
      case 'inhale': return 'Powoli wdychaj powietrze przez nos';
      case 'hold1': return 'Wstrzymaj oddech';
      case 'exhale': return 'Powoli wydychaj powietrze przez usta';
      case 'hold2': return 'Wstrzymaj oddech';
      default: return '';
    }
  };
  
  // Oblicz rozmiar koła na podstawie fazy
  const getCircleSize = () => {
    if (!breathingEnabled) return 100;
    
    const baseSize = 100;
    const maxSize = 200;
    const minSize = 80;
    
    switch(phase) {
      case 'inhale':
        return baseSize + (progress / 100) * (maxSize - baseSize);
      case 'hold1':
        return maxSize;
      case 'exhale':
        return maxSize - (progress / 100) * (maxSize - minSize);
      case 'hold2':
        return minSize;
      default:
        return baseSize;
    }
  };
  
  // Oblicz kolor na podstawie fazy
  const getCircleColor = () => {
    if (!breathingEnabled) return '#87AE73';
    
    switch(phase) {
      case 'inhale':
        return `rgba(135, 174, 115, ${0.6 + (progress / 100) * 0.4})`;
      case 'hold1':
        return 'rgba(135, 174, 115, 1.0)';
      case 'exhale':
        return `rgba(135, 174, 115, ${1.0 - (progress / 100) * 0.4})`;
      case 'hold2':
        return 'rgba(135, 174, 115, 0.6)';
      default:
        return '#87AE73';
    }
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 50%, #80DEEA 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      fontFamily: "'Manrope', sans-serif"
    }}>
      <audio ref={audioRef} />
      
      <div style={{
        textAlign: 'center',
        color: '#2d3e2d',
        maxWidth: '500px',
        padding: '20px'
      }}>
        <h1 style={{
          fontSize: '32px',
          marginBottom: '10px',
          fontWeight: 700,
          color: '#87AE73'
        }}>
          {isLowFocusReturn ? 'Zrób sobie chwilę przerwy' : 'Przygotuj się do sesji'}
        </h1>
        
        {breathingEnabled && (
          <>
            <div style={{
              margin: '40px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                width: `${getCircleSize()}px`,
                height: `${getCircleSize()}px`,
                borderRadius: '50%',
                background: getCircleColor(),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.1s ease-out',
                boxShadow: `0 0 ${getCircleSize() * 0.3}px ${getCircleColor()}`,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  animation: phase === 'inhale' || phase === 'exhale' ? 'pulse 2s infinite' : 'none'
                }} />
                <div style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#FFFFE3',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {getPhaseText()}
                </div>
              </div>
              
              <div style={{
                fontSize: '18px',
                color: '#2d3e2d',
                fontWeight: 500,
                marginTop: '20px'
              }}>
                {getPhaseInstruction()}
              </div>
              
              <div style={{
                width: '300px',
                height: '6px',
                background: 'rgba(135, 174, 115, 0.2)',
                borderRadius: '10px',
                overflow: 'hidden',
                marginTop: '20px'
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: '#87AE73',
                  borderRadius: '10px',
                  transition: 'width 0.1s ease-out'
                }} />
              </div>
              
              {cycleCount > 0 && (
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(45, 62, 45, 0.7)',
                  marginTop: '10px'
                }}>
                  Cykl {cycleCount}
                </div>
              )}
            </div>
          </>
        )}
        
        <div style={{
          marginTop: '40px',
          fontSize: '24px',
          fontWeight: 600,
          color: '#87AE73'
        }}>
          {timeLeft}s
        </div>
        
        <div style={{
          marginTop: '10px',
          fontSize: '14px',
          color: 'rgba(45, 62, 45, 0.7)'
        }}>
          {breathingEnabled ? 'Ćwicz oddech i przygotuj się' : 'Przygotuj się do rozpoczęcia'}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

export default IntroScreen;

