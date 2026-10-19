import Fastify from "fastify";
import {
  buildEmailPreviews,
  emailPreviewDevPlugin,
  isEmailPreviewDevRouteEnabled,
  type EmailPreview,
} from "../emailPreviewDev.controller";

const EXPECTED_IDS = [
  "verifyEmail",
  "welcome",
  "passwordReset",
  "signupAttemptAlert",
  "emailChangeConfirm",
  "emailChangeOldAddressAlert",
  "shareHaikuPostcard",
  "shareHaikuText",
];

const cidRefs = (html: string) => [...html.matchAll(/src="cid:([^"]+)"/g)].map((match) => match[1]).sort();

describe("GET /dev/emails", () => {
  it("returns every system email built by its real template", async () => {
    const app = Fastify();
    await app.register(emailPreviewDevPlugin);

    const response = await app.inject({ method: "GET", url: "/dev/emails" });
    expect(response.statusCode).toBe(200);
    const { ok, data } = response.json() as { ok: boolean; data: EmailPreview[] };

    expect(ok).toBe(true);
    expect(data.map((email) => email.id)).toEqual(EXPECTED_IDS);
    for (const email of data) {
      expect(email.subject.trim()).not.toBe("");
      expect(email.html.trim()).not.toBe("");
      expect(email.text.trim()).not.toBe("");
    }
  });

  it("declares exactly the inline images each email references by cid", () => {
    for (const email of buildEmailPreviews()) {
      expect(email.inlineImages.map((image) => image.cid).sort()).toEqual(cidRefs(email.html));
    }
  });

  it("points the postcard back at the dev renderer with the sample message", () => {
    const postcard = buildEmailPreviews().find((email) => email.id === "shareHaikuPostcard")!;
    const back = postcard.inlineImages.find((image) => image.kind === "postcardBack");

    expect(back).toMatchObject({ path: expect.stringMatching(/^\/dev\/postcard_back\.png\?message=/) });
    expect(postcard.postcardHaiku?.title).toBe("Old pond");
    expect(postcard.replyTo).toBe("hiro@example.com");
  });

  it("is disabled in production", () => {
    expect(isEmailPreviewDevRouteEnabled({ NODE_ENV: "production" } as NodeJS.ProcessEnv)).toBe(false);
    expect(isEmailPreviewDevRouteEnabled({ NODE_ENV: "development" } as NodeJS.ProcessEnv)).toBe(true);
  });
});
