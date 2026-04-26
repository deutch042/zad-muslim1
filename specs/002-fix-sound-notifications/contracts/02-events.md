# Contract: Custom Events

**Feature**: Fix Sound Notifications | **Type**: Internal Event Contract

## Overview

The app uses CustomEvents for cross-component communication. This contract defines all events.

## Events

### audio-unlock-needed

**Purpose**: Notify UI that audio is blocked and user needs to tap to enable

**Emitter**: `useSalawatTimer.ts:55`, `useAdhanPlayer.ts:186`

```typescript
interface AudioUnlockNeededEvent extends CustomEvent {
  detail?: never;  // No payload
}
```

**Listener**: `useAudioUnlock.ts:44-53`

### adhan-playing

**Purpose**: Notify UI components that adhan is currently playing (for toast display)

**Emitter**: `useAdhanPlayer.ts:198-202`, `useAdhanPlayer.ts:123-127`

```typescript
interface AdhanPlayingEvent extends CustomEvent {
  detail: {
    prayerName: string;      // 'Fajr' | 'Dhuhr' | etc.
    prayerNameAr: string;   // 'الفجر' | 'الظهر' | etc.
  };
}
```

**Listener**: `AdhanToast.tsx` (shows toast)

---

## Event Flow

```
User enables Salawat → useSalawatTimer starts interval
       ↓
Interval fires (foreground) → playSalawat() → isAudioUnlocked?
       ↓ (if blocked)
audio-unlock-needed event → useAudioUnlock shows TapToPlayBanner
       ↓ (user taps)
unlockAudioSession() → isAudioUnlocked() = true
       ↓
audio plays, playCount increments
```

```
Prayer time arrives → useAdhanPlayer detects match
       ↓
triggerAdhan() → Play sound + notification + adhan-playing event
       ↓
AdhanToast displays prayer name
```

---

## Constraints

- Events only work in browser context (not SSR)
- Events are synchronous within the same page
- For cross-tab communication, use BroadcastChannel API (not implemented)