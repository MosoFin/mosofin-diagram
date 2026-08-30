# Finance brief — Northline Coffee

Fixture for finance onboarding. Copy the field shape, not these facts.
This file is not renderer input.

- Entity: Northline Coffee LLC (one entity only)
- Method: accrual
- Audience: controller first; founder share-card second
- Proof: authored (no pinned extracts yet)
- Period default: 2026-07

## Systems

| System | Role | Source of truth for | Evidence |
| Shopify | commerce + CRM | orders, customers, tax collected, gift cards | describe |
| Stripe | payments | charges, fees, payouts, disputes | describe |
| QuickBooks | books | revenue, deposits, tax payable, P&L | describe |
| Chase 1002 | bank | settled operating cash | describe |

## Truth rules

- Orders originate in Shopify
- Cash lands in Chase via Stripe payout
- Revenue is recognized in QuickBooks (not the Shopify dashboard)
- DTC checkout is a sales receipt: QuickBooks has no AR unless wholesale invoices

## Default intent

Understand how money reaches the books (architecture)
