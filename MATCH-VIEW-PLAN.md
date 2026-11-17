# Moving match view - experimental stage

v1.128 provides Developer · Match test on the main menu. It opens match-lab.html and uses possession-sim.js, a fixed-step seeded spatial model separate from career saves and outcomes. The same state drives shirts, ball, commentary and statistics. Research is recorded in Clubline-99-Match-Simulation-Research-2026-11-17.md.

Current coverage: short fictional 4-4-2 passages with passing, pressure, interceptions, tackles, simplified ground crosses, shots/blocks/saves/goals, explicit restart repositioning, three starting situations and four experimental approaches. Replay and exported state support reproducing errors. This is not a full match or a calibrated season engine.

Next: review phone readability and natural movement; tune support, pressing, passing and shot quality across seeds; add offside, aerial play, restarts/set pieces and other rules as separate tested stages. Only then add full match duration, player data, substitutions, injuries/cards, stamina, half-time ends and career/save integration. Preserve one authoritative state/event stream and keep rendering/sound randomness separate from outcomes.

Before integration, compare managed and background match distributions across representative clubs and seeds. Existing background-score diagnostics do not establish realism for this new model. The established career engine is retained until an explicit integration stage.
