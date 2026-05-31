# Real Estate Financial Services

Project workspace for real estate financial services planning, analysis, and implementation.

## Start Here

For non-technical users, open [START_HERE.html](START_HERE.html), then click **Open the Tool**.

Simple user guide: [ApprovalPath OS Simple User Guide](USER_GUIDE_NONTECHNICAL.md)

## Core Documents

- [Business Model Basis](BUSINESS_MODEL_BASIS.md)
- [Model and Design Blueprint](MODEL_AND_DESIGN_BLUEPRINT.md)
- [Roadmap Execution](ROADMAP_EXECUTION.md)
- [Product Backlog](PRODUCT_BACKLOG.md)
- [Operating Guide](OPERATING_GUIDE.md)
- [Backend Migration Plan](BACKEND_MIGRATION_PLAN.md)
- [Repo Audit Report](REPO_AUDIT_REPORT.md)

## Operating Assets

- [Launch Checklist](operations/LAUNCH_CHECKLIST.md)
- [Pilot Operating Manual](operations/PILOT_OPERATING_MANUAL.md)
- [Borrower Intake Template](operations/BORROWER_INTAKE_TEMPLATE.md)
- [Denial Reason Taxonomy](operations/DENIAL_REASON_TAXONOMY.md)
- [Scoring Model](operations/SCORING_MODEL.md)
- [Consent and Disclosure Draft](compliance/CONSENT_AND_DISCLOSURE_DRAFT.md)
- [Compliance Review Packet](compliance/COMPLIANCE_REVIEW_PACKET.md)
- [Partner Outreach Script](operations/PARTNER_OUTREACH_SCRIPT.md)
- [Partner Report Template](operations/PARTNER_REPORT_TEMPLATE.md)
- [Lender Discovery Questions](operations/LENDER_DISCOVERY_QUESTIONS.md)
- [Lender Network Engine](operations/LENDER_NETWORK_ENGINE.md)
- [Lender Scenario Package Template](operations/LENDER_SCENARIO_PACKAGE_TEMPLATE.md)
- [Impossible File Scan Spec](operations/IMPOSSIBLE_FILE_SCAN_SPEC.md)
- [Partner Packet and Outcome Tracking Spec](operations/PARTNER_PACKET_OUTCOME_TRACKING_SPEC.md)
- [Lender Program Matrix](data/lender_program_matrix.csv)
- [Lender Vetting Scorecard](data/lender_vetting_scorecard.csv)
- [Lender Network Pipeline](data/lender_network_pipeline.csv)
- [Pilot Partner Targets](data/pilot_partner_targets.csv)
- [Lead Import Schema](data/lead_import_schema.csv)

## MVP App

Open [ApprovalPath OS](app/index.html) in a browser to use the local command center.

For the fuller local development setup:

```sh
npm install
npm run start
```

Then open:

[http://127.0.0.1:4174](http://127.0.0.1:4174)

Run all local checks with:

```sh
npm run verify
```

Bulk lead files can be dropped into [imports/incoming](imports/incoming), then normalized with:

```sh
node scripts/import-leads.mjs
```
