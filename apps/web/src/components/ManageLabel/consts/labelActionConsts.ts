import styles from "../LabelActions.module.css";

export const EDIT_SRC = "/profile/label_actions/edit.svg";
export const DELETE_SRC = "/profile/label_actions/delete.svg";
export const DELETE_HOVER = "var(--accent-red, #aa1f3f)";
export const TUNE_IN_HOVER = "#738aff";

export const TUNE_IN_DISABLED_CALLOUT_POSITION = {
  left: "-8.5rem",
  bottom: "0rem",
} as const;

/** Tune-in action appearance with and without connected haikus (disabled variant fills with sky). */
export const TUNE_IN_VARIANTS = {
  connected: {
    src: "/profile/label_actions/tune_in.svg",
    captionKey: "tuneIn",
    ariaKey: "tuneInAriaLabel",
    layout: "iconEnd",
    color: "#9fa1ff",
    background: "solid",
    captionClassName: styles.captionTuneIn,
    iconClassName: styles.iconTuneIn,
  },
  notConnected: {
    src: "/profile/label_actions/not_connected_action.svg",
    captionKey: null,
    ariaKey: "noHaikusAriaLabel",
    layout: "iconFill",
    color: "sky",
    background: "sunburst",
    captionClassName: undefined,
    iconClassName: styles.iconNotConnected,
  },
} as const;
