# CLUBLINE 99 v1.117.0 - season stories

## A companion to the newsroom
Season stories brings recorded career developments together in two views, accessible from the Season picker, club planning/overview and the League newsroom.

- Your club: the next competitive meeting with club head-to-head and personal manager-exchange context kept separate; league winning/unbeaten/winless runs of three or more retained games; leading recorded scorers after three goals; under-22 players with at least five appearances and 450 competitive minutes; recorded player milestones; current-season club-history chapters.
- Around your division: manager appointments and selected rivalry/big results from the last 30 calendar dates this season. Club membership uses the current division; cup meetings between its clubs can appear. Departing managers' retained spell records provide context where available.
- Each card has Behind this story context and relevant existing player, club, match-report, press-room or history links. The layout uses two columns on desktop and one below 700px.

This is a read-only editorial view. It creates no saved news entries, consumes no random rolls and changes no morale, finances, selection or calendar stops. Existing press choices, follow-ups and capped effects are unchanged. Source records are deduplicated, and future results, friendlies and other clubs' player totals are excluded. Milestones describe recorded career tracking, not a player's real-world debut. Older careers can have gaps; personal exchanges and club reports are limited to retained history.

## Verification
Pure story tests cover winning/unbeaten/winless runs, ties for top scorer, youth thresholds, milestones, club/season/date filters, manager records, rivalry history, duplicates and no mutation. Both-mode application checks cover navigation, escaped strings, scope switching, player links, compressed saves, portable backups and scope reset after loading/new careers. Existing newsroom checks pass.

Both-mode calendar integration reaches 20 August with two completed stadium projects and a managed match, repeatedly rendering the story view without changing career data. The resulting first-match player milestones appear. Source checks cover all five divisions, module syntax, assets and 228 exact cache/import URLs. These checks were rerun on the restored release source on 16 November.

Desktop Chrome review on 15 November loaded an existing Arsenal career, opened Season stories, switched club/division scope, expanded the next-opponent context, followed a recorded milestone to player details, and returned through the newsroom link. Cards and supporting text were inspected at the desktop viewport. No physical Android, production offline upgrade or new full-season browser test is claimed. The v1.116 six-season evidence remains historical; game-engine and economy rules are unchanged here.

## Installation
Export a backup before updating. The cumulative ZIP supports v1.94 through v1.116; the complete ZIP includes all assets and data. No fresh career required. Existing stable save key retained. Nothing published.
