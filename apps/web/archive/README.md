# Archived components

Modules here are **not imported by the main app**. They were moved out of `src/components` so Storybook’s `src/**/*.stories.*` glob no longer discovers them.

Do not re-import these into app routes or live providers without deliberately moving them back under `src/`.

`tsconfig.json` and `jest.config.ts` exclude this folder so archived `@/components/...` cross-imports need not resolve for the app build or test runs.
