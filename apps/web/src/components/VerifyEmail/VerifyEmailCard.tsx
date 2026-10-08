import { useTranslations } from "next-intl";
import { Button, Card, Typography } from "@/components/StyledComponents";

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
  const t = useTranslations("VerifyEmail");

  if (state === "verifying") {
    return (
      <Card title={t("verifyingTitle")}>
        <Typography.Paragraph>{t("verifyingBody")}</Typography.Paragraph>
      </Card>
    );
  }

  if (state === "alreadyValidated") {
    return (
      <Card title={t("alreadyVerifiedTitle")}>
        <Typography.Paragraph>
          {t("alreadyVerifiedBody", { seconds: countdownSeconds })}
        </Typography.Paragraph>
      </Card>
    );
  }

  return (
    <Card title={resendDone ? t("resentTitle") : t("expiredTitle")}>
      {resendDone ? (
        <Typography.Paragraph>{t("resentBody")}</Typography.Paragraph>
      ) : (
        <>
          <Typography.Paragraph>{t("expiredBody")}</Typography.Paragraph>
          <Button type="link" onClick={onResend} disabled={resendPending}>
            {resendPending ? t("resending") : t("resend")}
          </Button>
        </>
      )}
    </Card>
  );
}
