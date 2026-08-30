# Business brief — Northline Coffee Group

Fixture for business onboarding. Copy the field shape, not these facts.
This file is not renderer input.

- Business: DTC + wholesale coffee roaster; sells online, in two cafés, and to
  grocery accounts on net-30 terms
- Entities: Northline Coffee LLC (roastery + DTC), Northline Cafés LLC (retail),
  Northline Wholesale LLC (grocery)
- Audience: founder and operations lead; controller reviews the books lane
- Evidence: describe
- As of: 2026-07

## Systems

| Domain | System of record | Owns | Shared or per-entity |
| Demand / CRM | HubSpot | wholesale leads, accounts, pipeline | shared |
| Commerce | Shopify | DTC orders, customers, tax collected | shared |
| Supply chain | NetSuite | purchase orders, green coffee cost, BOM | shared |
| Inventory / 3PL | NetSuite WMS + 3PL | units on hand, receipts, shipments | shared |
| Payments | Stripe | charges, fees, payouts, disputes | shared |
| Spend / AP | Ramp | vendor bills, cards, approvals | shared |
| Payroll / HR | Gusto | wages, payroll taxes, headcount | per-entity |
| Bank | Chase (one account per entity) | settled cash | per-entity |
| Books | QuickBooks (one company per entity) | revenue, AP, P&L, tax payable | per-entity |
| Data / BI | Metabase on a warehouse | reporting, unit economics | shared |

## Truth rules

- Wholesale accounts originate in HubSpot; DTC customers originate in Shopify
- Purchase orders and landed cost originate in NetSuite
- Cash lands in the entity's Chase account via Stripe payout or wholesale ACH
- Revenue is recognized in that entity's QuickBooks, not the Shopify dashboard
- Books are per entity: three QuickBooks companies, never consolidated in a map
- The operating stack (CRM, commerce, ERP, WMS, payments, spend) is one shared
  instance serving all three entities

## Default intent

How does the whole business run, end to end (architecture)
