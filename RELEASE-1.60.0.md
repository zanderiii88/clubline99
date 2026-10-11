# Clubline 99 — v1.60.0

11 October 2026. Champions League integration, based on the saved and integrity-checked v1.59.0 Wembley release. Not deployed. Physical phone and real-browser review remain outstanding.

## Included

- Champions League qualification, groups, two-legged knockouts, period away goals, extra time, penalties and one neutral final.
- Opening 1998–99 entry: Armoury FC and Mancaster United, with the historical 24-team group-stage field represented by the saved fictional club records. Draws and results are generated, not historical outcomes.
- Future English qualification comes from the completed Premier table: three places for 1999–2000 through 2001–02 and four from 2002–03. An English defending champion outside those places replaces the lowest league qualifier. A foreign defending champion is retained in the foreign field.
- Future foreign entrants vary through seeded, weighted country pools. This abstracts qualifying rounds and foreign domestic leagues; it does not simulate those leagues or reproduce the full annual UEFA access list.
- Draw-day notifications for participating managers. Watch selections appear automatically, pause, skip one selection, skip to the end of a group, or skip to the end and review. Reveals survive saving and reloading; playback resumes paused. Draws can be reviewed again from Organiser → Champions League.
- All CL group tables, fixtures, results and knockout progression can be browsed. CL statistics and cup tying are stored separately from league, League Cup and FA Cup statistics.
- CL games use the existing watched/simulated match, scouting, home/away venue and matchday fixture/result flows. Domestic finals still use Wembley.
- Premier CL qualification places highlighted blue; opening-season qualifiers have CL badges on club selection.
- Format-change notifications link to the competition page and explain the changed progression rules.
- Existing late-season saves defer CL until their next season. They keep existing dates, scores, reports and active matches. Early-season saves can add CL while preserving existing fixtures.

## Period formats and deliberate stopping point

| Career season | Format | Group-stage onward fixtures |
|---|---|---:|
| 1998–99 | Six groups of four; six winners and two best runners-up; quarter-finals, semi-finals and final | 85 |
| 1999–2000 to 2002–03 | Eight first-stage groups; top two enter four second-stage groups; top two then reach quarter-finals | 157 |
| 2003–04 onward | Eight groups; top two enter a round of 16, followed by quarter-finals, semi-finals and final | 125 |

No newer CL league-phase expansion is planned here. Later careers retain the last included format. The future UEFA Cup will retain the period knockout format, rather than later Europa League formats. Preliminary qualifying matches are abstracted. Matchweeks follow the period calendar shape and Tuesday/Wednesday scheduling; clash protection can move games to maintain at least three days between fixtures and protect stadium bookings. This is not an exact recreation of every year's historical calendar.

## Club and player data

The game now loads 118 club records and 2,478 starting players: the existing 68 English clubs / 1,428 players, plus 50 foreign CL-pool clubs / 1,050 players. The English `data/league.json` is byte-for-byte unchanged from v1.59.0. Foreign data lives separately in `data/europe-cl.json`; foreign clubs cannot be selected as playable English league clubs and cannot enter the domestic cups.

The input is the saved Clubline-UEFA-Period-Players-Batch-2.zip cumulative draft. Its CL part contains 27 fully researched parody squads, 13 mixed star/fictional squads and 10 fictional squads: 607 mapped period player parodies in total. Ages and ability estimates reflect the earlier 1998–99 draft; they are not historical statistical measurements. Earlier research limitations, including some later arrivals available in the opening snapshot, remain documented in the roster source notes. Existing IDs are retained. Historical player-reference mappings and research status are included under `review/`.

Rangers are excluded. Celtic's Glasgow Clover record remains in the future CL pool, including the approved fictional substitution context. It is not falsely inserted into the historical opening 1998–99 group-stage field.

## Foreign grounds, kits and finance

Foreign club drafts originally had empty stadium sections and placeholder kit settings. This release gives them playable modular stadium presets, simple vector kits, and a reused fixed neighbourhood scene. Ground capacities are editorial 25k/40k/60k presets, not verified historical capacities. These are **not** replicas of Camp Nou, Bernabéu, San Siro, Olympiastadion or other landmark grounds. Detailed European stadium modelling is still to come. Existing English scenery and Wembley assets are retained.

European finals rotate between three foreign preset grounds. The first uses Barceluna's preset, inspired by the 1999 host city; later choices are fictional game hosting, not claims about the historical final venues.

Home European matches use the existing gate/operating-cost logic and the actual chosen venue's capacity. Neutral matches retain the existing no-home-gate behaviour. CL group win/draw payments of £200k/£100k and a £2m champion prize are explicit game estimates. Payments are recorded once. Full historical UEFA broadcasting distributions and neutral gate sharing are not implemented.

## Validation performed

- All three saved v1.59.0 ZIPs downloaded, SHA-256 matched and ZIP CRC checked before editing.
- Foreign squad sizes, unique IDs/names, two goalkeepers, defensive/midfield/forward coverage, positions, ages, fitness, wages and overall/potential ranges checked.
- 12 complete combined domestic/CL seasons tested across 1998, 1999, 2000, 2002, 2003 and 2004; correct stage/fixture counts, safe rest gaps, venues, completion, JSON save roundtrips, idempotent payments and away-goals-before-extra-time checked.
- Actual application logic in a Node VM with DOM stubs: four career starts, English-only club selection, CL pages, automatic draw steps/skip controls/review/reload, home and away CL simulation/watch/report flows, separate statistics, backups and old-save migration.
- Existing FA Cup application checks: five starts, draw/results/table/reload flows, idle days, replay, statistics and cup tying, season rollover and legacy migration.
- Existing FA Cup engine: nine combined seasons and six financial runs; League Cup: nine seasons and six prize runs; divisions: twelve movement/calendar/decider runs.
- Existing venue application checks: thirteen cases, including away and Wembley match handling, attendance, backups and legacy migration.
- English roster checksum, all 68 existing stadium reserve checks, 408 existing kit/shirt assets, every offline cache asset path, and JavaScript syntax checked.
- Three-part release packaging checks CRCs, disjoint complete file coverage, per-entry bytes and upload-size limits. Saved ZIPs are downloaded again and checked against local SHA-256 before delivery.

These are data and application-logic tests, not browser rendering or a physical phone test. Draw timing, scrolling and responsive presentation should be reviewed on a phone when convenient.

## Suggested phone checks

1. Start Armoury FC or Mancaster United; confirm its CL badge. Advance to 28 August, watch the draw, try each skip control, reload halfway and review it again.
2. Open Organiser → Champions League and check groups, fixtures/results and CL statistics.
3. Play one home and one away CL fixture; confirm the venue and that the fixture/result flow returns correctly.
4. Continue an existing mid-season v1.59 save; check its current results remain intact and CL is marked for next season.
5. At season rollover, look for the format-change notice and updated qualification places.

## Next stage / preserved notes

UEFA Cup integration, UC badges and league/cup qualification bands remain next. CL first-stage third-place transfer clubs are reserved for the future UEFA Cup, but have no UEFA Cup fixtures in this release. There is no claim of a complete European expansion yet.

**Aberdeen / Aberdon Granite must receive researched 1998–99 player parodies when its UEFA Cup roster is prepared, rather than a random squad. Aberdeen must be stronger than Kilmarnock and St Johnstone.** Those clubs are not added or changed by this CL release.

## Reference sources

- UEFA's competition history and 1998–99 / 1999–2000 season archives: https://www.uefa.com/uefachampionsleague/history/seasons/1998/ and https://www.uefa.com/uefachampionsleague/history/seasons/1999/
- UEFA's historical format overview: https://www.uefa.com/newsfiles/40389.pdf
- UEFA announcement of the 2003–04 change: https://www.uefa.com/uefachampionsleague/news/025a-0eab034a2393-c36661944dab-1000--new-format-for-champions-league/
- UEFA on four English entrants in 2002–03: https://www.uefa.com/uefachampionsleague/news/025a-0eaafe1630b4-2d99fd0f6a27-1000/
- RSSSF period fixture/calendar archives: https://www.rsssf.org/ec/ec199899.html and https://www.rsssf.org/ec/ec199900.html

These support historical format and identity choices, not fictional ratings, finance, seeding coefficients, future country allocation or venue presets. Seeding uses game squad strength; final unresolved table ties use stable club IDs in place of a historical coefficient database.

## Upload

This is a full three-part release. Extract **all three ZIPs into the same folder** and upload their combined contents. No intermediate release is required. The saved career key and English roster edition are retained. Nothing has been deployed or published.
