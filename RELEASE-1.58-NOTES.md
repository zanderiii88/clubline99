# Clubline 99 — v1.58.0: FA Cup & matchday events

A complete downloadable release based on the inspected, intact v1.57 Game, Audio and Menu Assets ZIPs. Nothing deployed. All 68 English clubs, 1,428 player records, kits, modular stadiums and surroundings are unchanged.

## Install

Extract all three ZIPs—Game, Audio and Menu Assets—into the SAME folder. Upload the combined contents to the existing GitHub Pages folder, replacing matching files. No earlier release is needed. Export a career backup first. Open the hosted game, not index.html via file://. Version and offline cache are 1.58.0.

## Implemented: FA Cup

- One shared 68-club world; no invented fourth division or non-league clubs.
- Second Division clubs enter in round one. Eight randomly drawn byes reduce that round from 24 entrants to 16 survivors; round two reduces 16 to eight. The 44 Premier/First Division clubs enter round three, giving 52 entrants. Twelve random byes plus 20 ties produce a conventional 32-club fourth round, then 16, eight, four, two and one champion. This is an explicit game adaptation, not the historical full field. Byes pay no prizes and add no appearances.
- Preferred first-year dates: 14 November, 5 December, 2 January, 23 January, 13 February, 6 March, 11 April and 22 May. Fixtures move forward to avoid clashes and provide at least three days between competitive fixtures for each club; existing league dates remain intact. Later seasons retain these period-inspired month/day targets rather than reproducing exact historical calendars.
- Drawn round-one to quarter-final games have one replay with home/away venues reversed, normally at least ten days later. Replays use extra time and penalties when needed. No away-goals rule in this cup.
- In 1998–99 semi-finals, extra time comes before a replay if still level. The semi-final replay is neutral, targeted three days later subject to clashes. From 1999–2000 semi-finals are settled on the day with extra time/penalties. The final is always settled on the day.
- Semi-finals have neutral venue labels; the final is labelled Wembley Fields. Neutral fixtures do not earn the managed club home gate revenue or reserve its home stadium.
- FA Cup fixtures/results, saved draws and previous champions are browsable under Organiser → FA Cup, with a Home shortcut.
- Separate FA Cup statistics and cup-tying records. Playing for one club in the FA Cup prevents later FA Cup appearances for another club that season; this does not cup-tie a player in the League Cup. Existing simplified competitive bans apply across the leagues and cups.
- Advancing prizes are £10k, £15k, £30k, £50k, £75k, £125k, £250k and £500k; the final runner-up gets £250k. Prizes are estimated game-design amounts, paid once. Match income retains the existing simplified economy; historical FA gate-sharing accounting is not implemented.
- Both cups must finish before season rollover. Champions are archived; new draws use the new season’s division memberships. Cup statistics and tying reset separately.

## Implemented: the matchday flow

1. Before play, a daily card lists games in your own division (including playoffs), the League Cup and the FA Cup that your club entered that season. It includes your own accepted friendly when applicable. Other divisions are still available through Organiser, but do not fill this daily card.
2. If your club play, Continue opens the existing match choices and lineup confirmation. Back to club remains available for management changes; Advance returns to those choices. On an idle day, Continue simulates the relevant games and opens the day’s results without a managed match or match-income payment.
3. Your own game still has its detailed report. Continuing from it shows your result alongside all the other relevant results, grouped by competition. Replay dates, extra time and penalty decisions are labelled.
4. Days with own-division league matches then show the updated table, including movement from the pre-match standings. Cup-only/friendly-only days do not add an irrelevant league table. Continue returns to Home or the next draw event.
5. Each domestic cup round’s draw is a small saved event, with Reveal next tie, Skip to complete draw and Continue. It pauses advancement and can be reviewed afterwards in the cup page. The first FA draw is scheduled for 7 November; later draw events become available as the previous round finishes. Random byes are shown after the draw. Both clubs’ cup draws are followed even after your own club is eliminated.

Fixture previews occur before NPC results for that day are generated. Results and player appearances are applied once. The preview, match choices, results, table and partially revealed draw survive save/reload and backup import. Draws appear in the calendar and produce notifications when your club is involved. This is a tap-through event, not a timed animated draw show.

## Existing careers

Existing v1.57 saves keep their league and League Cup games/results. Careers on or before 7 November can receive the FA Cup this season. Later careers defer it until the next season, avoiding retrospective games. The storage key and roster edition are unchanged. Historical draws in older saves are not repeatedly presented as new events. An already active match is retained; a saved pre-match choice without the new day state includes the daily fixtures directly.

## Validation

Automated reports and runnable scripts are included under review/ and review-tests/:

- Nine complete combined league/cup seasons spanning 1998, 1999 and 2000, forcing draws in all cup games to stress replays. Verified all 68 entrants, 67 eliminations, byes, replay venue swaps, neutral stages, 1998–99 versus later semi-final rules, rest gaps, unchanged league dates, save metadata and exactly-once prizes. Maximum-draw FA seasons have 133 games in 1998–99 and 131 in later years.
- Six additional FA champion/runner-up prize checks, covering all three division entry paths and unpaid byes.
- Fifteen League Cup regression runs and twelve division regression seasons.
- Real application handlers in a Node VM with DOM stubs: five club starts; fixture → choices → report → results → table; back to club and resuming; idle cup and league days; partially revealed draws and each saved screen; FA watched-lineup confirmation and replay simulation; separate statistics and tying; both cups’ season rollover; November draw/calendar/notification idempotence; late v1.57 migration.
- A full chronological managed career using actual Advance, match and event handlers passed: 637 actions, 55 managed matches, 80 fixture/result days, 46 table screens and all 15 domestic draws; both cups completed, all fixtures played, monthly backups parsed and the ending save reloaded. Its report is review/fa-cup-career-season.json.
- All 68 stadium presets fit their fixed reserves, all 408 kit/shirt files and surroundings exist, new modules are in the offline cache, source league data are byte-for-byte unchanged, and application JavaScript passes syntax checks.
- All ZIPs are checked locally for integrity and exact combined contents. Saved downloads are retrieved and compared against their original SHA-256 hashes before delivery.

These are automated logic, generated-markup and asset checks. No actual browser or physical phone testing has been performed. Touch layout, audio playback, installed-PWA update/offline behaviour and long-term economy balance still require playtesting.

## Later work and limits

- Wembley: reuse the modular stadium engine for the bowl/stands, add bespoke twin towers and entrance frontage, and route neutral matches to an actual venue scene. Currently neutral match labels/accounting are implemented, but the watched match view still renders a participating club’s stadium. There is no actual Wembley asset in this release. Ordinary watched away matches can show the host club’s ground through the Stadium/Lineups toggle; simulations go straight to a report.
- Extra time and penalties use compact simulated score deciders; there is no live extra-time/shootout animation or individually attributed extra-time scorer. Penalties currently use the inherited simple 5–4 decision.
- These are generated schedules and a fictional 68-club cup adaptation. There is no fourth-tier/non-league qualifying field, Manchester United withdrawal scenario, comprehensive historical disciplinary rulebook, or European qualification yet.
- Future European competitions and CL/UC table bands remain separate work.

## Quick phone checks later

Start a Second Division club. Dismiss the welcome, reveal/skip the League Cup draw, then advance to a fixture day. Check the fixtures card, match choices, report, all results and table. Back out of the match choices to change your squad, then return with Advance. Continue to November to review the FA draw. Save/reload partway through a draw and between results and table. Check FA Cup statistics after an appearance. A drawn early-round FA match should schedule a swapped-venue replay. On an idle cup day, you should see the other games without playing or receiving home-match income.

## Sources

- RSSSF, England FA Challenge Cup 1998–1999: https://www.rsssf.org/tablese/engcup99.html — January entry, round dates, replays, neutral semi-finals with extra time and replay, and 22 May Wembley final.
- RSSSF, England FA Challenge Cup 1999–2000: https://www.rsssf.org/tablese/engcup00.html — subsequent period competition context.
- FA Cup format overview: https://en.wikipedia.org/wiki/FA_Cup — replay rule changes, including the end of semi-final replays from 1999–2000. Historical rules are intentionally distinguished from the current modern competition.
- Existing League Cup sources and adaptation: RELEASE-1.57-NOTES.md. Lower-division roster/stadium sources: LOWER-DIVISION-DATA-SOURCES.md.
