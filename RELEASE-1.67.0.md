# CLUBLINE 1.67.0 — Club overview, squad depth and match action

Complete release including Streamlined and In-depth, all earlier usability fixes, every game asset and the five supplied Pixabay music tracks. No earlier ZIP is required. Nothing has been deployed automatically.

## Stadium overview

- Upper-right mini league table shows your club and the two clubs either side, shifting to five rows at the top/bottom. Points, goal difference and the last five league results are shown. Green dots are wins, grey are draws, red are losses; outlined dots mean no game yet. Results read oldest to newest. Your club is highlighted; tapping opens the full table.
- Upper-left Club spotlight rotates every nine seconds through recent player form, league scoring/assist/clean-sheet leaders, team form and recommended actions. Previous/next controls, swipe and a pause control are available. Rotation pauses after interaction and while a control has focus, and respects reduced-motion preferences. Urgent selection, decision or balance concerns remain pinned in red. Tapping opens the relevant player, decision, team or budget screen.
- The bottom club card is centred with equal side margins and fits above the ticker/navigation. Excess content stays within the card instead of being cut off.

## Competitions

Season briefing competition buttons close the briefing and open the selected competition. Back returns to the briefing without advancing time or consuming a pending draw.

Domestic division buttons appear only on domestic league table, fixtures and club screens. Champions League has Tables, Fixtures, Results and Clubs views. Group tables show your group first; previous stages can be expanded. Fixtures and scores are separated, club names open scouting, and the participating-club list offers squad inspection. Undrawn groups and fixtures remain hidden until the scheduled draw is completed. UEFA Cup uses Fixtures, Results and Clubs, with no invented group table. Format explanations are expandable.

## Transfers and youth

Streamlined Find a player retains assistant suggestions and adds name search, position/status filters, maximum estimated fee, minimum/maximum value, age/rating filters and sorting. Search distinguishes player value from transfer fee. Free agents are included with £0 fees and visible weekly wages; confirming a free signing still uses a registration place and adds payroll. Free agents are supplemental fictional players saved with the career, with a new intake each season; original roster records are unchanged. Signings still require confirmation and can be cancelled without spending.

Both bench and reserves remain available beneath the XI. A persistent reserve dropdown selects a player for a subsequent XI/bench swap; the outgoing player becomes available immediately.

Temporary youth call-ups occupy an appropriate registration place and add the displayed senior weekly wage while called up. Return to youth is available between matches, removes the player from XI/bench and senior payroll, and retains recorded appearances, fitness, form and development. Recalls use the same player identity. Permanent promotion is a separate explicit choice and retains senior terms without the temporary return option. Loans/sales require permanent promotion first. With one or fewer reserves, the youth call-up panel opens as a cover shortcut. Temporary call-ups return to the academy at season rollover before summer senior payroll is calculated.

## Stadium planning

Streamlined offers a mid-season stadium review after half the league fixtures and a summer review once the season is complete, each once per season. Attendance, near-sell-outs, capacity and cash help decide whether to review upgrades, defer until season end or keep the ground unchanged. Monthly facility investment cards no longer prompt stadium design. Optional Stadium planning remains accessible from Club's decision/summary workspace; In-depth retains unrestricted facilities access.

The designer has four labelled corner buttons with large touch targets. Side/corner/whole-ground shortcuts wrap instead of disappearing into horizontal scrolling. Selecting a corner from a side selection clears the side, avoiding accidental mixed upgrades. Previewing spends nothing; construction confirmation shows cost, completion date, closed seats and affected home fixtures. Summer projects can extend into the next season if their duration is long.

## Matches

Latest match action stays visible above the lineups, including chances, saves, goals, cards, injuries and short passages of play. The fuller commentary remains expandable. Explicit Next event, Half-time and Full-time buttons are always in the main live controls; Half-time disappears after the break. Skipping pauses at its target and still stops for an injury/sending-off decision when the assistant is not handling it. Existing substitution confirmation, cancellation and limits remain.

Full-time and archived reports show goal scorers and minutes directly beneath the score, with sent-off players, minutes and second-yellow labels. Other report details remain expandable.

## Validation and installation

Targeted Chromium mobile emulation at 390×844, 360×740 and 844×390 checks briefing links, competition browsing/draw privacy/club inspection, table boundaries and form, free signing, youth call-up/swap/reload/return, corner selection, stadium review, live action/skips, scorer/red-card summaries, centred cards and overflow. In-depth mobile regressions, European application regressions, full Streamlined season/backups and dedicated squad/free-agent/rollover checks passed. Asset checks verify all 68 stadiums, 408 kits, offline files, JavaScript syntax and original roster preservation. Physical Android responsiveness remains for user testing.

Export a career backup, extract the complete ZIP and upload its contents to the root of your existing GitHub Pages game folder, replacing matching files. After publishing, Check for Updates / Load update and reopen. The title should show 1.67.0. Existing careers remain supported.
