# Journey return progression

Base: origin/main 8e5c3e54a757c80077790699aa83fa646205b479. Scoped local change; not deployed.

After server-confirmed lesson completion, the existing map animated to the next local node or chapter checkpoint but stayed in the old chapter. Reopening an already-seen completion return also initialized the old chapter and never followed the actual current lesson.

The view now derives its transition from the assigned model and server-confirmed completion set. Adjacent next lessons keep the existing hop. Finishing a chapter animates to its checkpoint, then settles on the actual current chapter. Replays and non-adjacent gaps go directly to the current lesson. Reduced motion and previously seen returns settle without replaying the animation. The bunny no longer appears in an old chapter merely because it was the return source.

No curriculum ordering, free/paid policy, assessment, save, reward, or exam rule changed. This does not implement the planned full-unit map, new design system shell, theatrical reveal, or free-offer policy.

Validation: 68 journey tests across11files pass; TypeScript passes; scoped component/helper/test lint passes; git diff --check passes. Actual synthetic /demo/journey-v2/connected browser checks pass for adjacent progress, chapter boundary, repeated return, normal/reduced motion and zero reward callbacks, with zero page errors. Use localhost:3336 for the dev preview (127.0.0.1 triggers the existing dev-origin warning). The browser harness waits for the first hop to begin before checking that it ended, avoiding an initial-render race.

The synthetic demo uses in-memory completion fixtures and isolated callbacks. Tests verify the existing savedJourneyHref waits for persistence and omits completion parameters on missing/failed saves. Live authenticated API/database flow was not retested in this UI-only change. Production build/deployment remain outstanding before release.

Preview: http://localhost:3336/demo/journey-v2/connected . Open Integration review → Saved completions →3 to observe moving to the second section. Free access remains unchanged; a locked next lesson still shows the Readee+ prompt.
