# DevOps Build Recovery Notes

## 2026-04-24

confirmed_by_user: true

### Signal
- `apps/web` `pnpm build` failed with many `Module not found` errors for `@/components/StyledComponents` and `@/theme/*`.
- `apps/api` `pnpm build` previously failed with unresolved imports from `src/generated/prisma`.

### Root Cause
- Shared frontend barrel files/assets expected by imports were missing.
- Prisma client generation artifacts were not present in API source tree.

### Minimal Remediation
1. Restore shared frontend export surface:
   - add `src/components/StyledComponents.tsx` to re-export required Ant Design modules and Google login button.
2. Restore theme entrypoints expected by layout:
   - add `src/theme/ThemeProvider.tsx`,
   - add `src/theme/globals.css`, `src/theme/antd-overrides.css`,
   - add `src/theme/themes/{tokyo-dusk,sumie,night-sky}.css`.
3. Regenerate Prisma client in API when generated imports are missing:
   - run `pnpm prisma generate` with required env loaded.

### Prevention
- Treat shared barrels (`StyledComponents`, theme provider/assets) as contract files; if removed/refactored, update all imports in the same change.
- For API pipelines, include `prisma generate` step before `tsc` if generated client is not committed or may be stale.

### New evidence
- User confirmed the API dev startup issue as resolved after restoring local env and rerunning `pnpm run dev`.
