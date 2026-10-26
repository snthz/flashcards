# Flashcards

An Anki-compatible spaced repetition app, built as an installable Progressive Web App. Import your existing `.apkg` decks, review them with the same scheduling algorithms Anki uses (classic SM-2 or FSRS), keep progress in sync across desktop and mobile, and track your learning with detailed statistics.

> The user interface is available in English (default) and Spanish.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Database Migrations](#database-migrations)
- [Docker](#docker)
- [Deployment (Dokploy)](#deployment-dokploy)
- [CI/CD](#cicd)
- [Exporting Decks from Anki](#exporting-decks-from-anki)
- [Exporting Decks to Anki](#exporting-decks-to-anki)
- [License](#license)

## Features

- **Anki import** — Reads `.apkg` packages in both the legacy format and the zstd-compressed format introduced in Anki 2.1.50+, including note types, templates, CSS, media, deck options, and each card's scheduling state.
- **Scheduling** — An Anki-style SM-2 scheduler (learning steps, ease, intervals, lapses, leeches) and FSRS via [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs), selectable per deck preset.
- **Deck management** — Hierarchical decks with subdecks, daily limits, option presets, and descriptions.
- **Study sessions** — Four answer buttons with predicted intervals, undo, bury, suspend, flag, audio playback, and keyboard shortcuts. Answers are scheduled on the device and synced in the background, so the next card appears instantly.
- **Offline study** — Today's cards for each deck (and their images and audio) are saved on the device while online. Without a connection the app keeps working from that copy, and the answers sync automatically when the connection returns. The server recomputes every answer with the same seed the device used, so both always agree.
- **Notes and browser** — A note editor with built-in Basic, Basic (and reversed card), Basic (type in the answer), and Cloze note types, plus a card browser with search, filters, and bulk actions. Typed answers are compared character by character, as in Anki.
- **Export** — Download a deck (with its subdecks) or the whole account as an Anki package (`.apkg`) with scheduling, review history and media, or as Anki's tab-separated plain text format. Exported packages open in Anki and can be imported back without creating duplicates.
- **Statistics** — Daily reviews, forecast, retention, streaks, a yearly activity heatmap, and card and interval distributions.
- **Accounts** — Database-backed persistent sessions, with configurable time zone and day rollover hour, and password reset by email (single-use links that expire after an hour and sign out every other device).
- **Languages** — English and Spanish, switchable from Settings or the landing page and saved to the account.
- **PWA** — Installable on iOS, Android, and desktop, with a service worker and an offline fallback page.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL with Prisma 7 |
| PWA | Serwist |
| Anki parsing | sql.js, fflate, fzstd |
| Scheduling | Custom SM-2 implementation, ts-fsrs |
| Testing | Vitest |

## Getting Started

### Prerequisites

- Node.js 24
- A PostgreSQL database

### Installation

```bash
cp .env.example .env    # then fill in the values
npm install
npx prisma migrate deploy
npm run dev
```

The app is then available at [http://localhost:3000](http://localhost:3000).

## Configuration

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Append `?schema=flashcards` to isolate the tables inside a shared database. |
| `SHADOW_DATABASE_URL` | Only required for `npm run db:diff`: an empty database where Prisma replays the migrations. Must use the same `?schema=` as `DATABASE_URL`. |
| `SESSION_SECRET` | A long random string used to sign session tokens. |
| `MEDIA_DIR` | Directory where imported images and audio files are stored. |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application. |
| `APP_URL` | Public URL used in emails, read at runtime. Falls back to `NEXT_PUBLIC_APP_URL`. Required in production for password reset links. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE` | SMTP server for outgoing email (password reset). `SMTP_SECURE=true` (or port 465) uses implicit TLS. Alternatively set `SMTP_URL` (for example `smtps://user:pass@smtp.example.com:465`). |
| `MAIL_FROM` | Sender address, for example `Flashcards <no-reply@example.com>`. Defaults to `SMTP_USER`. |

Without SMTP settings, development builds print password reset emails to the server log; production builds hide the "Forgot your password?" link.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run test` | Run the unit tests (scheduler, Anki parser, templates). |
| `npm run typecheck` | Generate Next.js route types and run `tsc`. |
| `npm run lint` | Run ESLint. |
| `npm run db:diff` | Generate SQL from changes to `prisma/schema.prisma`. |

## Database Migrations

To create a new migration after changing the schema (requires `SHADOW_DATABASE_URL` to point to an empty database with the same `?schema=`):

```bash
mkdir prisma/migrations/$(date +%Y%m%d%H%M%S)_migration_name
npm run db:diff > prisma/migrations/<folder>/migration.sql
npx prisma migrate deploy
```

CI runs `prisma migrate diff --exit-code` to verify that `prisma/migrations` and `prisma/schema.prisma` are in sync, so a missing migration is caught before it reaches production.

## Docker

The image uses a multi-stage build and runs from Next.js's `standalone` output. It does not bundle its own database; it connects to an existing PostgreSQL instance.

| Variable | Stage | Description |
| --- | --- | --- |
| `DATABASE_URL` | runtime | PostgreSQL connection string. Use `?schema=flashcards`. |
| `SESSION_SECRET` | runtime | Session signing secret. |
| `MEDIA_DIR` | runtime | Defaults to `/app/data/media` (mounted as a volume). |
| `SKIP_MIGRATIONS` | runtime | Set to `1` to skip `prisma migrate deploy` on startup. |
| `TZ` | runtime | Container time zone. |
| `APP_REVISION` | build | Revision reported by `/api/health` and used by the service worker. |
| `NEXT_PUBLIC_APP_URL` | build | `NEXT_PUBLIC_*` variables are inlined into the client bundle, so this must be passed as a `build-arg` rather than at runtime. |

On startup, the container runs `prisma migrate deploy` (using an isolated copy of the Prisma CLI in `/app/migrator`) and then `node server.js`. It exposes `/api/health`, which also serves as the image's `HEALTHCHECK`.

To test the image locally:

```bash
docker build --build-arg APP_REVISION=$(git rev-parse HEAD) -t flashcards:ci .
DATABASE_URL="postgresql://user:password@host.docker.internal:5432/database?schema=flashcards" \
  ./scripts/smoke-test.sh flashcards:ci
```

The smoke test starts the container, waits for `/api/health`, checks the public routes, and removes the container. CI runs the same script.

## Deployment (Dokploy)

GitHub Actions builds the image and publishes it to `ghcr.io/snthz/flashcards`; Dokploy only pulls it. Nothing is compiled on the server.

1. **GHCR package** — Make the package public at `https://github.com/users/snthz/packages/container/flashcards/settings`, or add `ghcr.io` under Dokploy → *Settings* → *Registry* with your username and a personal access token with the `read:packages` scope.
2. **Dokploy service** — Create a *Compose* service pointing to this repository (branch `main`, file `docker-compose.yml`).
3. **Environment variables** for the service:
   - `DATABASE_URL=postgresql://USER:PASSWORD@POSTGRES_SERVICE_NAME:5432/DATABASE?schema=flashcards`
   - `SESSION_SECRET` (for example, `openssl rand -base64 48`)
   - `FLASHCARDS_IMAGE=ghcr.io/snthz/flashcards:latest` (optional; pin a `sha-<commit>` tag to deploy a specific revision)
   - `TZ` (optional)
   - `APP_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and `MAIL_FROM` (optional; enable password reset emails)
4. **Domain** — Attach it to the `flashcards` service on port `3000`.
5. **Network** — The service joins `dokploy-network`, the existing network where Traefik runs.
6. **Webhook** — Copy the service's deployment webhook URL and store it as the `DOKPLOY_WEBHOOK_URL` repository secret.

The `flashcards` schema is created inside the existing database without affecting any other tables. Media files are stored in the `flashcards-media` volume.

## CI/CD

`.github/workflows/ci.yml` runs on every pull request and every push to `main`, with three sequential jobs:

| Job | Description |
| --- | --- |
| `verify` | Runs `npm run lint`, `npm run typecheck`, and `npm run test`, applies the migrations to a clean PostgreSQL instance, and checks with `prisma migrate diff --exit-code` that `prisma/migrations` and `prisma/schema.prisma` have not diverged. |
| `build` | Builds the image with the buildx cache, runs the smoke test, and publishes it to GHCR tagged `sha-<commit>` and `latest`. Pull requests are built and tested but not published. |
| `deploy` | `main` only: calls the Dokploy webhook and waits until `/api/health` reports the deployed commit. |

Required GitHub configuration:

| Name | Type | Purpose |
| --- | --- | --- |
| `DOKPLOY_WEBHOOK_URL` | Secret | Triggers the Dokploy deployment. |
| `NEXT_PUBLIC_APP_URL` | Variable | Public URL; inlined into the build and used to verify the deployment. |

No registry token is needed: the push to GHCR uses the workflow's built-in `GITHUB_TOKEN`.

To use the Dokploy API instead of the webhook, replace the *Trigger Dokploy deployment* step with:

```bash
curl -fsS -X POST "$DOKPLOY_URL/api/compose.deploy" \
  -H "x-api-key: $DOKPLOY_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"composeId\":\"$DOKPLOY_COMPOSE_ID\"}"
```

## Exporting Decks from Anki

In Anki, open the deck's gear menu → **Export**, choose **Anki Deck Package (\*.apkg)**, and enable **Include scheduling information** and **Include media**.

Re-importing the same deck updates existing notes and preserves the scheduling of cards that have already been studied.

## Exporting Decks to Anki

Open a deck and choose **Export**, or use **Settings → Backup** to export every deck. The `.apkg` package uses Anki's legacy collection format, which every Anki version can import. Notes keep a stable GUID, so importing a newer export into Anki (or back into this app) updates the existing notes instead of duplicating them.

## License

Released under the [MIT License](LICENSE).
