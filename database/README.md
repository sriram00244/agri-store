# Agronix Database

Agronix uses **MongoDB** (via Mongoose) as its database.

- **Connection**: configured in `backend/src/config/db.ts` via the `MONGODB_URI` env var (see `backend/.env.example`).
- **No local MongoDB? No problem**: if `MONGODB_URI` is unset or unreachable, `connectDB()` automatically spins up an
  in-memory MongoDB instance (via `mongodb-memory-server`) so the app still runs for local development/demo purposes.
  Data in that mode does **not** persist across server restarts — install/run real MongoDB (or point `MONGODB_URI`
  at Atlas or another host) for persistent data.
- **Source of truth for schemas**: the actual Mongoose schemas live in `backend/src/models/` (TypeScript, used directly
  by the running app). `schema.md` in this folder documents them for quick reference so you don't have to open every
  model file to understand the data model.
- **Seeding**: `seed.js` in this folder populates the database with sample users, farms, sensor readings, and community
  posts for local development/demo purposes.

## Collections

| Collection   | Model file                          | Purpose                                   |
|--------------|--------------------------------------|--------------------------------------------|
| `users`      | `backend/src/models/User.ts`         | Accounts, auth, notification preferences   |
| `farms`      | `backend/src/models/Farm.ts`         | Registered farms + ThingSpeak channel info |
| `sensordatas`| `backend/src/models/SensorData.ts`   | Polled IoT sensor readings per farm        |
| `posts`      | `backend/src/models/Post.ts`         | Community feed posts, likes, comments      |
| `marketdatas`| `backend/src/models/MarketData.ts`   | (Schema defined; live prices are currently generated on the fly by `marketController.ts` rather than read from this collection) |

## Running the seed script

```bash
cd database
npm install
MONGODB_URI="mongodb://localhost:27017/agronix" node seed.js
```

This is optional — the app works without seeding (farms/posts are created from the UI once you register a user).
