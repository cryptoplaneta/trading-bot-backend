#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BACKEND API - BOT TRADINGOWY
FastAPI + WebSocket dla real-time updates
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import ccxt
import pandas as pd
import numpy as np
from datetime import datetime
import asyncio
from typing import List, Dict, Optional
import json

app = FastAPI(title="Trading Bot API", version="1.0.0")

# CORS - pozwala na połączenia z React frontendu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # W produkcji zmień na konkretny URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TradingAnalyzer:
    def __init__(self):
        self.exchange = ccxt.bybit({'enableRateLimit': True})
        self.symbol = 'BTC/USDT'
        self.timeframes = ['15m', '1h', '4h', '1D']
        self.fibo_fala2 = [0.5, 0.618, 0.667, 1.0, 1.155, 1.272]
        self.fibo_fala4 = [0.382, 0.414, 0.5]
        self.fibo_fala3 = 1.414
        
    def pobierz_dane(self, timeframe: str, limit: int = 500) -> Optional[pd.DataFrame]:
        """Pobiera dane OHLCV"""
        try:
            ohlcv = self.exchange.fetch_ohlcv(self.symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        except Exception as e:
            print(f"Błąd pobierania danych: {e}")
            return None
    
    def znajdz_swing_points(self, df: pd.DataFrame, lookback: int = 5) -> pd.DataFrame:
        """Znajduje swing high i swing low"""
        df = df.copy()
        
        df['swing_high'] = False
        for i in range(lookback, len(df) - lookback):
            if df['high'].iloc[i] == df['high'].iloc[i-lookback:i+lookback+1].max():
                df.loc[df.index[i], 'swing_high'] = True
        
        df['swing_low'] = False
        for i in range(lookback, len(df) - lookback):
            if df['low'].iloc[i] == df['low'].iloc[i-lookback:i+lookback+1].min():
                df.loc[df.index[i], 'swing_low'] = True
        
        return df
    
    def wykryj_fale(self, df: pd.DataFrame) -> Optional[Dict]:
        """Wykrywa strukturę falową"""
        df = self.znajdz_swing_points(df)
        
        swing_highs = df[df['swing_high'] == True].tail(10)
        swing_lows = df[df['swing_low'] == True].tail(10)
        
        if len(swing_highs) < 3 or len(swing_lows) < 3:
            return None
        
        # Próbujemy wykryć trend wzrostowy
        trend_up = self.analiza_trend_up(swing_highs, swing_lows, df)
        if trend_up:
            return trend_up
        
        # Próbujemy wykryć trend spadkowy
        trend_down = self.analiza_trend_down(swing_highs, swing_lows, df)
        if trend_down:
            return trend_down
        
        return None
    
    def analiza_trend_up(self, highs, lows, df) -> Optional[Dict]:
        """Analiza trendu wzrostowego"""
        try:
            all_points = pd.concat([
                highs[['timestamp', 'high']].rename(columns={'high': 'price'}),
                lows[['timestamp', 'low']].rename(columns={'low': 'price'})
            ]).sort_values('timestamp').tail(10)
            
            if len(all_points) < 5:
                return None
            
            points = all_points.tail(5).reset_index(drop=True)
            
            if points['price'].iloc[0] < points['price'].iloc[-1]:
                fala_1_2 = abs(points['price'].iloc[1] - points['price'].iloc[0])
                
                struktura = {
                    'trend': 'UP',
                    'punkt_1': {
                        'cena': float(points['price'].iloc[0]),
                        'czas': points['timestamp'].iloc[0].isoformat()
                    },
                    'punkt_2': {
                        'cena': float(points['price'].iloc[1]),
                        'czas': points['timestamp'].iloc[1].isoformat()
                    },
                    'punkt_3': {
                        'cena': float(points['price'].iloc[2]),
                        'czas': points['timestamp'].iloc[2].isoformat()
                    },
                    'fala_1_2': float(fala_1_2),
                    'aktualna_cena': float(df['close'].iloc[-1]),
                    'poziomy_fibo': self.oblicz_poziomy_fibo(points, 'UP')
                }
                
                return struktura
        except:
            pass
        
        return None
    
    def analiza_trend_down(self, highs, lows, df) -> Optional[Dict]:
        """Analiza trendu spadkowego"""
        try:
            all_points = pd.concat([
                highs[['timestamp', 'high']].rename(columns={'high': 'price'}),
                lows[['timestamp', 'low']].rename(columns={'low': 'price'})
            ]).sort_values('timestamp').tail(10)
            
            if len(all_points) < 5:
                return None
            
            points = all_points.tail(5).reset_index(drop=True)
            
            if points['price'].iloc[0] > points['price'].iloc[-1]:
                fala_1_2 = abs(points['price'].iloc[1] - points['price'].iloc[0])
                
                struktura = {
                    'trend': 'DOWN',
                    'punkt_1': {
                        'cena': float(points['price'].iloc[0]),
                        'czas': points['timestamp'].iloc[0].isoformat()
                    },
                    'punkt_2': {
                        'cena': float(points['price'].iloc[1]),
                        'czas': points['timestamp'].iloc[1].isoformat()
                    },
                    'punkt_3': {
                        'cena': float(points['price'].iloc[2]),
                        'czas': points['timestamp'].iloc[2].isoformat()
                    },
                    'fala_1_2': float(fala_1_2),
                    'aktualna_cena': float(df['close'].iloc[-1]),
                    'poziomy_fibo': self.oblicz_poziomy_fibo(points, 'DOWN')
                }
                
                return struktura
        except:
            pass
        
        return None
    
    def oblicz_poziomy_fibo(self, points, trend: str) -> Dict:
        """Oblicza poziomy Fibonacciego"""
        poziomy = {}
        
        if trend == 'UP':
            punkt_1 = float(points['price'].iloc[0])
            punkt_2 = float(points['price'].iloc[1])
            roznica = punkt_2 - punkt_1
            
            poziomy['fala_2'] = {
                '0.5': float(punkt_2 - (roznica * 0.5)),
                '0.618': float(punkt_2 - (roznica * 0.618)),
                '0.667': float(punkt_2 - (roznica * 0.667)),
                '1.0': float(punkt_1),
            }
            
            poziomy['fala_3'] = {
                '1.414': float(punkt_1 + (roznica * 1.414))
            }
            
        else:  # DOWN
            punkt_1 = float(points['price'].iloc[0])
            punkt_2 = float(points['price'].iloc[1])
            roznica = punkt_1 - punkt_2
            
            poziomy['fala_2'] = {
                '0.5': float(punkt_2 + (roznica * 0.5)),
                '0.618': float(punkt_2 + (roznica * 0.618)),
                '0.667': float(punkt_2 + (roznica * 0.667)),
                '1.0': float(punkt_1),
            }
            
            poziomy['fala_3'] = {
                '1.414': float(punkt_1 - (roznica * 1.414))
            }
        
        return poziomy
    
    def generuj_sygnaly(self, fale: Dict, timeframe: str) -> Optional[Dict]:
        """Generuje sygnały tradingowe"""
        if not fale:
            return None
        
        aktualna_cena = fale['aktualna_cena']
        trend = fale['trend']
        poziomy = fale['poziomy_fibo']
        
        sygnal = {
            'timeframe': timeframe,
            'trend': trend,
            'akcja': None,
            'powod': '',
            'cel': None,
            'stop': None,
            'risk_reward': None
        }
        
        if trend == 'UP':
            for poziom, cena in poziomy['fala_2'].items():
                odchylenie = abs(aktualna_cena - cena) / cena * 100
                
                if odchylenie < 1.5:
                    sygnal['akcja'] = 'BUY'
                    sygnal['powod'] = f'Korekta fali 2 na poziomie {poziom} Fibo'
                    sygnal['cel'] = poziomy['fala_3']['1.414']
                    sygnal['stop'] = fale['punkt_1']['cena']
                    sygnal['risk_reward'] = abs((sygnal['cel'] - aktualna_cena) / (aktualna_cena - sygnal['stop']))
                    return sygnal
        
        elif trend == 'DOWN':
            for poziom, cena in poziomy['fala_2'].items():
                odchylenie = abs(aktualna_cena - cena) / cena * 100
                
                if odchylenie < 1.5:
                    sygnal['akcja'] = 'SELL'
                    sygnal['powod'] = f'Korekta fali 2 na poziomie {poziom} Fibo'
                    sygnal['cel'] = poziomy['fala_3']['1.414']
                    sygnal['stop'] = fale['punkt_1']['cena']
                    sygnal['risk_reward'] = abs((aktualna_cena - sygnal['cel']) / (sygnal['stop'] - aktualna_cena))
                    return sygnal
        
        return sygnal

# Singleton analyzer
analyzer = TradingAnalyzer()

# WebSocket manager dla real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "online",
        "service": "Trading Bot API",
        "version": "1.0.0"
    }

@app.get("/api/price")
async def get_current_price():
    """Pobiera aktualną cenę BTC/USDT"""
    try:
        ticker = analyzer.exchange.fetch_ticker(analyzer.symbol)
        return {
            "symbol": analyzer.symbol,
            "price": ticker['last'],
            "high_24h": ticker['high'],
            "low_24h": ticker['low'],
            "volume_24h": ticker['quoteVolume'],
            "change_24h": ticker['percentage'],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/api/candles/{timeframe}")
async def get_candles(timeframe: str, limit: int = 100):
    """Pobiera świeczki dla danego timeframe"""
    try:
        df = analyzer.pobierz_dane(timeframe, limit)
        
        if df is None:
            return JSONResponse(
                status_code=500,
                content={"error": "Nie udało się pobrać danych"}
            )
        
        # Konwersja do formatu dla wykresów
        candles = []
        for _, row in df.iterrows():
            candles.append({
                'time': int(row['timestamp'].timestamp()),
                'open': float(row['open']),
                'high': float(row['high']),
                'low': float(row['low']),
                'close': float(row['close']),
                'volume': float(row['volume'])
            })
        
        return {
            "timeframe": timeframe,
            "candles": candles
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/api/analysis/{timeframe}")
async def get_analysis(timeframe: str):
    """Analizuje dany timeframe i zwraca strukturę falową + sygnały"""
    try:
        df = analyzer.pobierz_dane(timeframe)
        
        if df is None:
            return JSONResponse(
                status_code=500,
                content={"error": "Nie udało się pobrać danych"}
            )
        
        fale = analyzer.wykryj_fale(df)
        sygnal = analyzer.generuj_sygnaly(fale, timeframe) if fale else None
        
        return {
            "timeframe": timeframe,
            "fale": fale,
            "sygnal": sygnal,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/api/analysis/all")
async def get_all_analysis():
    """Analizuje wszystkie timeframe'y naraz"""
    try:
        results = []
        sygnaly_aktywne = []
        
        for tf in analyzer.timeframes:
            df = analyzer.pobierz_dane(tf)
            
            if df is None:
                continue
            
            fale = analyzer.wykryj_fale(df)
            sygnal = analyzer.generuj_sygnaly(fale, tf) if fale else None
            
            results.append({
                "timeframe": tf,
                "fale": fale,
                "sygnal": sygnal
            })
            
            if sygnal and sygnal['akcja']:
                sygnaly_aktywne.append(sygnal)
        
        # Liczenie confluencji
        buy_count = sum(1 for s in sygnaly_aktywne if s['akcja'] == 'BUY')
        sell_count = sum(1 for s in sygnaly_aktywne if s['akcja'] == 'SELL')
        
        return {
            "results": results,
            "summary": {
                "total_signals": len(sygnaly_aktywne),
                "buy_signals": buy_count,
                "sell_signals": sell_count,
                "strong_signal": "BUY" if buy_count >= 2 else "SELL" if sell_count >= 2 else None
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket dla real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Wysyłamy aktualizacje co 30 sekund
            try:
                # Pobierz aktualną cenę
                ticker = analyzer.exchange.fetch_ticker(analyzer.symbol)
                
                # Analizuj wszystkie timeframe'y
                results = []
                for tf in analyzer.timeframes:
                    df = analyzer.pobierz_dane(tf, limit=200)
                    if df is not None:
                        fale = analyzer.wykryj_fale(df)
                        sygnal = analyzer.generuj_sygnaly(fale, tf) if fale else None
                        results.append({
                            "timeframe": tf,
                            "fale": fale,
                            "sygnal": sygnal
                        })
                
                # Wyślij dane
                await websocket.send_json({
                    "type": "update",
                    "price": ticker['last'],
                    "analysis": results,
                    "timestamp": datetime.now().isoformat()
                })
                
            except Exception as e:
                print(f"Błąd WebSocket: {e}")
            
            await asyncio.sleep(30)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
