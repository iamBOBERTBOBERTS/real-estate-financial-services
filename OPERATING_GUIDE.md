# Operating Guide

## Daily Use

1. Open the app: `app/index.html`
2. Import leads under **Import Leads** or create a file under **Borrower Intake**.
3. Open each borrower from the **Command Center**.
4. Work the file in **Work Queue**.
5. Complete task and document checklists.
6. Add notes after every call, review, or partner response.
7. Mark the file **Lender Match Ready** only after consent and enough documents exist.
8. Export CSV weekly for reporting.

## Bulk Lead Workflow

For small files:

1. Open **Import Leads**.
2. Upload CSV or JSON.
3. Click **Parse Leads**.
4. Review duplicate warnings.
5. Click **Import Parsed Leads**.

For larger folders:

1. Drop CSV or JSON files into `imports/incoming`.
2. Run:

```sh
node scripts/import-leads.mjs
```

3. Upload `data/normalized_leads.csv` in **Import Leads**.

## Lender Network Workflow

1. Use official sources in `operations/LENDER_NETWORK_ENGINE.md`.
2. Add candidates to `data/lender_network_pipeline.csv`.
3. Run discovery calls using `operations/LENDER_DISCOVERY_QUESTIONS.md`.
4. Score each lender in `data/lender_vetting_scorecard.csv`.
5. Add validated lenders to `data/lender_program_matrix.csv`.
6. Test with anonymized scenarios using `operations/LENDER_SCENARIO_PACKAGE_TEMPLATE.md`.
7. Route real borrower data only after consent.
8. Track outcomes and downgrade partners that do not perform.

## First Real Milestone

The project becomes real when these are complete:

- 100 leads imported
- 25 files reviewed
- 30 lender candidates sourced
- 10 lender discovery calls completed
- 5 validated partners scored 70+
- 3 anonymized scenarios tested
- 1 attorney review completed

