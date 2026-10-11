import { useTranslations } from "next-intl";
import { Button, Card, Typography } from "@/components/StyledComponents";
import { withDefaults } from "@/utils/props/withDefaults";
import type { VerifyEmailExpiredCardProps } from "./VerifyEmailCard.types";

const EXPIRED_CARD_DEFAULTS = { resendPending: false, resendDone: false };

/** Expired verification link: offer a resend, then confirm it was sent. */
export function VerifyEmailExpiredCard(props: VerifyEmailExpiredCardProps) {
  const { resendPending, resendDone } = withDefaults(props, EXPIRED_CARD_DEFAULTS);
  const t = useTranslations("VerifyEmail");

  return (
    <Card title={resendDone ? t("resentTitle") : t("expiredTitle")}>
      {resendDone ? (
        <Typography.Paragraph>{t("resentBody")}</Typography.Paragraph>
      ) : (
        <>
          <Typography.Paragraph>{t("expiredBody")}</Typography.Paragraph>
          <Button type="link" onClick={props.onResend} disabled={resendPending}>
            {resendPending ? t("resending") : t("resend")}
          </Button>
        </>
      )}
    </Card>
  );
}
