# CLUBLINE 1.64.0 — Usability and experience

Complete release based on 1.63.0. All game assets and the five supplied Pixabay tracks are included. No previous ZIP is required.

## What changed

- The next-up stadium card shows how far away the next match is, competition, venue and a preparation shortcut. It can flag a possible injury return before the match without promising availability.
- Team, Club, Competitions and Inbox remember their last screen. Each workspace remembers its scroll position. Closing player details returns to the previous screen and position.
- The calendar remembers a chosen advance destination when stopped by a decision, draw or matchday. Review the stop, resolve it, then continue towards that destination. The destination survives a save/reload and can be cleared. Stop text updates when the previous blocker is resolved.
- Specific lineup warnings explain empty places, duplicate selection, goalkeeper requirements and unavailable players, with an Auto pick recovery action.
- Match preparation shows XI availability, XI review and optional tactics review. Tactics remain accessible within pre-match lineup confirmation. The kickoff button says “Kick off with this XI” to distinguish it from reviewing the selection.
- Player selection stays visible in a sticky status strip with Cancel. A completed swap briefly highlights both affected players and confirms their names.
- Transfer signings/sales, contract renewals, training/youth investments and medical spending show a compact outcome card with the actual cost, wage/level where relevant and balance.
- Current match reports lead with score, standout player, net income, attendance and injuries/red cards. Statistics, finances and player/key-event detail are expandable; Continue remains easy to reach.
- Larger touch targets for player information and bench swap controls. Touch button handling prevents a delayed duplicate click while preserving ordinary player taps and drag gestures.

## Validation

Browser emulation at 390×844, 360×740 and 844×390 checked the previous mobile flows plus selection cancellation, specific lineup blockers, player screen/scroll restoration, destination memory, optional tactics review, investment cost/outcome, calendar target save/reload, stop review/resume availability, pre-match tactics access, and expandable match reports. No browser exceptions or page overflow in the checked flows.

Domestic and European cup application regressions passed: draw controls and reloads, watched/simulated home/away matches, separate statistics, backups, migrations and rollover. Asset/syntax checks verify the release references and unchanged roster baseline.

Checks use browser emulation and application tests. Responsiveness and touch behaviour on a physical Android phone still need your feedback.

## Upload

Export a career backup first. Extract this ZIP and upload its contents into the root of the existing GitHub Pages game folder, replacing matching files. Allow publishing to finish, then use Check for Updates / Load update and reopen the game. The title should show 1.64.0. Nothing has been deployed automatically.
