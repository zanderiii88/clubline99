# CLUBLINE 99 v1.128.0 - developer match simulation lab

## Straight into testing

The main menu now has Developer · Match test. It opens a separate experimental match screen immediately, with fictional Blue XI and Red XI sides. A three-minute passage starts at 4x speed. No career setup is required and the lab does not read or write career saves. Menu returns to the normal app, where Continue remains available.

Pause/Play, 1x/2x/4x/8x playback, Replay, optional Sound, and a live Blue approach selector are provided. Under Test controls, choose Open play, Counterattack or Wide attack, step to the next action, generate a new seed, or export the test state/event log as JSON. Tapping a shirt identifies the player. Hidden pages pause; returning requires Play. Reduced-motion users start paused and can step through events.

Replay resets the same seed and starting situation to their initial tactics. Changing tactics during a run can change what follows. Export includes the current state, RNG state, seed, events and tactic changes; it is a diagnostic log, not a career backup. Reload starts a new test rather than resuming an old passage.

## What is simulated

A fixed-step, deterministic model tracks 22 players, bounded movement, ball ownership and flight. Players maintain simplified 4-4-2 shape, offer support/width, press and track the ball. Passing options consider progression, teammate space, passing lanes, distance, attributes and tactical preference. Defenders can intercept a travelling pass or tackle the ball carrier. Shots can be blocked, saved, miss or cross the goal line. Each outcome updates the same state that drives the display, commentary and counters.

This is not animation over the existing career engine's goals. It is an isolated new model, which lets us assess its movement before deciding how to integrate it. The career match engine and background-score model remain unchanged.

The top-down portrait pitch uses numbered shirts, a highlighted ball, current action and compact statistics. Optional audio uses existing recorded stadium/goal/save samples and respects installation mute/volume preferences. Sound is off initially so the user can enable it with a gesture. Samples and credits are unchanged; there is no new music.

## Deliberate limits

This is a short ground-ball prototype, not a calibrated full-match engine. Its restarts reposition the sides explicitly; open play uses bounded movement. Crosses are simplified ground-ball deliveries. There is no aerial play, offside, fouls/cards, substitutions, stamina, full set-piece rules or half-time. Match scoring and pass rates still need tuning. The three-minute clock does not establish realistic full-season results. Tactical effects are experimental and should be judged over repeated tests, not one run.

## Verification

Thirty three-minute passages cover all three starting situations across ten seeds. Checks include deterministic replay, JSON state round trips, render-speed-independent batching, bounded player movement in open play, active actors/receivers, one score update per goal, pass/shot counters, no events after the end, a contact-driven interception, and changed decisions under tactical input. These are behavioural checks, not an assessment of football realism.

Existing workspace-navigation checks and exact offline import/cache validation pass. The new lab page, model, renderer and stylesheet are included in the cache manifest. A real installed-PWA upgrade and physical Android performance/audio remain outstanding. See review/possession-sim-1.128.json and the browser review for bounded coverage.

No new database, recorded audio or stadium assets were added. No career restart is required. Export a career backup before installing. This is a prepared test build, not a public-release milestone. Nothing has been published automatically.

Browser verification: the main-menu shortcut, pause, replay, stepping, tactical/scenario controls, new seed and sound toggle were exercised. A seed-100 wide-attack run reached 03:00 at 8x with a 0–1 score and Test complete. Top-level diagnostic JSON was downloaded and parsed. The lab fits at 320px and 390px iframe widths without horizontal overflow. Menu → Continue returned to the saved Middlesbrough career at 20 Nov 1998 09:00 with the same £8,963,763 balance. Physical-device listening and performance remain unverified.
