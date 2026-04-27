# Idea Version Patches

This folder stores restorable patch snapshots for each idea iteration.

## Naming convention

- `<sequence>-<slug>-<timestamp>.patch`
- Example: `001-yinyang-baseline-20260426-225048.patch`

## Workflow

1. Implement one idea step.
2. Export patch from current working tree:
   - `git diff > ideas-versions/<name>.patch`
3. Start the next idea step.

## Restore workflow

- Preview:
  - `git apply --check ideas-versions/<name>.patch`
- Apply:
  - `git apply ideas-versions/<name>.patch`

