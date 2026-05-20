# VeriChain — Blockchain-Powered Product Authentication System

**Final Year Project** · Blockchain-Based Anti-Counterfeit and Smart Inventory Management using Hyperledger Fabric

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
```

| Fabric setting | Value in this project |
|----------------|------------------------|
| Channel | `supplychannel` |
| Chaincode name | `anticounterfeit` |

**Deploy chaincode only if needed** (first setup, after `./network.sh down`, or if create product / blockchain calls fail):

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
| Fabric / chaincode errors | Network not up or chaincode not deployed | Run `./network.sh up -c supplychannel` from `fabric-samples/test-network/`; redeploy chaincode if needed |
| `./network.sh: No such file` | Wrong folder | `cd ~/fabric-project/fabric-samples/test-network` first |
| Backend DB error | PostgreSQL stopped or wrong credentials | Start PostgreSQL; check `fabric-api/config/db.js` |
| `GET /health` fails | Backend not started | `cd fabric-api && npm start` |
| Phone QR opens wrong / fails | `localhost` in QR link | Set `FRONTEND_URL` to LAN IP; use `--host 0.0.0.0` for Vite |
| Frontend won’t start | Node version too old | `nvm use 20` in `fabric-frontend/` |
| Admin Fabric status error | Wallet or network issue | Re-run `node enrollAdmin.js` in `fabric-api/` after Fabric is up |

More detail: [Troubleshooting](#troubleshooting).

---

## Project overview

**VeriChain** combines:

- **Hyperledger Fabric** — on-chain product traceability (lifecycle, custody, history)
- **PostgreSQL** — off-chain application data (users, metadata, transfers, inventory, notifications)
- **React + Express** — web UI and REST API with JWT and role-based access

**Main features:** QR verification (with tampered-hash detection), supply-chain transfers, consumer inventory, expiry and safety alerts, regulator organization review, admin monitoring, feedback (Likert scale).

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

### Demo accounts (seed script)

Admin and regulator cannot self-register. From **repo root**:

```bash
node scripts/seed-demo-privileged-users.js
```

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@test.com` | `Admin123!` |
| Regulator | `regulator@test.com` | `Regulator123!` |

Demo use only — not for production.

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

| Role | Main responsibility |
|------|---------------------|
| Consumer | Verify products, inventory, expiry / safety alerts |
| Manufacturer | Create products, QR codes, transfers to distributors |
| Distributor | Accept transfers, update location, send to retailers |
| Retailer | Accept retail custody |
| Regulator | Approve or flag organizations |
| Admin | Users list, system health (API / DB / Fabric) |

Public registration: consumer, manufacturer, distributor, retailer.

---

## Suggested demo flow (evaluation)

1. Login or register as **manufacturer**.
2. **Create product** (metadata + image).
3. Open **QR code** page.
4. **Verify** product (browser or phone scan).
5. **Tamper test** — change hash in URL → warning shown.
6. **Transfer** manufacturer → distributor → retailer (accept at each step).
7. **Consumer** — verify, add to inventory, view alerts.
8. **Regulator** — organization review.
9. **Admin** — users and system status.

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
