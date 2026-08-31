# Piñata Monde — digital platform

Demo platform for custom piñata quotes: website (and later WhatsApp) → complexity estimate → price estimate → CRM lead → admin inbox.

This repository is a small monorepo. **Do not treat placeholder prices as real Piñata Monde tariffs.**

## Current checkpoint

| Piece | Status |
| --- | --- |
| Documentation | Yes |
| Frontend shell + quote form | Yes |
| Pricing engine + unit tests | Yes |
| Quote API + PostgreSQL persistence | Yes |
| AI, Odoo, WhatsApp, admin auth, deploy | Not started |

## Layout

```text
frontend/   Next.js (marketing + quote UI)
backend/    Python (pricing engine first; API later)
ml/         Classifier backends (mock later; not wired yet)
docs/       Architecture and demo notes
```

## Prerequisites

- Node.js 20+
- Python 3.12+ (3.11 is fine)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Quote form: [http://localhost:3000/cotizar](http://localhost:3000/cotizar).

Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` before submitting a quote to
the API (see the configuration section below).

## Backend API and database

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Copy the repository example, then set DATABASE_URL to your local PostgreSQL database.
cp ../.env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

The backend is available at `http://localhost:8000`; health check:
`GET /health`. The quote endpoint accepts multipart form data at `POST /quotes`.
Uploaded JPEG, PNG, and WebP reference images are stored locally under
`backend/uploads/` and are ignored by git.

Run the backend tests with:

```bash
cd backend
source .venv/bin/activate
python -m pytest
```

For local PostgreSQL, create an empty database using your preferred PostgreSQL
installation, then set `DATABASE_URL` in `backend/.env`; Alembic creates the
tables with the command above. No manual table SQL is required.

## Configuration

See `.env.example`. Configure `DATABASE_URL`, `FRONTEND_ORIGIN`, and
`NEXT_PUBLIC_API_URL` for local development. Integrations default to mocks
(`ODOO_MOCK=true`, `WHATSAPP_MOCK=true`, `CLASSIFIER_BACKEND=mock`) when those
phases are built.

## Docs

- `guidelines.md` — how we work in this repo
- `docs/architecture.md` — system design and MVP boundaries
