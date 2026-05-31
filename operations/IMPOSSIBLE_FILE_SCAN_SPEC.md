# Impossible File Scan Spec

Purpose: classify hard-to-approve buyer files without promising approval.

## Safe Language

Use:

- possible path
- needs review
- likely blocker
- rescue tier
- recommended next step
- lender-ready
- needs licensed lender review

Do not use:

- guaranteed approval
- you qualify
- we can get anyone approved
- approved by the system

## Rescue Tiers

### Rescue Now

The file may be fixable in 0-30 days. Usually there is income, some cash or DPA possibility, and the blocker may be documents, program mismatch, DPA, one debt payoff, or lender mismatch.

### Approval Sprint

The file likely needs 30-120 days of focused work. Common examples: 580-619 credit, cash gap, high DTI, missing documents, or self-employed income packaging.

### Rebuild First

The buyer likely needs 4-12 months. Common examples: credit under 580, very low cash, unstable income, large debt issue, no documents, or no clear program path.

### Protect & Refer

The buyer should not be pushed into lender review yet. Common examples: no stable income, affordability concern, extreme debt problem, fraud/misrepresentation concern, or no realistic payment ability.

## Blocker Codes

- CREDIT
- DTI
- CASH
- INCOME
- EMPLOYMENT
- DOCUMENTS
- PROPERTY
- PROGRAM_MISMATCH
- DPA_NEEDED
- UNKNOWN

## Output

The Review Buyer page should show:

- rescue tier
- primary blocker
- secondary blockers
- buyer timeline
- cash available
- credit range
- income type
- DPA needed
- lender-ready status
- recommended next move

## Editable Scan

Users should be able to update scan answers after the buyer file is created.

Editable fields:

- timeline
- credit range
- monthly income
- monthly debt
- cash available
- income type
- main problems
- available documents
- protection flags

When saved, the system recalculates:

- rescue tier
- primary blocker
- secondary blockers
- lender-ready status
- recommended next move
- task checklist
- document checklist
- lender lane

## Lender Lane Matching

The scan should map files to a lender lane:

- DPA First
- Manual Review
- Self-Employed / Bank Statement
- Housing Counseling / Nonprofit
- Property Specialty
- Non-QM / Alternative Product
- VA Specialist
- USDA Specialist
- Portfolio / Community Bank

The lender lane is a routing suggestion only. It must not be presented as an approval or qualification decision.
