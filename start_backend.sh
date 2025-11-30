#!/bin/bash
# start_backend.sh - Uruchamia backend Python FastAPI

echo "🚀 Uruchamianie Backend API..."
echo ""
echo "📦 Instalacja bibliotek..."
pip install -r requirements.txt

echo ""
echo "✅ Backend gotowy!"
echo ""
echo "🌐 API dostępne pod: http://localhost:8000"
echo "📡 WebSocket: ws://localhost:8000/ws"
echo ""
echo "🔥 Uruchamiam serwer..."
python main.py
