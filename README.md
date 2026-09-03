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
