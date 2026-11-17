# CLUBLINE 99 v1.129.0 - tactical match-lab choices and freer movement

## Test it
Main menu → Developer · Match test. The lab starts paused so you can choose a plan and fictional squad profile. Press Play to apply a pending plan and begin, or use Apply plan first. During play, changes remain a draft until Apply plan is pressed. Pausing and then pressing Play also applies a pending draft.

Four editable presets are available: Balanced, Possession, Counterattack and High Press. Adjust team plan contains passing, tempo, width, pressing, freedom, and reactions after winning or losing the ball. The assistant previews the selected plan against the current squad's relevant attributes and energy. It gives reasons and tradeoffs rather than blocking an unsuitable choice or guaranteeing success.

Squad profiles let you compare a balanced XI, technical midfield, quick counter side and physical side with limited technique. The same seed produces the same base players before profile adjustments. Changing a profile or starting situation resets the passage and pauses it; the pending draft is preserved for review. The opponent remains a balanced fictional side.

Tap a shirt to inspect attributes. Blue players can be told to hold position, offer support, roam, run beyond or overlap. Goalkeepers are limited to following the plan or holding position. Individual instructions apply immediately, remain independent of team presets and are retained on Replay. Replay starts the same seed with the currently applied team plan/profile/instructions; it does not reproduce a previous sequence of mid-run instructions. Export logs include setup, attributes, state and the actual timed tactical changes.

## Movement and execution
Formation positions now act as reference areas. Off-ball players choose support angles and pockets of space, pass and continue moving, provide width or overlap, counterattack, counterpress, cover a teammate closing down, or recover shape. Decision intervals differ by ability. Freedom and individual instructions affect how far players search from their reference areas; positional discipline influences how strongly they retain shape. Teammates avoid choosing the same patch. Movement remains bounded rather than teleporting during open play; restarts still explicitly reposition teams.

Passing, technique, composure and decisions influence delivery and risk. Pace and off-ball movement influence counterattacking options. Positioning, teamwork, anticipation and decisions influence movement/reactions; stamina affects energy expenditure, with energy affecting running speed. Better ability is not an unconditional bonus for every tactic. These are prototype relationships and game estimates, not calibrated full-match ratings.

## Upload package cleanup
The complete-game and cumulative-update ZIPs now omit historical release notes, test scripts/results, tools and development research/plans. The current release note, README, roadmap, audio credits, source/provenance and licence material are retained alongside all runtime code, databases and assets.

A separate Development archive keeps the full code, tests, review evidence and documentation, without duplicating the large assets/data folders. Overlay it onto the complete game only when developing. It is not intended for website upload.

ZIP extraction does not remove files already on an existing website. UPLOAD-CLEANUP.txt lists only obsolete development/documentation paths from the previous package that may be removed. No cleanup or publication has been performed on the live site. Audio/assets dominate the complete game's size, so this cleanup primarily reduces clutter.

## Verification and limits
The tactical model checks cover 48 three-minute passages: four squad profiles, four presets and three seeds. Coverage includes seeded replay, JSON state restoration with cached movement targets, bounded motion, energy limits, score/pass ledgers, different suitability for different attributes, individual hold/roam instructions, transition/support behaviours and unsuitable plans remaining selectable. The existing spatial model checks cover another 30 passages. These are bounded behavioural checks, not full-match realism or season balance evidence.

The new tactics remain confined to the experimental lab. Career tactics, saved careers, normal match outcomes and the background-score model are unchanged. Offside, fouls/cards, aerial play, substitutions and complete set-piece rules remain outside the lab. Physical Android performance, audio listening and installed-PWA offline upgrade still need device feedback. Current checks and browser evidence are retained in the Development archive.

No career restart is required. Export a career backup before updating. This remains an experimental test build, not public-release preparation. Nothing has been published automatically.

Browser checks at 320px/390px cover draft/apply semantics, pre-match and live presets, profile-dependent advice, per-player roaming, retained instructions after Replay and real JSON export on the standalone lab page. Both widths show all 22 shirts without horizontal overflow. These were partial browser passages, alongside the full-duration model checks.
