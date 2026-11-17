# CLUBLINE 99 v1.132.0 — match foundations

The developer lab now favours long keeper kicks by default, offers distinct support angles, separates teammate targets, models first-touch mistakes and adds basic offside/restarts. Normal career matches and saves are unchanged. This is a prepared experimental build, not a release candidate or public launch.

## Try it
Main menu → Developer · Match test → Test controls. New situations: Goalkeeper distribution, Support movement, Offside flag, Corner and Throw-in. Use Next action or Play. An offside-positioned receiver can first allow the ball to run loose; involvement then triggers the flag. Adjust team plan → Goalkeeper distribution controls short/varied/long independently of outfield passing; changes require Apply plan. Existing strengths, profiles, individual instructions, replay and JSON export remain available.

## Football changes
- Lofted keeper kicks pass over ground contacts and descend into a collection contest. Passing/technique/composure influence accuracy. Balanced varies with a long preference; Possession favours short; Counterattack long. Kicks have visible flight/ball-size cues and a count.
- Two supporting midfield/fullback outlets keep distinct lanes after role movement is evaluated. Targets consider space, passing lanes and teammates' reserved positions. Attackers try to time runs relative to the defensive line, with ability/variation. Fixed a direction-specific pressing offset.
- Receivers can control or miscontrol, with technique, composure, pressure, energy and incoming flight affecting risk. Successful controls introduce a short settling period. Poor touches spill a loose ball rather than silently gifting possession.
- Offside snapshots at release and sanctions on involvement, with level/own-half/behind-ball exceptions and direct goal-kick/corner/throw-in exemptions. A flag cancels reception and awards an indirect free kick. The incident includes its release position in the export. No automatic review or VAR.
- Throw-ins, corners, goal kicks and indirect restarts stop play, set up and resume. Balls can run out; blocked shots can produce corners. Goal kicks must leave the penalty area before collection, reflecting the historical rule. Kick-off delivery travels forwards. Restart transitions explicitly reposition shirts.
- Offsides, corners, poor touches and long keeper kicks are displayed in the test statistics. Important flags remain briefly visible in commentary rather than being immediately replaced by restart text.

## Validation
Rule/support fixtures cover both directions, onside exceptions, direct-restart exemptions, involvement using the saved release position, four restart types, restart JSON replay, boundary awards and the historical goal-kick restriction. A crowded setup goes from 6 close teammate pairs to 0 after seven simulated seconds. Across 300 paired first-touch conditions, high-ability players miscontrol 7, low-ability players 36. Distribution tests cover 320 first decisions per setting: varied 226 long, short 56, long 302; mean long-kick distance about 53m. Natural passages include teammate collection, opponent collection and loose landings.

30 spatial, 48 tactical/profile, 48 non-stalling and 90 strength-control passages passed, together with previous loose-ball recovery, deterministic replay/restore, bounded live movement, source/cache and both-mode career-navigation checks. In 60 three-minute mismatches, stronger sides made 240 shots to 40 and scored 55 to 7; 34 wins, 23 draws, 3 losses. Equal-tier controls: 8 Blue wins, 7 Red wins, 15 draws, goals 12–10. These short tests do not establish realistic 90-minute scorelines, upset frequency or season calibration. Longer scoring/pass-reception calibration and identical-squad mirror tests remain priorities.

Mobile browser checks cover keeper distribution, offside, corner/throw-in delivery, support playback and applied-plan controls at 320px. Physical phone performance and subjective movement still need user testing.

## Still planned
Readable highlights with live text/stats between passages; fouls/advantage, direct free kicks, penalty appeals/awards/kicks, cards, injuries, substitutions, aerial duels, occasional marginal referee mistakes and incident-based interviews/rivalries. Current offside uses player centres and ball involvement, not detailed body geometry or interference with opponents. None of those pending features is implied by the new basic restarts. No VAR will be introduced. Audio direction remains default intro theme then quieter ambient/atmospheric main-game sound.

Upload packages exclude historic notes, tests and tools. Development materials are in the separate Development archive. No files have been published automatically.
