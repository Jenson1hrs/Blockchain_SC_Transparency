# VeriChain — Cosmetics & Skincare Product Authentication

**Final Year Project** · Blockchain-based authentication for cosmetics and skincare SMEs and consumers, using Hyperledger Fabric for traceability

**Platform name:** VeriChain

---

## Quick demo startup on my laptop

Use this order when the project is **already configured** on your machine (Fabric samples installed, PostgreSQL database created, `.env` and `config/db.js` set, wallet enrolled).

> **Important:** `./network.sh` must be run only from  
> `~/fabric-project/fabric-samples/test-network`  
> Do **not** run it from `fabric-api/` or `fabric-frontend/`.

### Startup order (three terminals)

| Step | Where | Command |
|------|--------|---------|
| **1** | Windows | Start **Docker Desktop** and wait until it is running |
| **2** | WSL — Terminal A | `docker ps` (confirms Docker is reachable) |
| **3** | WSL — Terminal A | Start Fabric (stay in `test-network` folder) |
| **4** | WSL — Terminal B | Start backend API |
| **5** | WSL — Terminal C | Start frontend |
| **6** | Windows CMD (optional) | Get LAN IP for phone QR testing |

---

### Step 1 — Docker Desktop

Start **Docker Desktop** on Windows. In WSL:

```bash
docker ps
```

You should see a list of containers (or an empty list without errors). If this fails, Docker is not running.

---

### Step 2 — Hyperledger Fabric network

**Terminal A** — open WSL and run:

```bash
cd ~/fabric-project/fabric-samples/test-network
./network.sh up -c supplychannel
./network.sh createChannel -c supplychannel
```

> **Note:** `./network.sh up` only starts Docker containers (peers, orderer). It does **not** create the channel. If you skip `createChannel`, product create will fail with `supplychannel error: access denied`.

| Fabric setting | Value in this project |
|----------------|------------------------|
| Channel | `supplychannel` |
| Chaincode name | `anticounterfeit` |

**Deploy chaincode** (required after first setup, after `./network.sh down`, or if create product / blockchain calls fail):

```bash
cd ~/fabric-project/fabric-samples/test-network
./network.sh deployCC \
  -c supplychannel \
  -ccn anticounterfeit \
  -ccp ../../anti-counterfeit-chaincode \
  -ccl javascript
```

Chaincode source folder in the repo: `anti-counterfeit-chaincode/`  
Deploy path is relative to `test-network/`: `../../anti-counterfeit-chaincode`

PostgreSQL should already be running locally with database `anti_counterfeit_db` (see [Configuration](#configuration)).

---

### Step 3 — Backend API

**Terminal B** — new WSL window:

```bash
cd ~/fabric-project/fabric-api
npm start
```

This runs `node app.js` on port **3000**.

Check: [http://localhost:3000/health](http://localhost:3000/health) — should return JSON with `"status": "online"`.

---

### Step 4 — Frontend

**Terminal C** — new WSL window:

```bash
cd ~/fabric-project/fabric-frontend
nvm use 20
npm run dev -- --host 0.0.0.0
```

Open in browser: [http://localhost:5173](http://localhost:5173)

**Node version:** Vite 8 requires **Node.js 20+** (see `.nvmrc`). Use `nvm use 20` if `npm run dev` fails with an engine error.

**API in normal dev:** The frontend uses `/api` by default; Vite proxies to `http://127.0.0.1:3000`. You do **not** need `VITE_API_BASE_URL` for laptop-only testing.

---

### Step 5 — Phone QR testing (optional)

QR links use `FRONTEND_URL` from `fabric-api/.env`. A phone cannot open `localhost`.

On **Windows** (Command Prompt or PowerShell):

```cmd
ipconfig | findstr "IPv4"
```

Use your laptop’s LAN address (e.g. `192.168.1.x`), then in `fabric-api/.env`:

```env
FRONTEND_URL=http://192.168.1.x:5173
```

Restart the backend after changing `.env`.

For LAN API calls from the phone, optionally add `fabric-frontend/.env`:

```env
VITE_API_BASE_URL=http://192.168.1.x:3000
```

Keep `npm run dev -- --host 0.0.0.0` so Vite accepts connections from the phone.

---

## Common demo problems

| Problem | Likely cause | Fix |
|---------|----------------|-----|
| `docker ps` fails | Docker Desktop not running | Start Docker Desktop, wait, retry |
| `supplychannel error: access denied` | Channel not created (`up` alone is not enough) | Run `./network.sh createChannel -c supplychannel`, then deploy chaincode |
| Fabric / chaincode errors | Network not up or chaincode not deployed | `up` + `createChannel` + `deployCC` from `fabric-samples/test-network/` |
| `./network.sh: No such file` | Wrong folder | `cd ~/fabric-project/fabric-samples/test-network` first |
| Backend DB error | PostgreSQL stopped or wrong credentials | Start PostgreSQL; check `fabric-api/config/db.js` |
| `GET /health` fails | Backend not started | `cd fabric-api && npm start` |
| Phone QR opens wrong / fails | `localhost` in QR link | Set `FRONTEND_URL` to LAN IP; use `--host 0.0.0.0` for Vite |
| Frontend won’t start | Node version too old | `nvm use 20` in `fabric-frontend/` |
| Admin Fabric status error | Wallet or network issue | Re-run `node enrollAdmin.js` in `fabric-api/` after Fabric is up |

More detail: [Troubleshooting](#troubleshooting).

---

## Project overview

**VeriChain** helps **cosmetics and skincare SME manufacturers** protect brand trust and helps **consumers** verify products before use. Supporting roles (distributor, retailer, regulator, admin) provide traceability, governance, and platform operation.

The platform combines:

- **Hyperledger Fabric** — on-chain product traceability (lifecycle, custody, history)
- **PostgreSQL** — off-chain skincare metadata (ingredients, allergy notes, halal status, usage instructions, images, expiry)
- **React + Express** — web UI and REST API with JWT and role-based access

**Main features:** QR verification (with tampered-hash detection), product registration with safety metadata, supply-chain transfers, consumer inventory, expiry and allergy/halal alerts, regulator organization review, admin monitoring, feedback (Likert scale).

**Architecture diagrams:** [`docs/FYP-System-Architecture.md`](docs/FYP-System-Architecture.md)

---

## Technology stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 5 (`npm start` → `app.js`) |
| Blockchain | Hyperledger Fabric 2.x (Docker test network) |
| Chaincode | JavaScript — `anti-counterfeit-chaincode/` |
| Database | PostgreSQL (`fabric-api/config/db.js`) |
| Authentication | JWT, bcrypt |

**Development environment:** Windows + WSL Ubuntu + Docker Desktop (for Fabric only).

---

## System architecture

```text
User roles → React (fabric-frontend) → Express API (fabric-api)
                                              ↙         ↘
                              Hyperledger Fabric    PostgreSQL
                              supplychannel /       users, metadata,
                              anticounterfeit       transfers, inventory
```

| On-chain (Fabric) | Off-chain (PostgreSQL) |
|-------------------|-------------------------|
| Product creation, transfers, location, history | Users, product metadata, images, expiry |
| Immutable audit trail | Transfer requests, inventory, notifications, feedback |

---

## Repository structure

```text
fabric-project/
├── fabric-api/                 # Backend — npm start
├── fabric-frontend/            # Frontend — npm run dev
├── anti-counterfeit-chaincode/ # Chaincode deployed to Fabric
├── scripts/
│   └── seed-demo-privileged-users.js
├── docs/
└── fabric-samples/             # Not in git — install locally
    └── test-network/             # ./network.sh runs HERE only
```

---

## Configuration

### Backend — `fabric-api/.env`

```bash
cp fabric-api/.env.example fabric-api/.env
```

| Variable | Purpose |
|----------|---------|
| `FRONTEND_URL` | Base URL in QR verify links (use LAN IP for phone testing) |
| `JWT_SECRET` | Login tokens |
| `QR_SECRET` | QR authenticity hash |

### PostgreSQL — `fabric-api/config/db.js`

Database settings are in **`config/db.js`**, not in `.env`:

```js
database: 'anti_counterfeit_db'
user: 'postgres'
host: 'localhost'
port: 5432
```

Edit this file to match your local PostgreSQL user and password.

### Frontend — API URL

| Mode | Setting |
|------|---------|
| **Normal dev (laptop)** | Default `/api` — Vite proxy to port 3000; no `VITE_API_BASE_URL` required |
| **Phone / LAN testing** | Set `FRONTEND_URL` in backend `.env`; optionally `VITE_API_BASE_URL` in `fabric-frontend/.env` |

### Demo accounts

#### Privileged accounts (seed script only)

Admin and regulator **cannot** self-register. From **repo root**:

```bash
node scripts/seed-demo-privileged-users.js
```

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@test.com` | `Admin123!` |
| Regulator | `regulator@test.com` | `Regulator123!` |

Demo use only — not for production.

#### Supply-chain and consumer accounts (manual registration)

**Do not seed** manufacturer, distributor, retailer, or consumer accounts. Register them through the normal UI (**Register** → choose role → sign in), then open **Profile** and complete organization details (company name, description, location, website, logo).

This demonstrates real onboarding workflow and avoids hard-coding demo companies in the database.

See [GlowCare demo scenario](#glowcare-demo-scenario-documentation-only) below for suggested account details and product examples (documentation only — enter them yourself in the UI).

### Landing page video (local only)

Hero video is **not in GitHub** (>100 MB). Place `BackgroundVideo_LandingPage.mp4` in `fabric-frontend/Background_video/` and see `fabric-frontend/Background_video/README.md`.

---

## Full setup on a new laptop

For first-time installation on a clean machine.

### Prerequisites

- Docker Desktop (with WSL integration if using WSL)
- WSL Ubuntu or Linux
- Node.js 20+ (`nvm use` — see `.nvmrc`)
- PostgreSQL
- Hyperledger Fabric samples — [official install guide](https://hyperledger-fabric.readthedocs.io/en/latest/install.html)
- Git

Place `fabric-samples` inside `fabric-project/` (folder is gitignored).

### 1. Clone and install dependencies

```bash
git clone <your-repo-url> fabric-project
cd fabric-project
nvm use
cd fabric-api && npm install && cd ..
cd fabric-frontend && npm install && cd ..
```

### 2. Docker and Fabric network

```bash
docker ps
cd ~/fabric-project/fabric-samples/test-network

./network.sh down
./network.sh up createChannel -ca -c supplychannel

./network.sh deployCC \
  -c supplychannel \
  -ccn anticounterfeit \
  -ccp ../../anti-counterfeit-chaincode \
  -ccl javascript
```

### 3. Enroll Fabric wallet for API

```bash
cd ~/fabric-project/fabric-api
node enrollAdmin.js
```

Re-run after every fresh `./network.sh down`. Update TLS paths in `connection.json` if your project path differs — **verify based on local setup**.

### 4. PostgreSQL

```bash
sudo service postgresql start
```

```sql
CREATE DATABASE anti_counterfeit_db;
```

Edit `fabric-api/config/db.js`.

**Verify based on local setup:** The `products` table must exist before creating products. Other tables (`users`, `transfer_requests`, etc.) are created automatically on first API use. There is no `init-db.js` in this repo.

### 5. Environment and seed users

```bash
cd ~/fabric-project/fabric-api
cp .env.example .env
cd ~/fabric-project
node scripts/seed-demo-privileged-users.js
```

### 6. Run the app

Follow [Quick demo startup](#quick-demo-startup-on-my-laptop) (Steps 1–4).

---

## User roles

| Role | Focus | Main responsibility |
|------|--------|---------------------|
| **Manufacturer / brand** | Primary | Register skincare products, publish verified metadata, generate QR codes, protect brand trust |
| **Consumer** | Primary | Scan QR to verify authenticity, check expiry/ingredients/halal/allergy alerts, save to inventory |
| Distributor | Supporting | Traceability — accept transfers, update logistics locations |
| Retailer | Supporting | Traceability — retail custody, expiry watch, verify before sale |
| Regulator | Supporting | Governance — organization verification, metadata oversight |
| Admin | Supporting | Platform operation — users, API / DB / Fabric health |

Public registration: consumer, manufacturer, distributor, retailer.

---

## GlowCare demo scenario (documentation only)

The following is an **example evaluation narrative**. Accounts are registered manually through the UI; products are created manually while Fabric is running. Nothing below is seeded or hard-coded by the application.

### Suggested supply-chain accounts (register via UI)

| Role | Email | Password | Company name | Location |
|------|--------|----------|--------------|----------|
| Manufacturer | `glowcare.mfg@test.com` | `123456` | GlowCare Naturals Sdn. Bhd. | Shah Alam, Selangor, Malaysia |
| Distributor | `beautylink.dist@test.com` | `123456` | BeautyLink Distribution Sdn. Bhd. | Petaling Jaya, Selangor, Malaysia |
| Retailer | `glowmart.retail@test.com` | `123456` | GlowMart Retail Sdn. Bhd. | Kuala Lumpur, Malaysia |

After registration, sign in to each account and set **Profile → Organization** fields (description, website, logo) to match your demo story.

**Example organization descriptions (paste in Profile):**

- **GlowCare Naturals Sdn. Bhd.** — Malaysian SME skincare brand focused on transparent, safe, and consumer-friendly cosmetic products. Website: `https://www.glowcare-demo.com`
- **BeautyLink Distribution Sdn. Bhd.** — Skincare and cosmetics distributor supporting verified product movement between brands and retail partners. Website: `https://www.beautylink-demo.com`
- **GlowMart Retail Sdn. Bhd.** — Retail store for verified skincare and cosmetic products with consumer-facing authenticity support. Website: `https://www.glowmart-demo.com`

### Suggested demo products (create via manufacturer UI)

Create these while logged in as **GlowCare** with Fabric and the API running. Fill all metadata fields for best regulator/manufacturer completeness scores.

**1. GlowCare Vitamin C Brightening Serum**

| Field | Example value |
|-------|----------------|
| Product ID | `GC-VS-001` |
| Batch | `GC2026-VS-A1` |
| Expiry | `2027-06-30` |
| Halal status | `Halal` (dropdown: Halal, Non Halal, Vegeterian, Unknown, None) |
| Ingredients | Aqua, Ascorbic Acid 10%, Niacinamide, Hyaluronic Acid, Glycerin, Tocopherol, Phenoxyethanol |
| Allergy info | Contains fragrance. Patch test before full use. |
| Usage | Apply 2–3 drops to cleansed face morning and night. Use sunscreen during the day. |

**2. GlowCare Hydrating Face Moisturizer**

| Field | Example value |
|-------|----------------|
| Product ID | `GC-MC-002` |
| Batch | `GC2026-MC-B2` |
| Expiry | `2027-03-15` |
| Halal status | `Halal` (dropdown: Halal, Non Halal, Vegeterian, Unknown, None) |
| Ingredients | Aqua, Glycerin, Shea Butter, Ceramide NP, Hyaluronic Acid |
| Allergy info | Contains shea butter. |
| Usage | Apply after cleansing and serum. Use morning and night. |

**3. GlowCare Gentle Daily Sunscreen SPF50**

| Field | Example value |
|-------|----------------|
| Product ID | `GC-SS-003` |
| Batch | `GC2026-SS-C3` |
| Expiry | `2026-12-31` |
| Halal status | `Halal` (dropdown: Halal, Non Halal, Vegeterian, Unknown, None) |
| Ingredients | Aqua, Zinc Oxide, Titanium Dioxide, Glycerin, Aloe Vera Extract |
| Allergy info | Patch test before full use. |
| Usage | Apply evenly 15 minutes before sun exposure. Reapply every 2–3 hours. |

---

## Suggested demo flow (evaluation)

1. Show **manual registration** — supply-chain accounts created via UI (not seed scripts).
2. **Regulator** — verify **GlowCare** organization (and optionally BeautyLink / GlowMart).
3. **Manufacturer (GlowCare)** — create a product (e.g. `GC-VS-001`) with full skincare metadata + image.
4. Open **QR code** page and scan from phone (set `FRONTEND_URL` to LAN IP if needed).
5. **Consumer** — verify authenticity, review ingredients/expiry/halal, save to inventory.
6. **Tamper test** — change hash in QR URL → warning shown (detects tampered **links**, not physical label copying).
7. **Transfer** GlowCare → BeautyLink → GlowMart (accept at each step); show supply-chain history.
8. **Admin** — users and system status.

---

## API and npm scripts

| Service | Command | URL |
|---------|---------|-----|
| Backend | `cd fabric-api && npm start` | http://localhost:3000 |
| Health check | — | http://localhost:3000/health |
| Frontend | `cd fabric-frontend && nvm use 20 && npm run dev` | http://localhost:5173 |
| Frontend (LAN) | `npm run dev -- --host 0.0.0.0` | http://\<LAN-IP\>:5173 |

Backend has no `npm run dev` script in `package.json`.

---

## Chaincode

| Item | Value |
|------|--------|
| Channel | `supplychannel` |
| Chaincode name | `anticounterfeit` |
| Source | `anti-counterfeit-chaincode/antiCounterfeit.js` |

Functions used by the API include `createProduct`, transfer, location update, and history read (via `fabric-api/services/fabricService.js`).

---

## Troubleshooting

### Git push rejected — file over 100 MB

Keep `BackgroundVideo_LandingPage.mp4` local; it is in `.gitignore`.

### Fabric connection error

- `docker ps` shows `orderer.example.com`, `peer0.org1.example.com`, `peer0.org2.example.com`
- Redeploy chaincode from `fabric-samples/test-network/`
- `cd fabric-api && node enrollAdmin.js`
- Check `connection.json` paths and `grpcs://localhost:7051`

### CORS errors

Match browser origin to allowed dev origins. Use LAN IP in `FRONTEND_URL` when testing from a phone.

### Chaincode path wrong

From `test-network/`, use `../../anti-counterfeit-chaincode` — not `../chaincode/anticounterfeit`.

---

## Prototype limitations

- Local Fabric test network only (not production consortium)
- QR hash detects **tampered links**, not physical label copying
- Allergy / halal alerts are informational, not medical advice
- In-app notifications only (no email / SMS / native app)

---

## Evaluation notes

- Demonstrate from the configured laptop with all services running.
- Prepare a **backup demo video** if live Fabric or Docker fails during marking.
- Include hero video separately if required (not in git repository).

---

## Academic use

Final Year Project prototype for academic demonstration. Change all demo secrets and passwords before any real deployment.
