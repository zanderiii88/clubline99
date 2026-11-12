# CLUBLINE 99 v1.96.0 - consistent board finances and season review

The cumulative update is for v1.94.0 or v1.95.0. Copy all files from the ZIP into the repository root, retaining its folder structure. No fresh career is required. Nothing has been deployed.

## Player-facing changes
- Board confidence, financial warning text and formal board reports now share the same four-week forecast. It includes wages with loan shares, club running costs, completed facility upkeep and commercial income adjusted for the current division. Previously the confidence assessment omitted running costs and used opening commercial income, while the formal report separately corrected its forecast; the two could disagree.
- Manager & board now offers an expandable forecast breakdown in both modes. In-depth season expectations show the same breakdown. It explicitly excludes future match income, prizes, transfers and new spending. This is a cash planning estimate, not a prediction of the club's final balance.
- Saved board reports show the forecast recorded at the time of the report. Older records retain their historical values.
- Fixed the Streamlined end-of-season "Review season" shortcuts, whose season-summary action had no handler. They now open the existing review, with the same completion checks as the In-depth route.

## Included from v1.95
Retirement and succession advice in Player development, announced retirement horizons versus age watch, positional cover, and protection against repeating a completed development rollover. The roadmap includes rivalries and manager/media exchanges alongside board pressure and morale; those interactions are still future work.

## Verification
The updated full-season harness uses current draw and decision handlers, simulates the actual managed matches, acknowledges board reports and declines offers/bookings. Club stories use no-spend choices or are allowed to expire through ordinary advancement. No optional player purchases, facility investments or stadium bookings are accepted.

The VM uses DOM/timer stubs and seeded randomness. Routine test saves use the game's supported plain-JSON representation to avoid repeatedly compressing large saves. At every monthly checkpoint and the end-of-season/season-two checkpoints it invokes the actual save codec, reloads the device save, and validates a portable backup. Test-only hooks are injected by the harness and are absent from production files.

Completed scenarios (actual engine simulation):

| Club | Mode | Managed matches | Save/backup checkpoints | Season two reached |
| --- | --- | ---: | ---: | --- |
| Fulham (C45) | In-depth | 51 | 13 | Yes |
| Arsenal (C01) | In-depth | 54 | 12 | Yes |
| Aberdeen (EU051) | In-depth | 44 | 13 | Yes |
| Hibernian (SC11) | Streamlined | 42 | 14 | Yes |

191 managed matches and 52 checkpoints passed. An independent audit of the retained test checkpoints also verifies complete league match counts, no duplicate match reports or payroll entries, season-one archives and season-two balances. Reopening the season review pays nothing twice.

The evidence JSON records each career's completion, match and checkpoint counts, decision handling and balance. These are repeatable simulation scenarios, not proof that every club's long-term finances are balanced. Physical Android testing and browser offline/cache-replacement testing remain outstanding for this build.

Focused checks cover true four-week cash settlement, running costs/upkeep, promotion/relegation income, loan shares, academy payroll, confidence/report agreement and negative balances. Existing v1.73, v1.74 and v1.95 regression suites and manager-world checks also pass. Source checks now cover the current 68-club English and 56-club Scottish databases, all five playable divisions, all English stadium/kit paths, JavaScript syntax and exact service-worker imports/assets. Database records are unchanged.

Browser check: an existing Streamlined Arsenal test save loaded in v1.96; Manager & board opened and its forecast breakdown displayed the expected wage, upkeep/running cost and commercial figures. Desktop only.

## Running checks
- node --experimental-vm-modules review-tests/check-career-season.mjs
- node review-tests/check-board-finances.mjs
- node tools/source-checks.mjs
- node --experimental-vm-modules review-tests/check-release-195.mjs

CLUBLINE_TEST_CLUB can select C45, C01, EU051 or SC11 for one season scenario. Test checkpoints are generated under review/checkpoints and are excluded from the delivered archives.
