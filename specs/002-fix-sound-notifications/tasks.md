# Tasks: Fix Sound Notifications

**Input**: Design documents from `specs/002-fix-sound-notifications/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md
**Branch**: `002-fix-sound-notifications`

**Note for implementer**: These tasks are designed to be executed by a
smaller AI model. Each task includes the exact file path, what to do,
and what the code should look like. Follow them in order. Do NOT skip
tasks or combine them — each task is a single, testable change.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)

---

## Phase 1: Setup (Audio Foundation)

**Purpose**: Create the core audio session module that all other tasks
depend on. This is the key fix — it unlocks browser autoplay.

- [X] T001 Create the AudioSession singleton module in `src/lib/audio-session.ts`

  **What this file does**: Manages a single Web Audio API `AudioContext`
  that unlocks browser autoplay restrictions. Once a user taps anywhere
  in the app, this module calls `audioContext.resume()` and plays a
  silent buffer. After that, ALL `audio.play()` calls work — even from
  `setInterval` timers.

  **Create this file with these exact exports**:

  ```
  // src/lib/audio-session.ts
  //
  // EXPORTS:
  //   getAudioContext()      → returns the singleton AudioContext
  //   unlockAudioSession()   → call on user gesture (click/touchend)
  //                            returns Promise<boolean> (true = unlocked)
  //   isAudioUnlocked()      → returns boolean
  //   resumeIfSuspended()    → call on visibilitychange to re-resume
  ```

  **Implementation details**:
  1. Create a module-level `let ctx: AudioContext | null = null`
     and `let unlocked = false`.
  2. `getAudioContext()`: If `ctx` is null or closed, create a new
     `AudioContext` (with `webkitAudioContext` fallback for older
     WebViews: `new (window.AudioContext || (window as any).webkitAudioContext)()`).
     Return `ctx`.
  3. `unlockAudioSession()`: Get context. If `ctx.state` is
     `'suspended'`, call `await ctx.resume()`. Then create a silent
     buffer: `ctx.createBuffer(1, 1, 22050)`, connect a
     `BufferSource` to `ctx.destination`, call `.start(0)`. Set
     `unlocked = true`. Return `true`. Wrap in try/catch, return
     `false` on error.
  4. `isAudioUnlocked()`: Return `unlocked && ctx?.state === 'running'`.
  5. `resumeIfSuspended()`: If `ctx` exists and `ctx.state !== 'running'`,
     call `ctx.resume()`. This is for when the user returns from
     background and the context got suspended.

  **IMPORTANT**: Add `'use client';` at the top. Do NOT create more
  than one AudioContext — Safari limits to 4.

---

## Phase 2: Foundational (Hooks & UI Components)

**Purpose**: Create the React hook and UI component that use the
AudioSession. These MUST be complete before fixing the actual bugs.

- [X] T002 [P] Create the `useAudioUnlock` hook in `src/hooks/useAudioUnlock.ts`

  **What this hook does**: Attaches `click` and `touchend` event
  listeners to `document`. On the first user tap anywhere in the app,
  it calls `unlockAudioSession()` from `src/lib/audio-session.ts`.
  It also listens for `visibilitychange` to re-resume the context.

  **Create this file**:
  1. Add `'use client';` at top.
  2. Import `{ useEffect, useState }` from `'react'`.
  3. Import `{ unlockAudioSession, isAudioUnlocked, resumeIfSuspended }`
     from `'@/lib/audio-session'`.
  4. Export `function useAudioUnlock()` that:
     - Has state: `const [unlocked, setUnlocked] = useState(false)`
     - Has state: `const [needsPrompt, setNeedsPrompt] = useState(false)`
     - In a `useEffect`:
       a. Create handler `async function onInteraction()` that calls
          `const ok = await unlockAudioSession()`. If `ok`, call
          `setUnlocked(true)` and `setNeedsPrompt(false)`, then
          remove both listeners.
       b. Add `document.addEventListener('click', onInteraction)`
       c. Add `document.addEventListener('touchend', onInteraction)`
       d. Cleanup: remove both listeners.
     - In a second `useEffect`:
       a. Create handler `function onVisibility()` — if
          `document.visibilityState === 'visible'`, call
          `resumeIfSuspended()`.
       b. Add `document.addEventListener('visibilitychange', onVisibility)`.
       c. Cleanup: remove listener.
     - Return `{ unlocked, needsPrompt, setNeedsPrompt }`.

  **IMPORTANT**: The `needsPrompt` state is set to `true` externally
  by other hooks when `audio.play()` fails. The `useAudioUnlock` hook
  itself does NOT set it to `true`.

- [X] T003 [P] Create the TapToPlayBanner component in `src/components/ui/TapToPlayBanner.tsx`

  **What this component does**: A floating banner at the top of the
  screen that says "Tap to enable sounds" (in Arabic and English).
  It appears when `needsPrompt` is `true` and disappears after the
  user taps it.

  **Create this file**:
  1. Add `'use client';` at top.
  2. Import `motion, AnimatePresence` from `'framer-motion'`.
  3. Import `useSettingsStore` from `'@/store/settings-store'`.
  4. Props: `{ visible: boolean; onTap: () => void }`.
  5. Get `language` from `useSettingsStore`.
  6. Render with `AnimatePresence`:
     - If `visible`, show a `motion.div` with:
       - Fixed position: `fixed top-4 left-4 right-4 z-[100]`
       - Style: `rounded-xl border border-zad-gold/30 bg-zad-navy/95
         p-4 shadow-xl backdrop-blur-sm`
       - Inner content:
         - A bell icon (use `Volume2` from `lucide-react`)
         - Text: `language === 'ar' ? 'اضغط هنا لتفعيل الأصوات'
           : 'Tap here to enable sounds'`
         - Style text as `text-sm font-medium text-zad-gold`
       - `onClick={onTap}`
       - Animate: `initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -20 }}`

  **Keep it simple** — just a banner, a text, and an onClick.

- [X] T004 Wire up `useAudioUnlock` and `TapToPlayBanner` in `src/app/page.tsx`

  **What to change in page.tsx**:

  1. Add import at top:
     ```
     import { useAudioUnlock } from '@/hooks/useAudioUnlock';
     import { TapToPlayBanner } from '@/components/ui/TapToPlayBanner';
     ```

  2. Inside the `Page()` component (around line 190, next to the
     existing `useAdhanPlayer()` call), add:
     ```
     const { unlocked, needsPrompt, setNeedsPrompt } = useAudioUnlock();
     ```

  3. Inside the JSX, right before `<SalawatBanner />` (around
     line 258), add:
     ```
     <TapToPlayBanner
       visible={needsPrompt}
       onTap={() => setNeedsPrompt(false)}
     />
     ```

  **That's it** — 3 small additions to the existing file.

**Checkpoint**: At this point, the audio unlock infrastructure is
ready. Opening the app and tapping anywhere should unlock the
AudioContext. You can verify in browser console:
`[AudioSession] Unlocked successfully`.

---

## Phase 3: User Story 1 — Salawat Timer Auto-Play (Priority: P1)

**Goal**: Make the Salawat sound play automatically at the configured
interval, without the user needing to click anything.

**Independent Test**: Enable Salawat, set interval to 1 min, wait
1 minute — sound should play by itself.

### Implementation for User Story 1

- [X] T005 [US1] Modify `src/hooks/useSalawatTimer.ts` to use AudioSession for playback

  **Current problem (line 53)**: `audio.play()` is called from a
  `setInterval` callback. The browser blocks it because there's no
  user gesture. The `playPromise` rejects with `NotAllowedError`.

  **What to change**:

  1. Add import at top:
     ```
     import { isAudioUnlocked } from '@/lib/audio-session';
     ```

  2. **Change the `playSalawat` function** (lines 41-64):
     - Before calling `audio.play()`, check `isAudioUnlocked()`.
     - If NOT unlocked, dispatch a custom event to signal that
       the tap-to-play banner should appear:
       ```
       window.dispatchEvent(new CustomEvent('audio-unlock-needed'));
       ```
       Then `return` early (don't try to play — it will fail).
     - If unlocked, proceed with the existing `audio.play()` logic.
     - The updated function should look like:
       ```
       const playSalawat = useCallback(() => {
         const audio = audioRef.current;
         if (!audio) return;

         if (!isAudioUnlocked()) {
           window.dispatchEvent(new CustomEvent('audio-unlock-needed'));
           return;
         }

         audio.currentTime = 0;
         const playPromise = audio.play();
         if (playPromise) {
           playPromise.then(() => {
             setPlayCount(c => c + 1);
           }).catch((err) => {
             console.warn('[SalawatTimer] play() rejected:', err.message);
           });
         }
       }, []);
       ```

  3. **Keep the rest of the file unchanged** — the `setInterval`
     logic (line 91) is correct. It just needs the AudioSession
     unlock to have happened first.

- [X] T006 [US1] Add `audio-unlock-needed` event listener in `src/hooks/useAudioUnlock.ts`

  **What to change**: In the `useAudioUnlock` hook, add a third
  `useEffect` that listens for the `'audio-unlock-needed'` custom
  event on `window`. When received, call `setNeedsPrompt(true)`.

  Add this after the existing useEffect blocks:
  ```
  useEffect(() => {
    const handler = () => {
      if (!isAudioUnlocked()) {
        setNeedsPrompt(true);
      }
    };
    window.addEventListener('audio-unlock-needed', handler);
    return () => window.removeEventListener('audio-unlock-needed', handler);
  }, []);
  ```

- [X] T007 [US1] Ensure Salawat timer auto-resumes on cold start (verify existing behavior in `src/hooks/useSalawatTimer.ts`)

  **Why this task exists**: The spec requires that when the user
  reopens the app, the Salawat timer MUST auto-start if it was
  previously enabled (FR-009).

  **Current behavior** (lines 67-104): The timer `useEffect` depends
  on `salawatEnabled` and `isLoaded`. When the Zustand store hydrates
  from localStorage, `salawatEnabled` will be `true` and `isLoaded`
  will become `true`, which triggers the effect and starts the
  interval. **This already works correctly.**

  **Verification**: No code change needed. Just verify by:
  1. Enabling Salawat, closing the tab, reopening.
  2. Check console for `[SalawatTimer] Starting interval: every X min`.
  3. If the log appears without user interaction → PASS.

  If it does NOT work, the issue is likely `isLoaded` being `false`.
  Check `src/store/settings-store.ts` to ensure the `onRehydrateStorage`
  callback sets `isLoaded = true`.

**Checkpoint**: Salawat timer plays sound automatically. Verified by
setting interval to 1 minute and waiting without touching screen.

---

## Phase 4: User Story 2 — Azan at Prayer Time (Priority: P1)

**Goal**: Make the Azan sound play when the actual prayer time
arrives, including a 5-minute grace period for missed prayers.

**Independent Test**: Open app before prayer time, wait for it to
arrive — Azan plays automatically.

### Implementation for User Story 2

- [X] T008 [US2] Modify `src/hooks/useAdhanPlayer.ts` — integrate AudioSession unlock check

  **Current problem**: `triggerAdhan()` (line 166) calls
  `playAdhanSound()` which calls `audio.play()`. When triggered
  from the 15-second `setInterval` check (line 258), there's no
  user gesture, so `audio.play()` is blocked.

  **What to change**:

  1. Add import at top:
     ```
     import { isAudioUnlocked } from '@/lib/audio-session';
     ```

  2. **In the `triggerAdhan` function** (line 166), add an audio
     unlock check BEFORE the "Play adhan sound" section (line 191).
     Add this right after the browser notification block (line 189):
     ```
     // 2) Play adhan sound (only if audio is unlocked)
     if (!isAudioUnlocked()) {
       window.dispatchEvent(new CustomEvent('audio-unlock-needed'));
       // Still dispatch the toast event so user sees visual notification
     } else if (currentSound === 'default') {
       playDefaultAdhan();
     } else {
       const played = await playAdhanSound(currentSound);
       if (!played) {
         playDefaultAdhan();
       }
     }
     ```
     Replace the existing lines 192-199 with the above block.

  3. **Keep the toast dispatch** (lines 203-207) AFTER the sound
     block — the toast should always show regardless of audio state.

- [X] T009 [US2] Add 5-minute missed prayer grace period to `src/hooks/useAdhanPlayer.ts`

  **What this does**: When the app opens and a prayer time was missed
  within the last 5 minutes, trigger the Azan once (FR-010).

  **What to change in the `check()` function** (lines 220-247):

  1. Currently, the check only triggers if `diff <= 30000` (30 seconds).
     Change this to also trigger if the prayer time is in the PAST
     and within 5 minutes.

  2. Replace the current time comparison block (lines 236-246) with:
     ```
     const diff = now.getTime() - prayerTime.getTime();
     const absDiff = Math.abs(diff);

     // Within 30 seconds of prayer time (normal trigger)
     // OR prayer was up to 5 minutes ago (grace period for cold start)
     if (absDiff <= 30000 || (diff > 0 && diff <= 5 * 60 * 1000)) {
       const dateKey = `${key}-${now.toDateString()}`;
       if (notifiedPrayerRef.current !== dateKey) {
         notifiedPrayerRef.current = dateKey;
         triggerAdhan(key, prayerArabic[key] || key);
       }
       return;
     }
     ```

  3. **IMPORTANT**: The `notifiedPrayerRef` already prevents duplicate
     triggers for the same prayer on the same day — no additional
     dedup logic needed.

- [X] T010 [US2] Fix the `playDefaultAdhan()` function to reuse AudioSession context (line 16-66 in `src/hooks/useAdhanPlayer.ts`)

  **Current problem**: `playDefaultAdhan()` creates a NEW
  `AudioContext` every time it's called (line 19). This wastes
  resources and may hit Safari's 4-context limit.

  **What to change**:

  1. Add import at top of file:
     ```
     import { getAudioContext } from '@/lib/audio-session';
     ```

  2. In `playDefaultAdhan()`, replace line 19:
     ```
     // OLD: const ctx = new AudioContext();
     // NEW:
     const ctx = getAudioContext();
     ```

  3. Remove the `setTimeout(() => ctx.close(), 15000)` on line 62 —
     we must NOT close the shared singleton context.

**Checkpoint**: Azan plays at prayer time. Verified by waiting for
the next prayer time or temporarily modifying the time check.

---

## Phase 5: User Story 3 — Background Notifications (Priority: P2)

**Goal**: When the app is minimized or screen is locked, send a
system notification. When the app has an open window, also play
custom audio via service worker → client messaging.

**Independent Test**: Enable features, minimize app, wait for event
— notification appears with sound.

### Implementation for User Story 3

- [X] T011 [US3] Add `postMessage` to service worker in `src/app/sw.ts` to notify open clients

  **What to change**: After the service worker shows a notification
  (via `showNotif`), it should ALSO send a message to any open
  client windows so they can play the actual audio file.

  1. **Add a helper function** after the `showNotif` function
     (after line 180):
     ```
     async function notifyClients(data: { type: string; sound?: string; prayer?: string }) {
       try {
         const allClients = await self.clients.matchAll({
           type: 'window',
           includeUncontrolled: true,
         });
         allClients.forEach((client: any) => {
           client.postMessage(data);
         });
       } catch {
         // No clients available — that's fine, notification is enough
       }
     }
     ```

  2. **In `checkPrayerTimesOffline()`** (line 265-271), after the
     `showNotif(...)` call for adhan, add:
     ```
     await notifyClients({
       type: 'PLAY_ADHAN',
       prayer: prayer,
       sound: settings.adhanSound || 'rashed',
     });
     ```

  3. **In `checkSalawatOffline()`** (line 332-338), after the
     `showNotif(...)` call for salawat, add:
     ```
     await notifyClients({ type: 'PLAY_SALAWAT' });
     ```

  4. **In the `push` event handler** (line 349-389), after the
     `self.registration.showNotification(...)` call, add inside
     the `event.waitUntil(...)`:
     ```
     .then(() => {
       if (type === 'adhan') {
         return notifyClients({
           type: 'PLAY_ADHAN',
           prayer: prayer || '',
           sound: 'rashed',
         });
       } else if (type === 'salawat') {
         return notifyClients({ type: 'PLAY_SALAWAT' });
       }
     })
     ```

- [X] T012 [US3] Add service worker message listener in `src/hooks/useAdhanPlayer.ts`

  **What to change**: Add a `useEffect` that listens for messages
  from the service worker. When it receives `PLAY_ADHAN`, play the
  Azan. When it receives `PLAY_SALAWAT`, ignore (handled by
  SalawatTimer).

  Add this new `useEffect` inside `useAdhanPlayer()`, before the
  `return` statement (before line 268):
  ```
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'PLAY_ADHAN' && adhanEnabled) {
        const soundKey = data.sound || adhanSound;
        const prayerKey = data.prayer || '';
        const arabicName = prayerArabic[prayerKey] || prayerKey;

        // Prevent duplicate if already triggered by the foreground check
        const dateKey = `${prayerKey}-${new Date().toDateString()}`;
        if (notifiedPrayerRef.current === dateKey) return;
        notifiedPrayerRef.current = dateKey;

        triggerAdhan(prayerKey, arabicName);
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handler);
    };
  }, [adhanEnabled, adhanSound, triggerAdhan]);
  ```

- [X] T013 [US3] Add `notificationclick` → `postMessage` in `src/app/sw.ts`

  **What to change**: When a user taps a notification, the app opens.
  Currently (line 395-411), it just focuses the window. We should
  also send a message so the app can play the sound.

  Replace the `notificationclick` handler (lines 395-411) with:
  ```
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notifData = event.notification.data || {};
    const notifType = notifData.type || '';
    const prayer = notifData.prayer || '';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            // Tell the client to play the sound
            if (notifType === 'adhan') {
              client.postMessage({
                type: 'PLAY_ADHAN',
                prayer: prayer,
                sound: 'rashed',
              });
            }
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  });
  ```

**Checkpoint**: Minimize app, wait for prayer time or Salawat
interval — system notification appears. If app window is still
alive, custom audio also plays.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Azan priority over Salawat, dedup, cleanup.

- [X] T014 [P] Add Azan priority over Salawat in `src/hooks/useSalawatTimer.ts`

  **What this does**: When an Azan is currently playing, skip the
  Salawat sound (FR-006).

  **What to change in `playSalawat()` function**:

  Add this check at the beginning of the function (before the
  `isAudioUnlocked()` check):
  ```
  // Skip if Azan is currently playing (Azan takes priority)
  const adhanAudio = document.querySelector('audio[src*="adhan"]') as HTMLAudioElement | null;
  if (adhanAudio && !adhanAudio.paused) {
    return;
  }
  ```

  **Alternative simpler approach**: Listen for the `'adhan-playing'`
  custom event and set a ref flag:
  1. Add `const adhanPlayingRef = useRef(false);` near other refs.
  2. Add a `useEffect` that listens for `'adhan-playing'` event,
     sets `adhanPlayingRef.current = true`, then sets it back to
     `false` after 30 seconds (typical Azan notification duration).
  3. In `playSalawat()`, check `if (adhanPlayingRef.current) return;`.

  **Use whichever approach is simpler for you.**

- [X] T015 [P] Remove duplicate `serwist.addEventListeners()` call in `src/app/sw.ts`

  **What to fix**: Line 85 and line 87 both call
  `serwist.addEventListeners()`. Remove the duplicate on line 87.

  This is a pre-existing bug unrelated to this feature but should
  be fixed while we're editing the file.

- [X] T016 Run the app and verify all acceptance scenarios from `specs/002-fix-sound-notifications/quickstart.md`

  **Steps**:
  1. `npm run dev` and open `localhost:3000`.
  2. Run through ALL 7 tests in `quickstart.md`.
  3. Verify each one passes.
  4. Fix any issues found.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start here
- **Phase 2 (Foundational)**: Depends on T001 (AudioSession module)
- **Phase 3 (US1 Salawat)**: Depends on T002 (useAudioUnlock hook)
- **Phase 4 (US2 Azan)**: Depends on T001 (AudioSession module)
- **Phase 5 (US3 Background)**: Depends on T008 (Azan with AudioSession)
- **Phase 6 (Polish)**: Depends on all user stories complete

### Task Dependencies Graph

```
T001 (AudioSession) ──┬──▶ T002 (useAudioUnlock) ──▶ T004 (wire up page.tsx)
                      │                                      │
                      ├──▶ T003 (TapToPlayBanner) ──────────┘
                      │                                      │
                      ├──▶ T005 (fix Salawat play) ─▶ T006 (unlock event) ─▶ T007 (verify)
                      │
                      ├──▶ T008 (fix Azan play) ──▶ T009 (grace period) ──▶ T010 (fix default)
                      │
                      └──▶ T011 (SW postMessage) ──▶ T012 (SW listener) ──▶ T013 (notif click)
                                                                               │
                                                                      T014 (priority) ──▶ T015 (dedup) ──▶ T016 (verify all)
```

### Parallel Opportunities

```
After T001 completes, these can run in parallel:
  - T002 + T003 (different files)
  - T005 + T008 (different files)

After T004 completes:
  - T005 + T008 + T011 (different files, different stories)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 → T002 → T003 → T004 (foundation)
2. Complete T005 → T006 → T007 (Salawat fix)
3. **STOP and TEST**: Set Salawat to 1 min, wait, verify sound plays
4. If working → proceed to US2

### Incremental Delivery

1. T001-T004 → Audio foundation ready
2. T005-T007 → Salawat timer works
3. T008-T010 → Azan at prayer time works
4. T011-T013 → Background notifications work
5. T014-T016 → Polish and final verification

### Total: 16 tasks across 6 phases
