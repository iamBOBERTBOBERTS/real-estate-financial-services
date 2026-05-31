# Backend Migration Plan

## Recommended Backend Options

1. Supabase
2. Firebase
3. Custom Node/Express + Postgres
4. Local-first encrypted sync later

## Recommended First Production Backend

Use Supabase first.

Reason: Supabase gives the project authentication, Postgres, row-level security, storage, and audit-friendly data models without forcing the team to build every backend service from scratch.

## Tables Needed

- users
- organizations
- organization_members
- buyers
- scan_results
- consent_records
- tasks
- lenders
- partners
- assistance_programs
- handoff_events
- outcomes
- packet_exports
- audit_logs

## Security Requirements

- authentication required
- role-based access control
- row-level security
- encrypted storage for sensitive files if documents are added later
- audit logs for reads, edits, exports, and shares
- no SSNs in v1
- no full credit reports in v1
- no document upload until secure storage is implemented

## Migration Path

1. Keep the current `LocalStorageAdapter` as demo mode.
2. Create a `SupabaseAdapter` with the same function names as `storage.js`.
3. Move buyer records into the `buyers` table.
4. Move scan output into `scan_results`.
5. Move consent fields into `consent_records`.
6. Move handoff and outcome changes into event-style tables.
7. Store every export, share, edit, and role change in `audit_logs`.
8. Add row-level security policies by organization, role, and explicit buyer sharing.
9. Add secure file storage only after legal/compliance review.

## V1 Data Safety Boundaries

The production v1 should stay focused on estimates, categories, statuses, consent, workflow, handoff, and outcome tracking.

Do not collect:

- SSNs
- full credit reports
- bank account numbers
- identity documents
- tax returns
- paystubs

Those can be handled later only after secure storage, retention policy, access logging, and compliance review are in place.
