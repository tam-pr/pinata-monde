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

