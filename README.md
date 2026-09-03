# pinata-monde
# Piñata Monde Digital Platform

A modern redesign of the Piñata Monde website focused on improving the customer quotation process and connecting customer interactions with Odoo CRM.

## Project Goal

Transform the current Piñata Monde website into a digital sales platform where customers can:

* Browse Piñata Monde products
* Request custom piñatas
* Upload a reference/inspiration image
* Estimate the price of a custom design
* Receive an AI-assisted design complexity estimate
* Continue the quotation process through WhatsApp

The business should be able to:

* Receive customer inquiries through the website and WhatsApp
* Automatically create/manage leads in Odoo CRM
* View quotation information and customer requests
* View reference images associated with leads
* Manage relevant CRM information through a Piñata Monde-branded admin interface

## Current quote flow

The implemented MVP flow is: website quote → PostgreSQL + local reference images → complexity suggestion → transparent Python price suggestion → owner review at `/admin` → Odoo CRM lead.

From the quote result, the customer can also click "Ordenar por WhatsApp": this opens a pre-filled `wa.me` chat (no WhatsApp Business API) and tags the *same* quote's source as WhatsApp — it never creates a new quote or an Odoo lead by itself. The lead is still only created once, on owner approval, same as any other quote; it just carries `Source: WhatsApp` instead of `Source: Website`.

The AI only estimates image-design complexity. It does **not** approve a quote or determine the final price. Every new quote is `pending_review`; the owner can adjust complexity and/or final MXN price before approving it. The original AI score, confidence, reason, and model version are retained for future feedback/training.

Pricing parameters are deliberately centralized at the top of `backend/app/services/pricing.py`, labeled as `REAL BUSINESS DATA`, `MARKET CALIBRATION`, or `TODO / PLACEHOLDER`. Odoo runs in idempotent local mock mode by default (`ODOO_MOCK=true`); real mode requires environment-provided credentials.

## Pricing Configuration

* **Pricing parameters** (sizes/dimensions, shipping fee, stick fee, Express window, complexity multipliers, and `FINAL_PRICE_ROUNDING`) live in one place: [`backend/app/services/pricing.py`](backend/app/services/pricing.py). Each value is labeled `REAL BUSINESS DATA` (confirmed by the owner), `MARKET CALIBRATION` (derived from a confirmed anchor point), or `TODO / PLACEHOLDER` (not yet provided — do not treat as final).
* **ML complexity-prediction parameters** (model version, categories, baseline scoring) live in [`backend/app/services/complexity.py`](backend/app/services/complexity.py). The `ml/` directory only holds documentation; the executable adapter is in `backend/app/services/`. AI only predicts complexity 1–5 and never sets or influences the final price.
* `FINAL_PRICE_ROUNDING` (in `pricing.py`) controls upward rounding of the final customer-facing price: the price is always a whole integer, rounded UP to the next multiple of this value (e.g. with `FINAL_PRICE_ROUNDING = 5`, 701 → 705, 709 → 710).

## Core Architecture

```text
                         CUSTOMER
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
          WEBSITE                      WHATSAPP
              │                           │
              └─────────────┬─────────────┘
                            ▼
                         FASTAPI
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
             AI        PRICE ENGINE      ODOO
              │                           │
              ▼                           ▼
        COMPLEXITY                    CRM / SALES
                                          │
                                          ▼
                                   ADMIN DASHBOARD
```

## Main Components

### Frontend

Customer-facing website and Piñata Monde admin interface.

**Technologies:**

* Next.js
* React
* Tailwind CSS

### Backend

API and integration layer between the frontend, AI system, WhatsApp, and Odoo.

**Technologies:**

* Python
* FastAPI
* Pydantic

### Database

Application-specific persistent data.

**Technology:**

* PostgreSQL

Odoo remains the source of truth for CRM and business operations.

### AI

Estimates the manufacturing/design complexity of a customer's reference image.

**Initial approach:**

```text
Reference Image
      ↓
Pretrained Vision Model
      ↓
Image Embedding
      ↓
Logistic Regression
      ↓
Simple / Medium / Complex
```

The AI does not determine the final price.

### Pricing Engine

Combines business-defined inputs:

```text
Size
+ Quantity
+ Design Complexity
+ Deadline / Timeframe
+ Shipping
↓
Estimated Price
```

### WhatsApp

Implemented as a plain `wa.me` click-to-chat link — deliberately **not** the WhatsApp Business API (no webhooks, no incoming-message handling, no Meta app).

```text
Customer clicks "Ordenar por WhatsApp"
   ↓
wa.me link opens (pre-filled message) — client-side only
   ↓
POST /quotes/{id}/whatsapp-click — tags the existing quote's source, no new quote
   ↓
(same as any quote) owner approves at /admin
   ↓
Odoo CRM lead, Source: WhatsApp
```

The number is `CONTACT.phoneHref` in [`frontend/lib/nav.ts`](frontend/lib/nav.ts) — the single place to update it; nothing else to configure, no backend env vars.

### Odoo

Used for:

* CRM leads
* Customers
* Opportunities
* Quotations
* Orders
* Products
* Inventory

The adapter lives in [`backend/app/services/odoo.py`](backend/app/services/odoo.py). Both lead creation and the read-only connectivity check use Odoo's **JSON-2 API** (`POST {ODOO_URL}/json/2/{model}/{method}`, bearer-token auth):

* **Lead creation** (`create_crm_lead`) — called from `/admin`'s "Aprobar y enviar a Odoo" action, only after owner approval. `ODOO_MOCK=true` (the default) returns a local mock lead and never contacts Odoo. `ODOO_MOCK=false` creates one real `crm.lead` record via JSON-2. It is idempotent: `review_quote` only calls it when the quote has no `odoo_lead_id` yet, so approving the same quote twice never creates a second lead — the second call just returns the already-saved lead. If Odoo is unreachable or rejects the request, the quote's approval (owner complexity + price) is still committed first, so the quote is never lost and the lead creation can be retried by approving again.
* **Read-only connectivity check** (`check_connection_read_only`) — verifies the connection and reads CRM data. It is independent of `ODOO_MOCK`, so real read access can be checked while lead creation stays mocked. It only ever calls read/inspection ORM methods — `context_get`, `check_access_rights`, `search_read`, `fields_get` — and never creates, writes, deletes, or archives anything.

Required environment variables (in `backend/.env`, never committed):

| Variable | Notes |
| --- | --- |
| `ODOO_MOCK` | `true` (default) = local mock lead, no network call; `false` = real JSON-2 lead creation |
| `ODOO_URL` | e.g. `https://your-instance.odoo.com` |
| `ODOO_DATABASE` | only required for multi-database instances |
| `ODOO_API_KEY` | generate in Odoo under *Preferences > Account Security > New API Key*; put it in `backend/.env` as `ODOO_API_KEY=...` — never in code, README, or committed files |

Tests: `backend/tests/test_odoo_connection.py` is **READ-ONLY** (calls only inspection/read ORM methods). `backend/tests/test_odoo_lead_creation.py` covers mock creation, idempotent duplicate approval, and Odoo-failure handling always; the real-Odoo creation case additionally skips automatically unless `ODOO_URL` and `ODOO_API_KEY` are set, so it never touches a real Odoo database by accident.

### Admin Portal

A Piñata Monde-branded interface (`/admin`) for reviewing and approving quotes, plus the relevant Odoo CRM/sales information for each one. Quotes can be searched (name, email, phone, folio, or design), archived, and soft-deleted — a deleted quote sits in a 3-day-recoverable trash before it (and its reference images) are permanently removed; the 3-day expiry is enforced server-side, not by a frontend timer.

The project should not attempt to recreate the entire Odoo ERP.

## Running Locally

Requires Python 3.11+, Node.js 20+, and a running PostgreSQL instance.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `backend/.env` and set at least `DATABASE_URL`. To use `/admin`, also set `ADMIN_USERNAME` / `ADMIN_PASSWORD` there — the backend seeds that one admin user on startup (see [`backend/app/auth.py`](backend/app/auth.py)). Leaving them unset keeps `/admin` locked.

```bash
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Runs at `http://127.0.0.1:8000` (health check: `/health`).

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Use `localhost`, not `127.0.0.1` — the `/admin` session cookie is `SameSite=Lax`, and browsers treat those as different sites, which silently drops the cookie.

```bash
npm run dev
```

Runs at `http://localhost:3000`. Log in at `/admin/login` with the `ADMIN_USERNAME` / `ADMIN_PASSWORD` you set above.

### Sharing your local instance (ngrok)

Tunneling only port 3000 is not enough: `/cotizar` and `/admin` call the backend directly from the *browser*, so if `NEXT_PUBLIC_API_URL` still points at `localhost:8000`, that request tries to reach the visitor's own machine, not yours, and silently fails. The backend needs to be reachable too.

This needs an ngrok authtoken configured once via `ngrok config add-authtoken YOUR_TOKEN` (from [dashboard.ngrok.com](https://dashboard.ngrok.com/get-started/your-authtoken)) — it's stored in ngrok's own config (`~/Library/Application Support/ngrok/ngrok.yml` on macOS), never in this repo.

**Most ngrok accounts (including the free tier) only get one public hostname at a time.** Starting a second `ngrok http` tunnel on such an account fails with `ERR_NGROK_334` ("endpoint already online") — the account has one hostname and every tunnel without an explicit different one competes for it. So there are two setups below: use the first unless you know you have two available public hostnames (e.g. a paid plan, or two reserved domains).

#### Option A — one tunnel, proxied backend (works on any plan)

Tunnel only the frontend. Next.js itself forwards `/api/*` server-side to your local backend (`frontend/next.config.ts`), so the browser only ever talks to the one public URL — no second hostname needed, and CORS doesn't even come into it (same-origin from the browser's point of view).

```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=https://<your-frontend-ngrok-domain>
```

`NEXT_PUBLIC_SITE_URL` only affects link previews (e.g. WhatsApp) — set it once you know the printed URL below (see next step), then restart. Without it, a shared link's preview image will fail to load, since it'd resolve to `localhost`.

Restart `next dev` (Next.js inlines `NEXT_PUBLIC_*` vars at server start), then:

```bash
ngrok http 3000
```

That's it — the printed `https://...ngrok-free.app` URL now serves a fully working `/cotizar` and `/admin`, reaching your local backend and Postgres through the proxy.

#### Option B — two tunnels, direct backend calls (needs two public hostnames)

If your account/plan can hold two simultaneous public hostnames, add both to `ngrok.yml`:

```yaml
version: "3"
agent:
    authtoken: YOUR_TOKEN
tunnels:
    frontend:
        proto: http
        addr: 3000
    backend:
        proto: http
        addr: 8000
```

```bash
ngrok start --all
```

Then point the frontend straight at the backend's public URL (restart `next dev` after changing this):

```
NEXT_PUBLIC_API_URL=https://<your-backend-ngrok-domain>
```

...and allow the frontend's public URL in the backend's CORS config (restart `uvicorn` after changing this):

```
FRONTEND_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,https://<your-frontend-ngrok-domain>
```

Either option's URLs are random and change on every ngrok restart unless you reserve a static domain on the ngrok dashboard — after any restart, re-check the printed URL(s) and update the env vars above to match.

## Repository Structure

```text
pinata-monde/
│
├── README.md
├── guidelines.md
├── .gitignore
├── .env.example
│
├── docs/
│   └── architecture.md
│
├── frontend/
├── backend/
└── ml/
```

## Development Priority

1. Customer-facing website
2. Quote/price estimator
3. Backend API
4. AI complexity classifier
5. Odoo integration
6. WhatsApp integration
7. Admin dashboard
8. End-to-end demo

## Project Scope

This is primarily a functional demonstration/prototype.

Prioritize:

* Working end-to-end flows
* Good UX/UI
* Reliable demonstrations
* Simple architecture
* Clear separation of responsibilities

Do not introduce enterprise-level infrastructure unless it is necessary.
