# CLUBLINE 99 v1.98.0 - post-match interviews and manager press styles

Cumulative update for v1.94.0 through v1.97.0. Copy every file into the repository root, retaining folder structure. No fresh career is required. Nothing has been deployed.

## Changes
- Selected competitive matches now produce a post-match interview. The match report, other results and table retain priority; the interview appears afterwards.
- Follow-ups focus on rivalries, an earlier respectful/confident/provocative exchange, or a margin of three goals or more. A separate seven-day cooldown limits follow-ups; a notable result without an earlier exchange needs fourteen days since the last post-match interview.
- A pre-match No comment prevents the post-match follow-up for that fixture. Post-match No comment and Keep perspective have no direct effects. Leave for later remains available; the response window ends two calendar days after the match.
- Post-match choices reflect a win, draw or defeat: credit the opposition, keep perspective, praise/stand by your players, criticise the other manager, or no comment. Penalty decisions are recognised. The displayed score uses your club's score first and labels the outcome.
- Opposing managers have a stable press style: measured, fiery, tactical or gracious. Their pre-match quotes, post-match assessments and replies vary by style. The style follows the manager ID through a job change and is shown in the press room and fictional-manager profiles. It changes dialogue, not manager ability or tactical behaviour.
- Post-match comments refer to the manager who coached that match, even if a later appointment changes the other club's manager during the response window.
- Direct reactions retain the existing cumulative +/-3 morale/goodwill cap and -10 to +10 manager relationships. A post-match answer cannot trigger another result penalty for a match that has already finished.
- Queued interviews, answers, deadlines, scores and replies survive save/reload and portable backups. Old v1.97 pre-match records remain compatible. Stale questions expire on load or season rollover without adding response effects.

## Verification
- Native tests cover win/draw/loss and penalty results, all five post-match choices, duplicate creation/response protection, no second result penalty, neutral choices, deadline/opt-out, rollover expiry, manager identity after a move, cooldown and malformed records.
- Both management modes exercised a real simulated match through report -> results -> table -> post-match interview. Checks include queued-interview save/reload while the report is open, answering afterwards, actual reply/feedback display and answered-interview backup/reload.
- The previous pre-match suite and v1.74 calendar, v1.95 retirement/rollover and board-finance regression checks pass. Completed English and Scottish v1.97 career backups pass v1.98 validation.
- Current database, league-schedule, stadium/kit, JavaScript syntax and exact service-worker cache/import checks pass. Database bytes remain unchanged.
- Browser: loaded the existing v1.97 Streamlined Arsenal test career, simulated a 5-0 win against Wimbledon, reviewed report/results/table first, answered the new interview, and verified the tactical-style reply and relationship change.

This round uses targeted match/save and browser checks. The complete-season evidence from v1.96/v1.97 is retained as earlier evidence; it is not claimed as a fresh full-season v1.98 pass. Physical Android and final production offline cache-replacement testing remain outstanding.

## Next priorities
Return to squad succession and transfer-market improvements, while keeping media optional. Later media work can add rivalry history and questions about wider league events.
