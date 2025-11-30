# 🚀 DEPLOYMENT GUIDE - Uruchomienie na Domenie

## 🎯 **QUICK DEPLOY (5 minut)**

### **KROK 1: Backend na Render.com (FREE)**

1. **Wejdź na:** https://render.com
2. **Zarejestruj się** (przez GitHub najłatwiej)
3. Kliknij **"New +"** → **"Web Service"**
4. Wybierz **"Build and deploy from a Git repository"**
5. Jeśli nie masz repo na GitHub:
   - Stwórz nowe repo na https://github.com/new
   - Nazwij: `trading-bot-backend`
   - Upload folder `backend/` tam
6. W Render wybierz swoje repo
7. Ustawienia:
   ```
   Name: trading-bot-api
   Region: Frankfurt (najbliżej Polski)
   Branch: main
   Root Directory: (puste lub „backend" jeśli cały projekt)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```
8. Kliknij **"Create Web Service"**
9. ✅ Poczekaj 2-3 minuty na deploy
10. **Skopiuj URL:** `https://trading-bot-api-xxx.onrender.com`

---

### **KROK 2: Frontend na Vercel (FREE)**

1. **Wejdź na:** https://vercel.com
2. **Zarejestruj się** (przez GitHub)
3. Kliknij **"Add New Project"**
4. **Import Git Repository:**
   - Stwórz repo `trading-bot-frontend` na GitHub
   - Upload folder `frontend/` tam
   - Wybierz repo w Vercel
5. Ustawienia:
   ```
   Framework Preset: Create React App
   Root Directory: (puste lub „frontend")
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```
6. **Environment Variables** (WAŻNE!):
   ```
   REACT_APP_API_URL = https://trading-bot-api-xxx.onrender.com
   REACT_APP_WS_URL = wss://trading-bot-api-xxx.onrender.com/ws
   ```
7. Kliknij **"Deploy"**
8. ✅ Poczekaj 1-2 minuty
9. **Gotowe!** Dostaniesz link: `https://trading-bot-xyz.vercel.app`

---

### **KROK 3: Połącz Frontend z Backend**

W pliku `frontend/src/App.jsx` zmień:

```javascript
// Dodaj na górze (po importach):
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

// W funkcji App() zmień:
// Stare:
// const websocket = new WebSocket('ws://localhost:8000/ws');

// Nowe:
const websocket = new WebSocket(WS_URL);

// Również wszystkie fetch() zmień:
// Stare:
// fetch(`http://localhost:8000/api/price`)

// Nowe:
fetch(`${API_URL}/api/price`)
```

**Potem w Vercel:**
- Settings → Environment Variables
- Dodaj te zmienne:
  - `REACT_APP_API_URL` = `https://twoj-backend.onrender.com`
  - `REACT_APP_WS_URL` = `wss://twoj-backend.onrender.com/ws`
- Redeploy (Deployments → ... → Redeploy)

---

## 🎯 **WŁASNA DOMENA (opcjonalnie)**

### **Vercel Custom Domain:**

1. W Vercel → Project → Settings → Domains
2. Dodaj swoją domenę: `trading.twojadomena.pl`
3. W panelu domeny dodaj:
   ```
   CNAME  trading  →  cname.vercel-dns.com
   ```
4. ✅ Gotowe! Twoja domena będzie działać

### **Render Custom Domain:**

1. W Render → Service → Settings → Custom Domains
2. Dodaj: `api.twojadomena.pl`
3. W panelu domeny:
   ```
   CNAME  api  →  trading-bot-api.onrender.com
   ```
4. ✅ Render automatycznie doda SSL

---

## 📱 **ALTERNATIVE: RAILWAY (Najprostsze)**

Railway to jak Heroku - wszystko w jednym miejscu.

```bash
# 1. Instalacja CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy Backend
cd backend
railway init
railway up

# Dostaniesz URL: https://xxx.railway.app

# 4. Deploy Frontend
cd ../frontend
railway init

# Dodaj environment variable w Railway dashboard:
# REACT_APP_API_URL = https://twoj-backend.railway.app

railway up
```

**Koszt:** 
- $5/miesiąc po free trial (500h)
- Ale dużo szybsze niż Render free tier

---

## 🔒 **CORS FIX (WAŻNE!)**

W `backend/main.py` sprawdź CORS:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://trading-bot-xyz.vercel.app",  # Dodaj swój Vercel URL
        "https://trading.twojadomena.pl",       # Twoja domena
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**LUB dla prostoty (tylko development!):**
```python
allow_origins=["*"]  # Pozwala wszystkim
```

---

## 💾 **UŻYWANIE BAZY DANYCH (opcjonalnie)**

Jeśli chcesz zapisywać sygnały:

### **PostgreSQL na Render (FREE):**

1. Render → New → PostgreSQL
2. Name: `trading-bot-db`
3. Free tier
4. Skopiuj **Internal Database URL**
5. W backend dodaj:
   ```python
   import os
   import psycopg2
   
   DATABASE_URL = os.getenv('DATABASE_URL')
   conn = psycopg2.connect(DATABASE_URL)
   ```
6. W Render Web Service → Environment:
   ```
   DATABASE_URL = twoj_postgresql_url
   ```

---

## 🎉 **GOTOWE LINKI:**

Po deployment będziesz miał:

- **Frontend:** `https://trading-bot.vercel.app`
- **Backend API:** `https://trading-bot-api.onrender.com`
- **API Docs:** `https://trading-bot-api.onrender.com/docs`
- **WebSocket:** `wss://trading-bot-api.onrender.com/ws`

---

## 🐛 **TROUBLESHOOTING:**

### **Frontend nie łączy się z Backend:**
1. Sprawdź CORS w `backend/main.py`
2. Sprawdź zmienne środowiskowe w Vercel
3. Sprawdź czy backend działa: otwórz `https://twoj-backend.onrender.com`

### **WebSocket nie działa:**
1. Render free tier usypia po 15 min bezczynności
2. Upgrade do paid ($7/m) dla 24/7 uptime
3. LUB użyj Railway ($5/m)

### **Render backend wolny:**
1. Free tier ma cold start (30s)
2. Po pierwszym requestcie będzie szybki
3. Paid tier = instant start

---

## 💡 **REKOMENDACJA:**

**Na start (0 zł):**
- Frontend: Vercel (FREE forever)
- Backend: Render (FREE, ale usypia)

**Dla production ($5/m):**
- Frontend: Vercel (FREE)
- Backend: Railway ($5/m, szybki, bez uśpienia)

**Dla biznesu ($15-20/m):**
- VPS (Hetzner €4.5/m) + Twoja domena
- Pełna kontrola, najszybsze

---

## 📞 **SUPPORT:**

Jeśli coś nie działa:
1. Sprawdź logi w Render/Vercel dashboard
2. Sprawdź Network tab w DevTools (F12)
3. Sprawdź CORS errors w Console

---

**Gotowe do uruchomienia! 🚀**

Wybierz opcję i pisz jak pójdzie!
