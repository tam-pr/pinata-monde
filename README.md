# Piñata Monde — digital platform

Demo platform for custom piñata quotes: website (and later WhatsApp) → complexity estimate → price estimate → CRM lead → admin inbox.

This repository is a small monorepo. **Do not treat placeholder prices as real Piñata Monde tariffs.**

## Current checkpoint

| Piece | Status |
| --- | --- |
| Documentation | Yes |
| Frontend shell + quote form (no API) | Yes |
| Pricing engine + unit tests | Yes |
| Backend API, DB, AI, Odoo, WhatsApp, admin auth, deploy | Not started |

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

The form does **not** persist quotes yet. Submit shows a local confirmation only.

## Pricing engine

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m pytest
```

## Configuration

See `.env.example`. Integrations default to mocks (`ODOO_MOCK=true`, `WHATSAPP_MOCK=true`, `CLASSIFIER_BACKEND=mock`) when those phases are built.

## Docs

- `guidelines.md` — how we work in this repo
- `docs/architecture.md` — system design and MVP boundaries
