import toolStyles from "../HeaderHaikuTools.module.css";
import styles from "../HeaderToolButton.module.css";
import type { HeaderSearchView } from "./headerSearchSourceUtils";

const joinClassNames = (...names: (string | null | undefined)[]) => names.filter(Boolean).join(" ");

/** Anchor and panel classes for the header search button; only the main-page search shrinks with the tools. */
export function headerSearchButtonClassNames(view: HeaderSearchView, className: string | undefined) {
  return {
    anchor: joinClassNames(styles.anchor, view.isSettings ? null : toolStyles.shrinkTool, className),
    panel: joinClassNames(styles.panelSearch, view.labelsTab ? styles.panelSearchLabels : null),
  };
}
