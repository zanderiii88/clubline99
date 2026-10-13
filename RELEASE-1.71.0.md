# CLUBLINE 99 — 1.72.0

Complete cumulative release built from the verified 1.70.0 ZIP. Extract the entire archive before uploading its contents. No deployment was performed.

## Nationalities and flat flags
- Flat local flag images follow names in squad lists, bench/reserve cards, player profiles, scouting rosters, transfer results and comparison headings.
- Profiles also write out the nationality. Flags are bundled for offline use and do not depend on emoji rendering.
- Historical counterpart nationalities are mapped from sourced roster records. A small number of unresolved historical players show “Not yet verified”; they are never assigned their club's nationality as a substitute.
- Fictional players receive a nationality before a matching name is generated. Lower-division English clubs have a stronger British/Irish core; top-flight and European recruitment is more varied. Academy generation is predominantly local.
- Identities belong to the player and persist through transfers, loans, promotion and reloads. Existing fully fictional names are refreshed once to fit this identity system; player IDs, ratings, contracts and club ownership are retained.
- The original historical roster JSON files are unchanged. Period flag treatment includes Yugoslavia and the pre-2004 Georgian flag.

## Managers
- Club scouting now includes an expandable manager profile: nationality, preferred formation/style, appointment date, current-spell results, win rate, job status and previous appointments.
- AI managers are fictional. Their match records begin when this feature is enabled in the career; no invented historical results are added.
- Poor sustained results can lead to a dismissal after sufficient matches and tenure. Summer departures and retirement can also open jobs. Successful managers can move up to stronger clubs, and replacements are assigned without leaving duplicate appointments.
- Manager changes appear as important news in the live ticker and in the relevant club's news.
- Your profile and selectable nationality are available through “Manager & board”. Your board confidence remains advisory: this build does not dismiss the human manager or implement switching the human manager's club.
- Foreign clubs without enough simulated fixtures do not receive arbitrary performance dismissals. Their statistics cover only the competitions simulated by the game.

## Board reports
- Routine reports arrive at the end of every third month of the review cycle: October, January, April and July for a new August career.
- Pressing financial concerns or sustained poor performance prompt additional month-end reports. Once concerns ease, a recovery review returns you to the quarterly cycle.
- Reports explain what pleases the board, what needs improving and concrete priorities, with optional figures and an archive of the latest 24 reports.
- Continue and calendar advancing stop for unread reports in both management modes. Closing a report leaves it unread; “Acknowledge report” clears the stop.
- The Club heading highlights unread reports, with red used for urgent concern in Streamlined mode.
- On older saves, the cycle begins when this feature is first enabled; past reports are not fabricated.

Starting-roster coverage: 4,056 of 4,074 players have a sourced or deliberately generated nationality; 18 historical identities remain unverified.

## Verification
- Full Streamlined season: 54 matches, 195 Continue calls, both domestic cups complete, repeated save/reload and portable-backup validation.
- Manager appointment consistency, performance dismissals, upward moves, quarterly/monthly/recovery cadence, unique fictional identities and save validation.
- Mobile touch workflow at 360px and 390px portrait plus 844px landscape; report acknowledgement, archive, manager nationality and save/reload.
- Existing loan, compressed-save and completed-season rollover checks; twelve world-development rollovers.
- Historical base-roster integrity, all stadium and kit assets, local flag references and offline cache targets.
- Complete ZIP integrity and extracted-file hash comparison before saving.

Source mappings and flag licensing are included in nationality-records.js, NATIONALITIES-SOURCES.md and assets/flags/LICENSE.txt.
