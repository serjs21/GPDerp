export const CLAP_HOLD_MS = 1000;
export const CLAP_FADE_MS = 200;

/** Clap burst sits this far up/left of the toggle wrap's top-right corner. */
export const CLAP_BURST_OFFSET_PX = 16;

export const HAIKU_ACTIONS_TOGGLE_ICON_SRC = {
  open: "/lantern_actions/actions_open.svg",
  closed: "/lantern_actions/actions_closed.svg",
} as const;

export const HAIKU_ACTIONS_CLAP_SRC = "/lantern_actions/clap_sound.svg";

/** Panel slots in visual order; `slotClassKey` / hover keys are HaikuActions.module.css class names. */
export const HAIKU_ACTIONS = [
  {
    id: "delete",
    label: "deleteLabel",
    ariaLabel: "deleteAriaLabel",
    iconSrc: "/lantern_actions/delete.svg",
    slotClassKey: "slotDelete",
    enterFrom: "left",
  },
  {
    id: "share",
    label: "shareLabel",
    ariaLabel: "shareAriaLabel",
    iconSrc: "/lantern_actions/share.svg",
    slotClassKey: "slotShare",
    enterFrom: "left",
  },
  {
    id: "label",
    label: "labelLabel",
    ariaLabel: "labelAriaLabel",
    iconSrc: "/lantern_actions/label.svg",
    slotClassKey: "slotLabel",
    enterFrom: "right",
  },
  {
    id: "copy",
    label: "copyLabel",
    ariaLabel: "copyAriaLabel",
    iconSrc: "/lantern_actions/copy.svg",
    slotClassKey: "slotCopy",
    enterFrom: "right",
  },
] as const;

export const PANEL_HOVER_CLASS_KEYS = {
  delete: "panelHoverDelete",
  share: "panelHoverShare",
  label: "panelHoverLabel",
  copy: "panelHoverCopy",
} as const;
