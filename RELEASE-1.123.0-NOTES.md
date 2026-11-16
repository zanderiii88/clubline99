# CLUBLINE 99 v1.123.0 - recorded, contextual sound

## Recorded atmosphere
Added 31 edited clips from 22 of the recordings approved in the conversation, about 2 MB of audio. Public HQ MP3 previews were downloaded from the creators' Freesound pages, checked for CC0 or Attribution licences, then trimmed, resampled, level adjusted and faded. These are recorded sounds; the rejected synthesized palette remains absent and blocked. Alternate approved recordings that duplicated a role or were busier were left unused in this first integration.

Credits, source pages, licence links and editing notes appear in Options & Help and AUDIO-CREDITS.md. The source manifest records preview URLs, original-preview checksums, excerpt offsets and derived checksums. No audio was copied from the FIFA Soccer Manager video; it supplied the screen-context reference.

## Where sounds play
- Title/setup: existing intro music choices; no stadium ambience.
- Ordinary club view and stadium design: occasional birds, breeze or footsteps with quiet gaps. A fixture date alone does not start a crowd.
- Training, youth and development screens: short football-practice excerpts, touches, kicks and occasional training whistle. Fitness-focused work uses weights, workout and gym recordings instead.
- Office, finances, inbox and organiser screens: occasional paper/office activity or a rare phone ring. Leaving the screen cancels its clip and schedule.
- Match preparation: turnstile excerpts.
- Live match: quiet crowd bed with occasional chanting. Separate goal celebrations and save applause are event-triggered, not randomly scheduled.
- Match report: post-match shower excerpts, after the final whistle and quiet spacing.

Background texture starts after a 12–28-second gap. Later gaps are 25–65 seconds, or 35–90 seconds for office sounds. Short visits may remain quiet. All levels remain adjustable.

## Match event timing
Kick-off, half-time, second-half restart and full-time trigger whistles. Newly displayed goals trigger cheers; on-target chances trigger applause for the defending side. Off-target chances do not trigger a goal cheer. Crowd reactions favour the home supporters, with a lower away response and intermediate neutral-venue gain.

Manual pause, decision drawers, leaving the match and hiding the page stop its event audio. Automatic goal pauses allow the goal reaction to finish. Fast-forward to a highlight uses only the newly displayed current moment; skip-to-result uses a final whistle rather than replaying accumulated goals. Instant simulation does not create a retrospective reaction queue. Reloading an existing match or report does not replay its old sounds. A new event replaces the previous cue instead of queuing it, and the background is reduced briefly under reactions.

Ambience mute/volume controls background atmosphere. FX mute/volume controls match reactions and whistles, independently. Existing Music/FX/ambience preferences survive the update. Gameplay music stays optional; menu/setup music remains available.

## Verification
- Context/timing tests cover ten virtual ordinary-day minutes, repeated navigation, screen-specific catalogues, fixture-date isolation, match whistles, home/away goal levels, saves, off-target chances, manual pause, highlight skips, instant simulation, reloads, visibility and independent mute controls.
- Two real match-engine runs, one per management mode, produced five goal cues and twelve save cues tied to the corresponding actual events. Two instant simulations produced no retrospective cue queue. These are code-level interaction checks, not a browser match-listening claim.
- Real-catalogue control integration covers preference migration, enabled controls, credit markup, five fixed audio players, FX reactions with ambience muted, hidden-page stop and visibility no-replay.
- All 31 audio files decoded successfully with finite, bounded samples; all runtime clips are precached. Nine byte-range cases passed for recorded audio offline; stale synthesized-palette paths remain blocked.
- Source integrity passed with 238 exact module/cache URLs, syntax, data counts and existing stadium/kit checks.
- Desktop browser loaded v1.123, continued the saved In-depth Aberdeen test career, showed enabled sound controls and source/licence credits, opened Training and switched between Balanced and Fitness focus. This verifies UI/navigation, not subjective audio quality. Browser-extension metadata errors were observed; no app error was identified from that log sample.
- Both ZIPs checked for integrity and exact current bytes; game data, stadium artwork, existing music and save keys are unchanged.

Limits: no physical Android/iOS listening test, production offline-upgrade test, or full browser match playthrough in this batch. The chosen loop interval and levels still need listening feedback in the game. Extra-time/penalty decisions do not gain a separate shot-by-shot soundtrack. Source approval does not imply a final subjective approval of every edited excerpt or mix.

## Install
Existing careers can continue. Apply the cumulative ZIP over v1.94-v1.122 or use the complete build. Menu version: v1.123.0. Nothing has been published.

If v1.121 was previously installed, the obsolete assets/audio/ambience/ folder and tools/build-ambience.py should still be removed before uploading game files; ZIP extraction cannot delete them. They remain blocked by the current worker and are omitted from both new ZIPs. The new recordings live in assets/audio/recorded/.
