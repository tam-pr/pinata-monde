# Architecture

Status: current MVP implementation includes the public quote flow, local image persistence, ML baseline/fallback, transparent pricing, owner review UI, and Odoo mock adapter.

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
         classifier adapter (baseline | mock | future vision | custom)
         pricing.estimate(...)
         storage adapter (local | later cloud)
         odoo adapter (mock | crm.lead | later quotations)
         whatsapp adapter (mock | Cloud API)
```

The public app is implemented with FastAPI, PostgreSQL/Alembic-compatible persistence, and local uploads. WhatsApp and authentication are later phases.

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

Classifier is a **backend** with a stable interface, e.g. `classify(images, description) -> {score, category, confidence, reason, model_version}`. The current baseline is deterministic and demonstrable, but is not trained vision inference. Missing/unavailable inputs use a bounded fallback. Do not hard-wire an external vision API.

## Pricing

Pure function, independent of AI code:

**Input (conceptual):** `size`, `quantity`, `deadline`, `shipping`, `complexity_score`

**Output:** suggested price plus base price, complexity multiplier, quantity, shipping, and rush breakdown.

Uses **PLACEHOLDER** constants until Piñata Monde provides real rules.

## Owner review and Odoo

New quotes are `pending_review`. `/admin` shows the reference, AI score/confidence/reason, and price breakdown. The owner can override complexity and final price. AI values remain immutable for audit/training feedback. Approval creates an Odoo lead through `services/odoo.py`; `ODOO_MOCK=true` yields an idempotent local fake lead.

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

## Admin

Focus on quote/CRM workflow, not cloning Odoo. Detail view:

Customer, source, reference image, request details, size, quantity, deadline, shipping, AI complexity, estimated price, Odoo lead ID, lead status.

Auth: single admin password / session — **not implemented yet**. `/admin` is for local/demo use only until auth is added.

## MVP vs later

**Demo needs:** public site, quote capture, baseline complexity, placeholder pricing, persistence, owner review, and Odoo mock or lead.

**Not for demo:** payments, inventory, custom Odoo modules, fine-tuned vision, S3, SSO, Facebook, HEIC.

## Phases

1. Customer site and quote API
2. Pricing engine + persistence
3. ML baseline / fallback
4. Owner review + Odoo mock
5. WhatsApp mock then Cloud API
6. Authentication and production admin hardening
7. End-to-end demo script
