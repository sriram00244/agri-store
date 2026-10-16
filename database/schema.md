# Schema Reference

Generated from `backend/src/models/*.ts`. This file is documentation only — edit the actual
`.ts` model files in `backend/src/models/` to change the real schema.

## User (`users`)

| Field           | Type    | Notes                                      |
|-----------------|---------|---------------------------------------------|
| name            | String  | required                                    |
| email           | String  | required, unique                            |
| password        | String  | required, bcrypt-hashed on save             |
| googleId        | String  | reserved for future Google OAuth            |
| phone           | String  |                                              |
| location        | String  |                                              |
| language        | String  | default `'en'`                              |
| notifications   | Object  | `{ email: Boolean, sms: Boolean, whatsapp: Boolean }` |
| timestamps      | -       | `createdAt`, `updatedAt`                    |

## Farm (`farms`)

| Field          | Type       | Notes                              |
|----------------|------------|-------------------------------------|
| user           | ObjectId   | ref `User`, required                |
| name           | String     | required                            |
| location       | String     | required                            |
| channelId      | String     | ThingSpeak channel ID, required     |
| readKey        | String     | ThingSpeak read API key, required   |
| emailAlerts    | String     | optional override email             |
| phoneAlerts    | String     | optional override phone (E.164)     |
| lastAlertSent  | Date       | used for alert cooldown             |
| timestamps     | -          | `createdAt`, `updatedAt`            |

## SensorData (`sensordatas`)

| Field          | Type      | Notes                                 |
|----------------|-----------|-----------------------------------------|
| farm           | ObjectId  | ref `Farm`, required                    |
| temperature    | Number    | °C                                      |
| humidity       | Number    | %                                       |
| soilMoisture   | Number    | %                                       |
| lightIntensity | Number    | lx                                      |
| recordedAt     | Date      | default now; indexed with `farm`        |

Populated automatically by `backend/src/services/pollingService.ts`, which polls each farm's
ThingSpeak channel every 15 seconds.

## Post (`posts`)

| Field      | Type      | Notes                                                        |
|------------|-----------|----------------------------------------------------------------|
| user       | ObjectId  | ref `User`, required                                           |
| content    | String    | required                                                        |
| category   | String    | enum: General, Market, Pests, Buy, Sell, Question, Tip          |
| image      | String    | optional image URL                                              |
| likes      | [ObjectId]| ref `User`                                                       |
| comments   | [Comment] | embedded subdocuments: `{ user, text, createdAt }`               |
| timestamps | -         | `createdAt`, `updatedAt`                                        |

## MarketData (`marketdatas`)

| Field       | Type   | Notes               |
|-------------|--------|----------------------|
| commodity   | String | required             |
| state       | String | required             |
| market      | String |                       |
| minPrice    | Number |                       |
| maxPrice    | Number |                       |
| modalPrice  | Number |                       |
| date        | Date   | default now           |

Note: the `/api/market` endpoint currently generates realistic simulated prices on every request
rather than reading from this collection (see `backend/src/controllers/marketController.ts`). The
schema/model is kept for future use if you wire it up to a real mandi price feed or the seed data.
