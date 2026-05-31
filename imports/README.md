# Lead Import Folder

Drop lead files into `imports/incoming`.

Supported file types:

- CSV
- JSON

Nested folders are supported by the local normalizer.

Run:

```sh
node scripts/import-leads.mjs
```

Outputs:

- `data/normalized_leads.csv`
- `data/normalized_leads.json`

Then upload either output file in the app under **Import Leads**.

## Supported Header Examples

The importer recognizes common variations:

- `name`, `full_name`, `borrower`, `lead_name`
- `first_name`, `last_name`
- `email`, `email_address`
- `phone`, `mobile`, `cell`
- `state`, `target_state`, `property_state`
- `partner`, `agent`, `realtor`, `builder`, `source_partner`
- `obstacle`, `denial_reason`, `issue`
- `credit_score`, `fico`, `middle_score`
- `dti`, `debt_to_income`
- `cash_available`, `down_payment`, `funds_available`
- `income_type`, `employment_type`
- `consent`, `authorization`, `consent_status`

