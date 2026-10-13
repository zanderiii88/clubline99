# Clubline 99 — v1.72.0

Complete release built from v1.71.0. Upload the extracted contents to the repository root, with index.html alongside app.js, style.css, sw.js, manifest.webmanifest, assets/ and data/. Do not upload the ZIP itself or place the files inside an additional release folder. Nothing has been deployed automatically.

## Changes
- Portrait main menu shows the whole approved artwork and logo without stretching or cropping. Compact two-column buttons and persistent Music off / FX off checkboxes.
- Fullscreen installed-app preference with standalone fallback. Android can still show system bars while interacting; desktop/browser tabs retain their normal browser interface.
- Corrected Chrome Classic icons, including padded maskable versions.
- Comparison controls above the charts: own-squad player dropdown; name/historical alias search; all-club league, club, nationality, position and free-agent filters.
- Stadium designer: entire-ground preview plus eight large blueprint selection areas. Multiple areas can be selected and cleared; the 3D selection stays in sync. Old stand/corner button lists removed. Each stand selection applies to its constituent bays.
- Substitutions: current XI above bench, shirt cards, condition and live rating; tap in either order or drag the substitute's shirt. Appropriate replacements highlighted; confirm/cancel and Done & resume. Match stays paused while making changes. Tactics remain separately expandable.
- Champions League draws: two-column group cards with four club slots, no match statistics, highlighted own club/group and latest selection. Draw controls stay separate from scrolling content. Existing complete-draw/next-team controls retained.
- 520 historical title records through 1997–98 across three league tiers and four cups, with fictional names matched to the game. Regional North/South third-tier titles labelled. Recent winners shown first, earlier history collapsed. Career winners follow historical records. Sources in HISTORICAL-SOURCES.md.
- Transfer refusals explain insufficient squad depth or a protected key player at a rival. Rival/challenger/key-player premiums produce reviewable counteroffers. Listed players and short contracts make clubs more willing to negotiate. This is a gameplay model, not a claim of exact historic transfer policy.
- Transfer review distinguishes club cash, advisory cash after four payrolls, and weekly wage headroom. Starting balances retained after reviewing all 68 domestic clubs; all begin with positive cash after four payrolls. No new claim of season-long financial balance validation.
- Guaranteed light-hearted mascot event on day three of the opening season, in both management modes. One acknowledgement per career; small morale/supporter effect, no cash windfall. Older saves beyond their opening week do not receive a late catch-up event.

## Verification
- JavaScript syntax and offline asset references checked; 68 stadium layouts and 408 kit/shirt assets intact.
- Mobile browser checks: menu audio persistence, own/all-club comparison selection, alias search, blueprint corner selection, substitution confirmation and pause state, draw layout at 360px/390px portrait and 844px landscape. No browser errors.
- Historical winner panels, rival/listed/short-contract transfer decisions and portable save reload verified.
- Opening-week event stops Continue on 5 August and persists acknowledgement.
- Existing manager/board, loan wages/recall/minutes, career rollover, compressed save and portable backup regression tests passed; 12 world development rollovers passed.
- Real-device Android dragging, installed fullscreen behaviour and longer-term financial balance remain useful feedback areas.
