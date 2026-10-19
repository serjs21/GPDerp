"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import { generatePostcardImage } from "@/components/Postcard/generatePostcardImage";
import { useOptionalPostcardTheme } from "@/hooks/usePostcardTheme";
import type { DevEmail } from "./devEmails";

const toPostcardHaiku = ({ title, body }: NonNullable<DevEmail["postcardHaiku"]>): HaikuDto => ({
  id: "storybook-email-postcard",
  title,
  titleSuffix: 0,
  body,
  createdAt: "2026-10-20T06:41:00.000Z",
  accountId: "",
  createdById: "",
  labels: [],
});

/**
 * Object URL of the postcard front rendered by the same `generatePostcardImage` the share modal uses,
 * or null while rendering / when the email has no postcard. Needs CelestialThemeProvider for the theme.
 */
export function usePostcardFrontUrl(postcardHaiku: DevEmail["postcardHaiku"]): string | null {
  const tPostcard = useTranslations("Postcard.renderer");
  const theme = useOptionalPostcardTheme();
  const [url, setUrl] = useState<string | null>(null);
  const title = postcardHaiku?.title;
  const body = postcardHaiku?.body;

  useEffect(() => {
    if (!theme || title === undefined || body === undefined) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    // generatePostcardImage mounts its own root with flushSync, which React rejects inside an effect.
    const timer = window.setTimeout(() => {
      void generatePostcardImage({
        theme,
        haiku: toPostcardHaiku({ title, body }),
        getAriaLabel: (haikuTitle) =>
          haikuTitle ? tPostcard("ariaLabelWithTitle", { title: haikuTitle }) : tPostcard("ariaLabel"),
      })
        .then((blob) => {
          if (cancelled) return;
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        })
        .catch((error) => console.error("[email story] postcard front failed", error));
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [theme, title, body, tPostcard]);

  return url;
}
