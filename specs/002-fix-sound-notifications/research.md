# Research: Fix Sound Notifications

**Date**: 2026-04-26 | **Branch**: 002-fix-sound-notifications

## Research Questions

### 1. AudioContext Suspend on Tab Background

**Question**: Does AudioContext automatically suspend when tab is backgrounded? How to keep it running?

**Findings**:
- AudioContext can be in `running`, `suspended`, or `closed` states
- On iOS specifically, WebKit bug #237878 confirms AudioContext is suspended when page is backgrounded
- A new `interrupted` state is being added to the Web Audio API spec to handle interruptions like phone calls
- Solution: Use `audioCtx.resume()` on tab visibility change (already implemented in `useAudioUnlock.ts`)
- For background audio, the page must use Service Worker notifications as fallback since AudioContext won't work

**Decision**: Use Service Worker notifications for background; AudioContext only works in foreground

### 2. iOS PWA Background Notifications

**Question**: Which iOS versions support background audio/notifications for standalone PWAs?

**Findings**:
- iOS 16.4+ (March 2023) is required for push notifications to work
- Push API ONLY works for PWAs installed via Safari → Add to Home Screen
- Regular tabs in Safari or any browser do NOT have access to PushManager
- Manifest MUST have `display: standalone` for push to work
- Background audio does NOT work on iOS PWAs - iOS kills the audio context
- Background Sync is NOT supported in Safari at all
- iOS treats PWAs closer to "glorified web bookmarks" per Apple's design

**Decision**: Document iOS limitations; require PWA installation; use server-side push (Vercel) as primary, fallback to in-app notifications when foregrounded

### 3. Periodic Background Sync API Support

**Question**: Which browsers support the Periodic Background Sync API?

**Findings**:
| Browser | Support |
|---------|---------|
| Chrome 80+ | ✅ Yes |
| Edge 80+ | ✅ Yes |
| Firefox | ❌ No |
| Safari (desktop) | ❌ No |
| Safari iOS | ❌ No |
| Chrome Android 80+ | ✅ Yes |
| Samsung Internet 13+ | ✅ Yes |
| Android WebView 80+ | ✅ Yes |

- Requires PWA to be installed (not just a tab)
- Chrome uses "site engagement score" to determine frequency
- Minimum interval is 5 minutes (Chrome enforces this)

**Decision**: Use as progressive enhancement for Chrome/Android; fallback to server-side push notifications for other browsers

### 4. Android WebView Background Audio

**Question**: Does Android WebView (AppCreator24) support background audio playback?

**Findings**:
- Android WebView (Chromium-based since Android 5.0) supports Web Audio API
- Background audio in WebView is NOT reliable - WebView gets suspended when app is minimized
- The app should use Service Worker notifications as fallback
- For true background audio, a native Android wrapper would be needed (but that's outside scope)

**Decision**: Use Service Worker notifications as primary background mechanism; document limitation that audio only works reliably in foreground

---

## Summary: Background Strategy

| Platform | Foreground Audio | Background Notifications | Notes |
|----------|------------------|--------------------------|-------|
| Chrome (desktop) | ✅ | ✅ (Periodic Sync + Push) | Full support |
| Chrome Android | ✅ | ✅ (Periodic Sync + Push) | Full support |
| Android WebView | ✅ | ✅ (Push only) | Periodic Sync works |
| iOS Safari PWA | ✅ | ⚠️ (Push only, iOS 16.4+) | Requires install |
| iOS Chrome/Firefox | ❌ | ❌ | Uses WebKit, no push |
| Safari desktop | ✅ | ❌ | No push/background |

---

## Alternatives Considered

1. **Native Android wrapper** - Would solve background audio but outside project scope
2. **Firebase Cloud Messaging** - Alternative to Vercel push, adds complexity
3. **WebRTC for background** - Not suitable for simple notification use case

---

## Recommendations

1. Fix Salawat timer bug (useEffect dependency issue)
2. Ensure Azan player works in foreground reliably
3. Use Service Worker push notifications as primary background mechanism
4. Document iOS limitations clearly in UI
5. Implement graceful degradation: foreground → push → in-app fallback