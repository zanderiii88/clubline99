# CLUBLINE 99 - v1.159.0

Retro football management with Streamlined and In-depth modes. v1.141 improves condition/workload, defensive spacing and pass anticipation, tackle commitment and loose-ball outcomes, and routine-versus-difficult saves in the experimental match lab. Three direct test situations support mobile review. The spatial engine remains separate from career matches and saves. v1.132 is the latest user-confirmed live checkpoint. No VAR.

## Full-match lab test

Open Developer · Match test and choose **Full match test**. Play at a viewing speed or use **Fast-forward** to reach the next decision, half-time or full-time. Use **Apply plan** for tactical changes after kick-off. At half-time you can make substitutions and then select **Start second half**. Choose **Short tests** to return to the scenario picker.

**Match detail** shows possession length, turnovers by pitch third and how often an opponent controls or shoots quickly after a clearance. The sides are shown in Blue–Red order.

Choose **Through ball · run in behind** or **One-two · run for the return** in **Test controls** to see the new patterns. **Match detail** shows completions out of attempts for each side.

**Match detail** now shows goal kicks alongside corners and throw-ins. The event log shows the boundary crossing before the restart.

## Install

If you installed v1.121, remove assets/audio/ambience/ and tools/build-ambience.py before uploading game files again. A ZIP extraction cannot delete old files. Playback is disabled regardless.

1. Export a career backup from Options & Help before updating.
2. Use Clubline-v1.131-onwards-to-v1.159-Update.zip over an existing v1.131–v1.158 installation, or Clubline-1.159.0-Complete.zip for the full game. This update contains everything needed from any of those baseline versions; intermediate update ZIPs are not required. Older installations should use Complete. Keep existing assets/data with the smaller Update.
3. Extract the chosen ZIP into the root of the existing game folder, replacing matching files and retaining subfolders. The files belong directly alongside index.html, not inside an extra parent folder. Keep existing assets/data when using the smaller update.
4. When you choose to publish the files, let GitHub Pages finish, open the game, use Check for Updates and Load update if offered, then reopen it. The main menu should show v1.159.0.

No fresh career is required. Nothing has been published automatically. Existing careers retain their management mode; Options & Help lets you change Management depth without restarting.

Read RELEASE-1.159.0-NOTES.md for changes and verification limits, and ROADMAP.md for priorities.

## Cleaner uploads

Upload either the complete game or cumulative update ZIP. Historic release notes, tests, review results and tools are now excluded. Keep the separate Development ZIP off the website; it is for future source work. Existing old files are not removed by extracting a ZIP: see UPLOAD-CLEANUP.txt if you want to clear those already uploaded. Keep all runtime files, data/assets, credits and licence/source material.

## Try the tactical prototype

Main menu → Developer · Match test. Choose a squad profile and plan, review Assistant, then press Play. During play, select a new plan and press Apply plan. Adjust team plan exposes individual tactical settings. Tap a Blue shirt to set its movement. Replay uses the applied setup; New test changes the seed. Changing the squad or starting situation resets the passage.

## New match tests

In Developer · Match test, open Test controls and choose Goalkeeper distribution, Support movement, Offside flag, Corner or Throw-in. Next action advances to the next event while paused; the flag scenario may first show a loose ball before the receiver becomes involved. Under Adjust team plan, change Goalkeeper distribution and Apply plan. Balanced varies distribution with a preference for long kicks; Possession favours short; Counterattack favours long. Team strength still controls each fictional XI independently. Replay preserves applied settings and Export includes the full seeded test state.

This remains a three-minute lab prototype. Basic contact rules, forced-off injuries, manager decisions and a five-player bench with three substitutions are active. Full-match highlights, complete referee judgement and post-match interviews remain planned. Basic aerial contacts are available; detailed body animation is still planned. Rates remain uncalibrated. No fresh career required.

## Delivery tests in v1.134

Developer · Match test → Test controls → Starting situation now offers Passing accuracy, Ball over the top, Early cross, Byline cross and Cutback. These start with an illustrative delivery, then resume normal decisions. Next action steps to the next incident; Play runs the full passage. The default playback speed is now 2×. Open Delivery statistics for long balls, crosses, cutbacks, errant deliveries, aerial wins and headed clearances. Adjust team plan → Passing changes the preference for lofted outfield balls; apply the draft before play. These are choices, not guarantees.

Errant delivery describes the actual inaccurate target and flight; it does not force possession to change. The intended receiver may rescue it, an opponent may intercept, or either side may chase the loose ball. Player inspection now shows heading; goalkeeper inspection also shows distribution. No fresh career required. v1.132 remains the confirmed live checkpoint until the user confirms a newer upload.

## Movement and cover tests

Developer · Match test → Test controls offers Fullback · space and cover, Fullback · opposing winger, Fullback · exposed overlap, and Fullback · recovery run. Use Next action to inspect the assignments while paused, then open Flank cover. The exposed case gives the example fullback an explicit Overlap instruction; team policies and your saved individual instructions can alter the examples.

Under Adjust team plan → Fullbacks choose Stay back, Balanced · check cover or Overlap · accept risk, then Apply plan. A player's Hold position or Overlap instruction takes precedence. Balanced considers opposing threats, possession pressure, energy and available midfield cover. A covering player's movement still takes time; it is not instant protection. The opposite fullback tucks in. Regrouping helps an advanced fullback recover while a teammate covers. Tap a shirt to inspect pace, acceleration and agility.

Passing statistics now include controlled teammate collections of recent loose deliveries. This is an accounting/receiving correction, not a flat accuracy bonus. Calibration is unfinished: the test model still generates too many goals over longer passages, so it remains separate from career matches.

## Restart and balance tests in v1.140

Choose Goalkeeper distribution, Corner, Throw-in or Demo · penalty awarded in Test controls. The restart countdown below the pitch shows preparation time. Skip setup advances the ordinary deterministic simulation to the restart; Next action also crosses the entire scheduled wait. Play retains your selected playback speed. Injury decisions still wait for your input. Match detail separates time with the ball in play from restart setup time.

Try Defence · inside the box to observe defenders reacting to a reachable shot path. Anticipation affects reaction and physical attributes limit movement; distant defenders do not teleport into a block. Recovery between tackle attempts reduces repeated attempts during a single close duel. This is an incremental balance pass, not completed historical calibration.

## Defending and condition tests in v1.141

Main menu → Developer · Match test → Test controls → Starting situation:
- **Defence · passing lane:** Red can move ahead of a ground pass to intercept. Anticipation affects reaction; physical movement and contact decide the result.
- **Defence · close control:** a defender in the box chooses whether to commit or stay on their feet. Discipline, ball reach and the state of the touch affect the choice. A fair tackle may win clean possession or knock the ball loose.
- **Condition · tired squad:** Blue outfield players start at 55% energy. Choose and apply High Press to compare workload, or inspect a shirt and the bench. The selected tactical plan is respected.

The folded Defending and condition panel explains the choices. Player inspection shows current intent and energy. Goalkeeper workload is lighter; outfield condition follows actual movement/pressing, with modest recovery during setup. The lab's fictional strength tiers now apply ±6 rather than ±10 attribute points; this affects lab comparisons, not historical career player data. No fresh career required.

Matched long diagnostics show lower scoring, but shot/pass volume and effective-time/foul incidence remain uncalibrated. This build is for testing the mechanics, not realistic season validation.
