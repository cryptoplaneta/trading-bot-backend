import React from 'react';
import './Components.css';

// Komponent nagłówka z ceną
export const PriceHeader = ({ priceData }) => {
  if (!priceData) return null;

  const changeColor = priceData.change_24h >= 0 ? '#26a69a' : '#ef5350';

  return (
    <header className="price-header">
      <div className="header-content">
        <div className="logo">
          <h1>🚀 BOT TRADINGOWY</h1>
          <span className="subtitle">Geometria Rynku</span>
        </div>
        
        <div className="price-info">
          <div className="price-main">
            <span className="symbol">BTC/USDT</span>
            <span className="price">${priceData.price?.toFixed(2) || 0}</span>
            <span className="change" style={{ color: changeColor }}>
              {priceData.change_24h >= 0 ? '+' : ''}
              {priceData.change_24h?.toFixed(2) || 0}%
            </span>
          </div>
          <div className="price-details">
            <span>H: ${priceData.high_24h?.toFixed(2) || 0}</span>
            <span>L: ${priceData.low_24h?.toFixed(2) || 0}</span>
            <span>Vol: {(priceData.volume_24h / 1000000)?.toFixed(2) || 0}M</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Komponent karty sygnału
export const SignalCard = ({ signal }) => {
  if (!signal || !signal.akcja) return null;

  const isBuy = signal.akcja === 'BUY';

  return (
    <div className={`signal-card ${isBuy ? 'buy' : 'sell'}`}>
      <div className="signal-header">
        <span className="signal-icon">{isBuy ? '🟢' : '🔴'}</span>
        <div>
          <h3>{signal.akcja}</h3>
          <span className="timeframe-badge">{signal.timeframe}</span>
        </div>
      </div>
      
      <div className="signal-body">
        <p className="signal-reason">{signal.powod}</p>
        
        <div className="signal-details">
          <div className="detail-item">
            <span className="label">🎯 Cel:</span>
            <span className="value">${signal.cel?.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="label">🛑 Stop:</span>
            <span className="value">${signal.stop?.toFixed(2)}</span>
          </div>
          {signal.risk_reward && (
            <div className="detail-item">
              <span className="label">📊 R/R:</span>
              <span className="value success">1:{signal.risk_reward.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Komponent analizy timeframe
export const TimeframeAnalysis = ({ data, isActive }) => {
  if (!data) return null;

  const hasFale = data.fale !== null;
  const hasSignal = data.sygnal && data.sygnal.akcja;

  return (
    <div className={`timeframe-card ${isActive ? 'active' : ''}`}>
      <div className="timeframe-header">
        <h3>{data.timeframe}</h3>
        {hasSignal && (
          <span className={`status-badge ${data.sygnal.akcja.toLowerCase()}`}>
            {data.sygnal.akcja}
          </span>
        )}
      </div>
      
      <div className="timeframe-body">
        {hasFale ? (
          <>
            <div className="trend-indicator">
              <span className={`trend ${data.fale.trend.toLowerCase()}`}>
                {data.fale.trend === 'UP' ? '📈 Trend wzrostowy' : '📉 Trend spadkowy'}
              </span>
            </div>
            
            <div className="fala-points">
              <div className="point">
                <span className="point-label">P1:</span>
                <span className="point-value">${data.fale.punkt_1.cena.toFixed(2)}</span>
              </div>
              <div className="point">
                <span className="point-label">P2:</span>
                <span className="point-value">${data.fale.punkt_2.cena.toFixed(2)}</span>
              </div>
              <div className="point">
                <span className="point-label">P3:</span>
                <span className="point-value">${data.fale.punkt_3.cena.toFixed(2)}</span>
              </div>
            </div>

            <div className="fibo-levels">
              <small>Poziomy Fibo:</small>
              {data.fale.poziomy_fibo && data.fale.poziomy_fibo.fala_2 && (
                <div className="fibo-list">
                  {Object.entries(data.fale.poziomy_fibo.fala_2).map(([key, value]) => (
                    <span key={key} className="fibo-item">
                      {key}: ${value.toFixed(2)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="no-structure">❌ Brak struktury falowej</p>
        )}
      </div>
    </div>
  );
};

export default { PriceHeader, SignalCard, TimeframeAnalysis };
