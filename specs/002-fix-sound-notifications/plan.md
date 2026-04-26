# Implementation Plan: Fix Sound Notifications

**Branch**: `002-fix-sound-notifications` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fix-sound-notifications/spec.md`

## Summary

Fix two critical bugs: (1) Salawat reminder timer doesn't play sound automatically at configured intervals - only plays on manual toggle, and (2) Azan doesn't play at prayer time despite being enabled - only works via Test button. Both require background notification support for when app is not in foreground.

## Technical Context

**Language/Version**: TypeScript 5.x | Next.js 16 (React 19)  
**Primary Dependencies**: Zustand (state), Serwist (PWA/Service Worker), Web Notifications API, Web Audio API  
**Storage**: LocalStorage via Zustand persist middleware  
**Testing**: Vitest (to be confirmed)  
**Target Platform**: Chrome/Android (WebView via AppCreator24), Safari/iOS best-effort  
**Project Type**: PWA (Progressive Web App) - mobile-first Islamic prayer companion  
**Performance Goals**: <30s cold start, <3s timer resume on foreground, 100% foreground reliability  
**Constraints**: WebView autoplay restrictions, iOS PWA background limitations, browser notification permissions  
**Scale/Scope**: Single-user mobile app, ~50 components, 15+ hooks

### Current Implementation State

| Feature | Location | Status | Issue |
|---------|----------|--------|-------|
| Salawat Timer | `src/hooks/useSalawatTimer.ts` | Implemented but buggy | Timer resets on every fire due to useEffect dependency on playSalawat |
| Azan Player | `src/hooks/useAdhanPlayer.ts` | Implemented | May fail silently if store not hydrated or audio blocked |
| Audio Unlock | `src/lib/audio-session.ts` | Implemented | Works but relies on user interaction |
| Tap-to-Play Banner | `src/components/ui/TapToPlayBanner.tsx` | Implemented | Shows when autoplay blocked |
| Background (SW) | `src/app/sw.ts` | Implemented | Uses Periodic Background Sync (limited support) |
| Push Notifications | `src/hooks/usePushNotifications.ts` | Implemented | Requires server push (Vercel) |

### Key Unknowns (NEEDS CLARIFICATION)

1. **Audio context state**: Does the AudioContext suspend after tab inactivity, preventing background sounds?
2. **iOS background limitations**: What exact iOS versions support background audio/notifications for PWAs?
3. **Service Worker periodic sync**: Which browsers support the Periodic Background Sync API?

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate Evaluation

| Principle | Status | Finding |
|-----------|--------|---------|
| I. No Direct Editing | ✅ PASS | This plan identifies bugs; implementation will be done by human developer |
| II. Full Review | ✅ PASS | All relevant files analyzed: useSalawatTimer.ts, useAdhanPlayer.ts, sw.ts, audio-session.ts |
| III. Quality First | ⚠️ WARN | Potential null pointer in audioRef.current (line 44-47 of useSalawatTimer.ts) - handled with guard |
| IV. Clean Code | ⚠️ WARN | useSalawatTimer has redundant audio creation - already handled in useEffect |
| V. Modular Design | ✅ PASS | Hooks follow existing patterns; audio-session.ts is shared module |
| VI. Zero-Error Policy | ⚠️ WARN | Missing catch on playSalawat promise (line 71) - currently only logs warning |

### Violations to Justify

None required - all issues are local to individual hooks, no cross-module violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-sound-notifications/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

This is a Next.js PWA with TypeScript. The relevant directories for this feature:

```text
src/
├── app/
│   ├── sw.ts                    # Service Worker (background notifications)
│   └── page.tsx                 # Main page (uses useAdhanPlayer)
├── components/
│   ├── ui/
│   │   └── TapToPlayBanner.tsx # Audio unlock prompt UI
│   └── salawat/
│       └── SalawatBanner.tsx   # Salawat toggle button (uses useSalawatTimer)
├── hooks/
│   ├── useSalawatTimer.ts       # BUG: Salawat interval timer (needs fix)
│   ├── useAdhanPlayer.ts       # Azan at prayer time (needs verification)
│   ├── useAudioUnlock.ts       # Audio context unlock handler
│   ├── usePushNotifications.ts  # Push subscription management
│   └── usePrayerTimes.ts       # Prayer time fetching
├── lib/
│   └── audio-session.ts         # AudioContext management (shared module)
├── store/
│   ├── settings-store.ts       # User settings (salawatEnabled, adhanEnabled, etc.)
│   └── salawat-store.ts        # Salawat counter (not related to timer)
└── types/
    └── index.ts                 # TypeScript interfaces (UserSettings)

public/
└── audio/
    ├── salawat.mp3              # Salawat sound file
    ├── adhan-algeria.mp3        # Azan variants
    ├── adhan-makka.mp3
    └── adhan-rashed.mp3

tests/                           # (to confirm test framework)
```

**Structure Decision**: Single Next.js project - all code is in `src/` directory. Feature spans hooks (logic), components (UI), and service worker (background).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

## Phase 0: Research Tasks

### Unknowns to Resolve

| # | Unknown | Research Question |
|---|---------|-------------------|
| 1 | AudioContext suspend | Does AudioContext automatically suspend when tab is backgrounded? How to keep it running? |
| 2 | iOS PWA background | Which iOS versions support background audio and notifications for standalone PWAs? |
| 3 | Periodic Sync API | What is the current browser support for the Periodic Background Sync API? Fallback strategy? |
| 4 | Background audio in WebView | Does Android WebView (AppCreator24) support background audio playback? |

### Research Output

- `research.md` - Consolidated findings on background audio, iOS limitations, browser support
