# USDT Hop

Manual **TRC-20 → BEP-20** USDT desk: customers send USDT on TRON; you confirm in Binance and send BEP-20 on BSC. Static UI on **Vercel**, orders on **Firebase Firestore**.

## Repo layout

| Path | Purpose |
|------|---------|
| `public/` | Customer (`index.html`) and admin (`admin.html`) pages |
| `scripts/build.mjs` | Generates `public/firebase-config.js` and `firestore.rules` from env |
| `firebase.json` | Firestore rules/indexes deploy only (hosting is Vercel) |

## Local setup

1. Copy `.env.example` → `.env` and fill values (see below).
2. `npm run build`
3. Serve `public/` with any static server, e.g. `npx serve public`

## Environment variables

Set these in **Vercel** (Production) and locally in `.env` before `npm run build`:

| Variable | Description |
|----------|-------------|
| `FIREBASE_*` | Web app config from Firebase console |
| `BRIDGE_DEPOSIT_ADDRESS` | **TRON TRC-20 USDT** deposit address (e.g. Binance TRON deposit) |
| `BRIDGE_ADMIN_EMAIL` | Firebase Auth admin email (must match generated rules) |
| `BRIDGE_APP_NAME` | Brand shown on the site |
| `BRIDGE_FEE` / `BRIDGE_MIN_AMOUNT` | Fee math; rules regenerated on build |
| `BRIDGE_SUPPORT_CONTACT` | `whatsapp:+234…` — powers the bottom-right **Help** chat panel |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | **Vercel only** — visitor + new-order push alerts |

**Important:** Inbound deposits are **TRON (`T…`)**, not Ethereum/Monad `0x…` addresses. Using a **Binance TRON deposit** for operations is fine; the UI does not mention Binance.

### Telegram alerts (reuse an existing bot is fine)

You do **not** need a new bot name. Use the bot you already created:

1. Telegram → [@BotFather](https://t.me/BotFather) → `/mybots` → pick your bot → **API Token** (copy it). If the token was ever shared publicly, use **Revoke** there and copy the new token.
2. In Telegram, send **any message** to your bot (start chat).
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and find `"chat":{"id":123456789}` → that number is `TELEGRAM_CHAT_ID` (use your own token in the URL only on your machine; never commit it).
4. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in **Vercel → Environment Variables** (not in git). Redeploy.

**Safety:** The token lives only on Vercel for `/api/notify`. Reusing an old bot is safe for this project if the token stays server-side. Avoid reusing a bot that controls other production systems unless you are OK sharing alert traffic.

- **Order:** ping when a customer submits “I've sent the USDT”.
- **Visitor:** optional — set `BRIDGE_NOTIFY_VISITS=true` on Vercel (default off).

If submit hangs or fails, redeploy Firestore rules (`npm run firebase:deploy-rules`) and ensure Google Cloud **API key** allows your Vercel domain (HTTP referrers).
- Local `npx serve public` has no `/api/notify` — use Vercel preview/production to test alerts.

## Firebase (one-time)

1. Create a Firebase project.
2. Enable **Firestore** (production mode) and **Email/Password** auth.
3. Add an admin user with `BRIDGE_ADMIN_EMAIL`.
4. Install CLI: `npm i -g firebase-tools`, `firebase login`.
5. Set `.firebaserc` `default` project ID.
6. `npm run firebase:deploy-rules`

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import in Vercel → Framework **Other**, root directory `.`
3. Add all env vars from `.env.example`.
4. Deploy. Customer URL: `/` — Admin: `/admin.html`

Add custom domain in Vercel → Domains (e.g. `usdthop.xyz`).

## Changing fee or admin email

Update env → `npm run build` → redeploy Vercel **and** `npm run firebase:deploy-rules`.

## Security

- Never commit `.env` or `public/firebase-config.js`.
- Admin is protected by Firebase Auth + Firestore rules.
- `admin.html` is `noindex` via Vercel headers.
