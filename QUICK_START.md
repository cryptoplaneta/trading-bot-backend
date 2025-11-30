# ⚡ QUICK START - Bot Tradingowy

## 🎯 Najprostsza instalacja (2 kroki)

### KROK 1: Uruchom Backend (Terminal 1)

```bash
cd backend
./start_backend.sh
```

**Lub ręcznie:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

✅ Czekaj aż zobaczysz: `Uvicorn running on http://0.0.0.0:8000`

---

### KROK 2: Uruchom Frontend (Terminal 2 - NOWY)

```bash
cd frontend
./start_frontend.sh
```

**Lub ręcznie:**
```bash
cd frontend
npm install
npm start
```

✅ Przeglądarka otworzy się automatycznie na `http://localhost:3000`

---

## 🎉 GOTOWE!

Teraz powinieneś zobaczyć:
- 📊 Wykres świecowy BTC/USDT
- 🔢 Aktualna cena w nagłówku
- 📈 Analiza 4 timeframe'ów (15m, 1h, 4h, 1D)
- 🟢/🔴 Sygnały BUY/SELL jeśli są aktywne
- ⚡ WebSocket status w stopce (powinien być 🟢)

---

## 🐛 Problemy?

**Backend nie startuje:**
```bash
# Sprawdź czy masz Pythona 3.9+
python --version

# Sprawdź czy port 8000 jest wolny
lsof -i :8000
```

**Frontend nie startuje:**
```bash
# Sprawdź czy masz Node.js 16+
node --version

# Wyczyść cache
rm -rf node_modules package-lock.json
npm install
```

**WebSocket nie działa:**
1. Upewnij się że backend działa PIERWSZY
2. Sprawdź konsolę przeglądarki (F12)
3. Odśwież stronę (Ctrl+R)

---

## 📖 Pełna dokumentacja

Zobacz: `README.md`

---

## 🚀 Co dalej?

- Zmień parę handlową w `backend/main.py` (linia 24)
- Dostosuj poziomy Fibonacciego (linia 26-28)
- Dodaj alerty Telegram/Discord
- Włącz auto-trading (ostrożnie!)

**Miłego tradingu! 📈💰**
