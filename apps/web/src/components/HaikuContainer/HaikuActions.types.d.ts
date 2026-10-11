import type { FocusEvent, ReactNode, RefObject } from "react";
import type { HaikuDto } from "@/api/haikus";

export type HoverTarget = "delete" | "share" | "label" | "copy" | null;

export type HaikuActionId = NonNullable<HoverTarget>;

export type HaikuActionsProps =
  | { variant: "generating" }
  | {
      variant: "saved";
      haiku: HaikuDto;
      onDeleted?: () => void;
      onChanged?: () => void;
      /** When set, confirm delegates delete to this handler (animation + API orchestration). */
      onDelete?: () => Promise<void>;
      /** Force hover state (Storybook / tests). */
      forcedHover?: HoverTarget;
      /** Force open state (Storybook / tests). */
      forcedOpen?: boolean;
    };

export type SavedHaikuActionsProps = Extract<HaikuActionsProps, { variant: "saved" }>;

export type HaikuActionSlotFaceProps = {
  hidden?: boolean;
  enterFrom?: "left" | "right";
  children: ReactNode;
};

export type HaikuActionButtonsProps = {
  activeHover: HoverTarget;
  onHover: (id: HaikuActionId) => void;
  onFocusHover: (id: HaikuActionId, target: HTMLElement) => void;
  onBlur: (event: FocusEvent<HTMLButtonElement>) => void;
  onAction: (id: HaikuActionId) => void;
};

export type HaikuActionsPanelProps = {
  open: boolean;
  onMouseLeave: () => void;
  children: ReactNode;
};

export type HaikuActionsToggleProps = {
  wrapRef: RefObject<HTMLSpanElement | null>;
  isOpen: boolean;
  onToggle: () => void;
};

export type ClapBurstPosition = { top: number; left: number };

export type HaikuClapBurstProps = {
  position: ClapBurstPosition | null;
  fading: boolean;
};
