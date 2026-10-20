# CLUBLINE 99 v1.92.0

Upload every file in this update to the repository root. There are no new asset or data folders. The new match-control.js file is required by app.js and career-backup.js. No deployment is performed by this update package.

## Fixes
- Continuing a live device save now restores the match paused. The score, minute, substitutions and participants are retained. Pending substitutions need a fresh selection before confirmation.
- Backup restoration preserves injury, red-card and half-time context instead of replacing it with a generic manual pause. Those decision drawers remain open.
- Live backup validation rejects duplicate XI/bench selections, more than three substitutions and invalid live score/time/selection fields.
- Muted draw prompts are processed before a calendar journey checks for blocking events, including immediately after loading a career.
- Changing a notification setting refreshes a report/results/table/draw overlay when its flow changes, while unrelated settings do not force a redraw.
- Scottish season reviews show Scottish qualification headings, domestic cup names, promotion/relegation and final tables instead of English-only labels and tables.

## Behaviour retained and checked
Three substitutions remain the limit. A red-card vacancy cannot be filled, and changing shape neither refills it nor uses a substitution. An injury vacancy can be filled while changes remain. Skipping stops for a new managed-team injury or sending-off; Next event respects the half-time boundary. Full-time skipping and direct simulation can intentionally pass half-time. No new match rules or automatic spending were introduced.

Post-match results precede league/group tables when both are enabled. Champions League group games use group standings; knockout games do not show an unrelated league table. Reports/results/tables remain independently optional. Reopening a report or reviewing a table does not pay match income again.

Ignored optional calendar prompts survive saving and loading. They do not accept transfers or spending, hide urgent decisions, or play an unplayed managed match automatically. A calendar journey may legitimately stop before its next match when a required decision arrives.

## Validation
The 34 targeted engine scenarios cover both modes, live reload/backup, substitution limits and vacancies, all formations after a dismissal, forced incident stops, half-time, all eight report/results/table preference combinations, Champions League and knockout flows, calendar preferences and required decisions.

Browser interaction checks cover both modes at narrow portrait and landscape sizes: playback controls, stadium/line-up switching, a confirmed substitution, rotation, paused reload and report → results → table. Draw completion and stadium-builder controls were also checked. These are browser-emulation checks, not tests on a physical phone.

Full-season checks cover Scottish First Division in Streamlined, Scottish Premier in In-depth and English Premier in In-depth, with monthly save/backup checkpoints and rollover into season two. Routine test decisions are acknowledged or declined; optional investments and transfers are not automatically accepted. These tests exercise the real game engine; they are not financial-only projections. The latter two runs use the existing calendar-batch path for daily advancement. Completed managed matches/checkpoints: Scottish First 46/12, Scottish Premier 42/12, English Premier 61/11. All three reached season two and passed its save/backup check. A loan enquiry is a required approval stop, not an optional prompt to bypass.

The production files, without test hooks, passed offline reload and cache replacement checks. JavaScript syntax, module/cache paths and ZIP integrity are checked for the delivered update.

This release keeps the v1.91 roster/economy edition. A fresh career is not required for an ordinary valid v1.91 save.
