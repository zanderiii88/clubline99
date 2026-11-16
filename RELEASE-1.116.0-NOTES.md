# CLUBLINE 99 v1.116.0 - career economy and generated-player reliability

## Payroll and financial decisions
The wage plan previously counted the registered squad, omitting retained wages on outgoing loans and contracted seniors awaiting registration. Monday accounts already charged those wages. A shared payroll calculation now supplies actual accounts, wage planning, transfer and renewal previews, board assessments and AI buying-club wage reserves. Retired players and academy-only players remain excluded; temporary youth call-ups incur their stated senior wage.

Existing saved wage allowances are retained. A new season's allowance is based on its actual opening payroll, including known loan shares and paid unregistered players. Remaining-season wage estimates explicitly hold current obligations and loan shares fixed: later loan returns, transfers, promotions and renewals can change payments. No wage rates, starting funds, commercial income, transfer valuations or match-engine coefficients have been retuned.

## Fictional player identities
Generated free agents and world replacement players no longer inherit real/parody display identities from the roster template used for attributes. Existing generated-player saves are repaired on loading: retain the saved fictional name where available; otherwise assign a deterministic fictional name to the same stable player ID. Ownership, skills, wages, contracts and career records remain attached to that ID. Already written historical news is retained rather than attempting to rewrite ambiguous old names.

## Verification and limits
Three seeded careers each complete two seasons and enter season three using natural starting budgets and real application handlers: six seasons, 323 managed matches and 78 compressed save/backup checkpoints. Fulham uses a development policy with partial loans and recalls; Arsenal and Hibernian use a trading policy accepting suitable offers. Policies also exercise affordable recruitment, paid summer agreements, selective renewals, temporary call-ups and permanent promotions. Monthly compressed saves and portable backups are validated. See review/career-balance-1.116.json and the per-club final evidence for exact outcomes, action records and scope.

Fee-ledger reconciliation includes managed purchases/sales, world transfers and annual AI allocations. Checks cover unique payroll/report records, loan returns, retirement/replacements, youth intake, registration limits, and reload persistence. These are bounded accounting and interaction checks under two conservative policies, not proof of realistic balance under every strategy. They run in a Node VM with DOM/timer stubs; they are not multi-season browser playthroughs.

Focused tests cover loan contributions, paid unregistered seniors, transfer/renewal projections, board forecasts, AI reserves, generated identities, naming toggles and legacy-save repairs. Desktop browser testing loads an older Arsenal save, approves a 75% borrower contribution, confirms Contracts and Finances both show £274,613 weekly payroll, and verifies fictional free-agent search names. Physical Android and production offline updates remain outstanding.

## Installation
Export a backup first. Use the cumulative v1.94-onwards update over v1.94 through v1.115, or the complete build with all assets. No fresh career required. Stable save key retained. Nothing published.
