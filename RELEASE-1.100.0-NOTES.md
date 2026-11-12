# CLUBLINE 99 v1.100.0 - club transfer decisions

Cumulative update for v1.94.0 through v1.99.0. Extract every file into the game repository root, retaining subfolders. No fresh career is required. Nothing has been deployed.

## Changes
- Clubs now bid for a formation improvement or useful spare cover rather than choosing a buyer at random. Formation coverage uses different players for each place. Announced departures can create a need; temporary injuries and suspensions do not automatically prompt a replacement purchase.
- Buyers protect four weeks of their enlarged payroll and observe a 26-player recruitment limit. The fee ceiling combines their transfer funds and valuation. Clubs unable to reach 75% of estimated value do not generate token bids for contracted players; free signings still require a wage reserve.
- Counter-offers receive a decision on the next game day, based on the buyer's squad, valuation and current resources. News records the reason. A counter alone never completes a sale.
- Sale reviews explain the buyer's interest and provide a link to your succession plan. An old offer is checked again at completion: a buyer which has spent its funds, filled its squad or no longer needs the player cannot complete the sale.
- Completed managed-club sales debit the buyer's transfer funds and apply the buyer's wage/contract terms. Managed-club purchases credit the seller. Monthly world transfers use the same buyer assessment and transfer ledger. Free transfers do not generate seller income.
- Newly agreed summer purchases credit the seller when you pay the fee. Cancellation refunds reverse that ledger entry once. Legacy agreements remain compatible and do not reverse money they never credited under older builds.
- Shared formation definitions keep the existing ten formations unchanged. Existing personal terms, playing-time roles, seller premiums, explicit approval and squad-selection safeguards remain in use.

AI transfer funds are a persistent transfer ledger, not a full simulation of every club's weekly accounts. The reserve uses wages; future income and running costs are not forecast. Transfer willingness uses the club's base formation. Broader AI financial balancing remains a future priority.

## Verification
- Native buyer-policy checks: useful upgrades and cover, redundant options, announced departures, valuation/fee and payroll boundaries, token-bid prevention, squad cap, unavailable/academy players, read-only assessments, counter responses, duplicate protection, transfer ledger and monthly free-agent settlement.
- Both management modes: transfer review and succession link, counter submission, saved club response, confirmed sale and wage changes, buyer debit, seller credit, repeat-click protection, stale-buyer withdrawal, compressed saves and portable backups. Legacy/new future-agreement cancellation and invalid ledger fields are checked.
- Existing succession, calendar required-stop, board-finance and manager/match regression checks pass. All game modules pass syntax checks, all exact import URLs are cached, and database files remain unchanged from v1.94.
- Browser: loaded an existing Arsenal career in v1.100; switched from Streamlined to In-depth, reviewed a saved sale offer, submitted a £2.3m counter, advanced one day and saw the buyer decline with its spending-range explanation. No sale was completed.

Two final full-season runs completed 96 managed matches with 26 save/backup checkpoints: English In-depth (54 matches) and Scottish Streamlined (42). Both reached season two with unique reports/payrolls, monthly world transfers and conserved AI transfer fees under the no-managed-spending policy.

Season simulation evidence is recorded separately under review/season-reliability-1.100-*.json. Those checks decline optional transfers and validate the season calendar, match reports, finances, monthly saves/backups and rollover into season two; they do not prove transfer-market balance over many seasons. Physical Android and production offline cache replacement remain untested.

## Next priorities
Longer-term AI finances and seller squad-cover decisions, followed by clearer tactical feedback. Rivalry history and wider manager/media stories remain on the roadmap.
