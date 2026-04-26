# Contract: Hook Interfaces

**Feature**: Fix Sound Notifications | **Type**: Internal Hook API

## useSalawatTimer

**File**: `src/hooks/useSalawatTimer.ts`

**Purpose**: Manages Salawat reminder interval timer and playback

**Interface**:
```typescript
interface UseSalawatTimerReturn {
  playSalawat: () => void;  // Manual trigger (for toggle button)
  playCount: number;        // Total successful plays (for UI display)
}
```

**Dependencies**:
```typescript
interface SalawatTimerDeps {
  salawatEnabled: boolean;   // From settings-store
  salawatInterval: number;   // From settings-store (minutes)
  isLoaded: boolean;         // From settings-store (rehydration complete)
}
```

**Behavior**:
- Starts interval when `salawatEnabled && isLoaded`
- Resets timer when interval or enabled state changes
- Checks `isAudioUnlocked()` before playing
- Dispatches `audio-unlock-needed` event if blocked

---

## useAdhanPlayer

**File**: `src/hooks/useAdhanPlayer.ts`

**Purpose**: Monitors prayer times and triggers Azan at prayer time

**Interface**:
```typescript
interface UseAdhanPlayerReturn {
  triggerAdhan: (prayerName: string, prayerNameAr: string) => Promise<void>;
  playAdhanTest: () => void;                    // Manual test button
  playAdhanPreview: (soundKey: string) => void; // Settings preview
  pauseAdhan: () => void;
  isPlaying: boolean;                           // Current playback state
}
```

**Dependencies**:
```typescript
interface AdhanPlayerDeps {
  adhanEnabled: boolean;    // From settings-store
  adhanSound: string;       // From settings-store
  isLoaded: boolean;        // From settings-store
  timings: PrayerTimings;    // From usePrayerTimes
}
```

**Behavior**:
- Checks prayer times every 15 seconds
- Triggers within 30 seconds of prayer time OR within 5-minute grace period
- Dedupes using `notifiedPrayerRef` (per prayer per day)
- Shows browser notification + plays sound + dispatches toast event

---

## useAudioUnlock

**File**: `src/hooks/useAudioUnlock.ts`

**Purpose**: Handles audio session unlock for autoplay-blocked browsers

**Interface**:
```typescript
interface UseAudioUnlockReturn {
  unlocked: boolean;         // Current unlock state
  needsPrompt: boolean;      // Whether to show tap-to-play banner
  setNeedsPrompt: (v: boolean) => void;  // Dismiss after tap
}
```

**Behavior**:
- Adds click/touchend listeners to unlock on first interaction
- Listens for `audio-unlock-needed` event to show banner
- Resumes audio context on tab visibility change

---

## Error Handling

All hooks must handle:
- AudioContext not available (SSR)
- Notification permission denied
- Audio file not found (404)
- Playback rejected (autoplay blocked)

Current handling: All errors are caught and logged; UI shows graceful degradation (visual notification instead of sound).