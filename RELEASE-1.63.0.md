# CLUBLINE 1.63.0 — Mobile usability

## Navigation and flow

- Five persistent destinations: Stadium, Team, Club, Competitions and Inbox.
- Date/time opens Calendar; balance opens Finances; the settings button opens Options & Help.
- Club groups overview, finances, contracts, stadium/facilities, youth and development.
- Competitions groups league tables, fixtures/results, cups and club browsing. Calendar, events, news and settings no longer fill that menu.
- Inbox brings outstanding decisions and updates together. Routine notifications are available here and through the ticker.
- Persistent Advance action identifies the next step: a day, match preparation, matchday or cup draw.
- Back returns to the relevant parent destination, then the stadium.

## Calendar

- Advance to a selected future date, or towards your next match.
- Stops for matchdays, draws and transfer/club/stadium decisions; it does not auto-answer them or play your match.
- Pause control during longer advances. Daily game processing remains the existing simulation; rendering is batched for responsiveness.
- Your fixture dates and fixture rows are highlighted.

## Team and touch controls

- XI, Tactics and Players shortcuts, with secondary team screens available in the screen selector.
- Separate Bench and Reserves tabs.
- One vertical workspace scrolling area in portrait and landscape. Tables can still scroll horizontally where needed.
- Tap a bench/reserve player, then a starting XI shirt to swap; drag from shirt images remains available.
- Selected players and swap/drop targets are highlighted. Selection taps update the existing elements instead of rebuilding the screen.
- Touch buttons execute on pointer release, with duplicate native click protection. A drag no longer suppresses unrelated button actions.
- Starting XI review gives a confirmation message and shows “Starting XI reviewed ✓”. Changing the lineup clears its review as appropriate.

## Attention and season introduction

- Amber badges indicate review needed. Red indicates an unavailable XI, negative balance, imminent contract expiry, due club decision or pending draw.
- Outstanding actions remain highlighted when a heading is opened; resolved actions clear their indicators.
- The chairperson’s welcome lists your competitions and entry stages. The summary remains in Competitions and appears again for a new season.
- Opening guide/welcome links does not launch a draw. A new career’s opening League Cup draw is scheduled for the next day.
- Your domestic and European cup ties and fixtures are highlighted.

## Performance and retained content

- Removes the duplicate render when changing sections and avoids constructing hidden overview content.
- Pauses SVG stadium animation behind management screens, and reuses existing prepared stadium surfaces.
- Contains all game, menu, stadium, kit and audio assets. Preserves the five user-supplied Pixabay tracks and source metadata. Old generated menu music is omitted.
- Version and offline-cache references updated to 1.63.0. Existing career save identity retained.

## Validation

- Browser emulation at 390×844, 360×740 and 844×390: guide flow, competition briefing, XI confirmation, tap swap, touch drag from bench into XI, no duplicate selected players, one lineup scrolling surface, navigation/calendar stops, and no page overflow or browser errors.
- Domestic cup/matchday application regression: five starts, draw/fixture/result/table reloads, idle days, matches, cup statistics, backups, rollover and migration.
- Champions League and UEFA Cup application regressions: draw controls/reload, watched and simulated home/away matches, statistics, backups and migration.
- Full season simulation: 635 progression steps, 52 matches, 82 fixture/result days, 46 tables, 15 draws, reaching 5 June 1999.
- All 68 stadiums and 408 kit/shirt assets present; offline asset references checked; JavaScript syntax and roster baseline verified.

These are automated browser-emulation and application checks. Responsiveness on a physical Android phone still needs your feedback; the change does not claim a measured device performance improvement.
