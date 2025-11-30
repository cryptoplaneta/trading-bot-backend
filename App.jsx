import React, { useState, useEffect } from 'react';
import './App.css';
import TradingChart from './components/TradingChart';
import { PriceHeader, SignalCard, TimeframeAnalysis } from './components/Components';

// API URLs z environment variables (dla deployment)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

function App() {
  const [priceData, setPriceData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState(null);

  // Połączenie WebSocket dla real-time updates
  useEffect(() => {
    const websocket = new WebSocket(WS_URL);
    
    websocket.onopen = () => {
      console.log('🟢 WebSocket połączony');
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        setPriceData({ price: data.price, timestamp: data.timestamp });
        setAnalysis(data.analysis);
        setLoading(false);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    websocket.onclose = () => {
      console.log('🔴 WebSocket rozłączony');
      // Reconnect po 5 sekundach
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, []);

  // Backup: Pobieranie danych HTTP jeśli WebSocket nie działa
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cena
        const priceRes = await fetch(`${API_URL}/api/price`);
        const priceData = await priceRes.json();
        setPriceData(priceData);
        
        // Analiza wszystkich timeframe'ów
        const analysisRes = await fetch(`${API_URL}/api/analysis/all`);
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData.results);
        
        setLoading(false);
      } catch (error) {
        console.error('Błąd pobierania danych:', error);
      }
    };
    
    // Pierwsze pobranie
    fetchData();
    
    // Odświeżanie co minutę jako backup
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getStrongSignal = () => {
    if (!analysis) return null;
    
    const signals = analysis
      .filter(a => a.sygnal && a.sygnal.akcja)
      .map(a => a.sygnal);
    
    const buyCount = signals.filter(s => s.akcja === 'BUY').length;
    const sellCount = signals.filter(s => s.akcja === 'SELL').length;
    
    if (buyCount >= 2) return { type: 'BUY', count: buyCount };
    if (sellCount >= 2) return { type: 'SELL', count: sellCount };
    
    return null;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2>Ładowanie analizy rynku...</h2>
      </div>
    );
  }

  const strongSignal = getStrongSignal();

  return (
    <div className="App">
      {/* Header z ceną */}
      <PriceHeader priceData={priceData} />
      
      {/* Silny sygnał - alert na górze */}
      {strongSignal && (
        <div className={`strong-signal-banner ${strongSignal.type.toLowerCase()}`}>
          <div className="banner-content">
            <span className="signal-icon">
              {strongSignal.type === 'BUY' ? '🚀' : '⚠️'}
            </span>
            <div className="signal-text">
              <h3>SILNY SYGNAŁ {strongSignal.type}</h3>
              <p>Confluencja na {strongSignal.count} timeframe'ach!</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Główny layout */}
      <div className="main-container">
        {/* Lewa kolumna - Wykres */}
        <div className="chart-section">
          <div className="timeframe-selector">
            {['15m', '1h', '4h', '1D'].map(tf => (
              <button
                key={tf}
                className={`tf-button ${selectedTimeframe === tf ? 'active' : ''}`}
                onClick={() => setSelectedTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <TradingChart 
            timeframe={selectedTimeframe}
            analysis={analysis?.find(a => a.timeframe === selectedTimeframe)}
          />
        </div>
        
        {/* Prawa kolumna - Analiza i sygnały */}
        <div className="analysis-section">
          <h2>📊 Analiza Multi-Timeframe</h2>
          
          {analysis && analysis.map(item => (
            <TimeframeAnalysis 
              key={item.timeframe}
              data={item}
              isActive={item.timeframe === selectedTimeframe}
            />
          ))}
          
          {/* Aktywne sygnały */}
          <div className="signals-container">
            <h2>🔔 Aktywne Sygnały</h2>
            {analysis && analysis
              .filter(a => a.sygnal && a.sygnal.akcja)
              .map(item => (
                <SignalCard 
                  key={item.timeframe}
                  signal={item.sygnal}
                />
              ))
            }
            
            {analysis && analysis.filter(a => a.sygnal && a.sygnal.akcja).length === 0 && (
              <div className="no-signals">
                <p>❌ Brak aktywnych sygnałów</p>
                <small>Czekam na odpowiednie warunki rynkowe...</small>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="app-footer">
        <p>🤖 Bot Tradingowy - Geometria Rynku | WebSocket: {ws?.readyState === 1 ? '🟢 Połączony' : '🔴 Rozłączony'}</p>
      </footer>
    </div>
  );
}

export default App;
