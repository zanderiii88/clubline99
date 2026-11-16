# CLUBLINE 99 v1.122.0 - withdrawn ambience palette

The v1.121 synthesized ambience was rejected in listening review. All fourteen audio files, their source manifest and their generator have been removed from this build. The approved catalogue is empty. Existing settings cannot enable or request the withdrawn sounds, and the current service worker blocks requests for the old palette directory even if files remain on an older installation.

The timing/mixing system remains, tested with mock sound identifiers only. Ambience controls are disabled and labelled unavailable while real recorded candidates are reviewed. Existing intro music, optional gameplay music, FX and their volume controls remain available. Gameplay remains quiet by default. There is no replacement ambience in this release.

## Installation cleanup
If you installed v1.121, delete assets/audio/ambience/ and tools/build-ambience.py from your game folder before uploading game files again. A ZIP extraction cannot delete old files. REMOVED-FILES-1.122.txt gives the exact list. The new catalogue and worker prevent playback regardless; the cleanup avoids redistributing the withdrawn files. Earlier v1.94-v1.120 installations do not contain those files.

Existing careers can continue. Apply the cumulative update over v1.94-v1.121, or use the complete build in a clean folder. The menu should show v1.122.0. Nothing has been published.

## Next audio review
Use the user's FIFA Soccer Manager reference for context-specific atmosphere: stadium crowds and turnstiles, training whistles, facilities showers and weights. Provide a couple of real-recording previews for listening review before integrating a replacement palette. See AUDIO-REVIEW.md.

## Verification
- Empty shipped catalogue remains silent in training, quiet, matchday, postmatch and menu contexts, including unmuted/max-volume settings; no ambience playback or timers.
- Mock-catalogue scheduling tests retain ordinary/matchday spacing, independent settings and lifecycle coverage. These are engineering tests, not sound-quality approval.
- Removed assets/generator absent from source and offline cache; four stale-palette request examples blocked. Nine offline byte-range cases retained for existing audio.
- Source integrity and exact cache/import paths checked. ZIP bytes/integrity and absence of all sixteen withdrawn paths checked; data, stadium artwork and existing music unchanged.
- No new browser journey, physical-device test or replacement-audio listening approval in this batch.
