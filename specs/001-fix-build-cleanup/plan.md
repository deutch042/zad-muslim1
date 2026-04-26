# Implementation Plan: Fix Build, Remove Dead Code & Improve Quality

**Branch**: `001-fix-build-cleanup` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-build-cleanup/spec.md`

---

## Summary

Resolve critical build failures and code quality issues in the Zad Muslim Next.js app. Primary work:
1. Install npm dependencies to fix build
2. Delete 16 backup/deprecated files
3. Add timeout + error handling to external API calls
4. Replace unsafe `as any` TypeScript casts with proper types

---

## Technical Context

| Attribute | Value |
|-----------|-------|
| **Language/Version** | TypeScript 5.x, Node.js 18+ |
| **Primary Dependencies** | Next.js 16, React 19, Prisma 6, Zustand, Tailwind CSS 4 |
| **Storage** | SQLite via Prisma (file-based) |
| **Testing** | Manual browser testing (no automated test suite) |
| **Target Platform** | Web (PWA installable), Mobile-first |
| **Project Type** | Next.js web application (mobile-first Islamic app) |
| **Performance Goals** | Build < 60s, Dev server startup < 10s |
| **Constraints** | Must work offline (PWA), AR/EN bilingual |
| **Scale/Scope** | ~140 source files, 15 API routes, 5 main tabs |

**External APIs** (require timeout handling):
- aladhan.com - prayer times
- github.com raw - radio stations data

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ⚠️ CONSTITUTION IS A TEMPLATE

The constitution file (`.specify/memory/constitution.md`) contains placeholder values only:
- `[PRINCIPLE_1_NAME]`, `[PRINCIPLE_2_NAME]`, etc.
- No actual principles defined

**Implication**: No constitution gates can be evaluated. Recommend running `/speckit.constitution` to define project principles before proceeding to implementation.

---

## Project Structure

### Documentation (this feature)

```
specs/001-fix-build-cleanup/
├── spec.md              # Feature specification
├── plan.md              # This file
├── tasks.md             # Implementation tasks (92 tasks, 6 phases)
└── (research.md, data-model.md - not needed for this operational fix)
```

### Source Code (repository root)

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx         # Home/dashboard
│   ├── layout.tsx       # Root layout
│   ├── api/             # 15 API routes (prayer, hadith, radio, etc.)
│   └── sw.ts            # Service worker (Serwist)
├── components/          # 40+ React components
│   ├── hadith/
│   ├── prayer/
│   ├── quran/
│   ├── radio/
│   ├── salawat/
│   └── settings/
├── hooks/               # Custom React hooks (usePrayerTimes, useRadioPlayer, etc.)
├── store/               # Zustand stores (appStore, settingsStore)
├── lib/                 # Utilities, constants
├── types/               # TypeScript type definitions
└── data/                # Static data (azkar.json)

prisma/
└── schema.prisma        # Database schema

public/
└── sw.js                # Generated service worker
```

---

## Phase 0: Research (NOT APPLICABLE)

This feature is an operational fix, not new feature development. No research phase needed:
- Build issues: Known - missing npm dependencies
- Dead code: Listed explicitly in spec (16 files)
- Error handling: Standard patterns for React/Next.js
- Type safety: Direct code fixes, no research required

---

## Phase 1: Design & Contracts

### Data Model

Not applicable - no new data structures. This is a build/quality fix, not a feature adding new data.

### API Contracts (Existing)

| Endpoint | Method | Purpose | Timeout |
|----------|--------|---------|---------|
| `/api/prayer` | GET | Fetch prayer times from aladhan.com | 10s (to add) |
| `/api/radio` | GET | Fetch radio stations | 10s (verify) |
| `/api/hadith` | GET | Fetch hadith (remote → local fallback) | N/A |
| `/api/push/cron` | POST | Scheduled notifications | 10s (to add) |

### Quickstart

```bash
# Install dependencies
npm install

# Regenerate Prisma client
npm run db:generate

# Verify build passes
npm run build

# Start dev server
npm run dev
```

---

## Implementation Phases

| Phase | Description | Duration |
|-------|-------------|----------|
| Phase 1 | Dependencies & Build Setup | 30 min |
| Phase 2 | Dead Code Removal | 20 min |
| Phase 3 | Error Handling & Timeout | 2-3 hrs |
| Phase 4 | TypeScript Type Safety | 1-2 hrs |
| Phase 5 | Manual Testing | 1-2 hrs |
| Phase 6 | Final Validation & Commit | 30 min |

**Total**: 5.5-7 hours

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| npm install fails | Medium | High | Verify Node 18+, check package-lock.json |
| Backup deletion breaks imports | Low | High | Test build after each batch |
| Type changes break components | Medium | Medium | Incremental testing, type-only changes |
| API timeout breaks functionality | Low | Medium | 10s is generous + fallback data |

---

## Success Criteria

From spec.md:
- ✅ `npm run build` succeeds with zero errors
- ✅ `npm run dev` starts without console errors
- ✅ All 16 backup files deleted
- ✅ All API calls have 10s timeout + fallback
- ✅ All UI components have error states
- ✅ No `as any` types in: HadithView.tsx, SalawatBanner.tsx, hadith/route.ts
- ✅ All 5 tabs render without errors
- ✅ App works with location denied
- ✅ Error messages in Arabic + English

---

## Next Steps

1. ✅ **Spec completed**: spec.md
2. ✅ **Plan completed**: this file
3. → **Next**: Run `/speckit.tasks` (tasks already exist)
4. → **Then**: Run `/speckit.implement` to execute phases