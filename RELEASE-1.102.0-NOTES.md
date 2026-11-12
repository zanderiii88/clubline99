# CLUBLINE 99 v1.102.0 - recorded tactical match review

Cumulative update for v1.94.0 through v1.101.0. Replace matching files at the game root and retain subfolders. No fresh career is required. Nothing has been published.

## Changes
- Half-time assistant advice and full-time match reviews now include an expandable tactical timeline. Each played spell records formation, style, orders, defensive override, manual/assistant control, XI, slot roles, individual instructions and opposing player count.
- Spell statistics show goals, shots, shots on target and observed possession from your club's perspective. The setup in effect before a played minute owns that minute: changes after 45 minutes apply from minute 46. Changes made at the same clock time are combined. Unplayed setups do not create invented comparisons.
- Starting condition summarises estimated match fatigue; unfamiliar positions and injuries/dismissals provide context. Each spell includes an expandable list of players and instructions.
- Assistant substitutions and opponent dismissals/injuries create new spells where the recorded setup changes. Switching tactics alone does not claim credit for later results. Short/unequal samples and extra-time/penalty resolution are explained.
- Watched and quick matches share the same recorder. A continued older live match starts recording from its resumed clock; previous minutes are not reconstructed. Older completed reports explicitly show that tactical history is unavailable.
- Tactical records survive compressed saves, portable backups and report archives; malformed records in live matches and imported reports are rejected. The recording and review functions consume no random numbers and do not change match-engine coefficients.

## Verification
- Pure record tests cover clock boundaries, repeated setup changes, exact statistic deltas, away perspective (including neutral venues), partial legacy recordings, absent possession, zero-duration spells, read-only rendering and malformed save data.
- Both Streamlined and In-depth: watched match through half-time, real formation/approach controls, substitution, a second-yellow dismissal, report totals, compressed save/reload, portable backup and invalid report rejection.
- Quick simulation records assistant control. Legacy live-match continuation records only new play. Missing history and invalid live backup cases are checked.
- Exact seeded comparison against recovered v1.101: identical scores, every event, statistics, player state, balance, XI and bench for the exercised match.
- Existing match incident/half-time, manager/media, seller safeguards/funding and succession application regression suites pass in their exercised scenarios.
- Source integrity passes for all five divisions, 68 English stadiums/kits, JavaScript syntax and 198 exact import/cache URLs. Data files remain unchanged from v1.101.
- Desktop browser: new Streamlined Arsenal career reaches Wimbledon through normal decisions and press response. A 3-0 simulated result shows three spells (1-65, 66-78, 79-92), shot totals 8+0+1=9 versus 1+0+0=1, on-target totals 6+0+1=7 versus zero, and expandable XI/instructions. Two-column cards were visually inspected.

This round uses targeted matches and regression scenarios, not a new full-season or multi-season balance run. Historical evidence remains labelled by its earlier release. Physical Android, the narrow-screen layout on a real handset and production offline cache replacement remain untested.

## Next
Improve youth opportunities and development follow-through alongside the succession plan. Longer-term transfer-market balancing, rivalry history, wider manager/media stories and stadium sections remain on the roadmap.
