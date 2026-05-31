# Roadmap Execution

Last updated: 2026-05-29

## Execution Status

The first execution pass converts the business blueprint into a working operating foundation:

- ApprovalPath OS MVP app
- borrower intake structure
- denial reason taxonomy
- scoring model
- lender/program matrix
- consent and disclosure draft
- launch checklist
- partner outreach materials

## Phase 1: Foundation

Status: **In progress**

Completed in this pass:

- Created the operating system MVP shell.
- Created the first borrower file model.
- Created the initial approval obstacle scoring system.
- Created the first denial taxonomy.
- Created starter consent and disclosure language.
- Created the first lender/program matrix format.
- Created launch and pilot checklists.

Next validation items:

- Attorney review of service language, compensation model, consent language, and state licensing exposure.
- Confirm target launch state or states.
- Identify the first 10 lender, broker, housing agency, and DPA partners.
- Interview 5 realtors and 2 builders about common buyer fallout patterns.
- Run 25 manual file reviews before automating routing too aggressively.

## 30-Day Pilot Target

Goal: prove that difficult borrower files can be classified, triaged, and routed faster than a normal agent or lender team can do alone.

Pilot inputs:

- 25 declined, delayed, or stalled borrower files
- 5 realtors or one builder sales team
- 10 partner lenders/agencies/programs

Pilot outputs:

- file classification within 24 hours
- action plan for each borrower
- lender/program routing recommendation
- outcome tracking by obstacle type
- partner report showing recovered pipeline value

## Build Order

1. Run manual file reviews using the templates in `operations/`.
2. Use `app/index.html` as the internal command center.
3. Track lender/program outcomes in `data/lender_program_matrix.csv`.
4. Update scoring after every 10 files reviewed.
5. Convert repeated manual steps into app workflows.

## Decision Gates

### Gate 1: Is the pain real?

Pass if agents/builders submit at least 25 files in the pilot.

### Gate 2: Can files be classified reliably?

Pass if 80% of files can be assigned to one primary approval path within 24 hours.

### Gate 3: Is routing useful?

Pass if at least 30% of pilot files are either submitted to a better-fit partner or given a concrete build plan.

### Gate 4: Can the model monetize safely?

Pass only after compliance review confirms the initial fee model and partner subscription model do not depend on prohibited referral compensation.
