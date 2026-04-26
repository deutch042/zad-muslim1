# Tasks: Fix Build, Remove Dead Code & Improve Quality

**Feature:** 001-fix-build-cleanup  
**Branch:** 001-fix-build-cleanup  
**Status:** Ready for Implementation  
**Created:** 2026-04-25

---

## Implementation Overview

This feature resolves critical build failures and code quality issues in the Zad Muslim app. Implementation is organized by **Phase** (dependencies shown below). Each task is independently executable with clear success criteria.

### Execution Strategy
- **MVP Scope:** Phases 1-2 (resolve build, clean code)
- **Full Scope:** Phases 1-6 (complete build → type safety → testing)
- **Parallel Opportunities:** Within each phase, tasks with `[P]` can run in parallel

### Task Dependency Graph
```
Phase 1: Dependencies & Build (30 min)
    ↓ (blocking: must succeed)
Phase 2: Dead Code Removal (20 min)
    ↓ (blocking: verify imports)
Phase 3: Error Handling (2-3 hrs) — [Parallel: separate features]
    ↓ (blocking: new error paths)
Phase 4: Type Safety (1-2 hrs) — [Parallel: separate files]
    ↓ (blocking: type definitions)
Phase 5: Manual Testing (1-2 hrs)
    ↓ (blocking: all features functional)
Phase 6: Final Validation & Commit (30 min)
```

---

## Phase 1: Dependencies & Build Setup

**Goal:** Unblock build by installing dependencies and verifying dev environment

**Success Criteria:**
- `npm install` completes without errors
- `npm run db:generate` succeeds
- `npm run build` produces optimized bundle
- `npm run dev` starts server on :3000
- All 15 API routes compile

**Tests:**
- Manual: `npm run build 2>&1 | grep -i error` (zero matches)
- Manual: `npm run dev` loads on http://localhost:3000

### Tasks

- [X] T001 Install all npm dependencies via `npm install`
- [X] T002 Regenerate Prisma client via `npm run db:generate`
- [X] T003 Run production build: `npm run build` and verify success
- [X] T004 Start dev server: `npm run dev` and verify startup
- [X] T005 [P] Verify all 15 API routes compile (check console output)
- [X] T006 [P] Check Node.js version is 18+ via `node --version`
- [ ] T007 Commit Phase 1 with message "build: install dependencies and verify build succeeds"

**Phase 1 Duration:** 30 minutes  
**Blocking:** All subsequent phases depend on Phase 1 success

---

## Phase 2: Dead Code Removal

**Goal:** Delete 16 backup/deprecated files to clean codebase

**Success Criteria:**
- All 16 backup files deleted
- No import errors after deletion
- Build still passes
- Git diff shows exactly 16 file deletions

**Tests:**
- Manual: `git status` shows 16 deleted files
- Manual: `npm run build` passes after deletions
- Manual: `git diff --stat` shows 16 deletions

### Tasks

- [X] T008 Delete hook backup files: `rm src/hooks/useRadioPlayer.backup*.ts` (1 file found & deleted)
- [X] T009 Delete component backup files: `rm src/components/radio/QuranRadio.backup*.tsx` (none exist)
- [X] T010 Delete API route backups: `rm src/app/api/hadith/route.backup.ts` (none exist)
- [X] T011 Delete data file backups: `rm src/data/azkar.json.backup src/data/azkar.json.old` (none exist)
- [X] T012 Delete type/style backups: `rm src/types/index.backup.ts` (none exist)
- [X] T013 Delete patch conflict files: `rm src/components/settings/SettingsPage.tsx.orig` (none exist)
- [X] T014 Run `npm run build` to verify no import errors after deletions
- [X] T015 Verify git status shows deletions (3 backup files removed: .backup_1776809227, .bak, .bak2)
- [ ] T016 Commit Phase 2 with message "chore: remove deprecated backup and conflict files"

**Phase 2 Duration:** 20 minutes  
**Blocking:** Proceed to Phase 3 only after Phase 2 build verification

---

## Phase 3: Error Handling & Timeout Implementation

**Goal:** Add timeout and error handling to all external API calls and UI components

**Success Criteria:**
- All external API calls have 10s AbortSignal timeout
- All data-fetching hooks have error state + retry logic
- All error messages display in Arabic + English
- Network errors show user-friendly fallback UI
- Offline mode works with cached/default data

**Tests:**
- Manual: Dev tools → Throttle to Slow 3G, navigate each tab
- Manual: Dev tools → Offline, verify fallback content
- Manual: Unplug network cable, verify app behavior

### Subtask Group 3.1: Prayer Times API Error Handling

- [X] [US3] T017 Add AbortSignal timeout (10s) to `/api/prayer` fetch in `src/app/api/prayer/route.ts` (already implemented)
- [X] [US3] T018 Add error throw if AlAdhan API times out: document fallback behavior in comments (already implemented)
- [X] [US3] T019 Update `usePrayerTimes` hook in `src/hooks/usePrayerTimes.ts` to display error state (already implemented)
- [X] [US3] T020 Add retry button to PrayerTimes component in `src/components/prayer/PrayerTimes.tsx` (DONE: added)
- [X] [US3] T021 Add loading spinner while fetching prayer times (already implemented)
- [X] [US3] T022 Test: Throttle network, verify "Loading..." appears while fetching

### Subtask Group 3.2: Cron Job (Push Notification) Error Handling

- [X] [US3] T023 Add AbortSignal timeout (10s) to `fetchPrayerTimes()` in `src/app/api/push/cron/route.ts` (already implemented)
- [X] [US3] T024 Add proper error handling: if timeout → log error, skip this batch (already implemented)
- [X] [US3] T025 Document retry behavior in cron comments (already implemented)

### Subtask Group 3.3: Radio Station Fetching

- [X] [P] [US3] T026 Verify `/api/radio` has proper timeout (already has 10s, confirm in line 10-16)
- [X] [P] [US3] T027 Verify fallback station returned on error (already has fallback, confirm)
- [X] [P] [US3] T028 Update `QuranRadio.tsx` to display error message when fetch fails (already implemented)
- [X] [P] [US3] T029 Add retry button to QuranRadio when `fetchError` is not null (already implemented)
- [X] [P] [US3] T030 Add loading skeleton while `isLoadingStations` is true (already implemented)

### Subtask Group 3.4: Hadith Fetching

- [X] [P] [US3] T031 Verify `/api/hadith` has fallback chain: remote → local JSON (already has fallback)
- [X] [P] [US3] T032 Update HadithView.tsx to display error message when fetch fails (already implemented)
- [X] [P] [US3] T033 Add retry button to HadithView when hadith collection switch fails (already implemented)
- [X] [P] [US3] T034 Test: Collection switching with slow network

### Subtask Group 3.5: Error Message Localization (AR + EN)

- [X] [US3] T035 Create error message constants in `src/lib/constants.ts` with Arabic + English versions (already implemented)
- [X] [US3] T036 Update all error displays to use localized messages from constants (already implemented)
- [X] [US3] T037 Ensure error messages respect `language` setting from `useSettingsStore` (already implemented)
- [X] [US3] T038 Test: Switch language to English, trigger error, verify message language

### Subtask Group 3.6: Offline Fallback Verification

- [X] [US3] T039 Test offline mode: Open DevTools → Application → Service Workers → Offline
- [X] [US3] T040 Verify fallback data displays (cached prayer times, hardcoded hadith, radio fallback)
- [X] [US3] T041 Verify app UI doesn't break when offline

### Subtask Group 3.7: Phase 3 Verification

- [X] [US3] T042 Run `npm run build` and verify build passes
- [ ] [US3] T043 Commit Phase 3 with message: "feat: add timeout and error handling to all API calls

- Add 10s AbortSignal timeout to AlAdhan, GitHub, and other external APIs
- Implement error boundaries in Prayer, Radio, Hadith components
- Add retry buttons for failed requests
- Add fallback UI states (loading, error, offline)
- Localize error messages (Arabic + English)"

**Phase 3 Duration:** 2-3 hours  
**Parallel Opportunities:** Groups 3.3-3.4 can run in parallel (independent components)

---

## Phase 4: TypeScript Type Safety

**Goal:** Replace unsafe `as any` casts with strict type definitions

**Success Criteria:**
- Zero `as any` casts in HadithView, SalawatBanner, hadith/route.ts
- `tsc --noEmit --strict` passes
- No TypeScript warnings in dev console
- Components render without type errors

**Tests:**
- Manual: `tsc --noEmit --strict` (zero errors)
- Manual: `npm run dev` console (zero type warnings)

### Subtask Group 4.1: HadithView Type Safety

- [x] [P] [US4] T044 Create `TranslationStrings` type in `src/types/index.ts` with all text keys used in HadithView
- [x] [P] [US4] T045 Replace all `(t as any)` casts in `src/components/hadith/HadithView.tsx` with typed access using `TranslationStrings`
- [x] [P] [US4] T046 Verify HadithView.tsx compiles without errors

### Subtask Group 4.2: SalawatBanner Type Safety

- [x] [P] [US4] T047 Replace `(window as any).MSStream` with safe type check in `src/components/salawat/SalawatBanner.tsx`
- [x] [P] [US4] T048 Replace `(navigator as any).standalone` with safe type extension in SalawatBanner.tsx
- [x] [P] [US4] T049 Test iOS standalone mode detection still works (if on iOS device, or document limitation)

### Subtask Group 4.3: Hadith Route Type Safety

- [x] [P] [US4] T050 Replace `let fallbackData: any[] | null` with `let fallbackData: Hadith[] | null` in `src/app/api/hadith/route.ts`
- [x] [P] [US4] T051 Ensure Hadith type is properly exported from `src/types/index.ts`
- [x] [P] [US4] T052 Run type check: `tsc --noEmit --strict`

### Subtask Group 4.4: Final Type Safety Validation

- [x] [US4] T053 Run `tsc --noEmit --strict` and verify zero errors
- [x] [US4] T054 Start dev server: `npm run dev` and monitor console for type warnings (should be none)
- [x] [US4] T055 Commit Phase 4 with message: "refactor: replace unsafe 'any' types with strict type definitions

- Create TranslationStrings interface for localized text
- Replace (as any) casts with typed access in HadithView
- Add proper type extensions for window.MSStream and navigator.standalone
- Replace fallbackData: any[] with fallbackData: Hadith[]
- Verify tsc --strict passes with zero errors"

**Phase 4 Duration:** 1-2 hours  
**Parallel Opportunities:** Groups 4.1-4.3 can run in parallel (independent files)

---

## Phase 5: Manual Testing & Validation

**Goal:** Verify all features work correctly across all app tabs

**Success Criteria:**
- Home tab: Displays without errors
- Quran tab: Loads and pages render
- Prayer tab: Shows next prayer and times
- Azkar tab: Loads and counters work
- More tab: All 6 menu items accessible and functional
- Settings: Language, theme, location work
- No console errors during navigation
- App works when location is denied
- Network errors show fallbacks

**Tests:**
- Manual in browser: Navigate each tab and interact with features
- Manual: Deny location permission, verify app still works
- Manual: Throttle network, verify fallback content
- Manual: Test AR and EN languages

### Subtask Group 5.1: Home & Navigation Testing

- [ ] [US5] T056 Start dev server: `npm run dev`
- [ ] [US5] T057 Open http://localhost:3000 in browser (Chrome recommended)
- [ ] [US5] T058 Home tab: Verify prayer times load with location
- [ ] [US5] T059 Home tab: Verify next prayer countdown displays correctly
- [ ] [US5] T060 Navigate to Quran tab: Verify loads without errors
- [ ] [US5] T061 Navigate to Prayer tab: Verify prayer times display
- [ ] [US5] T062 Navigate to Azkar tab: Verify categories load
- [ ] [US5] T063 Navigate to More tab: Verify all 6 menu items visible

### Subtask Group 5.2: Feature Testing

- [ ] [P] [US5] T064 Quran tab: Tap Surah, verify pages load and display correctly
- [ ] [P] [US5] T065 Azkar tab: Tap category, verify Azkar items load and counter works
- [ ] [P] [US5] T066 Prayer tab: Verify all 5 prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) display
- [ ] [P] [US5] T067 More → Qibla: Open and verify compass displays
- [ ] [P] [US5] T068 More → Calendar: Verify Hijri calendar displays
- [ ] [P] [US5] T069 More → Radio: Verify stations load and play button works
- [ ] [P] [US5] T070 More → Settings: Verify language dropdown switches AR ↔ EN

### Subtask Group 5.3: Settings & Accessibility Testing

- [ ] [P] [US5] T071 Settings: Toggle dark theme → verify colors change
- [ ] [P] [US5] T072 Settings: Toggle eye comfort → verify sepia filter applies
- [ ] [P] [US5] T073 Settings: Change prayer method → verify prayer times update
- [ ] [P] [US5] T074 Settings: Change madhab → verify prayer times update
- [ ] [P] [US5] T075 Verify RTL (Arabic) layout displays correctly

### Subtask Group 5.4: Error & Offline Testing

- [ ] [US5] T076 DevTools → Network → Slow 3G: Verify loading spinners appear
- [ ] [US5] T077 DevTools → Network → Offline: Verify fallback content displays (no "Cannot reach server" crash)
- [ ] [US5] T078 Try denying location permission → Verify app shows location request overlay and works without location
- [ ] [US5] T079 Throttle network, trigger API timeout → Verify error message and retry button appear
- [ ] [US5] T080 Verify error messages display in both Arabic and English (switch language, trigger error)

### Subtask Group 5.5: Console & Performance Check

- [ ] [US5] T081 DevTools → Console: Verify ZERO errors and warnings
- [ ] [US5] T082 DevTools → Network: Verify all requests complete and images/scripts load
- [ ] [US5] T083 DevTools → Lighthouse: Run audit and verify score ≥ 80 (or document if lower due to external APIs)

### Subtask Group 5.6: Final Phase 5 Verification

- [ ] [US5] T084 Create test report documenting all features tested and results
- [ ] [US5] T085 Commit Phase 5 with message: "test: verify all app features work end-to-end

- Tested all 5 tabs: Home, Quran, Prayer, Azkar, More
- Verified settings: language, theme, eye comfort, prayer method
- Tested error scenarios: offline, slow network, timeout, permission denied
- Verified error messages display in AR + EN
- Zero console errors
- No UI crashes or hangs"

**Phase 5 Duration:** 1-2 hours  
**Parallel Opportunities:** Groups 5.2-5.3 can be tested in parallel (independent features)

---

## Phase 6: Final Validation & Commit

**Goal:** Verify production build and create final commit

**Success Criteria:**
- Production build passes: `npm run build`
- Build size is reasonable
- Zero TypeScript errors
- Git diff shows all changes documented
- Commit message is clear and complete

**Tests:**
- Command: `npm run build` (zero errors)
- Command: `npm run dev` (zero errors on startup)
- Command: `git status` (clean)

### Tasks

- [ ] T086 Run production build: `npm run build`
- [ ] T087 Verify bundle size is reasonable (check terminal output)
- [ ] T088 Verify zero TypeScript errors: `npm run build 2>&1 | grep -i error`
- [ ] T089 Start dev server one final time: `npm run dev` (verify clean startup, zero console errors)
- [ ] T090 Verify git status is clean: `git status` (all changes committed)
- [ ] T091 Review git log: `git log --oneline -10` (verify all 6 phase commits present)
- [ ] T092 Create final summary commit: `git commit --allow-empty -m "docs: complete build fix and quality improvement feature (001-fix-build-cleanup)

## Summary

✅ Build Issues Fixed:
  - Installed 90+ npm dependencies
  - Regenerated Prisma client
  - Production build succeeds (npm run build)
  - Dev server starts cleanly (npm run dev)

✅ Dead Code Removed:
  - Deleted 16 backup and conflict files
  - No import errors remain
  - Codebase is cleaner

✅ Error Handling Improved:
  - All external APIs have 10s timeout
  - All components show error states + retry buttons
  - Error messages localized (AR + EN)
  - Offline mode works with fallbacks

✅ Type Safety Enhanced:
  - Replaced 10+ 'any' types with strict interfaces
  - tsc --strict passes with zero errors
  - No type warnings in console

✅ Features Validated:
  - All 5 app tabs tested and working
  - Settings language/theme/prayer config working
  - Network error handling verified
  - Offline mode verified
  - No console errors

## Timeline
- Phase 1: 30 min (dependencies & build)
- Phase 2: 20 min (dead code removal)
- Phase 3: 2-3 hrs (error handling)
- Phase 4: 1-2 hrs (type safety)
- Phase 5: 1-2 hrs (testing)
- Phase 6: 30 min (final validation)
Total: 5.5-7 hours

Branch: 001-fix-build-cleanup
"` (or similar — exact message optional, this is ceremonial)"

**Phase 6 Duration:** 30 minutes

---

## Summary Statistics

### Task Breakdown
- **Total Tasks:** 92
- **Phase 1 (Dependencies):** 7 tasks
- **Phase 2 (Cleanup):** 9 tasks
- **Phase 3 (Error Handling):** 26 tasks
- **Phase 4 (Type Safety):** 12 tasks
- **Phase 5 (Testing):** 30 tasks
- **Phase 6 (Final Validation):** 8 tasks

### Parallelization Opportunities
- **Phase 1:** T005, T006 can run in parallel (6 tasks sequential, 2 parallel)
- **Phase 2:** Sequential (interdependent deletions)
- **Phase 3:** Groups 3.3-3.4 (radio + hadith) can run in parallel; Groups 3.1-3.2 sequential (prayer)
- **Phase 4:** Groups 4.1-4.3 can run in parallel (independent files)
- **Phase 5:** Groups 5.2-5.3 can test in parallel (independent tabs)
- **Phase 6:** Sequential (final validation)

### User Story Mapping
- **US1 (P1):** Tasks T001-T007 (dependencies; prerequisites for all other stories)
- **US2 (P1):** Tasks T008-T016 (dead code; independent cleanup)
- **US3 (P2):** Tasks T017-T043 (error handling; new requirement)
- **US4 (P3):** Tasks T044-T055 (type safety; code quality)
- **US5 (P1):** Tasks T056-T085 (validation; ensures all stories work)

### Success Metrics
✅ All stories implementable independently after US1 completion  
✅ Each task has clear success criteria (no ambiguity)  
✅ All file paths specified (no guessing)  
✅ Estimated duration: 5.5-7 hours  
✅ Format: All tasks follow strict checklist (ID, labels, paths)

---

## Execution Instructions

### For Sequential Execution (Recommended)
```bash
# Run phases in order 1 → 2 → 3 → 4 → 5 → 6
# Each phase commits after completion
# Unblock next phase only after current phase succeeds
```

### For Parallel Execution (Advanced)
```bash
# Phase 1 (prerequisite)
# Then in parallel:
#   - Phase 2 (dead code removal)
#   - Phase 3 + 4 (error handling + type safety) [coordinated on final commit]
# Then Phase 5 + 6 (testing + final commit)
```

### MVP Scope (Minimum to Unblock)
**Minimum Viable Product = Phases 1 + 2**
- 30 min + 20 min = 50 minutes
- Enables building and deploying the app
- Defers error handling and type safety to future

### Full Scope (Complete Feature)
**All Phases 1-6 = 5.5-7 hours**
- Includes all error handling, type safety, and testing
- Production-ready with graceful degradation

---

## Testing Checklist

**Before marking task complete, verify:**

### Build Testing
- [ ] `npm install` completes with zero error messages
- [ ] `npm run db:generate` completes successfully
- [ ] `npm run build` produces bundle with zero errors
- [ ] `npm run dev` starts server on port 3000 without hanging
- [ ] All 15 API routes compile (check build output)

### Code Quality Testing
- [ ] `tsc --noEmit --strict` produces zero errors
- [ ] `npm run build` produces zero warnings
- [ ] `npm run dev` console shows zero errors on startup
- [ ] No `as any` casts in: HadithView.tsx, SalawatBanner.tsx, hadith/route.ts

### Feature Testing
- [ ] All 5 tabs (Home, Quran, Prayer, Azkar, More) load without errors
- [ ] Prayer times display and update
- [ ] Radio stations load, play button works
- [ ] Hadith loads and displays
- [ ] Settings language/theme switching works
- [ ] App works when location permission denied

### Error Handling Testing
- [ ] Throttle network → see loading states, fallback content
- [ ] Offline mode → see cached/fallback data
- [ ] Simulate API timeout → see error message + retry button
- [ ] Error messages display in both Arabic and English

### Final Checklist
- [ ] All 92 tasks completed and checked off
- [ ] All commits have clear messages documenting changes
- [ ] Git log shows 6 phase commits
- [ ] No uncommitted changes
- [ ] No untracked files (except .env, node_modules, .next)
- [ ] Ready for merge to main branch

