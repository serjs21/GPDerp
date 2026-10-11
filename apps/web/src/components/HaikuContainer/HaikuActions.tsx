"use client";

import { HaikuActionsGenerating } from "./HaikuActionsGenerating";
import type { HaikuActionsProps } from "./HaikuActions.types";
import { SavedHaikuActions } from "./SavedHaikuActions";

export type { HaikuActionsProps } from "./HaikuActions.types";

export const HaikuActions = (props: HaikuActionsProps) => {
  if (props.variant === "generating") return <HaikuActionsGenerating />;
  return <SavedHaikuActions {...props} />;
};
