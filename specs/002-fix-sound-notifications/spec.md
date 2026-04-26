# Feature Specification: Fix Sound Notifications

**Feature Branch**: `002-fix-sound-notifications`
**Created**: 2026-04-26
**Status**: Draft
**Input**: User description: "the app have errors, bugs, and functions that not work — salawat sound timer broken, azan sound not playing at prayer time, both need background support"

## Clarifications

### Session 2026-04-26

- Q: On cold start (app reopen), should the Salawat timer auto-resume if previously enabled? → A: Yes, auto-resume immediately without user action.
- Q: If the user opens the app after a prayer time has passed, within what window should a missed Azan still trigger? → A: 5-minute grace period; trigger missed Azan once if app opens within 5 minutes of the prayer time.
- Q: Which platform is the primary target for background sound support? → A: Chrome/Android primary (distributed as WebView APK via AppCreator24, hosted on Netlify); Safari/iOS best-effort with documented limitations.
- Q: When the browser/WebView blocks autoplay (no user gesture), what should happen? → A: Show a tap-to-play prompt banner asking the user to tap once to enable sounds for the session.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Salawat Reminder Sounds Play Automatically (Priority: P1)

The user enables the Salawat reminder and selects an interval (e.g.,
every 5 minutes). After the configured interval elapses, the app MUST
automatically play the Salawat sound without any manual interaction.
Currently the sound only plays when the user taps the toggle button;
the interval timer has no audible effect.

**Why this priority**: This is the primary reported bug. The interval
setting is visible in the UI but non-functional, misleading users into
thinking the feature works.

**Independent Test**: Enable the Salawat reminder, set the interval to
1 minute, leave the app open, and confirm the sound plays after
1 minute without touching the screen.

**Acceptance Scenarios**:

1. **Given** the user has enabled Salawat reminders with a 5-minute
   interval, **When** 5 minutes elapse, **Then** the Salawat sound
   plays automatically.
2. **Given** the user changes the interval from 5 minutes to 1 minute,
   **When** 1 minute elapses, **Then** the new interval is respected
   and the sound plays.
3. **Given** the user disables the Salawat reminder, **When** the
   previously set interval elapses, **Then** no sound plays.
4. **Given** the user re-enables the Salawat reminder after disabling
   it, **When** the interval elapses, **Then** the sound resumes.
5. **Given** the user closes and reopens the app with Salawat previously
   enabled, **When** the app loads, **Then** the timer auto-resumes
   without requiring the user to toggle it again.
6. **Given** the browser/WebView blocks autoplay on app start, **When**
   the first Salawat interval fires, **Then** a tap-to-play prompt
   banner appears asking the user to tap once to enable sounds.

---

### User Story 2 - Azan Plays at Prayer Time (Priority: P1)

When the actual prayer time arrives (e.g., Dhuhr at 12:15 PM), the app
MUST play the selected Azan sound automatically. Currently the Azan
only plays when the user taps the "Test" button in Settings; it does
not trigger at the real prayer time while the app is open.

**Why this priority**: Equally critical — prayer time notification is
the app's core value proposition. The feature exists but does not fire
when it matters.

**Independent Test**: Open the app before a known prayer time, wait for
that prayer time to arrive, and confirm the Azan sound plays without
any user action.

**Acceptance Scenarios**:

1. **Given** Azan is enabled and the app is open, **When** the current
   time matches a prayer time, **Then** the selected Azan sound plays
   and a visual notification (toast) appears.
2. **Given** the user has selected the "Makkah" Azan variant in
   Settings, **When** prayer time arrives, **Then** the Makkah variant
   plays (not the default).
3. **Given** the user has disabled Azan in Settings, **When** prayer
   time arrives, **Then** no sound plays and no toast appears.
4. **Given** the user's device is on silent/vibrate mode, **When**
   prayer time arrives, **Then** a visual toast still appears (sound
   follows device audio policy).
5. **Given** the user opens the app 3 minutes after Dhuhr time, **When**
   the app loads, **Then** the Azan plays once for the missed prayer.
6. **Given** the user opens the app 10 minutes after Dhuhr time, **When**
   the app loads, **Then** no Azan plays (outside 5-minute grace window).

---

### User Story 3 - Background Sound Notifications (Priority: P2)

Both the Salawat reminder and the Azan MUST function when the app is
not in the foreground — whether minimized, screen locked, or the
browser tab is inactive. A notification MUST appear and, where the
platform allows, sound MUST accompany it.

**Why this priority**: Depends on US1 and US2 working in the foreground
first. Background operation extends their reliability but is a separate
concern with distinct platform constraints.

**Independent Test**: Enable both features, minimize the app or lock
the screen, and wait for a Salawat interval or prayer time to arrive.
Confirm a notification appears (with sound where supported).

**Acceptance Scenarios**:

1. **Given** Salawat is enabled and the app is minimized, **When** the
   interval elapses, **Then** a system notification appears with the
   Salawat sound (or vibration if sound is restricted).
2. **Given** Azan is enabled and the screen is locked, **When** prayer
   time arrives, **Then** a system notification appears with the Azan
   sound (or vibration if sound is restricted).
3. **Given** the app has been closed entirely, **When** a prayer time
   arrives, **Then** a system notification is delivered via background
   sync or push notification (sound depends on OS capabilities).
4. **Given** the user denies notification permission, **When** a sound
   event triggers in the background, **Then** the app falls back to
   in-app visual alerts when the user returns.

---

### Edge Cases

- What happens when two prayer times are very close together (e.g.,
  Maghrib and Isha within minutes)? Both MUST trigger independently.
- What happens when a Salawat interval fires at the exact same time as
  an Azan? Azan MUST take priority; Salawat is deferred or skipped.
- What happens when the device has no audio output (e.g., no speakers,
  Bluetooth disconnected)? The visual notification MUST still appear.
- What happens when the user changes the Salawat interval while a timer
  is already running? The new interval MUST take effect immediately.
- What happens on a page navigation within the app? Sound timers MUST
  persist across in-app navigation without resetting.
- What happens when autoplay is blocked and the user ignores the
  tap-to-play prompt? Sounds remain silent; visual notifications
  (toast/banner) continue to appear for every event.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Salawat reminder MUST play the Salawat sound file
  automatically at the user-configured interval without requiring any
  manual interaction after initial enablement.
- **FR-002**: The Azan MUST play the user-selected Azan sound when the
  current time matches a calculated prayer time, within a tolerance of
  30 seconds.
- **FR-003**: Both sound features MUST continue operating when the app
  is not in the active foreground (minimized, screen locked, or tab
  backgrounded).
- **FR-004**: When background audio playback is not permitted by the
  platform, the system MUST deliver a system notification with sound
  or vibration as a fallback.
- **FR-005**: Changing the Salawat interval while the timer is active
  MUST apply the new interval immediately (reset the timer).
- **FR-006**: Azan MUST take priority over a concurrent Salawat
  reminder; the Salawat sound MUST be deferred or skipped.
- **FR-007**: Sound playback MUST respect the user's device audio/
  volume settings (silent mode, Do Not Disturb).
- **FR-008**: The Salawat play count MUST increment each time the sound
  successfully plays (both manual and automatic triggers).
- **FR-009**: On app open (cold start), if the Salawat reminder was
  previously enabled, the timer MUST auto-resume without user action.
- **FR-010**: On app open, if a prayer time was missed within the last
  5 minutes and Azan is enabled, the Azan MUST play once for that
  prayer.
- **FR-011**: When the browser or WebView blocks autoplay (no user
  gesture), the app MUST display a tap-to-play prompt banner. After
  the user taps once, sounds MUST be unblocked for the session.

### Key Entities

- **Salawat Reminder**: Periodic audio alert; defined by enabled state,
  interval (minutes), and associated sound file.
- **Azan Alert**: Event-driven audio alert; defined by enabled state,
  selected sound variant, and the set of daily prayer times.
- **Prayer Time**: A calculated moment (hour:minute) for each of the
  five daily prayers, derived from the user's geographic location.
- **System Notification**: An OS-level notification with optional sound
  and vibration, used as fallback when the app is backgrounded.
- **Tap-to-Play Prompt**: A dismissible UI banner shown when autoplay
  is blocked; a single user tap unlocks audio for the current session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Salawat sound plays automatically within 5 seconds of the
  configured interval elapsing, with 100% reliability while the app is
  in the foreground.
- **SC-002**: Azan sound plays within 30 seconds of the actual prayer
  time, with 100% reliability while the app is in the foreground.
- **SC-003**: When the app is in the background, a notification with
  sound/vibration is delivered for at least 90% of Salawat intervals
  and prayer times (platform-dependent constraints apply).
- **SC-004**: No duplicate sounds play for the same Salawat interval
  tick or the same prayer time event.
- **SC-005**: Users can complete the enable-and-configure flow for both
  features in under 30 seconds.
- **SC-006**: On cold start with Salawat previously enabled, the timer
  resumes within 3 seconds of app load completing.
- **SC-007**: On app open within 5 minutes of a missed prayer, the Azan
  plays within 3 seconds of load completing.

## Assumptions

- Users have granted notification permission to the app (the app
  already requests this on first use).
- The device has functioning audio output or vibration hardware.
- Prayer times are calculated correctly by the existing prayer time
  engine (this feature fixes sound triggering, not prayer time
  calculation).
- The app is a PWA hosted on Netlify, primarily distributed as an
  Android APK via AppCreator24 (WebView wrapper). Some users access
  it directly via mobile browser (Chrome, Safari).
- The Android WebView (AppCreator24) is the primary runtime target.
  Chrome browser is secondary. Safari/iOS is best-effort with
  documented limitations.
- Background reliability is limited by each platform's power
  management and background execution policies; the app will use
  best-effort mechanisms (periodic sync, push notifications) and
  document known limitations per platform.
- WebView autoplay policies may differ from standalone Chrome;
  the tap-to-play prompt handles this gracefully.
