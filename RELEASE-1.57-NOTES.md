# Clubline 99 — v1.57.0: League Cup

Complete release based on the inspected v1.56 checkpoint. Extract ALL THREE ZIPs into the same folder, then upload the combined contents to your existing GitHub Pages folder. No previous release upload is required. No deployment has been performed.

The previous saved v1.56 audio/menu ZIP was incomplete when read back. These assets have been recovered unchanged from the verified v1.55 source and repackaged separately as Audio and Menu Assets. The new package includes everything required.

## Implemented

- League Cup for all 68 existing clubs, with saved draws, automatic progression, managed-club watch/simulate handling and results throughout the competition.
- A deliberate 68-club adaptation of the 92-club era format. Second Division clubs play round one; all First Division clubs have opening-round byes. Twelve Premier clubs enter round two; the eight strongest Premier clubs, ranked by starting attack plus defence, enter round three. This is provisional seeding, NOT implemented European qualification or a claim of exact historical entrants.
- Round sizes: 24, 48, 32, 16, 8, 4, 2. All 68 clubs enter once; 67 are eliminated. There are 105 cup fixtures.
- First and second rounds and semi-finals have two legs. Third/fourth rounds, quarter-finals and final are single matches. The final is neutral at fictional Wembley Fields, with no home ticket gate.
- Tied aggregates use simulated extra time, then away goals if still tied, then penalties. Single matches use simulated extra time and penalties. League Cup away goals remain in use across the represented period, distinct from the league-playoff change after 1998–99.
- Draw notifications and a persistent Home link. Organiser → League Cup allows revealing one tie, skipping to the complete draw, reviewing previous rounds and browsing fixtures/results. The drawn ties are saved immediately; revealing them does not change the draw. This is a click-through draw presentation, not an animated ceremony.
- Period-inspired round dates (August through March), adjusted for existing matches. Cup insertion leaves league dates unchanged, provides at least three days between each participating club's scheduled fixtures, avoids the shared Selwood Park home-date clash, and respects accepted bookings at the managed club's ground.
- Cup form/condition, injuries, cards and suspensions use the existing match systems. Suspensions apply across competitive games. Cup appearances/goals are stored separately from league statistics, with a selector under Squad → Statistics. Cup games never add league-table points or league appearances.
- Players who have appeared in the League Cup are cup-tied if transferred or loaned to a different club that season. Unused substitutes are not marked as having appeared. Cup eligibility resets at season rollover.
- Round progression prizes and final runners-up prize are paid once. Game-design amounts: £10k, £20k, £30k, £50k, £75k, £125k and £250k for the successive winning rounds; £100k for the losing finalist. Existing gate, concessions, operating-cost and condition systems apply.
- Season progression waits for the cup, all leagues and playoffs. Cup winners and rounds are archived at rollover; a new cup is drawn with the current division membership.
- A pre-existing career already beyond 11 August keeps its current season intact and begins the cup next season. Earlier existing careers can receive the cup while preserving original league fixtures/results. Old saves and backups are still accepted; malformed cup membership/round data are rejected.

## Validation

- Fifteen complete cup runs: nine format/scheduling checks across 1998–2001 and six forced champion/runner-up checks spanning all entry paths. Verified every entrant, elimination counts, all 105 fixtures, round sizes, rest spacing, unchanged league dates and exact/idempotent prizes.
- Application/module logic in a Node VM with DOM stubs: five club starts, normal matches, actual managed cup match, separate statistics, cup-tied eligibility, organiser panels, draw review, backup export/import and reload, legacy migration and lower-division rollover with the cup included.
- Twelve three-division regression seasons still pass. All 68 starting stadium layouts fit their reserves, all 408 kit/shirt assets exist, all offline-cache references resolve and application JS passes syntax checks. Original 20 clubs/420 players remain unchanged.
- ZIP contents and archive integrity checked before saving. Saved downloads are checked again after retrieval because the earlier asset ZIP was incomplete.

These are automated logic/asset checks. Actual browser/phone layout, touch navigation, audio, offline installation and lengthy career performance remain untested.

## Limits and next stage

- FA Cup is the next separate release. European competitions, their draws and qualification, including CL/UC table bands, remain unimplemented.
- Extra time/penalties use the existing compact score-decider approach. There are no live extra-time/shootout animations or individually attributed extra-time scorers. Wembley Fields has a neutral label/accounting, not a bespoke stadium scene.
- Fixtures are generated and adjusted, not historical reconstructions. Cups use the existing simplified matchday registration and disciplinary systems rather than a complete historical FA/EFL rulebook.
- Club finances and cup prizes are game-design estimates. The season-long economic balance needs playtesting.

## Useful phone checks later

Start a Second Division club to enter round one. Review its draw from Home; reveal ties or skip. Play a cup match, close the report, check cup fixtures/results and cup statistics, then reload. Confirm the league table/appearances did not receive cup results. Check a First Division club's round-two entry and a seeded Premier club's round-three entry. For an existing career after August, confirm the cup screen says it will start next season.

Export a career backup before replacing your site files.

## Sources

- RSSSF, England League Cup 1998/99: https://rsssf.org/tablese/engleagcup99.html — two-legged opening rounds and semi-finals, later rounds and March final.
- RSSSF, England League Cup 1999/2000: https://rsssf.org/tablese/engleagcup00.html — two-legged stages and away goals applied after extra time.
- EFL, The League Cup: 1990–1999: https://www.efl.com/news/2020/february/the-league-cup-1990-1999 — period competition and Wembley final context.
- Existing roster/kit/stadium assumptions: LOWER-DIVISION-DATA-SOURCES.md. Ratings and finances remain editorial game estimates.
