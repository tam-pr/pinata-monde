# Development guidelines

## Product

Piñata Monde sells custom piñatas. The digital MVP captures a quote request, estimates complexity and price, and (later) creates an Odoo CRM lead. Website and WhatsApp must share **one** quote pipeline.

## Stack (agreed)

| Layer | Choice |
| --- | --- |
| Frontend | Next.js App Router, TypeScript, Tailwind. One app: public site + later `/admin`. |
| Backend | FastAPI (Python), added in a later phase. Pricing lives in Python now. |
| Database | PostgreSQL (later). |
| Images | Local disk behind a storage interface (later). JPEG, PNG, WebP only. No HEIC in MVP. |
| CRM | Odoo `crm.lead` first. `ODOO_MOCK=true` until a sandbox exists. |
| WhatsApp | Cloud API later; mock/simulator first. Same quote pipeline as the website. |
| Classifier | Modular backends: mock, rules, external vision, custom model. **Mock first.** Do not commit to a vision vendor yet. |
| Admin auth | Later. Not in the current checkpoint. |

## Working incrementally

Implement one checkpoint at a time. Do not build Odoo, WhatsApp, AI, authentication, or deployment until that phase is approved.

## Pricing vs AI

The pricing engine **must not** import classifier internals. It receives `complexity_score` (1–5) plus size, quantity, deadline, and shipping, and returns `estimated_price`.

Complexity **storage** (later): `complexity_score`, `complexity_category`, `confidence`.

User-facing category mapping:

```text
1–2 → Simple
3   → Medium
4–5 → Complex
```

## Placeholder data

Any peso amounts, rush windows, or shipping fees in code must be clearly marked `PLACEHOLDER` until real rules are provided.

## Language

- Customer-facing copy: Spanish
- Code, comments, docs: English

## Images (when upload is wired)

- Types: JPEG, PNG, WebP
- Max file size and max count via env (`MAX_IMAGE_BYTES`, `MAX_IMAGES_PER_QUOTE`)
- Storage behind an interface so local disk can become cloud storage later

## Git

- Do not commit `.env`, `uploads/`, or secrets
- Do not invent real production prices
