# Agronix — Smart Farming Platform

Full-stack app for farm monitoring (IoT sensors via ThingSpeak), AI crop disease diagnosis,
weather, market prices, a farmer community feed, an AI chat assistant, and English/Tamil
language support.

## Structure

```
agronix/
├── backend/    Node.js + Express + TypeScript API (MongoDB via Mongoose, Socket.io)
├── frontend/   React + TypeScript + Vite client (Tailwind CSS)
└── database/   MongoDB schema reference + seed script
```

## Requirements

- **Node.js 18+** (includes npm) — check with `node -v`. Download from [nodejs.org](https://nodejs.org) if needed.
- **MongoDB** — optional. If not installed/reachable, the backend automatically starts an
  in-memory MongoDB so the app still runs (data won't persist across backend restarts in that mode).

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev              # http://localhost:5002
```

`npm run build && npm start` runs the compiled production build instead.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL, defaults to http://localhost:5002
npm run dev               # http://localhost:5173
```

## 3. Database (optional sample data)

```bash
cd database
npm install
MONGODB_URI="mongodb://localhost:27017/agronix" node seed.js
```

Creates a demo login (`demo@agronix.demo` / `Demo@1234`) with a sample farm, sensor readings, and
a community post. See `database/README.md` and `database/schema.md` for the data model.

## Environment variables (backend/.env)

Only `PORT`, `CLIENT_URL`, `MONGODB_URI`, and `JWT_SECRET` are needed to run the app at all.
Everything else is optional — each feature degrades independently into a clearly-labeled demo
mode rather than crashing when its key is missing:

| Variable | Required for | If missing |
|---|---|---|
| `MONGODB_URI` | Persistent data | Falls back to non-persistent in-memory MongoDB |
| `JWT_SECRET` | Login/auth | Must be set (any long random string) |
| `GEMINI_API_KEY` | Real AI Crop Doctor + Chat Assistant | Falls back to offline "expert mode" with clearly-labeled example answers |
| `MARKET_API_KEY` | Real mandi price data | Falls back to clearly-labeled "Demo Market Data" |
| `EMAIL_USER` / `EMAIL_PASS` | Email reports/alerts | That feature returns a clear config-needed message |
| `TWILIO_*` | SMS/WhatsApp alerts | That feature returns a clear config-needed message |

Weather needs **no API key** — it uses Open-Meteo, a free key-less weather + geocoding API, plus
Zippopotam.us for Indian PIN-code lookup.

ThingSpeak channel ID + read key (for live farm sensor hardware) are entered **per farm** from the
app UI when you add a farm — there's no global ThingSpeak env var.

## Demo mode, by feature

Every external integration is independently demo-safe:
- **Dashboard**: shows a "Demo Live Environment" badge with realistic, gently-changing simulated
  readings whenever there's no farm yet, or a farm's ThingSpeak feed can't be reached. Real data is
  shown (and clearly marked "Live") once a working ThingSpeak channel is connected.
- **Crop Doctor**: without `GEMINI_API_KEY`, returns a labeled example diagnosis instead of a real
  image analysis. With the key, analyzes your actual photo and returns a confidence score — if
  confidence is below 50%, it tells you to upload a clearer image rather than guessing.
- **Weather**: always live (no key needed).
- **Market Prices**: always clearly labeled "Demo Market Data" unless you wire up a real mandi
  price API via `MARKET_API_KEY` (see the comment at the top of `backend/src/controllers/marketController.ts`).
- **AI Assistant**: without `GEMINI_API_KEY`, answers from a small topic-matched offline library
  (rice, wheat, tomato, pests, soil, schemes, etc.), clearly marked "Demo Mode" in the chat header.
- **Community**: always real — posts are stored in MongoDB and persist across restarts as long as
  `MONGODB_URI` points at a real (not in-memory) MongoDB instance.

## What changed in this upgrade pass

**Crop Doctor**
- Was calling `gemini-pro-vision`, a model Google has retired — switched to `gemini-flash-latest`.
- The old prompt explicitly told the AI to *randomize* its diagnosis "for variety." Replaced with an
  honest prompt that only reports what it actually sees, plus a confidence threshold: below 50%
  confidence, the app tells the user to upload a clearer photo instead of guessing.
- Response is now the full structured JSON you'd expect: crop, diagnosis, confidence, severity,
  symptoms, possible causes, treatment, prevention, irrigation/nutrient advice, and a standing
  "consult an expert" warning.
- Added basic client-side image validation (file type, 8MB size limit).

**AI Assistant**
- Same deprecated-model issue, fixed the same way.
- The old prompt told the AI to *never* say "error," "offline," or "not supported" — i.e. never
  admit uncertainty. Rewrote it to ask clarifying questions when needed, avoid inventing prices/
  weather/scheme numbers, and avoid precise chemical dosages beyond general guidance.
- Added suggested quick-question chips and a clear-chat button.
- Offline fallback now covers government schemes specifically, plus rice/wheat/tomato/soil/pest/
  irrigation topics, instead of one generic canned reply.

**Weather**
- Already used a solid, free, key-less provider (Open-Meteo + Zippopotam.us for PIN codes) — kept
  that rather than switching to a paid provider that needs a registered key.
- Hardened input normalization (trims whitespace), added explicit request timeouts, and distinct
  error messages for "not found" vs "timed out" vs "service unavailable" vs "rate limited."

**Market Prices**
- The UI claimed "Real-time... Data sourced from TN Agricultural Marketing Department" while the
  data was 100% randomly generated. That's exactly the false-labeling the spec asked to avoid —
  fixed the copy and added an explicit `isDemo: true` flag from the backend so the frontend always
  shows an honest "Demo Market Data" badge.
- Documented the real path to go live (data.gov.in mandi price API) in the controller and `.env.example`.

**Community**
- Was missing `DELETE /api/community/:id` entirely — added it (owner-only), wired to a delete
  button in the UI, plus real loading/error states and a refresh button.
- Posts already used MongoDB (not localStorage) and persist across backend restarts as long as
  `MONGODB_URI` points at a real database — SQLite wasn't added since it would duplicate/compete
  with the already-working setup.

**Language (i18n)**
- The "AI Assistant" nav item was hardcoded English with a comment reading "Kept static or add to
  json if needed" — literally the example the spec called out. Fixed.
- Language selection now persists to `localStorage` and survives a page refresh (it previously
  reset to English every time).
- Added ~45 new translation keys (English + Tamil) covering Settings, Community, Chat Assistant,
  Crop Doctor, and the new Dashboard widgets.

**Dashboard**
- Added a proper "Demo Live Environment" mode: when no farm is connected (or a connected farm's
  ThingSpeak feed fails), the dashboard shows realistic, slowly-changing simulated readings instead
  of blank `--` placeholders, clearly labeled as demo data — with a "Live" badge shown instead once
  real sensor data is flowing.
- Added trend arrows on temperature/humidity/moisture, a Farm/Crop Summary strip (soil temperature,
  rainfall, wind speed, water level, crop health, growth stage, irrigation status, a demo commodity
  price), and a Recent Activity panel.

**Backend/security carried over from the previous pass**
- Fixed a password-rehashing bug in `User.ts`'s pre-save hook.
- Real `PUT /api/auth/profile` endpoint (Settings page used to be a fake `alert()`).
- Removed a debug route that leaked email config.
- Centralized the frontend API base URL via `VITE_API_URL` instead of 16 scattered hardcoded URLs.
- Redacted a live Gmail address + app password that were hardcoded in `.env` and a debug script —
  **if this was ever a real account, treat that password as compromised and rotate it.**

## Known limitations / what's still simulated

- **Market prices** are fully simulated (see above) — there's no data.gov.in key wired up in this
  environment. The integration point is documented and ready to fill in.
- **Dashboard's extra environment metrics** (soil temperature, rainfall, wind speed, water level,
  crop health, growth stage) have no real sensor equivalent anywhere in this app's IoT setup — they
  are always demo/illustrative, even when temperature/humidity/moisture/light are real ThingSpeak data.
- **Google OAuth** (`googleId` field on `User`) is reserved in the schema but not implemented — only
  email/password auth works.
- The Dashboard fetches ThingSpeak directly from the browser using the farm's own read key (a
  per-farm key you control, not a shared secret) rather than routing through the backend. Left as-is
  to avoid touching a working, low-risk piece of the architecture, but a stricter "backend as the
  only external caller" setup would proxy this through `/api/farms/:id/sensor-data` instead.

## How this was tested

This pass was done by careful line-by-line code review, TypeScript typechecking, and reasoning
through each control-flow path (demo-mode fallbacks, error branches, confidence thresholds) rather
than a live end-to-end run — this environment has no network access and this particular build was
worked on without `node_modules` present, so `npm install` + a live server + a real browser session
couldn't be run here. Please run through the checklist below yourself after `npm install`, since it
catches real dependency/environment issues manual review can't:

1. Dashboard — Demo Live Environment badge appears with no farm added; add a farm with a real
   ThingSpeak channel to confirm it switches to "Live."
2. Crop Doctor — upload a clear photo and a deliberately blurry one; confirm the low-confidence
   message appears for the blurry one.
3. Weather — search a city name, an Indian PIN code, and an invalid entry.
4. Market Prices — confirm the "Demo Market Data" badge is visible.
5. Community — post, refresh in a second browser/incognito session as another user, and delete
   your own post.
6. AI Assistant — try a suggested question and a free-text question.
7. Language toggle — switch to Tamil, refresh the page, confirm it stays Tamil.
8. Restart the backend — confirm Community posts are still there (with a real, non-in-memory MongoDB).
