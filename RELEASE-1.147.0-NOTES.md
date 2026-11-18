# CLUBLINE 99 v1.147.0

## Touchline play

- A defender stretching for a wide pass can get a touch without bringing the ball under control. An early block on a cross can send the ball back towards the touchline. The last touch determines the throw-in.
- A loose tackle near the line can take the ball sideways, depending on where the defender approaches from. Clearances under pressure are more often aimed up the pitch within the touchline.
- Players retain their positions at throw-ins. The taker looks for a nearby outlet with a clear lane before considering a longer throw.
- Branches for a glancing touch and a clean interception remain separate because the existing offside phase applies after a deflection.

The boundary checks cover the first line crossed, last-touch decisions, wide deflections, sideways tackles, throw-in positioning and the short outlet. The seeded match report logs exits by cause.

## Matched full-match tests

Twelve repeated 90-minute fixtures compare the same starting setups and seeds.

| Metric | v1.146 | v1.147 |
|---|---:|---:|
| Throw-ins | 220 | 192 |
| Throw-ins from pressured clearances | 215 | 128 |
| Corners | 33 | 54 |
| Pass completion | 59.1% | 57.8% |
| Average ball in play | 78.8 min | 78.8 min |
| Shots | 373 | 386 |
| Goals | 31 | 23 |
| Own goals | 0 | 0 |

The v1.147 throw-ins included 32 deflected passes, 11 blocked crosses and 10 tackles. The separate six-fixture set recorded 16 goals in v1.146 and 13 in v1.147, with 190 and 196 shots respectively. These are small lab samples, so scoring and the balance of stoppages both need further calibration.

The cumulative Update covers v1.131 through v1.146. Complete contains all game files. Development includes source, test cases and both fixture comparisons.
