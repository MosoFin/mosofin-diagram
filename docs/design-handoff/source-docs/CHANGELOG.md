# Changelog

All notable changes to Mosofin are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

Development identity: `v1.0.0-dev.0`

- Brand catalogue grew to 111 marks: added QuickBooks, Intuit, Gusto and Chase (official Simple Icons
  vectors), closing the ledger/payroll/bank gap the design handoff flagged — a money map's QuickBooks
  node no longer renders bare.
- Repositioned the skill: Mosofin now helps a business outline how it actually runs — the whole
  operating stack — not only its finances. New `references/business-onboarding.md` contract with a
  16-domain catalog (CRM, commerce, supply chain, inventory, manufacturing, fulfilment, support,
  payments, bank, spend/AP, payroll/HR, books, data/BI, compliance, marketing, product),
  `BUSINESS-BRIEF.md`, and `examples/business-brief.md`. A finance brief counts as a partial
  business brief; `finance-onboarding.md` stays authoritative wherever numbers must tie out.
- Three business recipes (22 total): `business-operating-map` (architecture), `business-handoffs`
  (workflow), `business-order-journey` (sequence). An unrouted question now falls back to the
  business operating map.
- New proof `business-operating-map`: a whole-business map across three entities — demand, supply
  chain, inventory, commerce, payments, spend, payroll, bank and three separate ledgers. Gallery is
  now 9 artifacts / 81 checks.
- Renamed the GitHub repository to `mosofin-diagram` (`MosoFin/mosofin-diagram`).
- Finance-only proof gallery: eight Northline Coffee artifacts (`examples/northline-*.json`), one per
  finance recipe, replace the eleven engineering proofs; every recipe's `proof` now points at a
  finance artifact and the landing hero embeds the close, money map, and order path.
- Sample diagrams: delivered HTML for all eight recipes in `docs/samples/` with full-page light and
  dark screenshots in `docs/samples/images/`, linked from the README and `docs/USE-CASE.md`.
- Design handoff package `docs/design-handoff/` (built by `scripts/build-design-handoff.mjs`): inventory
  of every inherited visual component with verified source references, verbatim source docs, tokens
  and i18n (en + zh) extracted from source, all 13 sigils and 107 brand marks, viewer-chrome and
  share-card captures, and a proposed finance redesign for Claude Design.
- Copy fixes: gallery heading now reads "Eight finance stories" in every copy; guide library title says
  nineteen starting points (en + zh).
- Mosofin forked from Archify (MIT) and rebranded as a finance-first diagram skill.
- Finance onboarding contract (`references/finance-onboarding.md`) and `FINANCE-BRIEF.md` fixture.
- Eight finance scenario recipes: money map, order path, revenue walk, month-end close,
  dispute lifecycle, payout reconciliation, customer A/R, cash runway.
- Sample use case: Northline Coffee money map (`docs/USE-CASE.md`, `docs/samples/`).
- Removed upstream research notes, experiments, benchmarks, and the DeepSeek harness integration.
