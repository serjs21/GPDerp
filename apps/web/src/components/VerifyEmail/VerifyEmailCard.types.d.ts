export type VerifyEmailUiState = "verifying" | "alreadyValidated" | "tokenExpired";

export type VerifyEmailCardProps = {
  state: VerifyEmailUiState;
  countdownSeconds?: number;
  resendPending?: boolean;
  resendDone?: boolean;
  onResend?: () => void;
};

export type VerifyEmailExpiredCardProps = Pick<VerifyEmailCardProps, "resendPending" | "resendDone" | "onResend">;
