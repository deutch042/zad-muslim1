# Contract: Service Worker Message API

**Feature**: Fix Sound Notifications | **Type**: Internal PWA Contract

## Overview

The Service Worker communicates with the main app via postMessage. This contract defines the message types and their payloads.

## Message Types (SW → App)

### PLAY_ADHAN

Triggered when prayer time arrives (foreground or background).

```typescript
interface PlayAdhanMessage {
  type: 'PLAY_ADHAN';
  prayer: string;        // 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
  sound?: string;       // 'default' | 'algeria' | 'makka' | 'rashed'
}
```

**Handler**: `useAdhanPlayer.ts` (lines 265-289)

### PLAY_SALAWAT

Triggered when Salawat interval fires in background.

```typescript
interface PlaySalawatMessage {
  type: 'PLAY_SALAWAT';
}
```

**Handler**: `SalawatBanner.tsx` (via `useSalawatTimer`)

## Message Types (App → SW)

Service Worker doesn't receive messages directly - it handles push events and periodic sync.

## Constraints

- Messages only work when SW is active and app is open/foreground
- Background notifications rely on Push API or Periodic Sync (not postMessage)
- iOS: postMessage only works for installed PWAs

---

## Example Usage

```typescript
// In SW (sw.ts line 286-291)
navigator.serviceWorker.addEventListener('message', (event) => {
  if (data.type === 'PLAY_ADHAN' && adhanEnabled) {
    triggerAdhan(data.prayer, arabicName);
  }
});
```