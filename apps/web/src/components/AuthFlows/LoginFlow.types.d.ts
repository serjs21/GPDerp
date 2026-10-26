import type { AuthCredentials } from "@/hooks/useAuthCredentials";

export type AuthFlowHandle = {
  submit: () => void;
};

export type LoginFlowProps = {
  onSuccess: () => void;
  showGoogle?: boolean;
  onGoogleSignupRequired?: () => void;
  /** Hide in-flow CTA (parent provides ComicPageDialog ctaFooter). */
  hideCta?: boolean;
  onSubmittingChange?: (submitting: boolean) => void;
  /** Shared email/password (e.g. the auth modal's Login and Register tabs); omitted = the flow keeps its own. */
  credentials?: AuthCredentials;
};
