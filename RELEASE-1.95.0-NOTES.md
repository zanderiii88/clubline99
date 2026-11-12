# CLUBLINE 99 v1.95.0 - retirement and succession planning

Apply the update over v1.94.0. Copy its game files into the repository root, including the new retirement-planning.js. No fresh career is required. No deployment performed.

## Changes
- Player development now includes Retirement & succession in both management modes.
- Announced plans distinguish the end of this season, next season and later seasons. Older players without announcements are labelled Age watch, never presented as certain retirements. Watch starts at 33 for outfield players and 36 for goalkeepers; this advice does not change existing retirement rules.
- Review each player's existing senior positional cover and how many are currently fit and unsuspended. Loans, agreed departures, unregistered players, academy-only players and announced near-term retirees are excluded from cover. Advice describes positional suitability, not replacement quality or enough cover for a formation; players can be shared across multiple cover lists.
- Links open player comparisons, youth prospects and recruitment. Advice is read-only and uses existing save data.
- Repeating a completed development rollover now does nothing rather than adding another year, another archive and another intake. An earlier season start is rejected before mutation. This protects the development transition, not every possible partially interrupted full-season transition.
- ROADMAP.md records the requested rivalries and manager/media comments alongside board pressure and morale, including response choices and visible consequences. Those interactions are future work.

## Verification
PASS: targeted v1.95 VM tests in both modes: retirement horizons, goalkeeper watch threshold, injury/suspension cover distinctions, registration, academy status, retirement, loans, agreed departures, read-only advice, rendered panel integration, real development rollover and repeated/restored-data rollover.
PASS: existing v1.73 and v1.74 regression suites: facility/development, manager identity, loans, youth intake, calendar prompts and required transfer approvals.
PASS: manual browser check of a new Streamlined Arsenal career, opening Team -> Player development and reviewing the retirement/cover panel. Desktop browser only; no physical-phone testing claimed.

Verification limits: the historical source-checks script still expects 20 English clubs (the current data has 68). The historical check-career-season harness reaches its step limit without handling all current required decisions. These older checks are not counted as passes. This round does not claim a fresh full-season, offline-browser or Android pass. Updated syntax, service-worker cached paths/imports and ZIP integrity are checked separately.
