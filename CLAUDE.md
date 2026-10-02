# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

IntraTEL (a.k.a. "Didactic-Tel") is a gamified learning platform for Telematics Engineering students (UTFSM). It is a React SPA plus an Express/SQLite API. Docs and UI strings are in Spanish. Games award "flags" (points) and track per-user progress.

## Commands

```bash
npm install
npm run dev:full        # API (node --watch, :3001) + Vite (:5173) together
npm run dev             # frontend only (Vite proxies /api -> http://localhost:3001)
npm run server          # API only (also `npm start`); server:dev adds --watch
npm run build           # vite build -> dist/
npm run lint            # eslint .
npm test                # jest (all)
npm run test:frontend   # jest tests/frontend
npm run test:backend    # jest tests/backend
npx jest tests/backend/auth.test.js            # single file
npx jest tests/backend/auth.test.js -t "name"  # single test
npm run test:e2e        # cypress run
```

Default admin (auto-created on first server start by `server/scripts/createAdmin.js`): `admin@intratel.com` / `admin123`.

## Architecture

**Frontend (`src/`)** — Vite + React 19 + react-router-dom 7. Routes are declared in `src/main.jsx` with `createBrowserRouter`; most are wrapped in `ProtectedRoute` (optionally `requiredRole="admin"`). `src/App.jsx` is the shared layout (navbar, `TelixBot` assistant, `FlagSubmitter`). Global state lives in three contexts: `AuthContext` (JWT), `DataContext` (cached data/refresh), `ThemeContext`. `src/config/environment.js` hardcodes `API_BASE_URL: '/api'`, so the frontend always calls relative `/api` — in dev via the Vite proxy, in prod via nginx (`/root/nginx/*.conf` hold the reverse-proxy configs).

**Games (`src/components/Games/`)** — each game is self-contained in its own folder: `Gestion` (NetworkManager), `Software` (CSSCodeGame), `Network`, `Teleco` (Espectro), `NandGame`, `Ajedrez` (chess vs. ONNX models via `onnxruntime-web`, see `chessAgent.js`/`boardEncoder.js`). Games report progress and flags through the API.

**Backend (`server/`)** — ESM Express app, `server/server.js` entry. Layering: `routes/` -> `controllers/` -> `models/` -> `config/database.js` (a singleton wrapper over `sqlite3` that creates tables in `initializeTables()` on startup — schema changes go there, there is no migration tool). Auth is JWT via `middleware/auth.js` (`authenticateToken`, `requireRole`). The DB file is `server/data/intratel.db` (path is hardcoded in `database.js`; `DB_PATH` in `.env.example` is not read). `server/scripts/` has one-off admin/flag seeding utilities (`banderas.json` is the flag catalogue).

Things that are non-obvious:
- **Groups are disabled**: `/api/groups` is commented out in `server.js`, though `GroupController`, `Group` model, tables, and `requireGroupMembership` still exist (and `/api/games/progress/group/:groupId` still references it).
- **Achievements are in-memory** (`models/AchievementsStore.js`) and reset on server restart; progress and flags are persisted in SQLite.
- `dotenv` is a dependency but the server does not import it; env vars (`PORT`, `CORS_ORIGINS`, `NODE_ENV`) must come from the real environment. CORS allows all origins when `CORS_ORIGINS` is empty.
- `server/server.js` calls `app.listen` on import, which matters when testing it with supertest.

## Testing

Jest runs in `jsdom` with babel-jest (`jest.config.js`, `babel.config.js`); only files under `tests/**` matching `*.test|spec.(js|jsx)` run. `tests/setup.js` mocks `console.*`, starts an MSW server (`tests/utils/mocks`) with `onUnhandledRequest: 'error'`, so any new frontend request needs an MSW handler. NandGame also has tests under `src/components/Games/NandGame/test`, which jest does not pick up.

## Deployment

Production runs as a single container (`Dockerfile`: Debian build stage for Vite, Alpine runtime with only `server/`, the server's `node_modules` and `dist/`). The VPS never builds: `.github/workflows/deploy.yml` builds the image in GitHub Actions, smoke-tests it, pushes `ghcr.io/yohannsj/intratel:sha-<commit>`, and (only on `main`) SSHes into the VPS to run `/usr/local/bin/deploy-intratel sha-<commit>`. Pushes to `build/**` branches build and push an image but never deploy. Do not push to `main` casually.

- `package.json` `dependencies` must contain **only what `server/` imports**; anything bundled by Vite (react, recharts, onnxruntime-web, ...) goes in `devDependencies`. The runtime image is installed with `npm ci --omit=dev --omit=optional`, and CI fails if the image exceeds 300 MB.
- `deploy/deploy-intratel` and `deploy/docker-compose.yml` are the sources of `/usr/local/bin/deploy-intratel` and `/srv/projects/intratel/docker-compose.yml` on the VPS; they are installed by hand when changed, not by CI.
- The deploy script backs up the SQLite DB (`/srv/projects/intratel/backups`, last 10), pulls the image, brings the container up on `127.0.0.1:3001`, rolls back to the previous image if `/api/health` fails, then copies `dist/` out of the image to `/var/www/intratel` (host nginx serves static files and proxies `/api`) and removes old images.
- The DB lives on the host at `/srv/projects/intratel/data/intratel.db`, bind-mounted to `/app/server/data`. The container runs as uid 1000 with a read-only root filesystem, so the server can only write there and in `/tmp`.
- Operator scripts run inside the container: `docker compose -f /srv/projects/intratel/docker-compose.yml exec api node server/scripts/<script>.js`. Logs: `docker compose -f ... logs api`.
