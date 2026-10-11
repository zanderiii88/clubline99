# Clubline 99 — v1.62.0: Season review and qualification

This is a complete release built from the inspected, verified v1.61.0 Game, Audio and Menu Assets ZIPs. Nothing has been deployed.

## Implemented

- A full season review becomes available after all three divisions, both sets of playoffs and all four cups have finished. The existing next-season button opens the review; its **Begin next season** button then performs rollover.
- Final position, points, played, goal difference and promotion/relegation; all three final tables and the promoted/relegated clubs.
- League Cup, FA Cup, Champions League and UEFA Cup outcomes and winners, including a CL group-stage exit/UEFA Cup transfer.
- The existing board verdict, objectives and financial assessment, captured at full season completion. This does not add cup bonuses or manager dismissals to the board model.
- League and cup prize money already received, plus the balance when the review was captured. Opening or reopening a review makes no additional payment. Off-season wages and commercial income are settled by the existing rollover logic.
- Confirmed **English** CL and UEFA Cup qualifiers with qualification routes. Foreign entrants are still chosen from the country pools when the new season begins; this report does not claim that they are already confirmed.
- Your next division, domestic cups and European entry, plus the next season’s period formats and applicable 1999/2003 changes. CL remains at its implemented 2003 format thereafter; UEFA Cup remains at its implemented 1999 format. No recent expansions added.
- Review notification, Home entry and **Organiser → Season reviews** archive. Back closes the report. Saved reviews and an open report survive reload and career backup/restore.
- Qualification’s alphabetical tie-break now uses the same custom club names as the displayed league table.

The review is a frozen snapshot, not a second accounting or competition engine. Names, results and closing balance in an old review retain their values at capture. Existing careers acquire reviews from their current completed season onward; old seasons are not reconstructed from incomplete historical data.

## Validation completed

Automated tests ran against the actual application modules in Node VM with DOM stubs:

- Four completed career starts across Premier, First and Second Divisions, including promotion, relegation and staying in a division.
- Prize summary matched actual recorded league/cup payments; repeated save/review did not change the balance, duplicate the review or duplicate its notification.
- Opening, Back, reopening, saving/reloading an open report, retained archives, and exactly one rollover.
- Confirmed qualifiers and next division matched the new season’s actual qualification and division state.
- Lower-division FA Cup winner UEFA qualification and an English CL title holder outside ordinary league places.
- Compatible legacy saves without review fields retained their fixture dates, scores and balance; new careers start with an empty review archive.
- Malformed snapshot objectives, duplicate seasons and incomplete tables rejected by career-backup validation.
- Unfinished seasons blocked and old archived reviews have no next-season action.
- 1999/2003 format notices and no later format expansion.
- Existing UEFA Cup application flows passed: five career starts, draw playback/review/reload, both legs, match reports/results, separate stats, migration and rollover.
- Existing FA Cup application flows passed: five career starts, fixtures/results/table/draw reloads, idle days, FA matches/replays, cup tying/statistics, rollover and legacy migration.
- All JavaScript syntax, offline asset references, 68 fixed English stadium reserves, and 408 kit/shirt assets passed checks.
- All three roster JSON files remain byte-for-byte identical to the verified v1.61 source: 194 clubs and 4,074 players.

The report uses a constrained, scrolling dialog with responsive type and wrapping buttons. **Physical phone and real-browser visual testing remain outstanding.** DOM-stub tests do not prove visual layout or touch behaviour.

Review evidence is included under `review/season-review-app.json`; the test is `review-tests/check-season-review.mjs`. Older evidence retained in the package describes its respective previous release, not new browser testing.

## Install and later phone checks

1. Export your current career backup.
2. Extract **all three v1.62.0 ZIPs** into one folder: Game, Audio and Menu Assets.
3. Upload their combined contents to your existing GitHub Pages folder, replacing matching files. No earlier release is required. Upload files, not ZIPs or an extra enclosing folder.
4. Use Check for Updates/Load update as usual and verify v1.62.0.

When convenient: finish a season, inspect the phone report, close/reopen it, begin next season and confirm that the old review remains available in Organiser. Check portrait and landscape scrolling and the bottom buttons.

## Notes retained for future work — not implemented here

A browsable Free Agents tab/pool with position, age, ability and wage filters and direct contract negotiation. The current contract system keeps expired contracts rolling; genuine release/expiry and seasonal replenishment need separate work.

Major European stadium replicas such as Camp Nou, Bernabéu, San Siro and Bayern’s Olympiastadion remain future work. Foreign grounds still use the existing modular presets.
