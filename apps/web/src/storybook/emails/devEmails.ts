/** Proxied to the API by `.storybook/main.ts` (`STORYBOOK_API_URL`, default http://localhost:4000). */
export const DEV_API_PREFIX = "/dev-api";
export const DEV_EMAILS_URL = `${DEV_API_PREFIX}/dev/emails`;

/** Mirrors `EmailPreviewInlineImage` in apps/api/src/modules/email/emailPreviewDev.controller.ts. */
export type DevEmailInlineImage =
  | { cid: string; kind: "postcardBack"; path: string }
  | { cid: string; kind: "postcardFront" };

/** Mirrors `EmailPreview` in apps/api/src/modules/email/emailPreviewDev.controller.ts. */
export type DevEmail = {
  id: string;
  label: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  inlineImages: DevEmailInlineImage[];
  postcardHaiku?: { title: string; body: string };
};

export type DevEmails = { ok: true; emails: DevEmail[] } | { ok: false; error: string };

/** Storybook loader: every system email, rendered by the API's real templates. */
export async function loadDevEmails(): Promise<DevEmails> {
  try {
    const res = await fetch(DEV_EMAILS_URL);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const { data } = (await res.json()) as { ok: true; data: DevEmail[] };
    return { ok: true, emails: data };
  } catch (error) {
    return {
      ok: false,
      error: `Could not load ${DEV_EMAILS_URL} (is the API running?): ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
