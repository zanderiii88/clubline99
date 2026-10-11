# CLUBLINE 1.65.0 — Match controls and calmer management

Complete release including all 1.63 and 1.64 usability changes, all game assets and the five supplied Pixabay music tracks. No earlier ZIP is required.

## Changes

- Larger live match controls. Score and clock stay visible; commentary is expandable to give the pitch more room.
- Team opens a paused touchline panel with a compact substitution picker first. Choose who comes on and who comes off, then confirm. Cancel changes no players. Remaining substitutions and completion feedback are clear. Tapping or dragging players queues the same confirmation flow. Sent-off player and three-substitution restrictions remain enforced.
- Tactics and the full XI/bench are expandable beneath the picker. Their expanded state is retained while editing.
- Short pre-match context shows opposition formation/style, tactical advice, eligible selection and tired starters. Detailed scouting remains expandable.
- Current and archived match reports include current availability concerns and the next fixture. Archived statistics, finances and ratings are expandable.
- Inbox consolidates outstanding items that lead to the same screen. Routine training, payroll, development, scouting and stadium updates form an expandable digest with a mark-read action. Outstanding decisions are retained.
- Calendar advancing always stops for matches, draws and transfer decisions. Other club decisions and offered stadium bookings stop when within two days of their response deadline. An optional calendar checkbox restores stopping for every proposal. Routine updates do not stop advancing. Deadline warnings remain highlighted in Inbox and navigation.
- First-season guidance is optional and expandable. Dismiss it for the season; reopen the briefing from Options & Help. Competition entry information remains visible in the briefing and Competitions.
- Touch actions prevent delayed compatibility clicks from activating a different control after the screen changes.

## Validation

Mobile Chromium emulation at 390×844, 360×740 and 844×390 checks navigation, XI review feedback, real touch drag and tap selection, scroll and route restoration, calendar stop/resume, outcomes, preparation and report detail. Added checks cover confirmed/cancelled substitutions, full-list selection, unique XI, red-card restriction, substitution limit, visible score/controls, deadline stop modes, routine digest read and guidance dismissal.

Domestic and European application regressions cover draws/reloads, home/away watched and simulated matches, statistics, backups, migrations and rollover. A full-season application simulation completed every fixture and both domestic cups, with monthly backup checks and reload. Asset checks verify all offline files and unchanged roster records.

Physical Android responsiveness and layout still need user testing.

## Upload and test

Export a career backup first. Extract this ZIP and upload its contents into the root of the existing GitHub Pages game folder, replacing matching files. Allow publishing to finish, then Check for Updates / Load update and reopen. The title should show 1.65.0. Nothing has been deployed automatically.

For one combined phone test, try: XI tap/drag swaps and review; calendar advancing, a stop and resume; a watched match and confirmed/cancelled substitutions; portrait/landscape controls; report expansion; routine Inbox digest; guidance dismissal.
