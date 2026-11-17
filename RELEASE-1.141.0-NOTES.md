# CLUBLINE 99 v1.141.0

Defending, condition and keeper difficulty pass in the isolated spatial lab. Prepared for testing; not public-release preparation or a release candidate. v1.132 remains the latest user-confirmed live checkpoint. No VAR.

## Changes
- **Condition follows workload.** Replace the heavy flat drain that exhausted virtually every starter, including keepers. Actual movement and pressing cost energy; stamina affects the rate; goalkeepers have a lighter workload. Restart setup allows modest recovery. Bench players retain their own condition. This is an abstract prototype model, not a measured physiological simulation.
- **Defenders can close down.** Attacking support keeps wider target separation; defensive spacing is tighter, and a player actively closing or containing a carrier is not pushed away by a teammate's reserved target.
- **Anticipate a ground pass.** Up to two defenders can move towards a reachable future point on a pass/cutback. Anticipation affects reaction; actual travel and contact still decide the interception. Lofted balls retain the separate aerial logic.
- **Choose the challenge.** Ball reach, an unsettled touch, discipline, an existing booking and box context affect whether a defender commits or stays on their feet. Fouls remain judged separately under the existing contact rules. The choice never guarantees a fair challenge or a penalty.
- **Clean and loose tackles.** A fair challenge can win control or poke the ball into a short visible flight for either side to contest. Tackling versus control/dribbling and approach affect success. Clean-up of the intentional defensive play resets the old offside phase; no pass/completion is credited for the poke. Rebounds finish their short flight before becoming stationary loose balls. No distant/bench tackle can win possession through the API.
- **Contextual keeper contact.** A routine central shot already in reach is much less likely to be missed than a late, stretched contact. Physical positioning/reaction/reach still gate contact; handling still affects held versus parried saves. These are prototype probabilities, not historical measurements.
- **Moderate fictional tiers.** Lab tier shifts become ±6 instead of ±10 across attributes, reducing compounded extremes across passing, movement, tackling and finishing. Historical career data is unchanged.
- **Preserve injury stops.** A fair contact that forces an injury cannot leak into another carrier action after play has stopped.

## Mobile tests
Main menu → Developer · Match test → Test controls → Starting situation. Three new options: Defence · passing lane, Defence · close control and Condition · tired squad. The tired setup starts Blue outfield players at 55%; apply High Press yourself to compare the selected tactics. Player inspection shows intent and condition. A folded Defending and condition panel explains the mechanics. The lab starts paused, uses fictional XIs and has no effect on your career save.

## Validation
Eighty-one rotated/team-swapped three-minute pairs match event ledgers/stats, with maximum positional discrepancy about 1.30e-10m. Dedicated fixtures cover load/stamina/recovery and timestep consistency; pass reaction/reach; close-down target spacing; cautious versus exposed-touch choices; clean/loose/failed and distant tackles; moving poke/restore/pass accounting/offside reset; routine/stretch/late saves; a fair forced-injury stop; and nine restored demo passages. Existing simulation, tactics, recovery, offside/restarts/support, keeper distribution, strength, deliveries, aerial, movement/cover, keeper angles, build-up, contact rules and injury/bench checks pass. Source/cache and career navigation/save/backup checks pass.

Six matched continuous 90-minute diagnostics per version:
| Metric | v1.140 | v1.141 |
|---|---:|---:|
| Goals per passage | 5.17 | 1.50 |
| Shots per passage | 43.50 | 41.17 |
| Passing attempts per passage | 1389.67 | 1784.50 |
| Pass completion | 64.0% | 56.3% |

Twenty matched ten-minute passages: goals 0.80→0.25, shots 6.45→4.30, completion 63.9%→56.2%. Twelve further 90-minute diagnostics cover two regression and two additional seeds, four even games and eight strength mismatches. Stronger sides win seven mismatches; one loses 0–1 while dominating shots. Even games end 1–1, 0–1, 3–1 and 0–0. Active outfield energy ends 39.0–89.8%; keepers 96.5–97.9%; none of the active players reaches the floor in that set.

**Unresolved:** stronger-side shots still reach 43–74 in mismatches; passing volume is excessive, completion has fallen, effective play lasts 76.5–85.9 minutes in the additional set and some foul totals are low. Lower goals do not by themselves establish realism. No forced results, score caps, event quotas or post-hoc statistics are used. Continuous diagnostics omit halftime/calibrated added time and use fictional squads. The engine stays separate from career matches; no realistic season claim is made.

Browser review at 320px confirms the pass-lane interception, tired-player 55% inspection, draft-to-applied High Press flow and folded explanation without horizontal overflow. Cloud UI and Node CPU diagnostics are not physical-phone performance benchmarks. The new pass prediction adds CPU work, recorded separately in Development.

## Upload
Use Clubline-v1.131-onwards-to-v1.141-Update.zip over any v1.131–v1.140 installation, or Complete for all runtime files. Runtime packages omit historic release notes and development tools/tests; retain Development separately. ZIP extraction cannot delete old files; UPLOAD-CLEANUP.txt lists exact optional cleanup paths. Existing asset/data bytes are unchanged. Export a career backup before updating. No fresh career required. Nothing has been published automatically.
