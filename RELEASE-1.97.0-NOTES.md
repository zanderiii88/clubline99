# CLUBLINE 99 v1.97.0 - rivalries and the press room

Cumulative update for v1.94.0, v1.95.0 or v1.96.0. Copy every file into the repository root, preserving its folder structure. No fresh career is required. Nothing has been deployed.

## First media/manager interaction system
- Selected competitive fixtures generate a press question one to three days beforehand. Some ask for your assessment of the other manager; others quote that manager and ask for a response.
- Five choices: show respect, focus on your team, back your players, challenge the other manager, or no comment. Each shows its intended morale, community-goodwill and relationship effects before selection. Actual changes are reported afterwards, including caps.
- Respectful and provocative answers can draw a reply from the other manager. Bold statements can attract scrutiny after defeat, including a penalty shoot-out defeat. Result feedback is applied once and retained in the exchange history.
- Club morale already has a small, bounded influence on team strength; community goodwill influences supporter confidence. Media's cumulative contribution to each is capped at +/-3 points. Relationships range from -10 to +10 and affect the tone of future comments; they do not add transfer bonuses or force match results.
- Relationships are attached to manager IDs, so they follow a manager through job changes. A pending question expires if the opposing manager is replaced.
- The press room is available through Manager & board, the Club workspace and press news links. It retains up to 80 exchanges and shows the ten latest in its history view.
- Close or Leave for later lets time continue. Unanswered questions expire without effects once their match is played or their window closes. No comment is neutral. Press questions can be disabled in Manager & board.
- Normal questions have a 21-day cooldown; rivalry questions may arrive after seven days. Questions are not created on matchday. Draws, matchday flows, the opening club event and board reports take priority over an optional press prompt.

## Rivalry context
The 15 rivalry pairings already used by transfer negotiations are now shared with media and the match briefing. Rivalry fixtures get a visible label and can attract more press attention. This is the existing game list, not a newly researched exhaustive rivalry database. Managers remain fictional, as in previous versions.

## Included earlier work
All v1.95 retirement/succession advice and rollover protection, plus v1.96 board forecast consistency, visible cash breakdown and repaired Streamlined season-review shortcuts, are included.

## Verification
- Native media checks: all response choices; neutral/no-comment effects; no automatic spending; duplicate-response protection; actual reaction caps; defeat, draw, win and penalties; post-match expiry; manager replacement; stable relationships after a move; opt-out; reload idempotence; invalid media save records; no new question on matchday.
- Application checks in both modes: new-question stop, draw precedence, leave-for-later, opening from Manager & board, response and reply display, duplicate clicks, real save codec and portable backup, old saves without media data, actual match simulation, persisted result feedback.
- English Premier In-depth and Scottish First Streamlined careers reached season two with media enabled: 96 managed matches, 26 save/backup checkpoints, 23 explicit No comment responses. The test runs also exercised expiry of five questions queued as matchday opened; final generation now excludes matchday, covered by the targeted checks. No-comment balances matched the same seeded v1.96 careers exactly.
- The retained season checkpoint audit checks media state with the final validator, season archives, duplicate match reports and payroll entries. Detailed evidence is in review/media-reliability-1.97.json.
- Existing v1.73, v1.74 and v1.95 regression suites and board-finance checks pass. The v1.74 calendar test now explicitly leaves optional press questions for later while retaining its original journey assertions.
- Source checks cover current English/Scottish data, all five playable league schedules, English stadium/kit paths, JavaScript syntax, and exact cached import/asset URLs. Original database bytes are preserved.
- Browser check: loaded an existing Streamlined Arsenal save; advanced normally through loan/scouting/opening club decisions; a pre-match question appeared; selected a provocative response; confirmed actual reaction and the other manager's reply. Desktop browser only.

The season harness uses real game handlers in a Node VM with DOM/timer stubs. Routine saves use plain JSON; monthly/end checkpoints invoke the actual codec and validate device reload and backup. Physical Android and final production offline cache-replacement tests remain outstanding. Test career checkpoints are excluded from the archives.

## Follow-on work
This is a first pre-match system. Further rounds can add post-match press questions, distinct manager personalities, richer rivalry history and comments on wider league events. These are not implemented here.
