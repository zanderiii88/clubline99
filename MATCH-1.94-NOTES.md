# CLUBLINE 99 v1.94.0 — half-time resume and stadium default

Apply over v1.93.0. All files in this update go in the repository root. No deployment performed.

- Fixed the reported half-time freeze. Previously, “Done & resume” closed the drawer while the match was still paused; rendering reopened it at half-time. The state then said “playing”, but the open drawer prevented the clock starting. Both resume controls now close the drawer, clear pending selections, clear the pause reason and unpause before saving/rendering.
- The management drawer opens on arrival at half-time, rather than reopening on every paused render. Closing it leaves the match paused, with the toolbar resume action available.
- Clear “Start second half” controls at half-time, including a sticky action beside the drawer Close control and the existing bottom action. At other pauses the header says “Resume match”.
- Unconfirmed substitution selections are discarded when resuming; confirmed substitutions remain applied and still count toward the three-substitute limit. Resuming never confirms a substitution.
- New watched matches open in stadium view. Line-ups remains available; an explicit view choice is retained when the live match is reloaded.
- Shared behavior in Streamlined and In-depth. The v1.93 real-name option is retained.

## Validation

Reproduced the exact v1.93 drawer-open / clock-stopped state before the fix. Verified native resume clicks and actual clock progression beyond 45 minutes in both modes, including no selection, starter only, substitute only, an unconfirmed pair, a cancelled selection, a confirmed change, three substitutions already used, closing then using the toolbar, and half-time save reloads. Both normal clock and skip-to-half entry paths covered. Portrait and landscape browser emulation; no physical-phone testing claimed.

The 34 existing targeted regression scenarios passed, with zero browser errors. Two additional 45-minute pause boundary checks passed. Production offline reload was checked against the exact final app.js bytes; current service-worker asset/import checks passed.
