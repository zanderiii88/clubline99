# CLUBLINE 99 v1.125.0 - atmosphere and simpler everyday play

## Light continuous atmosphere and button feedback
Club screens now have a continuous, low-volume distant-traffic recording, with a two-second fade at context changes. It begins when the career opens after a user gesture, rather than waiting 12-28 seconds for the first occasional sound. Intermittent screen-specific sounds remain but play at half their former gain. Live matches retain the stadium bed; manual pause, hidden pages and mute still stop sound. The new 62-second loop has a crossfaded seam and a credited CC BY 4.0 source, included in Options & Help and AUDIO-CREDITS.md.

Buttons and menu disclosures now play a short click using the existing interface effect. It follows FX volume/mute, is throttled against repeated rapid activations and does not create a playback queue. Intro music remains the default on title/setup screens. Existing preferences are preserved. Listening and final mix approval on the user's own speakers/phone remain outstanding.

## Date simulation
The calendar now offers Simulate All Events, Ask Me For Key Decisions and Stop For Any Decisions. The last keeps the previous behaviour. Key-decision mode has individual switches for matches, transfers, injuries/suspensions, pressing board reviews, press questions and club proposals. These choices are remembered and can be changed at a stop before continuing to the saved destination.

Delegated runs use actual match and calendar handlers. The assistant selects eligible lineups and simulates matches; transfer offers and stadium bookings are declined, press responses use no comment, and optional stories can expire. Existing agreed transactions still settle. No new player sale, purchase, stadium spending or contract is silently authorised. Simulation stops if a legal lineup cannot be selected, at season completion, or when paused; it does not fabricate players or automatically begin another season. Destinations are limited to the next 370 days.

The recap lists every managed match result and relevant key events, including the club's own injuries, with a count of declined proposals. It excludes other clubs' unrelated injuries. Intermediate match renders and saves are suppressed while batching; final state is saved normally. Ordinary Continue remains unchanged unless continuing a selected simulation journey.

## Compact stadium builder
The default builder combines a compact clickable plan, a highlighted 3D preview, stand and roof choices, capacity, cost and duration. Whole-side selection is available. Finishes, saved plans, phasing and detailed controls are folded away, with the previous advanced editor retained. The section-by-section quote is collapsed initially. A Club menu shortcut makes it easier to leave a saved subpage and choose another club screen.

Previewing costs nothing. Review construction still shows closures, affected matches, duration and cash before the separate Confirm & pay action. Booking conflicts, active-project limits, site clearance and affordability checks remain. Capacity checks now respect the starting minimum of smaller Scottish grounds in both editors.

The attached FIFA Soccer Manager screenshot informed the compact layout; the linked YouTube video could not be fetched here, so no claim is made to have watched its segment.

## Managers and match updates
40 verified starting manager names are available under the existing real-names switch: the English Premier League and both playable Scottish divisions. The user's own manager identity is preserved. New generated coaches, lower English divisions and unresearched European opponents remain fictional. Historic names follow the original person ID through career moves and display consistently in saved narrative. See STARTING-MANAGERS.md for scope and sources. Ratings/career behaviour remain game estimates.

Live matches now provide named passing moves, runs, switches, tackles, crosses and build-up approximately every two match minutes when no larger incident occurs. They appear directly in the latest-action feed and full commentary. These passages use current participants and do not generate extra shots, goals or saves. Commentary itself uses no random draws. The larger event-linked 2D shirt-and-ball match view is planned separately in MATCH-VIEW-PLAN.md.

## Verification and limits
- Calendar: two-month actual-handler journeys in both modes, 11 managed matches per mode, target dates, key-match stop then delegation, disabled press questions, saved preferences, compressed reload and backup parsing.
- Stadium: compact/advanced controls, unchanged preview balance, existing itemised review/one-time confirmation and project safeguards in both modes; a desktop browser journey verified a £133,000 preview, +150 seats and six-week duration, with no payment made.
- Match: richer passages in actual games and save/reload in both modes; real goal/save reactions remain tied to engine events. No physical-device listening claim.
- Audio: continuous floor and a single schedule through 500 repeated renders, independent mute/FX, visibility and pause behaviour; 32 recordings decode and their cache/byte-range checks pass, with 23 sources credited.
- Manager names: all 40 mappings, shared toggle and saved narrative aliases, appointment/record preservation, compressed reload and backup checks.
- Balance: 200 independently drawn background-score fixture grids per division. This is diagnostic evidence, not 1,000 full career playthroughs. Premier scoring remains somewhat high and improbable standings can occur; no ratings or score-model tuning is bundled with this usability release.
- Module syntax, current data counts, stadium/kit assets and 240 exact offline module import URLs checked. Existing payroll and workspace-navigation checks pass.

Desktop browser controls were exercised; physical Android, narrow-screen interaction, a real offline version upgrade and the final audio mix remain to be checked. No database or stadium-scene assets were changed. Existing careers need no restart; export a backup before installing. Nothing was published automatically. The user-confirmed live baseline remains v1.114.
