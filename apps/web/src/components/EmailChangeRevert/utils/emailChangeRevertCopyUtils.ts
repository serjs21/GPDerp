import type { ComicPagePanelProps } from "@/components/ComicPageLayout";
import type { EmailChangeRevertResultState } from "../EmailChangeRevertView.types";
import styles from "../EmailChangeRevertView.module.css";

/** `{email}` value for result copy; empty for states that are not about a restored address. */
export function resultEmail(state: EmailChangeRevertResultState): string {
  return "restoredEmail" in state ? state.restoredEmail : "";
}

/** The no-password finish uses its own copy when the old address could not be put back. */
export function resultBodyKey(state: EmailChangeRevertResultState, defaultKey: string): string {
  return state.kind === "revertedNoPassword" && state.emailTaken ? "emailTakenNoPasswordBody" : defaultKey;
}

/** Loading gets the speed-line background; success panels sit in a row beside the card instead of stacking. */
export function resultPanelView(
  state: EmailChangeRevertResultState,
  success: boolean,
): Pick<ComicPagePanelProps, "background" | "loading" | "className"> {
  const loading = state.kind === "loading";
  return {
    background: loading ? "motion" : "solid",
    loading,
    className: success ? undefined : styles.stackPanel,
  };
}

export function resultActionLabelKey(action: "signIn" | "home"): string {
  return action === "signIn" ? "signInCta" : "homeCta";
}
