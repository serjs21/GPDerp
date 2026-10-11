import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { CreationModalProps } from "./CreationModal";

export type CreationLanternProps = Pick<
  CreationModalProps,
  "onHaikuDeleteFailed" | "onHaikuChanged"
> & {
  activeHaiku: HaikuDto | null;
  generatingDraft?: GeneratingDraft | null;
  isGenerating: boolean;
  showLanternActions: boolean;
  ariaLabel: string;
  /** Deleted haiku starts its exit flight (the modal keeps it mounted). */
  onDeleted: (haiku: HaikuDto) => void;
  onExitComplete: () => void;
};
