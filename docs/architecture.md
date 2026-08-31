# Architecture

Status: agreed for MVP. Implementation is phased. Current code covers the **frontend shell**, **quote UI (unpersisted)**, and **pricing engine tests** only.

## Demo flow

```text
Customer
   ↓
Website / WhatsApp
   ↓
Quote
   ↓
AI complexity estimate (score 1–5 + category + confidence)
   ↓
Price estimate (independent engine)
   ↓
Odoo CRM lead (crm.lead)
   ↓
Admin dashboard
```

Website and WhatsApp are **sources** on the same quote record. There is no separate WhatsApp quotation model.

## Runtime shape (target)

```text
Next.js  →  FastAPI  →  PostgreSQL
                ↓
         classifier adapter (mock | rules | vision | custom)
         pricing.estimate(...)
         storage adapter (local | later cloud)
         odoo adapter (mock | crm.lead | later quotations)
         whatsapp adapter (mock | Cloud API)
```

FastAPI, Postgres, and adapters are **not** in the current checkpoint.

## Complexity

Internal score is always **1–5**. Persist:

- `complexity_score`
- `complexity_category` (`simple` | `medium` | `complex`)
- `confidence`

Mapping:

| Score | Category |
| --- | --- |
| 1–2 | Simple |
| 3 | Medium |
| 4–5 | Complex |

Classifier is a **backend** with a stable interface, e.g. `classify(images, description) -> {score, category, confidence, reasons}`. Initial backend: **mock**. Do not hard-wire an external vision API.

## Pricing

Pure function, independent of AI code:

**Input (conceptual):** `size`, `quantity`, `deadline`, `shipping`, `complexity_score`

**Output:** `estimated_price`

Uses **PLACEHOLDER** constants until Piñata Monde provides real rules.

## Odoo (later)

- Default `ODOO_MOCK=true`
- First live object: **`crm.lead`**
- Lead should include / refer to: customer, contact, quote id, estimated price, complexity, request description, image/reference info, source (`website` | `whatsapp`)
- Adapter should allow quotations/orders later without rewriting quote logic

## WhatsApp (later)

- Mock/simulator during development
- Inbound text/image must call the **same** quote + classify + price + Odoo path as `POST /quotes`

## Images (later)

- Local `uploads/` for MVP
- `Storage` interface: `save(file) -> ref`, `url(ref)`, replaceable with cloud
- Validate JPEG/PNG/WebP, max bytes, max count; HEIC deferred

## Admin (later)

Focus on quote/CRM workflow, not cloning Odoo. Detail view:

Customer, source, reference image, request details, size, quantity, deadline, shipping, AI complexity, estimated price, Odoo lead ID, lead status.

Auth: single admin password / session — **not implemented yet**.

## MVP vs later

**Demo needs:** public site, quote capture, complexity (mock OK), placeholder pricing, persist + admin (later phases), Odoo mock or lead, WhatsApp mock or real webhook.

**Not for demo:** payments, inventory, custom Odoo modules, fine-tuned vision, S3, SSO, Facebook, HEIC.

## Phases

1. Customer site (this checkpoint)
2. Quote UI (basic form in this checkpoint; persist later)
3. Pricing engine (this checkpoint)
4. Backend API + Postgres + local storage
5. Classifier adapter (mock first)
6. Odoo `crm.lead`
7. WhatsApp mock then Cloud API
8. Admin dashboard
9. End-to-end demo script
