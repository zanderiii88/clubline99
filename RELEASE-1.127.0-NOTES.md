# CLUBLINE 99 v1.127.0 - stadium controls around the preview

The simple stadium builder follows the supplied FSM-style mobile sketch: roof arrows sit above the image, stand arrows sit over its left and right edges, and material/colour arrows sit immediately below it. The current stand choice is captioned under the image. All three controls remain with the preview on desktop too.

The preview is larger on narrow screens (190px high rather than 130px). Each arrow has a minimum 44px-wide touch target. Section selection is folded into Change sections, showing the current section or selection count. The map stays open while selecting multiple sections and can be closed again before adjusting the preview. The map and direct preview selection retain their existing behaviour. Cost, capacity, duration and Review build remain below; specifications and advanced controls stay folded away.

Preview changes still apply only to selected sections and spend nothing. Review construction and Confirm & pay remain separate. v1.126 construction durations, calendar Stop behaviour and audio refinements are retained. No new assets, audio, names, databases or match rules are included.

## Verification
- Browser checks at 320px and 390px iframe viewport widths, using a saved Streamlined Middlesbrough career. The builder has no horizontal overflow at either width; every arrow is at least 44x44px. The preview, controls and quote fit together with the section map closed.
- Multiple-section selection stays expanded through selection; roof, stand and material arrows update the highlighted preview and quote together. A two-section £220,000 preview left club cash unchanged; Review build opened its separate confirmation and closure information. No construction purchase was made in the browser.
- Existing actual-handler construction checks pass in both modes: no preview charge, itemised review, one payment, compressed save/reload, backup and active-project safeguards. Existing compact-builder/match-commentary checks and source/cache checks pass, including 242 exact module import URLs.
- These are browser layout checks, not physical Android or installed-PWA touch tests. Those still need the user's device feedback.

No career restart is required. Export a backup before updating. This is a prepared build; nothing has been published automatically.
