export { OrigamiNote, stateToFullProgress, type OrigamiFoldState, type OrigamiNoteProps } from "./OrigamiNote";
export { OrigamiNoteCrane, type OrigamiNoteCraneProps } from "./OrigamiNoteCrane";
export { OrigamiTrianglePanels, type OrigamiTrianglePanelsProps } from "./OrigamiTrianglePanels";
export {
  CRANE_CAMERA,
  CRANE_EXTRA_FOLDS,
  CRANE_ROTATION_POINTS,
  resolveCraneFoldProgress,
  resolveCraneFolds,
} from "./origamiCraneSequence";
export {
  CRANE_LANDMARK_TOLERANCE,
  CRANE_REFERENCE_LANDMARKS,
  computeCraneLandmarks,
  craneLandmarksToDataAttributes,
  verifyCraneOrientation,
  verifyCraneReferencePose,
  type CraneLandmarkId,
  type CranePoseVerification,
} from "./origamiCraneVerification";
export {
  ORIGAMI_MESH,
  findCenterHorizontalEdgeId,
  findCenterVerticalEdgeId,
  seedTriangleOnSide,
  trianglesInQuadrant,
  trianglesOnSideOfEdge,
  type MeshEdge,
  type MeshTriangle,
  type OrigamiMesh,
} from "./origamiMesh";
export {
  defaultFoldCamera,
  degToRad,
  edgeAxis3D,
  faceBrightness,
  pointsToClipPath,
  projectToNormalized,
  projectToScreen,
  ptToVec3,
  rotatePointAroundEdge,
  triangleNormal,
  type FoldCamera,
  type Vec3,
} from "./origamiFoldMath";
export {
  ROTATION_POINTS,
  maxFoldAngle,
  resolveFoldProgress,
  resolveGlobalFoldProgress,
  stateSegmentToRotationRange,
  type FoldInstruction,
  type ResolvedFold,
  type RotationPoint,
} from "./origamiFoldSequence";
export {
  edgeVertexPairsEqual,
  findVertexNear,
  solveOrigamiAtState,
  solveOrigamiMesh,
  verifyEdgeConnectivity,
  type FoldSolverResult,
  type TriangleProjection,
} from "./origamiFoldSolver";
export {
  CREASE_SEGMENTS,
  DISPLAY_CREASE_SEGMENTS,
  PATTERN_CENTER,
  PATTERN_ORIGIN,
  PATTERN_SIZE,
  PATTERN_TRIANGLES,
  TRIANGULATION_SEGMENTS,
  normalizePoint,
  pointsToClipPath as patternPointsToClipPath,
  pointsToPath,
  randomFaceColors,
  triangleArea,
  type Pt,
  type TriangleEdge,
  type TrianglePanel,
} from "./creasePattern";
