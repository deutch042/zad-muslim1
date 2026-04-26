# Zad Muslim - Agent Guidance

## Key Commands

```bash
npm run dev      # Start dev server (logs to dev.log)
npm run build    # Production build
npm run db:generate  # Regenerate Prisma client
npm run lint     # Run ESLint
```

## Important Quirks

- **TypeScript errors ignored in build**: `next.config.ts` has `ignoreBuildErrors: true` — builds pass even with TS errors
- **Prisma auto-generates**: `postinstall` script runs `prisma generate` automatically after `npm install`
- **Custom dev port**: Dev server runs on port 3000 (explicit in package.json script)
- **Service Worker**: Uses Serwist — src/app/sw.ts → public/sw.js; disabled in dev mode
- **CSP headers**: Next.js config includes strict Content-Security-Policy, may block external scripts

## Architecture

- **Framework**: Next.js 16 + React 19 + TypeScript (strict mode)
- **Database**: Prisma + SQLite (prisma/schema.prisma)
- **State**: Zustand stores in src/store/
- **PWA**: Serwist + Service Worker for offline support
- **i18n**: next-intl for AR/EN bilingual

## Path Aliases

`@/*` maps to `src/*` (configured in tsconfig.json)

## Build Constraints

- `tsconfig.json` excludes: node_modules, examples, mini-services, skills
- next.config.ts allows dev origins: http://192.168.1.3:3000

## Current Feature

- **Active Branch**: `001-fix-build-cleanup`
- **Spec**: `specs/001-fix-build-cleanup/spec.md`
- **Plan**: `specs/001-fix-build-cleanup/plan.md`
- **Tasks**: `specs/001-fix-build-cleanup/tasks.md`