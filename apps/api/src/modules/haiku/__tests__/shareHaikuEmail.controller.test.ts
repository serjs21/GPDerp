import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
import multipart from "@fastify/multipart";
import { haikuPlugin } from "../haiku.controller";
import { PNG_SIGNATURE, POSTCARD_MESSAGE_MAX_CHARS } from "../../../consts/postcard";

jest.mock("../../auth/repository", () => ({
  authRepository: { findAccountIdForUser: jest.fn() },
}));

jest.mock("../../payments/payments.service", () => ({
  paymentsService: { getCredits: jest.fn(), countCompletedPurchases: jest.fn() },
}));

jest.mock("../haiku.service", () => ({
  haikuService: { shareHaikuByEmailForUser: jest.fn() },
}));

const { haikuService } = jest.requireMock("../haiku.service") as {
  haikuService: { shareHaikuByEmailForUser: jest.Mock };
};

const HAIKU_ID = "11111111-1111-4111-8111-111111111111";
const BOUNDARY = "----postcard-test-boundary";
const fakePng = (marker: string) => Buffer.concat([PNG_SIGNATURE, Buffer.from(marker)]);

type Part =
  | { name: string; value: string }
  | { name: string; filename: string; contentType: string; content: Buffer };

const multipartBody = (parts: Part[]): Buffer => {
  const chunks: Buffer[] = [];
  for (const part of parts) {
    chunks.push(Buffer.from(`--${BOUNDARY}\r\n`));
    if ("value" in part) {
      chunks.push(Buffer.from(`Content-Disposition: form-data; name="${part.name}"\r\n\r\n${part.value}\r\n`));
    } else {
      chunks.push(
        Buffer.from(
          `Content-Disposition: form-data; name="${part.name}"; filename="${part.filename}"\r\nContent-Type: ${part.contentType}\r\n\r\n`,
        ),
        part.content,
        Buffer.from("\r\n"),
      );
    }
  }
  chunks.push(Buffer.from(`--${BOUNDARY}--\r\n`));
  return Buffer.concat(chunks);
};

const postcardParts = (overrides: Partial<Record<"front" | "back", Part | null>> = {}): Part[] => {
  const front: Part | null =
    overrides.front === undefined
      ? { name: "postcardFront", filename: "postcard-front.png", contentType: "image/png", content: fakePng("front") }
      : overrides.front;
  const back: Part | null =
    overrides.back === undefined
      ? { name: "postcardBack", filename: "postcard-back.png", contentType: "image/png", content: fakePng("back") }
      : overrides.back;
  return [
    { name: "haikuId", value: HAIKU_ID },
    { name: "emails", value: JSON.stringify(["friend@example.com"]) },
    { name: "message", value: "Wish you were here" },
    ...(front ? [front] : []),
    ...(back ? [back] : []),
  ];
};

describe("haiku.controller POST /share_haiku_email", () => {
  const buildApp = async () => {
    const app = Fastify();
    await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
    app.decorate("requireAuthenticated", async (request: FastifyRequest) => {
      request.user = { sub: "user-1", sid: "sid-1" };
    });
    app.decorate("sendToUid", jest.fn());
    app.decorate("broadcastToUser", jest.fn());
    await app.register(haikuPlugin);
    return app;
  };

  const postMultipart = async (parts: Part[]) => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/share_haiku_email",
      headers: { "content-type": `multipart/form-data; boundary=${BOUNDARY}` },
      payload: multipartBody(parts),
    });
    await app.close();
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    haikuService.shareHaikuByEmailForUser.mockResolvedValue({ ok: true, sentCount: 1 });
  });

  it("keeps the JSON body path without postcard images", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/share_haiku_email",
      payload: { haikuId: HAIKU_ID, emails: ["friend@example.com"], message: " hi " },
    });
    await app.close();

    expect(res.statusCode).toBe(200);
    expect(haikuService.shareHaikuByEmailForUser).toHaveBeenCalledWith({
      userId: "user-1",
      haikuId: HAIKU_ID,
      recipients: ["friend@example.com"],
      personalMessage: "hi",
      postcard: undefined,
    });
  });

  it("passes both postcard PNGs from multipart form data", async () => {
    const res = await postMultipart(postcardParts());

    expect(res.statusCode).toBe(200);
    const call = haikuService.shareHaikuByEmailForUser.mock.calls[0][0];
    expect(call.recipients).toEqual(["friend@example.com"]);
    expect(call.personalMessage).toBe("Wish you were here");
    expect(call.postcard.front.equals(fakePng("front"))).toBe(true);
    expect(call.postcard.backs.get("friend@example.com").equals(fakePng("back"))).toBe(true);
  });

  it("pairs one postcard back per recipient in emails order", async () => {
    const backPart = (marker: string): Part => ({
      name: "postcardBack",
      filename: `postcard-back-${marker}.png`,
      contentType: "image/png",
      content: fakePng(marker),
    });
    const parts = postcardParts({ back: null })
      .map((part) =>
        part.name === "emails" ? { name: "emails", value: JSON.stringify(["A@example.com", "b@example.com"]) } : part,
      )
      .concat([backPart("back-a"), backPart("back-b")]);

    const res = await postMultipart(parts);

    expect(res.statusCode).toBe(200);
    const { backs } = haikuService.shareHaikuByEmailForUser.mock.calls[0][0].postcard;
    expect(backs.size).toBe(2);
    expect(backs.get("a@example.com").equals(fakePng("back-a"))).toBe(true);
    expect(backs.get("b@example.com").equals(fakePng("back-b"))).toBe(true);
  });

  it("rejects multipart requests whose back count does not match the recipients", async () => {
    const parts = postcardParts().map((part) =>
      part.name === "emails" ? { name: "emails", value: JSON.stringify(["a@example.com", "b@example.com"]) } : part,
    );

    const res = await postMultipart(parts);

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ ok: false, error: "Each recipient needs exactly one postcard back image" });
    expect(haikuService.shareHaikuByEmailForUser).not.toHaveBeenCalled();
  });

  it("rejects multipart requests missing a postcard side", async () => {
    const res = await postMultipart(postcardParts({ back: null }));

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ ok: false, error: "Both postcard images are required" });
    expect(haikuService.shareHaikuByEmailForUser).not.toHaveBeenCalled();
  });

  it("rejects files that are not PNG", async () => {
    const res = await postMultipart(
      postcardParts({
        front: {
          name: "postcardFront",
          filename: "postcard-front.png",
          contentType: "image/png",
          content: Buffer.from("not really a png"),
        },
      }),
    );

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ ok: false, error: "Postcard images must be PNG" });
  });

  it("rejects messages longer than the postcard limit", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/share_haiku_email",
      payload: {
        haikuId: HAIKU_ID,
        emails: ["friend@example.com"],
        message: "x".repeat(POSTCARD_MESSAGE_MAX_CHARS + 1),
      },
    });
    await app.close();

    expect(res.statusCode).toBe(400);
    expect(haikuService.shareHaikuByEmailForUser).not.toHaveBeenCalled();
  });
});
