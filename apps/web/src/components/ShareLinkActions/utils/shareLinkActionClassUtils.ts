import styles from "../ShareLinkActions.module.css";

export function shareLinkActionPanelClassName({
  pressed,
  inverted,
  invertCaptionOnHover,
  disabled,
  className,
}: {
  pressed: boolean;
  inverted: boolean;
  invertCaptionOnHover: boolean;
  disabled: boolean;
  className?: string;
}): string {
  return [
    styles.action,
    pressed ? "" : styles.unpressed,
    inverted ? styles.inverted : "",
    invertCaptionOnHover ? styles.invertOnHover : "",
    disabled ? styles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
