# Animation Theory Packages (Generic Guidance)

## Context

This note captures approved, reusable guidance for **suggested/prototype animation work**.

## Approved package directions

- **Anime.js** is a strong option for expressive timeline-driven 2D text/icon transitions.
- **React Three Fiber** (+ `three`, and optionally `@react-three/drei`) is a strong option for advanced 3D/shader-based animation concepts.

## Label

- Use this guidance under the generic label: **animation theory**.

## Usage boundaries

- Prefer existing stack first (`motion`) for low-complexity UI interactions.
- Use Anime.js when timeline/stagger orchestration becomes awkward in Motion.
- Use React Three Fiber only when the concept explicitly benefits from 3D/shader effects (higher complexity and performance review needed).
- Keep these additions scoped to suggested/prototype components unless explicitly requested for production components.

## Dependency policy for suggested components

- It is allowed to research the web and install new **safe, free-to-use** packages as **devDependencies** for suggested/prototype components when they materially improve animation quality.
- Verify license and maintenance status before adding.
- Favor minimal additions and document why each package is needed.
