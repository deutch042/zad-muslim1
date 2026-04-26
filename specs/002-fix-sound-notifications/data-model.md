# Data Model: Fix Sound Notifications

**Date**: 2026-04-26 | **Branch**: 002-fix-sound-notifications

## Entities

### 1. Salawat Reminder

**Purpose**: Periodic audio alert at user-configured intervals

**Fields**:
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| `enabled` | boolean | `false` | Persisted in settings store |
| `interval` | number (minutes) | `15` | Must be: 1, 5, 10, 15, 30 |
| `playCount` | number | `0` | Increment each successful play |

**State Management**: Zustand persist middleware (`settings-store.ts`)

**Key Methods**:
- `playSalawat()` - Play sound, increment count, check audio unlock
- `setInterval(minutes)` - Reset timer with new interval

**State Transitions**:
```
Disabled → (toggle on) → Enabled → (interval fires) → Playing → (toggle off) → Disabled
```

### 2. Azan Alert

**Purpose**: Event-driven audio alert at prayer times

**Fields**:
| Field | Type | Default | Validation |
|-------|------|---------|------------|
| `enabled` | boolean | `true` | Persisted in settings store |
| `sound` | string | `'rashed'` | Enum: default, algeria, makka, rashed |
| `lastNotifiedPrayer` | string | `null` | Track per-day to prevent duplicates |

**State Management**: Zustand persist middleware (`settings-store.ts`)

**Key Methods**:
- `triggerAdhan(prayerName, prayerNameAr)` - Play sound + show notification + dispatch toast event
- `playAdhanTest()` - Test sound playback (manual trigger)

**State Transitions**:
```
Disabled → (enable) → Watching → (prayer time) → Playing → (complete) → Watching
```

### 3. Prayer Time

**Purpose**: Calculated times for daily prayers

**Source**: API (`/api/prayer`) via `usePrayerTimes` hook

**Fields**:
| Field | Type | Source |
|-------|------|--------|
| `Fajr` | string (HH:MM) | API |
| `Dhuhr` | string (HH:MM) | API |
| `Asr` | string (HH:MM) | API |
| `Maghrib` | string (HH:MM) | API |
| `Isha` | string (HH:MM) | API |

**Grace Period Logic** (from spec):
- Within 30 seconds of prayer time: normal trigger
- 1-5 minutes after prayer time: missed prayer (trigger once on app open)

### 4. System Notification

**Purpose**: OS-level notification when app is backgrounded

**Implementation**: Web Notifications API + Service Worker

**Fields**:
| Field | Type |
|-------|------|
| `title` | string |
| `body` | string |
| `icon` | string (URL) |
| `tag` | string (for deduplication) |
| `requireInteraction` | boolean |

**Trigger Conditions**:
- Salawat: every N minutes (based on interval)
- Azan: at prayer time ± 30 seconds, or within 5-minute grace period

### 5. Tap-to-Play Prompt

**Purpose**: UI banner when browser blocks autoplay

**Component**: `TapToPlayBanner.tsx`

**State**:
| Field | Type | Trigger |
|-------|------|---------|
| `visible` | boolean | AudioContext blocked + sound event triggers |

**User Action**: Single tap unlocks audio for session

---

## Validation Rules

1. **Salawat interval**: Must be one of [1, 5, 10, 15, 30] minutes
2. **Azan sound**: Must be one of ['default', 'algeria', 'makka', 'rashed']
3. **Notification permission**: Must be 'granted' before showing system notifications
4. **Audio unlock**: Must have user gesture before playing audio

---

## Edge Case Handling

| Scenario | Handling |
|----------|-----------|
| Two prayers close together | Both trigger independently |
| Salawat + Azan at same time | Azan takes priority |
| No audio output available | Show visual notification only |
| Interval changed while running | Reset timer with new interval |
| Page navigation | Timer persists (useEffect scope) |
| Autoplay blocked | Show tap-to-play banner |