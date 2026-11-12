# CLUBLINE 99 v1.101.0 - seller cover and annual AI transfer funding

Cumulative update for v1.94.0 through v1.100.0. Copy every file into the game repository root, retaining subfolders. No fresh career is required. Nothing has been deployed.

## Changes
- Selling clubs assess the whole formation before accepting an immediate or future sale. Distinct players must cover distinct places. An agreed departure or announced retirement cannot be counted again as future cover. Loans, unregistered players and temporary academy call-ups cannot justify losing permanent cover.
- Clubs retain at least 18 permanent registered players when selling, and at least two permanent goalkeepers. A summer agreement also reserves an 18-player permanent squad after confirmed departures. Existing summer commitments remain honoured at arrival under the previous settlement rules.
- Losing essential current or projected formation cover blocks a sale. Limited spare positional cover adds a 15% premium. Rival, nearby-league-challenger and long-contract key-player premiums remain; premiums use the largest applicable rate rather than stacking. Listing or contract expiry can ease a negotiation but never bypass cover safeguards. Temporary injuries and suspensions do not change structural cover.
- Managed-club signing reviews and monthly world transfers use the same seller assessment. Saved quotes are checked again before commitment. A higher asking price is shown for another confirmation; a refusal takes no money. Summer reviews display their projected-cover decision.
- Fixed opening bids in both transfer entry flows to include the career's contract-expiry fee discount, matching the asking-price calculation and financial illustration.
- AI transfer funds now receive a board review once at each actual season rollover. The allowance is up to 25% of the club's original budget, scaled by the current-division commercial-income ratio. New allocations stop at twice that reference budget. Existing balances and sale proceeds carry forward; money is never removed merely for exceeding the allocation cap. Refund debt is reduced before new spendable funds arise.
- Old careers begin funding tracking at their current season without retrospective payments. Reopening the game or repeating the review cannot add funds. A league-news item summarises the annual allocation. The managed club receives no AI funding payment.

AI funds remain an abstract transfer ledger with annual board allocations, not full weekly accounts for every club. The existing four-payroll buyer reserve still applies. Club base formations are used for structural transfer assessments. This round does not establish long-term market balance over many completed seasons.

## Verification
- Pure seller scenarios: minimum squad, whole-formation matching, two keepers, joint departures and retirement cover, loans/academy exclusion, future squad reservations, rivalry/listing/expiry/cover premiums and read-only advice.
- Both management modes: opening-price discount, seller explanation, personal terms and club counter without spending, refusal after cover changes, revised-price confirmation, purchase/seller credit and compressed save/portable-backup reload.
- Future commitments cannot take funds when projected squad cover fails. Annual funding checks cover legacy baseline, repeated season/reload protection, carryover and cap, refund debt, division scaling and multiple review cycles. Saved funding fields are validated.
- One new Scottish Streamlined full season completed 42 managed matches with 14 save/backup checkpoints and an actual rollover into season two. The annual allocation appeared exactly once. The AI ledger increase equals the recorded board allocation when optional managed transfers are declined. Reports and payrolls are unique. Evidence: review/seller-funding-season-1.101.json.
- The completed English v1.100 season-two career loads without retroactive funding or changes to cash/AI funds and passes current backup/save checks. Earlier full-season evidence remains historical, not a fresh English v1.101 full-season run.
- Buyer/transfer-ledger, succession, board-finance, calendar required-stop and manager/match regression checks pass. Syntax and exact cache/import checks pass. Database files remain byte-for-byte unchanged from v1.94.
- Browser: existing Arsenal career loads in v1.101; Manchester United refuses a Peter Schmeichel sale to preserve two permanent keepers. Personal terms, summer arrival and confirmation controls are disabled. Opening bid and displayed asking estimate both reflect the expiring-contract discount. No signing or payment is made.

Physical Android and production offline cache replacement remain untested.

## Next priorities
Clearer tactical feedback and follow-through on youth/development opportunities, with longer-term financial balancing alongside that work. Rivalry history and wider manager/media stories remain on the roadmap.
