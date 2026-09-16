# OrigamiNote approach

## Abandoned (do not revisit)

The following was implemented and **abandoned** because it could not reliably match reference fold poses:

- CSS 3D nested hinge trees (`panelTreeData`, `OrigamiPanelTree`)
- Nine-step fold sequence (`step` / `progress`, `origamiFoldAngles`, `origamiFoldMapping`)
- Named collapse presets (`origamiFoldPresets`, quadrant panel tree)
- Heuristic per-quadrant `rotate3d` boosts (`origamiPanelState`)

**Do not reintroduce** those modules or patterns.

## Current direction

- Flat square with bird-base **crease splits** (`CREASE_SEGMENTS`), fan-triangulated to 36 triangles.
- **Vertex-based 3D hinge solver** (`origamiMesh`, `origamiFoldMath`, `origamiFoldSequence`, `origamiFoldSolver`):
  - Positions indexed by shared vertex id — connection points stay coincident.
  - Each fold rotates the moving subgraph around a crease edge axis (`Vec3` Rodrigues rotation).
  - Clip paths rebuilt from projected 3D vertex positions each frame.
- **Three poses**: `flat` → `collapsed` (four-point star) → `birdPartial` (asymmetric quadrant folds).
- **Rotation points** (RP0–RP3): animation can change hinge direction between segments.

This is **not** the old nested DOM hinge tree; it is a kinematic solver with div clip-path rendering.
