# Quickstart: Fix Sound Notifications

**Branch**: 002-fix-sound-notifications | **Date**: 2026-04-26

## Prerequisites

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000)
```

## Key Files to Modify

### 1. Fix Salawat Timer Bug

**File**: `src/hooks/useSalawatTimer.ts`

**Current Issue** (line 115):
```typescript
}, [salawatEnabled, salawatInterval, isLoaded, playSalawat]);
```

The `playSalawat` function updates state (`setPlayCount`), causing the useEffect to re-run and reset the timer every time the sound plays.

**Fix**: Use a ref to track play count instead of state, OR remove `playSalawat` from dependencies and use a separate effect for the interval.

### 2. Verify Azan Player Trigger

**File**: `src/hooks/useAdhanPlayer.ts`

**Current Issue**: The hook is called in `page.tsx:192` but return value isn't used. Need to verify:
- Store rehydration completes before timer starts
- Audio unlock works for automatic triggers (not just manual test)

**Debug**: Add logging to confirm `triggerAdhan` is called at prayer time.

### 3. Background Support

**File**: `src/app/sw.ts`

Already implemented:
- Periodic Background Sync (lines 208-230) - for offline notifications
- Push notification handling (lines 370-420)
- Cache for settings and prayer times

**Note**: Periodic Sync only works in Chrome/Edge. iOS/Safari need push fallback.

## Test Scenarios

### Salawat Timer
1. Enable Salawat in UI
2. Set interval to 1 minute
3. Wait - sound should play automatically (not just on toggle)
4. Check play count increments

### Azan at Prayer Time
1. Enable Azan in Settings
2. Wait for prayer time (or set device time)
3. Sound should play automatically
4. Toast should appear

### Background (Chrome Android)
1. Enable both features
2. Minimize app
3. Wait for interval/prayer time
4. System notification should appear

## Known Limitations

| Platform | Limitation |
|----------|------------|
| iOS Safari | No push notifications (requires PWA install) |
| iOS Safari | No background audio |
| Firefox | No Periodic Background Sync |
| Safari | No push notifications |

## Related Files

- `src/store/settings-store.ts` - Settings persistence
- `src/lib/audio-session.ts` - AudioContext management
- `src/components/ui/TapToPlayBanner.tsx` - Audio unlock prompt
- `src/components/salawat/SalawatBanner.tsx` - Salawat toggle UI
- `src/components/prayer/AdhanToast.tsx` - Prayer time toast