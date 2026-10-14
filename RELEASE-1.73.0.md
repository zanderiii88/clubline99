# CLUBLINE 99 — v1.73.0

Complete release based on the verified v1.72.0 package. Nothing has been deployed. Extract and upload the contents to your GitHub Pages repository root, replacing matching files. index.html must sit alongside app.js, style.css, sw.js, manifest.webmanifest, assets/ and data/. Do not upload the ZIP itself or an extra enclosing release folder. Use Check for Updates after GitHub Pages finishes publishing; the title should show v1.73.0.

## Matchday
- Skipping to the next event, half-time or full-time stops for your team's injuries and red cards, including with the assistant enabled. Fast simulation leaves the decision to you and opens the touchline panel.
- Half-time assistant report compares shots on target, mentions a booked opponent or tired player, and offers a suitable fresh substitute when available. You review and confirm any suggested substitution.
- Centred Play/Pause with Slower and Faster either side. Explicit Line-ups and Stadium buttons, Team & subs, and labelled skip controls.
- Visible recent commentary. A player briefly flashes gold after a shot on target; goals use a longer flash with the score and commentary feed. Reduced-motion preference avoids animated flashing.
- Existing visual XI/bench substitution interface and three-substitution limit retained.

## Management and players
- Optional manager first name, surname and nationality during new-career setup. Identity appears in the manager profile and personalised welcome/board greeting; name and nationality remain editable in the manager profile.
- Current ability and estimated potential star bars on player attribute profiles and comparisons. Stars are relative to your squad, with an estimated potential range and uncertainty influenced by scouting/youth assessment. Potential is not guaranteed development.
- Opening a scouting recommendation or expanding recommended signings marks it viewed; returning from that decision does not leave it pending.
- All-club comparison filters expand automatically.
- Loaned-out players appear below the squad's reserves, with return dates, a recall button where permitted, or an explanation of recall restrictions.
- Facility upgrades take 12 weeks. Only one project can run at a time; a further 180-day cooldown follows completion. Existing facilities remain usable. Pending work and cooldown persist in portable saves.
- Youth potential varies more within an intake. Five-star facilities still do not guarantee five-star players.
- Removed the redundant "Pick your team, choose an approach..." opening paragraph.

## Stadiums, draws and responsiveness
- Blueprint now has 28 individually selectable stand bays/corners, synchronised with the 3D preview, plus clear selection. Full-ground preview retained.
- Designer retains the club's fixed surroundings during layout preview. Corrected a European-site lookup that could select Wembley surroundings incorrectly.
- Champions League draw preserves the current scroll position when the next club is revealed.
- Recommended signings are calculated when expanded, rather than on every collapsed transfer-screen render. Shared squad-cover calculations are reused across candidate assessments.
- Home surroundings images are preloaded and kept decoded to reduce their reappearance delay after match screens.

## Verification
- Headless mobile Chromium: manager setup, comparison dropdowns/search and visible filters, 28-section blueprint/corner selection, confirmed substitutions and pause state, shot/goal highlights, half-time report width, draw scroll preservation, and draw footer/layout at 360px/390px portrait and 844px landscape. No page errors.
- Forced own-team red cards and injuries stop both half-time and full-time simulation with assistant enabled, without automatically spending a substitution. Portable save validation passed in these states.
- Facility payment, delayed completion, single-project lock, cooldown and pending-project save validation passed.
- Loan recall terms, wages/minutes, reserve recall controls, manager/board cadence, opening-week event, season rollover and 12 world-development rollovers passed regression checks.
- Elite academy intake test produced varied potential within valid bounds.
- Same-machine browser measurement of transfer-screen HTML generation: v1.72 about 1,756 ms; v1.73 about 14 ms. This isolates screen generation, not full phone navigation or network latency; real-device responsiveness still needs your feedback.
- Syntax and offline asset references checked. Complete ZIP integrity and extraction/file hashes verified before delivery.

## Follow-up note
Calendar travel pop-ups should offer an "Ignore this type in future" preference, then resume towards the selected date. This is recorded for a later update, as requested; it is not included in v1.73.

Android-specific touch behaviour, installed-app display and background decoding on the user's phone remain real-device checks. Existing balances, historical records, artwork, audio and previous gameplay features are retained.
