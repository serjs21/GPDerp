import type { SavedHaikusPathPhase } from "./utils/savedHaikusPathUtils";

export type SavedHaikusPathStatusProps = {
  phase: Extract<SavedHaikusPathPhase, "loading" | "error" | "searching">;
  onRetry: () => void;
};
