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

Provides a customer communication and quotation channel.

```text
Customer
   ↓
WhatsApp
   ↓
WhatsApp Business API
   ↓
FastAPI
   ↓
Odoo CRM
```

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

A Piñata Monde-branded interface for viewing relevant Odoo CRM/sales information.

The project should not attempt to recreate the entire Odoo ERP.

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
