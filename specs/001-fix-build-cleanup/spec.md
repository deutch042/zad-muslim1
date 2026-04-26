# Feature Specification: Fix Build, Remove Dead Code & Improve Quality

**Feature ID:** 001-fix-build-cleanup  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Created:** 2026-04-25

---

## Overview

The Zad Muslim app (Next.js 16 Islamic mobile app) has critical build failures and code quality issues blocking deployment. This feature addresses:
1. Missing dependencies preventing build
2. 16 backup/deprecated files cluttering codebase  
3. Insufficient error handling causing silent failures
4. Unsafe TypeScript types reducing maintainability

---

## Problem Statement

**Current State:**
- ❌ Build fails: `Module not found: '@prisma/adapter-libsql'` + all ~90 npm dependencies unmet
- ❌ Codebase bloat: 16 backup files (hooks, components, APIs, data, types)
- ❌ Fragility: Only 2 error handlers across 138 source files
- ❌ Type unsafety: 10+ `as any` casts with no type definitions

**Impact:**
- Cannot build/deploy app
- Risk of accidental use of old code
- Network errors cause silent failures (users see no feedback)
- Type errors discovered at runtime, not development time
- Maintenance burden: unclear which files are canonical

---

## Success Criteria

- ✅ **SC-1:** `npm run build` succeeds with zero errors
- ✅ **SC-2:** `npm run dev` starts without console errors
- ✅ **SC-3:** All 16 backup files deleted from codebase
- ✅ **SC-4:** All external API calls have 10s timeout + fallback
- ✅ **SC-5:** All UI components have error states & fallback content
- ✅ **SC-6:** No `any` types in: HadithView.tsx, SalawatBanner.tsx, hadith/route.ts
- ✅ **SC-7:** All 5 main tabs (Home, Quran, Prayer, Azkar, More) render without errors
- ✅ **SC-8:** App works when location permission denied
- ✅ **SC-9:** Network errors show user-friendly message (AR + EN)
- ✅ **SC-10:** Git commit with clear message documenting all changes

---

## User Stories

### Story 1: Resolve Build Failures (P1 — Critical)

**As a** developer  
**I want** the build to succeed  
**So that** I can deploy and test the app

**Acceptance Criteria:**
- [ ] AC-1.1: `npm install` installs all 90+ dependencies without errors
- [ ] AC-1.2: `npm run db:generate` regenerates Prisma client successfully
- [ ] AC-1.3: `npm run build` completes in < 60 seconds with zero errors
- [ ] AC-1.4: Production build includes all 15 API routes
- [ ] AC-1.5: Dev server (`npm run dev`) starts on port 3000
- [ ] AC-1.6: No TypeScript compilation errors
- [ ] AC-1.7: No console errors on app startup

**Tasks Involved:**
- Install dependencies
- Configure database (if needed)
- Regenerate Prisma client
- Verify build passes

**Priority:** P1 — Must complete before testing other features

---

### Story 2: Clean Up Dead Code (P1 — High)

**As a** maintainer  
**I want** deprecated files removed  
**So that** the codebase is clean and unambiguous

**Acceptance Criteria:**
- [ ] AC-2.1: All hook backup files deleted (5 files)
- [ ] AC-2.2: All component backup files deleted (2 files)
- [ ] AC-2.3: All API route backups deleted (3 files)
- [ ] AC-2.4: All data file backups deleted (2 files)
- [ ] AC-2.5: All type/style backups deleted (3 files)
- [ ] AC-2.6: No import errors after deletion
- [ ] AC-2.7: Build still passes after cleanup
- [ ] AC-2.8: Total 16 files removed, verified with `git status`

**Files to Delete:**
```
src/hooks/useRadioPlayer.backup*.ts (5 files)
src/components/radio/QuranRadio.backup*.tsx (2 files)
src/app/api/hadith/route.backup.ts
src/app/api/radio/route.backup*.ts (2 files)
src/data/azkar.json.backup
src/data/azkar.json.old
src/types/index.backup.ts
src/app/globals.css.backup-kaaba
src/components/settings/SettingsPage.tsx.orig/rej (patch files)
```

**Priority:** P1 — Should follow build fix

---

### Story 3: Add Timeout & Error Handling to APIs (P2 — High)

**As a** user  
**I want** the app to handle network errors gracefully  
**So that** I see helpful messages instead of hung UI or silent failures

**Acceptance Criteria:**
- [ ] AC-3.1: All external API calls have 10s AbortSignal timeout
- [ ] AC-3.2: AlAdhan prayer API: throw error if timeout
- [ ] AC-3.3: Radio API: return fallback data on error (already done)
- [ ] AC-3.4: Hadith API: fallback to local JSON if remote fails
- [ ] AC-3.5: Prayer times hook shows "Loading..." state
- [ ] AC-3.6: Prayer times hook shows error message + retry button on failure
- [ ] AC-3.7: Radio component shows error message + retry on fetch failure
- [ ] AC-3.8: Hadith component shows error message + retry on fetch failure
- [ ] AC-3.9: App works offline with fallback data visible
- [ ] AC-3.10: Error messages display in both Arabic and English

**APIs Affected:**
- `/api/prayer` (AlAdhan) — needs timeout + error thrown
- `/api/radio` (GitHub raw) — already has timeout, verify fallback
- `/api/hadith` (remote + local fallback) — verify fallback chain
- `/api/push/cron` (internal) — AlAdhan call needs timeout

**Priority:** P2 — Improves UX reliability

---

### Story 4: Replace Unsafe `any` Types (P3 — Medium)

**As a** developer  
**I want** TypeScript to catch type errors  
**So that** bugs are found during development, not at runtime

**Acceptance Criteria:**
- [ ] AC-4.1: HadithView.tsx: Replace 8 `(t as any)` casts with `TranslationStrings` type
- [ ] AC-4.2: SalawatBanner.tsx: Replace `(window as any).MSStream` with safe type check
- [ ] AC-4.3: SalawatBanner.tsx: Replace `(navigator as any).standalone` with safe type check
- [ ] AC-4.4: hadith/route.ts: Replace `any[]` with `Hadith[]` type
- [ ] AC-4.5: `tsc --noEmit --strict` passes with no errors
- [ ] AC-4.6: All components render without type errors
- [ ] AC-4.7: No TypeScript warnings in console during dev

**Files Affected:**
- `src/components/hadith/HadithView.tsx` (8 casts)
- `src/components/salawat/SalawatBanner.tsx` (2 casts)
- `src/app/api/hadith/route.ts` (1 type)

**Priority:** P3 — Improves maintainability

---

### Story 5: Verify All Tabs Work (P1 — High)

**As a** user  
**I want** all app features to work without errors  
**So that** I can use all functionality

**Acceptance Criteria:**
- [ ] AC-5.1: Home tab loads without errors
- [ ] AC-5.2: Prayer times display with location set
- [ ] AC-5.3: Quran tab loads and pages display
- [ ] AC-5.4: Prayer times tab shows next prayer + prayer times
- [ ] AC-5.5: Azkar tab loads categories and counters work
- [ ] AC-5.6: More menu loads all 6 items (Qibla, Calendar, Radio, Settings, Names, Goals)
- [ ] AC-5.7: Radio loads stations and play/pause works
- [ ] AC-5.8: Settings: Language switching works (AR ↔ EN)
- [ ] AC-5.9: Settings: Dark theme toggle works
- [ ] AC-5.10: Settings: Eye comfort mode works
- [ ] AC-5.11: No console errors during navigation
- [ ] AC-5.12: No performance regressions (Lighthouse score ≥ 80)

**Test Scenarios:**
1. Set location → Home tab shows prayer times
2. Play radio station → Audio loads and plays
3. Switch language to English → All UI updates
4. Deny location permission → App still works
5. Throttle network to Slow 3G → Fallback data visible, retry buttons work

**Priority:** P1 — Final validation

---

## Edge Cases

- **EC-1:** Location permission denied → App uses default location or shows permission request
- **EC-2:** Network offline → Show fallback data (cached or hardcoded)
- **EC-3:** AlAdhan API timeout (>10s) → Show error, allow retry
- **EC-4:** Radio stream unavailable → Show error, suggest alternative
- **EC-5:** No Hadith data → Show fallback hadith
- **EC-6:** Browser doesn't support Web Push → Gracefully degrade
- **EC-7:** Slow network (3G/LTE) → Show loading states, don't freeze UI
- **EC-8:** User navigates between tabs quickly → Cancel in-flight requests

---

## Constraints & Dependencies

- **Node.js 18+** required for build
- **npm** package manager (or compatible: pnpm, yarn)
- **SQLite** database (file-based, no external DB needed)
- **Browser:** Modern (ES2020+, Web Audio API, Geolocation API)
- **External APIs:**
  - aladhan.com (prayer times) — must handle timeout
  - github.com raw (radio data) — must handle timeout
  - web-push service (optional for notifications)

---

## Out of Scope

- ❌ Add new features (only fix existing ones)
- ❌ Refactor entire codebase (only address identified issues)
- ❌ Change UI/UX (only add error states + fallbacks)
- ❌ Add tests (already documented, not implementing)
- ❌ Performance optimization (beyond addressing current issues)

---

## Implementation Strategy

**Phases:**
1. **Phase 1 (30 min):** Install deps, build, verify dev server
2. **Phase 2 (20 min):** Delete 16 backup files
3. **Phase 3 (2-3 hrs):** Add error handling + timeouts
4. **Phase 4 (1-2 hrs):** Fix TypeScript types
5. **Phase 5 (1-2 hrs):** Manual testing all tabs
6. **Phase 6 (30 min):** Final validation + commit

**Total:** 5.5–7 hours

---

## Deliverables

1. ✅ Feature branch: `001-fix-build-cleanup`
2. ✅ Passing build: `npm run build` ← success
3. ✅ Clean codebase: 16 backup files deleted
4. ✅ Error handling: All API calls have timeout + fallback
5. ✅ Type safety: No `any` types in core files
6. ✅ Git commit: Clear message documenting changes
7. ✅ Test report: All 5 tabs working, no console errors

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| npm install fails | Medium | High | Check package-lock.json, verify Node 18+ |
| Backup deletion breaks imports | Low | High | Test build after each batch |
| API timeout breaks functionality | Low | Medium | Use 10s timeout (generous) + fallback |
| Type changes break components | Medium | Medium | Use type-only changes, test incrementally |

---

## Related Artifacts

- **Plan:** `.specify/specs/001-fix-build-cleanup/plan.md` (detailed implementation phases)
- **Branch:** `001-fix-build-cleanup` (Git feature branch)
- **Build:** `npm run build` command
- **Tests:** Run manually in browser (UI testing)

