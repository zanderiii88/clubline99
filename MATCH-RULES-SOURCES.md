# Historical match-rule reference

IFAB, Laws of the Game, July 1998 (1998/99), official archived edition:
https://downloads.theifab.com/downloads/laws-of-the-game-1998-99?l=en
Consulted 17 November 2026. Laws 8, 11, 13, 15, 16 and 17 informed this pass. In particular: offside concerns active involvement using the release-time position; direct goal-kick, corner and throw-in receptions are exempt. Goal kicks must leave the penalty area before the ball becomes live.

Implementation limits and planned rules are recorded in RELEASE-1.132.0-NOTES.md and ROADMAP.md. This reference is not a claim that the prototype implements every provision. No source text or PDF is bundled.

## v1.135 keeper rebound detail

The official July 1998 Laws, Law 11 and the goalkeeper-rebound example on printed page 51, identify an offside attacker gaining an advantage from a keeper rebound. A parried shot therefore retains its release-time offside candidates until another player takes control; collection can trigger the existing indirect-free-kick flag. This is a simplified contact-based model, not complete opponent-interference judgement. Source: https://downloads.theifab.com/downloads/laws-of-the-game-1998-99?l=en (checked 17 November 2026). No source text or diagrams reproduced. Keeper depth, reaction times, handling probabilities and rebound velocities are prototype design choices.

## v1.138 contact-rule pass

Official IFAB/FIFA July 1998 Laws, checked 17 November 2026: https://downloads.theifab.com/downloads/laws-of-the-game-1998-99?l=en . Law 5 covers advantage and serious/slight injuries; Laws 12–14 cover contact offences, penalties, cautions/dismissals, free kicks and penalty positioning/completion. Law 12 retains dismissal for denying an obvious scoring chance even when the restart is a penalty; a dangerous challenge from behind can be serious foul play. Law 3 supplies the historical substitution context for future work; the lab uses a conservative below-seven safety stop. No source text or diagrams are reproduced.

The implemented judgement is deliberately limited to outfield challengers. Geometry thresholds for a clear chance, force/severity probabilities, knock duration, wall choices and kick execution are prototype design decisions, not figures prescribed by the Laws or researched player ratings. Advantage currently covers minor uncarded fouls only. Temporary knocks are not a full injury system. Goalkeeper/handball offences, persistent infringement, full disciplinary/advantage judgement and substitution rules need further work. No VAR or review flow is introduced.

## v1.139 substitution and injury context

The same official July 1998 Laws (Law 3, printed pages 13–14) specify the maximum of three substitutions in official competition, named substitutes, no re-entry after replacement, and keeper role changes during a stoppage. The nominated bench size is competition-specific within the permitted range; five named players per side is the lab fixture. Law 5 distinguishes serious injury stoppages from lesser injuries where play may continue. The prototype uses a contested dropped ball for an injury-only stoppage; any existing infringement restart takes precedence. Source checked again 17 November 2026: https://downloads.theifab.com/downloads/laws-of-the-game-1998-99?l=en . No text or diagrams reproduced.

Contact severity, forced-off probability, non-contact risk, temporary impairment and emergency-keeper ratings are game-design choices. These are not medical guidance or researched historical injury frequencies. No diagnosis or recovery duration is assigned. Headless diagnostics manage both benches automatically; the mobile lab waits for Blue injury decisions.

Law 8 special circumstances (printed page 21) moves a goal-area dropped ball to the nearest point on the parallel goal-area line. The injury restart applies that placement; the ball is made collectable only after the stopped setup, without a preassigned winner.
