import React, { useState } from 'react';
import './App.css';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // {year, month, day}
  const [isActive, setIsActive] = useState(false); // czy aktywność jest w toku
  const [coins, setCoins] = useState(100); // liczba monet
  const [ownedItems, setOwnedItems] = useState([]); // posiadane przedmioty
  const [activeMusic, setActiveMusic] = useState(null); // aktywna muzyka
  const [activeBoosts, setActiveBoosts] = useState([]); // aktywne boostery
  const [activeAtmosphere, setActiveAtmosphere] = useState([]); // aktywna atmosfera
  const [activeShopTab, setActiveShopTab] = useState('music'); // aktywna zakładka w sklepie

  const startActivity = () => {
    setIsActive(true);
  };

  const pauseActivity = () => {
    setIsActive(false);
  };

  const stopActivity = () => {
    setIsActive(false);
  };

  const shopItems = [
    // Muzyka do skupienia
    { id: 'music1', category: 'music', name: 'Muzyka klasyczna', price: 80, icon: '🎵', description: 'Spokojna muzyka klasyczna dla lepszego skupienia', effect: 'focus+10%' },
    { id: 'music2', category: 'music', name: 'Dźwięki natury', price: 100, icon: '🌿', description: 'Odgłosy lasu i natury dla głębokiego flow', effect: 'flow+15%' },
    { id: 'music3', category: 'music', name: 'Binaural beats', price: 150, icon: '🧠', description: 'Fale mózgowe dla maksymalnej koncentracji', effect: 'focus+20%' },
    { id: 'music4', category: 'music', name: 'Ambient space', price: 120, icon: '🌌', description: 'Kosmiczne dźwięki dla kreatywnego flow', effect: 'creativity+15%' },
    
    // Boostery do skupienia
    { id: 'boost1', category: 'boost', name: 'Booster skupienia', price: 80, icon: '⚡', description: '+20% do tempa wzrostu przez 30 min', effect: 'growth+20%' },
    { id: 'boost2', category: 'boost', name: 'Eliksir flow', price: 150, icon: '🧪', description: 'Podwaja tempo wzrostu przez 1 godzinę', effect: 'growth+100%' },
    { id: 'boost3', category: 'boost', name: 'Kapsuła czasu', price: 200, icon: '⏰', description: 'Zwiększa czas efektywnej nauki o 25%', effect: 'time+25%' },
    
    // Atmosfera
    { id: 'atmo1', category: 'atmosphere', name: 'Światło świec', price: 60, icon: '🕯️', description: 'Ciepłe światło świec dla relaksu', effect: 'relax+10%' },
    { id: 'atmo2', category: 'atmosphere', name: 'Deszcz za oknem', price: 70, icon: '🌧️', description: 'Relaksujący dźwięk deszczu', effect: 'focus+12%' },
    { id: 'atmo3', category: 'atmosphere', name: 'Kominek', price: 90, icon: '🔥', description: 'Przytulna atmosfera kominka', effect: 'comfort+15%' },
    
    // Powiadomienia i przypomnienia
    { id: 'notif1', category: 'notification', name: 'Mądre przypomnienia', price: 50, icon: '🔔', description: 'Inteligentne przypomnienia o przerwach', effect: 'reminders' },
    { id: 'notif2', category: 'notification', name: 'Motywacyjne cytaty', price: 40, icon: '💬', description: 'Inspirujące cytaty podczas nauki', effect: 'motivation' }
  ];

  const buyItem = (item) => {
    if (coins >= item.price && !ownedItems.find(owned => owned.id === item.id)) {
      setCoins(coins - item.price);
      setOwnedItems([...ownedItems, item]);
      
      // Aktywuj przedmiot automatycznie po zakupie
      if (item.category === 'music') {
        setActiveMusic(item.id);
      } else if (item.category === 'boost') {
        setActiveBoosts([...activeBoosts, item.id]);
      } else if (item.category === 'atmosphere' || item.category === 'notification') {
        setActiveAtmosphere([...activeAtmosphere, item.id]);
      }
    }
  };

  const activateItem = (item) => {
    if (item.category === 'music') {
      setActiveMusic(item.id);
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
    } else if (category === 'boost') {
      setActiveBoosts(activeBoosts.filter(id => id !== itemId));
    } else if (category === 'atmosphere' || category === 'notification') {
      setActiveAtmosphere(activeAtmosphere.filter(id => id !== itemId));
    }
  };

  const getItemsByCategory = (category) => {
    return shopItems.filter(item => item.category === category);
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
      {/* Monety w prawym górnym rogu */}
      <div className="coins-display">
        <span className="coins-icon">🪙</span>
        <span className="coins-amount">{coins}</span>
      </div>

      <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {/* Wyświetlacz aktywnych efektów */}
      {(activeMusic || activeBoosts.length > 0 || activeAtmosphere.length > 0) && (
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

            {activeAtmosphere.map(atmoId => {
              const atmo = shopItems.find(item => item.id === atmoId);
              if (!atmo) return null;
              return (
                <div key={atmoId} className="effect-item">
                  <span className="effect-icon">{atmo.icon}</span>
                  <div className="effect-info">
                    <div className="effect-name">{atmo.name}</div>
                  </div>
                  <button 
                    className="effect-remove-btn"
                    onClick={() => deactivateItem(atmoId, atmo.category)}
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
          }}
        >
          <span className="icon-calendar"></span>
          <span>Kalendarz</span>
        </button>
        <button 
          className={`nav-item ${profileOpen ? 'active' : ''}`}
          onClick={() => {
            setProfileOpen(!profileOpen);
            setMenuOpen(false);
            setCalendarOpen(false);
          }}
        >
          <span className="icon-profile"></span>
          <span>Profil</span>
        </button>
      </div>

      {/* Sklep w menu bocznym */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-content">
          <h2>Sklep</h2>
          <div className="shop-coins-display">
            <span className="shop-coins-icon">🪙</span>
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
          </div>

          {activeShopTab === 'music' && (
            <div className="shop-tab-content">
              <h3 className="shop-category-title">Muzyka do skupienia</h3>
              <div className="shop-items-grid">
                {getItemsByCategory('music').map(item => {
                  const isOwned = ownedItems.find(owned => owned.id === item.id);
                  const isActive = activeMusic === item.id;
                  return (
                    <div key={item.id} className={`shop-item-card ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}`}>
                      <div className="shop-item-icon">{item.icon}</div>
                      <div className="shop-item-name">{item.name}</div>
                      <div className="shop-item-description">{item.description}</div>
                      <div className="shop-item-effect">{item.effect}</div>
                      <div className="shop-item-price">
                        <span className="shop-price-icon">🪙</span>
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
                          {coins >= item.price ? 'Kup' : 'Za mało monet'}
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
                    <div key={item.id} className={`shop-item-card ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}`}>
                      <div className="shop-item-icon">{item.icon}</div>
                      <div className="shop-item-name">{item.name}</div>
                      <div className="shop-item-description">{item.description}</div>
                      <div className="shop-item-effect">{item.effect}</div>
                      <div className="shop-item-price">
                        <span className="shop-price-icon">🪙</span>
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
                          {coins >= item.price ? 'Kup' : 'Za mało monet'}
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
                    <div key={item.id} className={`shop-item-card ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}`}>
                      <div className="shop-item-icon">{item.icon}</div>
                      <div className="shop-item-name">{item.name}</div>
                      <div className="shop-item-description">{item.description}</div>
                      <div className="shop-item-effect">{item.effect}</div>
                      <div className="shop-item-price">
                        <span className="shop-price-icon">🪙</span>
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
                          {coins >= item.price ? 'Kup' : 'Za mało monet'}
            </button>
                      )}
                    </div>
                  );
                })}
          </div>
            </div>
          )}
        </div>
      </div>

      {(menuOpen || calendarOpen || profileOpen) && (
        <div 
          className="overlay" 
          onClick={() => {
            setMenuOpen(false);
            setCalendarOpen(false);
            setProfileOpen(false);
          }} 
        />
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
                <button className="control-btn-icon pause" onClick={pauseActivity} title="Zatrzymaj">
                  <div className="icon-pause-animated"></div>
                </button>
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
                <div className="profile-stat-card">
                  <span className="stat-icon">📊</span>
                  <span className="stat-number">127</span>
                  <span className="stat-label">Ukończone sesje</span>
                </div>
                <div className="profile-stat-card">
                  <span className="stat-icon">⏱️</span>
                  <span className="stat-number">45h</span>
                  <span className="stat-label">Czas nauki</span>
                </div>
                <div className="profile-stat-card">
                  <span className="stat-icon">🔥</span>
                  <span className="stat-number">12</span>
                  <span className="stat-label">Dni z rzędu</span>
                </div>
                <div className="profile-stat-card">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-number">8,450</span>
                  <span className="stat-label">Punkty</span>
                </div>
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
                <span>Ciemny motyw</span>
                <label className="toggle-switch">
                  <input type="checkbox" />
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

      {selectedDate && (
        <div className="day-details-overlay" onClick={() => setSelectedDate(null)}>
          <div className="day-details" onClick={(e) => e.stopPropagation()}>
            <button className="day-details-close" onClick={() => setSelectedDate(null)}>×</button>
            <div className="day-details-header">
              <h2>{selectedDate.day} {monthNames[selectedDate.month]} {selectedDate.year}</h2>
            </div>
            
            <div className="stats-section">
              <div className="stat-item">
                <span className="stat-label">Najwyższy osiągnięty stan skupienia</span>
                <span className="stat-value">92%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Najdłuższy czas skupienia</span>
                <span className="stat-value">45 min</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Czas w stanie flow</span>
                <span className="stat-value">2h 15min</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Odporność na rozproszenie</span>
                <span className="stat-value">85%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Zebrane punkty</span>
                <span className="stat-value">1,250</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

