# DineDate 🍽️

A food-first dating app where matches are made through shared restaurant preferences.

## Quick Start

```bash
# 1. Install everything
bash setup.sh

# 2. Terminal 1 — backend
cd backend && npm run dev

# 3. Terminal 2 — frontend
cd frontend && npm run dev

# 4. Open http://localhost:3000
```

**Demo login:** `demo@dinedate.com` / `demo123`

---

## Project Structure

```
DineDate/
├── frontend/               # React + Vite (port 3000)
│   └── src/
│       ├── screens/        # 9 screens (Welcome → Browse → Chat → Restaurant)
│       ├── components/     # SwipeCard, RestaurantCard, MatchCard, BottomNav
│       ├── contexts/       # AuthContext, AppContext
│       └── services/       # api.js (Axios), socket.js (Socket.IO)
│
└── backend/                # Node.js + Express (port 5001)
    └── src/
        ├── routes/         # auth, users, matches, restaurants, chat
        ├── services/       # matchingService.js, googleMapsService.js
        ├── socket/         # Real-time chat via Socket.IO
        └── database/       # JSON file store (data/db.json)
```

## App Flow

```
Welcome → Sign Up (3 steps) → Onboarding (6 steps: cuisines, meals, vibe, price, personality, bio)
    ↓
Browse (swipe cards) → Like → Mutual like → Match created
    ↓
Both pick cuisines → Overlap found → Restaurant list shown
    ↓
Pick restaurant → Chat → Date confirmed ✅
```

## Key Features

| Feature | Details |
|---------|---------|
| **Swipe cards** | Drag/touch gesture, LIKE/PASS stamps, cuisine chips |
| **2-stage matching** | Mutual like + cuisine overlap required |
| **Restaurant suggestions** | Google Maps API (falls back to mock data without key) |
| **Real-time chat** | Socket.IO with typing indicators, read receipts |
| **Onboarding** | 6-step flow capturing cuisines, price, restaurant vibe |
| **Auth** | JWT with 30-day expiry, bcrypt passwords |

## Google Maps API (Optional)

Add your key to `backend/.env`:
```
GOOGLE_MAPS_API_KEY=your_key_here
```

Without a key the app uses curated mock restaurant data — all features work.

Get a key at [console.cloud.google.com](https://console.cloud.google.com) → Enable **Places API**.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Pure CSS (no framework), Inter font |
| Backend | Node.js, Express 4 |
| Database | JSON file store (zero setup) |
| Real-time | Socket.IO 4 |
| Auth | JWT + bcryptjs |
| Maps | Google Places API (optional) |
