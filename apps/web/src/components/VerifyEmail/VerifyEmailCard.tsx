import { Button, Card, Typography } from "antd";

export type VerifyEmailUiState = "verifying" | "alreadyValidated" | "tokenExpired";

type VerifyEmailCardProps = {
  state: VerifyEmailUiState;
  countdownSeconds?: number;
  resendPending?: boolean;
  resendDone?: boolean;
  onResend?: () => void;
};

export function VerifyEmailCard({
  state,
  countdownSeconds = 5,
  resendPending = false,
  resendDone = false,
  onResend,
}: VerifyEmailCardProps) {
  if (state === "verifying") {
    return (
      <Card title="Verifying your email">
        <Typography.Paragraph>Please wait while we validate your link.</Typography.Paragraph>
      </Card>
    );
  }

  if (state === "alreadyValidated") {
    return (
      <Card title="Email already verified">
        <Typography.Paragraph>
          Your email is already validated. Redirecting to the home page in {countdownSeconds} seconds.
        </Typography.Paragraph>
      </Card>
    );
  }

  return (
    <Card title={resendDone ? "Verification email sent" : "Verification link expired"}>
      {resendDone ? (
        <Typography.Paragraph>
          We sent a new verification email. Please check your inbox and use the latest link.
        </Typography.Paragraph>
      ) : (
        <>
          <Typography.Paragraph>This verification link has expired.</Typography.Paragraph>
          <Button type="link" onClick={onResend} disabled={resendPending}>
            {resendPending ? "Sending..." : "Resend verification email"}
          </Button>
        </>
      )}
    </Card>
  );
}
