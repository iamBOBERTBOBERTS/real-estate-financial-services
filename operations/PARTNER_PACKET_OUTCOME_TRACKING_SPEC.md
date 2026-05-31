# Partner Packet and Outcome Tracking Spec

## Purpose

This sprint turns ApprovalPath OS into a working handoff engine. The app can now prepare a plain-language partner packet, track where a buyer file was sent, and record what happened afterward.

## Partner Packet

The packet is available inside **Review Buyer**.

Actions:

- Export Partner Packet
- Copy Packet Text
- Print Packet

Current format:

- Markdown/plain text for copying
- Printable HTML for export or printing
- PDF is intentionally deferred

Packet sections:

- prepared date and prepared by
- buyer summary
- consent status
- Impossible File Scan
- financial snapshot
- lender routing
- documents
- tasks
- compliance reminder

Before export, copy, or print, the safety modal requires confirmation that:

- the buyer gave permission
- SSN, full credit reports, bank account numbers, and sensitive IDs are not included
- no approval promise is being made
- loan terms and formal eligibility are handled by properly licensed mortgage professionals

If the file is **Protect & Refer**, the modal shows a stronger warning to avoid treating the file as lender-ready.

## Handoff Tracking

Each buyer file now has a handoff record.

Tracked fields:

- status
- partner or lender name
- contact person
- date sent
- next follow-up date
- notes

Supported statuses:

- Not sent yet
- Ready to send
- Sent to lender
- Sent to DPA partner
- Sent to housing counselor
- Sent to realtor/builder
- In review
- More info requested
- Paused
- Closed / completed

When a file is marked sent, the user must confirm buyer permission.

## Outcome Tracking

Each buyer file now has an outcome record.

Tracked fields:

- outcome status
- outcome date
- source
- reason it worked
- reason it failed
- notes
- next action
- next follow-up date

The app uses these outcomes to show:

- Work Files filters
- Home dashboard metrics
- lender performance notes
- Learning Snapshot guidance

## Work Files Views

The Work Files screen now supports filtered views:

- Ready to Send
- Sent - Needs Follow-Up
- More Info Requested
- Outcome Needed
- Approval Sprint
- Rebuild First
- Protect & Refer
- Won / Closed
- Lost / Not Ready

Each row shows buyer, rescue tier, primary blocker, best lender lane, handoff, outcome, next follow-up, next action, and quick actions.

## Compliance Wording

The app should not claim system-level loan approval, guarantee financing, or tell a buyer they qualify.

Safe framing:

- routing suggestion
- lender lane
- review path
- next step
- partner packet
- file readiness

Unsafe framing:

- promised approval
- declaring formal eligibility
- system-level credit decisions
- predicting a lender decision as certain
