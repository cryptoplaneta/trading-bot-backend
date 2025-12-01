# 🚀 BOT TRADINGOWY - GEOMETRIA RYNKU
## Profesjonalny Dashboard React + Python API

---

## 📋 WYMAGANIA

- Python 3.9 lub nowszy
- Node.js 16 lub nowszy
- npm lub yarn

---

## 🔧 INSTALACJA

### 1. BACKEND (Python FastAPI)

```bash
# Przejdź do folderu backend
cd backend

# Zainstaluj biblioteki Pythona
pip install -r requirements.txt

# Uruchom serwer API
python main.py
```

**Backend będzie dostępny pod:** `http://localhost:8000`

**API Endpoints:**
- `GET /` - Health check
- `GET /api/price` - Aktualna cena BTC/USDT
- `GET /api/candles/{timeframe}` - Świeczki dla timeframe
- `GET /api/analysis/{timeframe}` - Analiza pojedynczego timeframe
- `GET /api/analysis/all` - Analiza wszystkich timeframe'ów
- `WebSocket /ws` - Real-time updates

---

### 2. FRONTEND (React)

```bash
# Przejdź do folderu frontend
cd frontend

# Zainstaluj zależności Node.js
npm install

# Uruchom serwer deweloperski
npm start
```

**Frontend będzie dostępny pod:** `http://localhost:3000`

Przeglądarka automatycznie się otworzy!

---

## 🎯 JAK TO DZIAŁA

### Backend:
1. Łączy się z **Bybit API** (publiczne, bez klucza)
2. Pobiera dane OHLCV dla BTC/USDT
3. Analizuje strukturę falową (punkty 1,2,3)
4. Oblicza poziomy Fibonacciego (0.5, 0.618, 0.667, 1.0, 1.414)
5. Generuje sygnały BUY/SELL
6. Wysyła dane przez **WebSocket** do frontendu (real-time)

### Frontend:
1. Łączy się z backendem przez WebSocket
2. Wyświetla **interaktywny wykres świecowy**
3. Rysuje **punkty falowe** (1,2,3) na wykresie
4. Pokazuje **poziomy Fibonacciego**
5. Wyświetla **sygnały BUY/SELL**
6. Wykrywa **confluencję** (zgodnośd sygnałów na wielu timeframe'ach)
7. Auto-odświeża dane co 30 sekund

---

## 📊 FUNKCJE DASHBOARDU

✅ **Real-time cena BTC/USDT** z zmianą 24h
✅ **4 timeframe'y naraz** (15m, 1h, 4h, 1D)
✅ **Interaktywny wykres** z oznaczonymi falami
✅ **Poziomy Fibonacciego** narysowane na wykresie
✅ **Sygnały BUY/SELL** z celami i stop lossami
✅ **Risk/Reward ratio** dla każdego sygnału
✅ **Silny sygnał** gdy 2+ timeframe'y się zgadzają
✅ **WebSocket** - aktualizacje na żywo co 30s
✅ **Responsive design** - działa na telefonie

---

## 🎨 WYGLĄD DASHBOARDU

```
┌─────────────────────────────────────────────────────────────┐
│  🚀 BOT TRADINGOWY                     BTC/USDT: $43,250     │
│     Geometria Rynku                    +2.5% | 24h Vol: 25M  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🔥 SILNY SYGNAŁ BUY - Confluencja na 3 timeframe'ach! 🔥   │
│                                                               │
├───────────────────────────┬─────────────────────────────────┤
│                           │  📊 Analiza Multi-Timeframe      │
│  [15m] [1h] [4h] [1D]     │  ┌─────────────────────────┐    │
│                           │  │ ⏰ 15m     🟢 BUY       │    │
│                           │  │ 📈 Trend wzrostowy      │    │
│  [Wykres świecowy         │  │ P1: $42,100             │    │
│   z punktami 1,2,3        │  │ P2: $43,500             │    │
│   i poziomami Fibo]       │  │ P3: $42,800             │    │
│                           │  └─────────────────────────┘    │
│  Punkt 3 ●                │                                  │
│    ↑                      │  ┌─────────────────────────┐    │
│  1.414 Fibo ----          │  │ ⏰ 1h      🟢 BUY       │    │
│    ↓                      │  │ 📈 Trend wzrostowy      │    │
│  Punkt 2 ●                │  └─────────────────────────┘    │
│    ↑                      │                                  │
│  Punkt 1 ●                │  🔔 Aktywne Sygnały              │
│                           │  ┌─────────────────────────┐    │
│                           │  │ 🟢 BUY - 15m            │    │
│                           │  │ Korekta fali 2 na 0.618 │    │
│                           │  │ 🎯 Cel: $44,200         │    │
│                           │  │ 🛑 Stop: $42,000        │    │
│                           │  │ 📊 R/R: 1:2.5           │    │
│                           │  └─────────────────────────┘    │
└───────────────────────────┴─────────────────────────────────┘
```

---

## 🔄 AKTUALIZACJE

- **WebSocket:** Real-time co 30 sekund
- **HTTP Backup:** Co 60 sekund (jeśli WS nie działa)
- **Auto-reconnect:** Automatyczne ponowne łączenie

---

## 🐛 TROUBLESHOOTING

### Backend nie startuje:
```bash
# Sprawdź czy port 8000 jest wolny
lsof -i :8000

# Jeśli zajęty, zabij proces:
kill -9 <PID>
```

### Frontend nie łączy się z backendem:
1. Sprawdź czy backend działa: `http://localhost:8000`
2. Sprawdź konsole przeglądarki (F12)
3. Sprawdź czy CORS jest włączony w `main.py`

### WebSocket nie działa:
1. Backend musi być uruchomiony PRZED frontendem
2. Sprawdź czy firewall nie blokuje WebSocket
3. W konsoli przeglądarki sprawdź błędy WS

---

## 🚀 DEPLOYMENT (Produkcja)

### Backend (Heroku/Railway/Render):
```bash
# Dodaj Procfile
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel/Netlify):
```bash
npm run build
# Deploy folder 'build'
```

**Pamiętaj:** Zmień `http://localhost:8000` na URL produkcyjnego backendu!

---

## 📝 NOTATKI

- Bot **NIE WYKONUJE** automatycznych transakcji
- Bot tylko **generuje sygnały** - Ty decydujesz czy je realizować
- Dane pobierane z **publicznego API** Bybit (bez klucza)
- **Backtesting** nie jest zaimplementowany (można dodać)

---

## 🎯 MOŻLIWE ROZSZERZENIA

- [ ] Telegram/Discord powiadomienia
- [ ] Zapisywanie sygnałów do bazy danych
- [ ] Backtesting na danych historycznych
- [ ] Więcej par (ETH, SOL, etc.)
- [ ] Wykrywanie fali 4 i 5
- [ ] Auto-trading (integracja z giełdą)
- [ ] Panel konfiguracji parametrów Fibo
- [ ] Export sygnałów do CSV/Excel

---

## 💬 SUPPORT

Jeśli coś nie działa:
1. Sprawdź konsole (backend + frontend)
2. Sprawdź czy wszystkie biblioteki są zainstalowane
3. Sprawdź czy porty 3000 i 8000 są wolne

---

## 🎉 GOTOWE!

Teraz masz profesjonalny dashboard tradingowy z:
- ✅ Real-time analizą
- ✅ Pięknym interfejsem
- ✅ Wykresami z TradingView
- ✅ Multi-timeframe analizą
- ✅ Sygnałami BUY/SELL

**Miłego tradingu! 🚀📈**
