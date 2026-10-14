# CLUBLINE 99 — v1.74.0

Complete release based on the verified v1.73.0 package. Extract and upload its contents to the GitHub Pages repository root, replacing matching files. index.html belongs alongside app.js, style.css, sw.js, manifest.webmanifest, assets/ and data/. Nothing has been deployed automatically. The title should show v1.74.0 after updating.

## Calendar pop-ups
- When travelling towards a selected calendar date or next match, optional pop-ups show the saved destination, an "Ignore this type in future calendar journeys" checkbox, and "Skip this prompt & continue".
- Leaving the checkbox unticked skips only the current item for that journey. Checking it saves a preference for subsequent calendar journeys. The current trip resumes automatically towards the original date.
- Applies to scouting suggestions, facility/stadium planning suggestions, youth recommendations, suggested sales, routine board reports, club event updates, optional club proposals, and each cup's draws.
- Skipping a draw reveals its complete outcome and marks the draw event finished. Tables, groups and fixtures remain available under Season. Each competition can be restored separately.
- Skipped suggestions/reports remain available in the appropriate club pages, pending decisions or report archive. No purchase, transfer, loan, contract renewal, facility investment or stadium work is approved by ignoring a prompt.
- Optional proposals can expire when their deadline passes. Skipping does not accept them.
- Matches/matchdays, actual transfer and loan decisions, contract decisions, urgent squad availability changes, finance warnings and pressing board reviews retain their stop behaviour.
- In-depth calendar proposals now have a pop-up with the same skip/ignore controls and a working Review in Inbox route.
- Options & Help → Calendar pop-ups provides individual checkboxes to restore each optional category. These preferences and the saved journey survive saves and portable backup export/import.
- Existing global draw-watch preferences remain available separately for ordinary Continue outside a calendar journey.

## Verification
- Both management modes stop for the opening-week event and resume to the saved date after skip/ignore. Preferences survive save/load and portable validation.
- Unticked suppression skips an item only for the current journey; a new destination resets those temporary skips.
- Routine versus urgent board reviews and optional versus mandatory decisions tested. Actual transfer approval still stops the calendar.
- Ignored Champions League draw completes without spending money; individual preference restoration re-enables suggestions.
- Headless mobile Chromium checked actual checkbox/button interaction, preserved destination, no automatic facility payment, restored suggestions, proposal Inbox review and reachable controls at 360px/390px portrait and 844px landscape. No page errors.
- v1.73 manager, facility, simulation interruption, loan recall, star display and youth intake regression checks passed. Existing mobile comparison, stadium blueprint, substitutions, match highlights, half-time advice and draw layout checks passed.
- Syntax/offline references and all existing stadium/kit assets checked. Complete ZIP integrity and extracted-file hashes verified before delivery.

This release focuses on calendar control. All v1.73 gameplay, artwork, audio, historical data and assets are included. Actual Android touch/installed-app behaviour remains useful testing on your phone.
