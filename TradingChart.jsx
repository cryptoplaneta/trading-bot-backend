import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import './TradingChart.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const TradingChart = ({ timeframe, analysis }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tworzenie wykresu
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#363c4e' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Seria świecowa
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Responsywność
    const handleResize = () => {
      chart.applyOptions({ 
        width: chartContainerRef.current.clientWidth 
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Pobieranie danych świeczek
  useEffect(() => {
    const fetchCandles = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/candles/${timeframe}?limit=200`);
        const data = await response.json();
        
        if (data.candles) {
          candlestickSeriesRef.current.setData(data.candles);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Błąd pobierania świeczek:', error);
        setLoading(false);
      }
    };

    if (timeframe) {
      fetchCandles();
    }
  }, [timeframe]);

  // Rysowanie poziomów Fibonacciego i punktów falowych
  useEffect(() => {
    if (!analysis || !analysis.fale || !chartRef.current) return;

    const chart = chartRef.current;
    const fale = analysis.fale;

    // Usuwamy stare markery i linie
    chart.applyOptions({ markers: [] });

    // Rysujemy punkty falowe
    const markers = [];
    
    // Punkt 1
    markers.push({
      time: Math.floor(new Date(fale.punkt_1.czas).getTime() / 1000),
      position: fale.trend === 'UP' ? 'belowBar' : 'aboveBar',
      color: '#2196F3',
      shape: 'circle',
      text: '1',
    });

    // Punkt 2
    markers.push({
      time: Math.floor(new Date(fale.punkt_2.czas).getTime() / 1000),
      position: fale.trend === 'UP' ? 'aboveBar' : 'belowBar',
      color: '#FF9800',
      shape: 'circle',
      text: '2',
    });

    // Punkt 3
    markers.push({
      time: Math.floor(new Date(fale.punkt_3.czas).getTime() / 1000),
      position: fale.trend === 'UP' ? 'belowBar' : 'aboveBar',
      color: '#4CAF50',
      shape: 'circle',
      text: '3',
    });

    candlestickSeriesRef.current.setMarkers(markers);

    // Rysujemy poziomy Fibonacciego jako linie
    // (lightweight-charts nie ma wbudowanej funkcji linii poziomych, więc używamy Price Lines)
    
    if (fale.poziomy_fibo && fale.poziomy_fibo.fala_2) {
      // Cel Fala 3
      const cel = fale.poziomy_fibo.fala_3['1.414'];
      candlestickSeriesRef.current.createPriceLine({
        price: cel,
        color: '#00FF00',
        lineWidth: 2,
        lineStyle: 2, // dashed
        axisLabelVisible: true,
        title: '🎯 Cel 1.414',
      });

      // Poziomy Fali 2
      Object.entries(fale.poziomy_fibo.fala_2).forEach(([key, value]) => {
        candlestickSeriesRef.current.createPriceLine({
          price: value,
          color: '#FFA500',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: key,
        });
      });
    }

  }, [analysis]);

  return (
    <div className="trading-chart-container">
      {loading && (
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Ładowanie wykresu {timeframe}...</p>
        </div>
      )}
      
      <div ref={chartContainerRef} className="chart" />
      
      {analysis && analysis.fale && (
        <div className="chart-info">
          <div className="info-item">
            <span className="label">Trend:</span>
            <span className={`value ${analysis.fale.trend.toLowerCase()}`}>
              {analysis.fale.trend === 'UP' ? '📈 Wzrostowy' : '📉 Spadkowy'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Punkt 1:</span>
            <span className="value">${analysis.fale.punkt_1.cena.toFixed(2)}</span>
          </div>
          <div className="info-item">
            <span className="label">Punkt 2:</span>
            <span className="value">${analysis.fale.punkt_2.cena.toFixed(2)}</span>
          </div>
          <div className="info-item">
            <span className="label">Punkt 3:</span>
            <span className="value">${analysis.fale.punkt_3.cena.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingChart;
