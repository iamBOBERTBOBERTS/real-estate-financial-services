# Repo Audit Report

Date: 2026-05-31

## Executive Summary

ApprovalPath OS now has two clear product surfaces:

- **Buyer Portal:** the polished user-facing frontend for safe intake, file status, next action, and safety expectations.
- **Admin Workspace:** the internal backend-style operating console for buyer files, lead import, scan review, lender routing, handoff, outcomes, consent, audit logs, backup, and role controls.

The app remains a local proof-of-concept, but it is now structured much closer to a real product: local storage is abstracted, browser tests exist, and the user/admin split is visible in the interface.

## Repo Structure Reviewed

- `app/`: static app, storage adapter, styles, browser entrypoint
- `scripts/`: lead import and smoke testing
- `tests/`: Playwright browser smoke tests
- `operations/`: business operations specs and templates
- `compliance/`: consent and compliance review drafts
- `data/`: lead, lender, partner, and matrix CSV/JSON assets
- root docs: business basis, model blueprint, roadmap, backend migration, user guide, README

## Admin Workspace Audit

Implemented and verified:

- Admin navigation and role selector
- Buyer pipeline dashboard
- lead list import
- single buyer intake
- Impossible File Scan
- editable scan answers
- hard-file review
- lender lane matching
- partner packet export/copy/print
- handoff tracking
- outcome tracking
- partner visibility controls
- structured consent controls
- audit logs
- backup export/import
- role-based action restrictions

Admin-side risks to address before production:

- Authentication is still demo-only.
- Role permissions are local UI controls, not server-enforced.
- LocalStorage is not secure storage for real buyer data.
- Audit logs can be modified by anyone with browser storage access.
- Backup JSON files can contain sensitive buyer information and need secure storage policy.

## Buyer Portal Audit

Implemented and verified:

- Buyer-facing first screen
- clear status summary
- safe intake form
- file progress preview
- next-action and follow-up display
- plain-language safety boundaries
- no document upload
- no SSN/full credit report/bank account collection
- no approval, rate, payment, or APR claims
- submitted portal intake appears in the Admin Workspace

Frontend risks to address next:

- Buyer identity/login is not real yet.
- Buyer status is demo/local and should eventually be scoped to authenticated buyer access.
- No secure messaging yet.
- No production consent/e-sign flow yet.

## Storage and Backend Readiness

Implemented:

- `app/storage.js` provides a LocalStorage adapter layer.
- App code uses storage functions instead of direct localStorage access, except inside the adapter.
- `BACKEND_MIGRATION_PLAN.md` defines a Supabase-first migration path.

Next hardening step:

- Implement a Supabase adapter with row-level security and server-side audit logging.

## Testing Audit

Current checks:

- `npm run check`
- `npm run smoke-test`
- `npm run test:e2e`
- `npm run verify`

Browser coverage now verifies:

- Buyer Portal renders first
- Admin Workspace renders separately
- core admin workflow sections exist
- restricted roles cannot export partner packets
- buyer portal intake creates an admin-visible file

## Compliance Language Audit

The app avoids new unsafe claims in the active interface:

- no approval promises
- no rate quotes
- no payment quotes
- no APR calculations
- no system-level loan decision language

Existing unsafe phrases appear only in specs as examples of language to avoid.

## Recommended Next Pass

1. Add Supabase authentication and database tables.
2. Move audit logs server-side.
3. Add authenticated buyer portal access.
4. Add secure partner/lender/counselor limited-view portals.
5. Add encrypted document storage only after policy and compliance review.
6. Add visual regression screenshots for buyer and admin surfaces.
