# CLUBLINE 99 v1.99.0 - squad succession planning

Cumulative update for v1.94.0 through v1.98.0. Copy every file into the game repository root, retaining folder structure. No fresh career is required. Nothing has been deployed.

## Changes
- Added Team -> Succession plan in Streamlined and Squad -> Succession plan in In-depth, with links from squad planning and the retirement report.
- Review the whole formation for next season: current fit registered cover, retained permanent senior cover after confirmed departures, and a scenario without players whose contracts need attention before opening. Each summary uses different players for different starting places; a versatile player cannot fill two places at once.
- Roles with current gaps, confirmed departures, renewal decisions or limited cover appear first. Review retained senior candidates, returning loans, agreed incoming players, players awaiting registration and the academy pathway for each role.
- Contracts expiring before opening are decisions, not automatic departures: the game permits rolling terms. Future cover ignores current injuries and suspensions, assumes no ability growth and excludes temporary academy call-ups. Loans, agreed arrivals, unregistered players and academy prospects remain separate options requiring decisions.
- Academy options show estimated readiness ranges, including reduced readiness in a declared secondary role. The panel does not reveal exact potential or assume that a prospect will succeed. Announced retirement plans are respected; age alone does not create a retirement.
- Compare senior alternatives with a current option, or open recruitment with that position selected. Reviewing the plan never selects, promotes, registers, recalls or signs anyone.
- Updated installation instructions and retained all v1.95-v1.98 retirement, finance and manager/media improvements.

## Verification
- Native scenario checks cover joint departures, distinct-player assignments, versatility, renewal and rolling-contract scenarios, loan returns, agreed transfers, registration, youth privacy, temporary call-ups, fitness separation, goalkeeper suitability, opening dates and read-only calculations.
- Both management modes: entry routes, rendered plan, senior comparisons, position-filtered recruitment, unchanged squad/finance state, compressed save/reload and portable backup validation. Temporary youth call-ups cannot open an exact academy comparison through a succession action.
- The coverage model runs across all 124 English and Scottish data clubs. The test event harness was corrected to match click targets by selector, preventing an unrelated checklist click during automated checks.
- Retirement/rollover, calendar required stops, pre-match media integration and board-finance checks pass. JavaScript syntax, current database/schedules, stadium/kit and service-worker import/cache checks pass. Data files remain byte-for-byte unchanged from v1.94.
- Browser: v1.99 loaded the existing Streamlined Arsenal career; reviewed the plan, compared Nicolas Anelka against Dennis Bergkamp, closed the comparison and opened recruitment with ST selected. Balance, game date and the existing result remained unchanged.

These are targeted checks, not a new complete-season simulation. Earlier v1.96/v1.97 complete-season evidence is retained as historical evidence. Physical Android and production offline cache replacement remain untested.

## Next priorities
Transfer activity and negotiations guided by club resources and squad needs, followed by further multi-season balance checks. Rivalry history and wider manager/media stories remain on the roadmap.
