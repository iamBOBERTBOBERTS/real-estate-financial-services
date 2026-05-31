# Approval Obstacle Scoring Model

The Approval Obstacle Score ranks how difficult a borrower file is to rescue.

Higher score means more difficult.

## Score Dimensions

| Dimension | Points |
|---|---:|
| Credit | 0-20 |
| Capacity / DTI | 0-20 |
| Capital / cash-to-close | 0-20 |
| Collateral / property | 0-15 |
| Documentation complexity | 0-15 |
| Compliance / fraud risk | 0-10 |
| Total | 0-100 |

## Bands

| Score | Band | Meaning |
|---:|---|---|
| 0-25 | Easy Save | Likely workable with clean routing or missing documents |
| 26-50 | Workable With Routing | Needs a better-fit program, lender, or assistance path |
| 51-70 | Rescue Plan Needed | Needs structured action before submission |
| 71-85 | Long Path | Needs a build plan and careful milestone tracking |
| 86-100 | Pause or Decline | Not currently viable or requires legal/compliance review |

## Fundability Status

- Fundable Now
- Fundable With Conditions
- Fundable With Different Lender
- Build Plan Required
- Not Currently Viable

## Path Assignment Rules

- Cash shortage is primary: DPA Stack Path
- AUS denial with compensating factors: Manual Underwrite Path
- Self-employed, 1099, gig, or variable income: Income Rescue Path
- Low score or derogatory history: Credit Comeback Path
- DTI is primary obstacle: Debt Strategy Path
- Nontraditional documentation or product need: Alternative Product Path
- Property is primary obstacle: Property Rescue Path
- Multiple severe issues and no immediate path: Pause and Build Path

