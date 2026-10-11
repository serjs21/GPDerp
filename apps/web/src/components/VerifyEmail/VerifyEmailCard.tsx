import { useTranslations } from "next-intl";
import { Card, Typography } from "@/components/StyledComponents";
import type { VerifyEmailCardProps } from "./VerifyEmailCard.types";
import { VerifyEmailExpiredCard } from "./VerifyEmailExpiredCard";

export type { VerifyEmailUiState } from "./VerifyEmailCard.types";

export function VerifyEmailCard({
  state,
  countdownSeconds = 5,
  resendPending,
  resendDone,
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
        <Typography.Paragraph>{t("alreadyVerifiedBody", { seconds: countdownSeconds })}</Typography.Paragraph>
      </Card>
    );
  }

  return <VerifyEmailExpiredCard resendPending={resendPending} resendDone={resendDone} onResend={onResend} />;
}
