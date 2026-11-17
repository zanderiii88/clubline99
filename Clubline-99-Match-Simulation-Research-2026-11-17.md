# CLUBLINE 99: research before a moving match view

Research date: 17 November 2026. Working build reviewed: v1.127. No game files changed, no new game release and no publication.

## Finding

The difficult part is believable football behaviour, not drawing 22 shirts. Separate the football model from its display, but let both describe the same evolving state. A display built around occasional pre-existing goals/chances can be a useful illustration; it does not by itself establish that movement, space or passing produced those chances.

The recommendation below is an engineering proposal for CLUBLINE, not a claim to reproduce a commercial game's proprietary engine. Research reduces avoidable architectural mistakes; iteration and playtesting remain necessary.

## What the primary sources establish

| Reference | Documented approach | Useful lesson for CLUBLINE |
| --- | --- | --- |
| Sports Interactive, FM21 match-engine explanation [1] | Players and officials assess decisions at quarter-second intervals. Defensive coordination and off-ball support matter; AI information feeds animation. | Give players purposes, including those away from the ball. Keep decisions and presentation consistent. The published cadence is an FM21 example, not a verified specification for every later edition. |
| RoboCup Soccer Simulator documentation [2,3] | A discrete simulation updates actions, movement, collisions, referee state and stamina. Its documented step is 100ms. A separate monitor receives state and supports recorded-game playback. | The model should run independently of the viewer. A replayable state/event stream makes errors easier to inspect. RoboCup is an AI research platform, not a football-management game or a ready-made browser component. |
| Google Research Football, based on Gameplay Football [4] | A physics-based engine supports football rules and both deterministic and stochastic configurations. Its Academy provides small passing, finishing and counterattack scenarios. | Validate isolated football situations before attempting a season. The useful reference is its scenario method; CLUBLINE does not need to train neural-network players or adopt its C++ engine. |
| Open Football's published player-state diagram [5] | The diagram distinguishes role-specific behaviours such as defensive covering, holding a line, midfield support, width and forward runs. | A small set of understandable behaviours can organise off-ball movement. Inspecting the diagram establishes the design vocabulary; it does not establish the quality of every implementation. |
| Glenn Fiedler's timing article [6] | Fixed simulation steps can be separated from display frames, with interpolation between states. | A phone rendering fewer frames should show less smooth movement, not a different result. Fixed timing alone does not guarantee determinism: random-number state and update ordering also need control. |

## Where CLUBLINE currently stands

Local source review: app.js functions tickMatch, chanceEvent, cardEvent, injuryEvent, quickScore and syncLiveScene; match-commentary.js passageOfPlay; MATCH-VIEW-PLAN.md.

The watched match advances in minute-level steps. Team power influences the chance of an incident; goals/chances, cards and injuries update actual game state. Passing/tackling passages supply descriptive actor/text information, but there is no continuous shared ball position or causal possession chain. Existing stadium motion is decorative. Other fixtures also use a separate aggregate quick-score model.

This means the next stage should strengthen the football state before treating animated positions as evidence of tactics. A commentary tackle should transfer possession in that state; a completed pass should identify its receiver and location. Presentation should not invent a second pass completion or goal decision.

## Three implementation choices

| Approach | What determines play | Tradeoff |
| --- | --- | --- |
| Event illustration | Existing statistical incidents; movement is reconstructed around them | Smallest change and useful for an early visual sample. Spatial choices do not genuinely cause outcomes. |
| Possession-based spatial model — recommended prototype | Ball owner, pitch location, player roles, support, pressure and attributes determine successive actions | More work than illustration, but a bounded route to coherent football without full physical modelling. Needs fresh balance checks because it changes how play is generated. |
| Full continuous agent/physics simulation | Every player's decisions and ball interactions are resolved in small time steps | Greatest scope for emergent play, with substantially more tuning, rule handling and performance work. |

The recommended middle option is CLUBLINE's proposed design, not a claim that a particular commercial title uses it.

## Proposed model

Keep one authoritative state containing time, score, active participants, formation/roles, attacking direction, player locations, ball owner or flight, possession phase and restart state. Start with coarse zones plus bounded coordinates; add detail where it improves decisions.

The ball carrier chooses among a pass, carry, cross, shot or clearance. Candidate actions depend on role, attributes, distance, passing lane, pressure, support and tactical instructions. Resolve the action once. Record actor, receiver/opponent, start/end positions, duration and outcome in a structured event. Derive commentary, sound and statistics from that event.

Away from the ball, initially implement shape recovery, offering support, providing width, tracking/pressing and goalkeeper positioning. Limit speed and turn rate. Avoid everyone chasing the ball, instant turns, teleporting receivers and a keeper who reacts only after the shot has finished.

The renderer interpolates between authoritative states and never rolls outcome randomness. Speed changes alter viewing pace. Instant simulation runs the same experimental model without drawing it. Background fixtures can remain aggregate initially, but their distributions must be compared with the new model before career-wide integration.

Use a match-local seeded random generator and stable event ordering for the prototype. Record enough state to reproduce a bad sequence. Reproducibility is a proposed requirement; the current engine's general Math.random calls do not already provide that guarantee.

## Next concrete work

1. Build an isolated experimental prototype, separate from established career saves. Show one readable mobile pitch, identifiable shirts and a ball. Do not replace the existing engine immediately.
2. Exercise a short passage with possession, a pass under pressure, support movement, interception and a transition into a shot. Include unsuccessful attacks so entering the box does not automatically mean a goal.
3. Check dedicated situations: one-on-one, wide cross, crowded midfield, defensive clearance, keeper possession and a restart. Expand to corners, free kicks, penalties and offside before calling it a complete match model. Match the intended 1998–99 rules; do not inherit contemporary VAR behaviour.
4. Show the prototype for visual review. Assess whether the movement reads as football on a phone, whether the ball is trackable and whether tactical instructions visibly affect the intended decisions.
5. Only then add full match duration, substitutions, dismissals, injuries, half-time ends, pausing, highlights, restored games and reduced motion. Advance simulation and audio from the same event clock.
6. Compare watched versus instant results for identical seeds and decisions. Test interruptions and save/restore without duplicated goals or sounds. Measure rendering and battery behaviour on a physical phone.
7. Rebalance with many seeds and representative teams: goals, shots, shot accuracy, draws, clean sheets, home advantage and strength effects. Compare league outcomes and managed/background consistency. Historical tables are a reference distribution, not a result to force.

## Limits

This was a documentation, published-source and local-code review. No external engine was compiled or benchmarked. No claim is made to know FIFA Soccer Manager's internal simulation from gameplay footage; its footage remains a visual/pacing reference. The research supports a small validated prototype, not a promise of a finished realistic engine on the first attempt.

## Sources

[1] Sports Interactive, Match Engine AI in FM21, published 2 November 2020: https://www.footballmanager.com/news/match-engine-ai-fm21

[2] RoboCup Soccer Simulator, Soccer Server, especially section 4.8: https://rcsoccersim.readthedocs.io/en/latest/soccerserver.html

[3] RoboCup Soccer Simulator, Soccer Monitor: https://rcsoccersim.readthedocs.io/en/latest/soccermonitor.html

[4] Google Research, Introducing Google Research Football, published 7 June 2019: https://research.google/blog/introducing-google-research-football-a-novel-reinforcement-learning-environment/

[5] Open Football repository, player_state_transitions.dot, viewed 17 November 2026: https://github.com/ZOXEXIVO/open-football/blob/master/player_state_transitions.dot

[6] Glenn Fiedler, Fix Your Timestep!, published 10 June 2004: https://gafferongames.com/post/fix_your_timestep/
