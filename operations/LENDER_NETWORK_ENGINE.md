# Lender Network Engine

Purpose: build a lender network that can actually handle difficult files, not just collect friendly contacts.

## The Core Truth

ApprovalPath OS should not depend on one lender. The advantage comes from a matrix of lenders, brokers, banks, credit unions, housing agencies, DPA administrators, and non-QM shops with different appetites.

The goal is to give each borrower multiple viable paths:

- agency path
- DPA path
- manual-underwrite path
- community bank or credit union path
- portfolio path
- non-QM or bank statement path
- pause-and-build path with a re-entry trigger

## Official Source Channels

Use official sources first, then validate with discovery calls.

1. **FHA-approved lenders**
   - Source: HUD Lender List
   - URL: https://www.hud.gov/program_offices/housing/sfh/lender/lenderlist
   - Use for: FHA, 203(k), and lenders with HUD approval.

2. **VA lender ecosystem**
   - Source: VA Home Loans lender resources
   - URL: https://www.benefits.va.gov/homeloans/lenders.asp
   - Use for: VA-heavy lenders and lenders with meaningful VA volume.

3. **USDA Single Family Housing Guaranteed lenders**
   - Source: USDA Rural Development
   - URL: https://www.rd.usda.gov/programs-services/single-family-housing-programs/single-family-housing-guaranteed-loan-program
   - Use for: no-down-payment rural and eligible-area buyers.

4. **NMLS verification**
   - Source: NMLS Consumer Access
   - URL: https://mortgage.nationwidelicensingsystem.org/about/Pages/NMLSConsumerAccess.aspx
   - Use for: verifying companies, branches, MLOs, licenses, addresses, and public regulatory information.

## Network Architecture

Build the network in lanes.

| Lane | What It Solves | Partner Types |
|---|---|---|
| FHA Manual | AUS denial, thin files, compensating factors | FHA lenders, brokers |
| DPA Stack | Cash-to-close shortage | DPA lenders, housing agencies |
| VA Rescue | eligible veterans with residual income or cash issues | VA specialists |
| USDA Zero Down | rural or eligible-area buyers | USDA-approved lenders |
| Self-Employed | tax return losses, 1099, bank deposits | non-QM, bank statement lenders |
| Portfolio | borrower does not fit agency box | community banks, credit unions |
| Credit Comeback | low score or derogatory history | housing counselors, lawful credit/budget partners |
| Property Rescue | manufactured homes, repairs, condos | specialty lenders |

## Lender Vetting Score

Score each lender from 0 to 100.

| Category | Points |
|---|---:|
| Product appetite for hard files | 20 |
| Manual underwriting or exception capability | 15 |
| DPA compatibility | 15 |
| Self-employed / alternative-doc flexibility | 15 |
| Low credit tolerance | 10 |
| Communication speed | 10 |
| Scenario feedback quality | 10 |
| Compliance clarity | 5 |

Bands:

- 85-100: Core routing partner
- 70-84: Strong secondary partner
- 55-69: Niche partner
- 40-54: Watchlist only
- Below 40: Do not route

## Lender Onboarding Steps

1. Source candidate from official list, referral, or market search.
2. Verify NMLS/company legitimacy.
3. Complete lender discovery call.
4. Fill scorecard.
5. Ask for written scenario-submission instructions.
6. Ask what files they do not want.
7. Test with anonymized scenarios before borrower data sharing.
8. Add to lender matrix only after fit is clear.
9. Track every routed outcome.
10. Downgrade lenders that do not respond or consistently decline mismatched files.

## Scenario Package Standard

Do not send messy borrower data. Send a clean scenario package:

- borrower state
- target property type and occupancy
- credit band
- estimated DTI
- income type
- cash available
- target price
- denial reason
- known documents available
- consent status
- requested question: "Is this a file you would review, and what would you need first?"

Only share personally identifying borrower information after consent and after the partner is validated.

## Partner Relationship Rules

- Keep lender ranking based on fit and outcomes, not hidden compensation.
- Document every material relationship.
- Do not represent paid placement as objective matching.
- Do not accept prohibited referral fees.
- Use legal review before any MSA, joint venture, or closing-tied compensation.

## First 30 Real Targets

Build 30 candidate partners before expecting consistent approvals:

- 5 FHA/manual underwriting lenders or brokers
- 4 DPA-heavy lenders
- 3 VA specialists
- 3 USDA specialists
- 4 credit unions or community banks
- 4 non-QM/bank statement lenders
- 3 housing counseling or DPA agencies
- 2 manufactured home/property-specialty lenders
- 2 lawful credit/budget partners

## Operating Rhythm

Weekly:

- add 5 new lender candidates
- complete 3 discovery calls
- score 3 partners
- test 2 anonymized scenarios
- update the matrix from actual responses

Monthly:

- remove weak partners
- publish internal appetite notes
- identify missing lanes
- review approval outcomes by partner

