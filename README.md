# 🔥 Ember Link

Profilo link personalizzabile (tipo Linktree) con RPC Discord live, musica di sottofondo e pagamenti Bitcoin.

---

## Servizi usati e perché

| Servizio | Cosa fa | Costo |
|----------|---------|-------|
| **Vercel** | Hosta il sito React e le API functions | Gratis |
| **Supabase** | Database, autenticazione, storage file, realtime | Gratis |
| **Fly.io** | Bot Discord sempre acceso 24/7 | Gratis |
| **BTCPay** | Pagamenti Bitcoin (opzionale) | Richiede setup |

---

## Setup — fallo in questo ordine

### 1. Supabase (database)

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Crea un nuovo progetto (scegli un nome, una password database, regione Europe)
3. Aspetta ~2 minuti che finisca di creare
4. Vai su **SQL Editor** (icona database a sinistra) → clicca **New query**
5. Il file `supabase/schema.sql` **l'hai già eseguito** ✅
6. Vai su **Storage** (icona cartella) → crea 3 bucket **pubblici** uno per uno:
   - Clicca **New bucket** → nome: `avatars` → spunta **Public bucket** → Create
   - Ripeti per `backgrounds`
   - Ripeti per `audio`
7. Vai su **Settings** → **API** → copia:
   - **Project URL** → va in `VITE_SUPABASE_URL`
   - **anon public** → va in `VITE_SUPABASE_ANON_KEY`
   - **service_role secret** → va in `SUPABASE_SERVICE_ROLE_KEY` (solo su Vercel, mai nel .env.local)

### 2. Vercel (sito web)

1. Vai su [vercel.com](https://vercel.com) e fai login con GitHub
2. Clicca **Add New → Project**
3. Importa il repo `Ember-link` da GitHub
4. Vercel riconosce Vite in automatico. Nella schermata di configurazione:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (già ok)
   - **Output Directory**: `dist` (già ok)
5. Prima di cliccare Deploy, vai su **Environment Variables** e aggiungi:
   ```
   VITE_SUPABASE_URL          → il tuo project URL
   VITE_SUPABASE_ANON_KEY     → la tua anon key
   SUPABASE_URL               → stesso project URL
   SUPABASE_SERVICE_ROLE_KEY  → la service_role key (quella lunga segreta)
   ADMIN_SECRET               → inventati una password, es: "miaPasswordSegreta42"
   NEXT_PUBLIC_SITE_URL       → https://ember-link.vercel.app (lo aggiorni dopo il deploy)
   ```
6. Clicca **Deploy** — dopo 1-2 minuti il sito è online

### 3. Discord Bot (RPC live)

**Prima: crea il bot su Discord**

1. Vai su [discord.com/developers/applications](https://discord.com/developers/applications)
2. Clicca **New Application** → dagli un nome (es. "Ember Link Bot")
3. Vai su **Bot** (menu a sinistra)
4. Clicca **Add Bot** → conferma
5. Sotto **Privileged Gateway Intents** attiva:
   - ✅ **Presence Intent** (necessario per leggere gioco/status)
   - ✅ **Server Members Intent** (necessario per vedere chi c'è nel server)
6. Clicca **Reset Token** → copia il token → salvalo, ti serve dopo
7. Crea un server Discord dedicato (o usa uno che hai già)
8. Aggiungi il bot al server: vai su **OAuth2 → URL Generator** → spunta `bot` → permessi: `Read Messages/View Channels` → copia l'URL → aprilo → aggiungi al server

**Poi: fai girare il bot su Fly.io**

1. Vai su [fly.io](https://fly.io) → crea account (gratis, non serve carta di credito)
2. Scarica e installa flyctl: [fly.io/docs/hands-on/install-flyctl](https://fly.io/docs/hands-on/install-flyctl/)
3. Da terminale:
   ```bash
   cd bot
   npm install
   fly auth login
   fly launch --name ember-link-bot --region fra --no-deploy
   ```
4. Imposta le variabili d'ambiente sul bot:
   ```bash
   fly secrets set DISCORD_BOT_TOKEN="il_tuo_token"
   fly secrets set SUPABASE_URL="https://xxx.supabase.co"
   fly secrets set SUPABASE_SERVICE_ROLE_KEY="eyJ..."
   ```
5. Deploy:
   ```bash
   fly deploy
   ```
6. Controlla che funzioni:
   ```bash
   fly logs
   ```
   Dovresti vedere `✅ Bot connesso come NomeBot#1234`

**Come ottenere il tuo Discord User ID:**
- Discord → Impostazioni → Avanzate → attiva "Modalità sviluppatore"
- Torna nella chat → click destro sul tuo nome → **Copia ID utente**
- Incollalo nella sezione RPC Discord della dashboard

### 4. Spotify (opzionale)

1. Vai su [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. **Create app** → nome: "Ember Link" → descrizione: qualcosa → accetta
3. **Settings** → **Redirect URIs** → aggiungi:
   `https://ember-link.vercel.app/api/spotify-callback`
4. Copia **Client ID** e **Client Secret**
5. Aggiungili su Vercel → Settings → Environment Variables:
   - `VITE_SPOTIFY_CLIENT_ID` = il client ID
   - `SPOTIFY_CLIENT_SECRET` = il client secret

### 5. BTCPay (opzionale, pagamenti Bitcoin)

Richiede un account BTCPay Server (self-hosted o tramite provider).
Parla prima con i tuoi genitori — i pagamenti devono passare da un loro account.

1. Crea uno store BTCPay
2. Genera una API Key con permesso "Create Invoice"
3. Aggiungi su Vercel:
   - `BTCPAY_HOST` = URL del tuo BTCPay Server
   - `BTCPAY_API_KEY` = la tua API key
   - `BTCPAY_STORE_ID` = ID dello store
   - `BTCPAY_WEBHOOK_SECRET` = lo trovi in BTCPay → Store → Webhooks
4. In BTCPay → Store → Webhooks → aggiungi:
   URL: `https://ember-link.vercel.app/api/btcpay-webhook`
   Evento: **Invoice Settled**

---

## Test in locale

```bash
cd frontend
npm install
npm run dev
```

Il sito gira su `http://localhost:5173`. Le API functions (`/api/...`) non girano in locale con `npm run dev` — per testarle devi fare il deploy su Vercel o usare `vercel dev` (installa Vercel CLI con `npm i -g vercel`).

---

## Generare un codice premium

Dal terminale, dopo il deploy:

```bash
curl -X POST https://ember-link.vercel.app/api/generate-code \
  -H "Content-Type: application/json" \
  -d '{"grants":"premium_30d","maxUses":1,"adminSecret":"LA_TUA_ADMIN_SECRET"}'
```

Risponde con `{"code":"AB12CD34"}`. Manda quel codice all'amico.

---

## Struttura progetto

```
ember-link/
├── frontend/
│   ├── src/
│   │   ├── pages/          Login, Register, Dashboard, PublicProfile
│   │   ├── components/
│   │   │   ├── dashboard/  LinksManager, ThemeCustomizer, MusicSettings, RPCSettings, PremiumPanel
│   │   │   └── profile/    LinkCard, RPCBadge, MusicPlayer, QRCodeButton
│   │   ├── context/        AuthContext (gestione sessione utente)
│   │   └── lib/            supabase.js (client Supabase)
│   ├── api/                Vercel Functions (og-preview, redeem-code, generate-code, btcpay, spotify)
│   └── .env.example        Template variabili d'ambiente
├── bot/
│   ├── index.js            Bot Discord
│   ├── fly.toml            Configurazione Fly.io
│   └── .env.example        Template variabili del bot
├── .gitignore
└── README.md
```
