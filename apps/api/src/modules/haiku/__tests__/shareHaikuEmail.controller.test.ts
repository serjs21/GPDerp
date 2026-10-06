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

/** Signature + IHDR chunk header with the given size (enough for the size check). */
const fakePng = (width = 2400, height = 1600) => {
  const ihdr = Buffer.alloc(16);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write("IHDR", 4, "ascii");
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  return Buffer.concat([PNG_SIGNATURE, ihdr, Buffer.from("rest")]);
};

/** SOI + APP0 segment + SOF0 header with the given size (enough for the size check). */
const fakeJpeg = (width = 2400, height = 1600) => {
  const app0 = Buffer.from([0xff, 0xe0, 0x00, 0x04, 0x00, 0x00]);
  const sof0 = Buffer.alloc(11);
  sof0.writeUInt16BE(0xffc0, 0);
  sof0.writeUInt16BE(11, 2);
  sof0.writeUInt8(8, 4);
  sof0.writeUInt16BE(height, 5);
  sof0.writeUInt16BE(width, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof0, Buffer.from("rest")]);
};

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

const frontPart = (content: Buffer = fakePng()): Part => ({
  name: "postcardFront",
  filename: "postcard-front.png",
  contentType: "image/png",
  content,
});

const fields = (emails: string[] = ["friend@example.com"]): Part[] => [
  { name: "haikuId", value: HAIKU_ID },
  { name: "emails", value: JSON.stringify(emails) },
  { name: "message", value: "Wish you were here" },
];

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
    haikuService.shareHaikuByEmailForUser.mockResolvedValue({ ok: true, sentCount: 1, queuedCount: 0 });
  });

  it("sends from a JSON body without a front", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/share_haiku_email",
      payload: { haikuId: HAIKU_ID, emails: ["friend@example.com"], message: " hi " },
    });
    await app.close();

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, data: { sentCount: 1, queuedCount: 0 } });
    expect(haikuService.shareHaikuByEmailForUser).toHaveBeenCalledWith({
      userId: "user-1",
      haikuId: HAIKU_ID,
      recipients: ["friend@example.com"],
      personalMessage: "hi",
      front: undefined,
    });
  });

  it("passes the front PNG from multipart form data", async () => {
    haikuService.shareHaikuByEmailForUser.mockResolvedValue({ ok: true, sentCount: 1, queuedCount: 1 });
    const res = await postMultipart([...fields(["a@example.com", "b@example.com"]), frontPart()]);

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, data: { sentCount: 1, queuedCount: 1 } });
    const call = haikuService.shareHaikuByEmailForUser.mock.calls[0][0];
    expect(call.recipients).toEqual(["a@example.com", "b@example.com"]);
    expect(call.personalMessage).toBe("Wish you were here");
    expect(call.front.equals(fakePng())).toBe(true);
  });

  it("passes a JPEG front from multipart form data", async () => {
    const res = await postMultipart([
      ...fields(),
      { name: "postcardFront", filename: "postcard-front.jpg", contentType: "image/jpeg", content: fakeJpeg() },
    ]);

    expect(res.statusCode).toBe(200);
    expect(haikuService.shareHaikuByEmailForUser.mock.calls[0][0].front.equals(fakeJpeg())).toBe(true);
  });

  it("rejects a JPEG front with the wrong dimensions", async () => {
    const res = await postMultipart([
      ...fields(),
      { name: "postcardFront", filename: "postcard-front.jpg", contentType: "image/jpeg", content: fakeJpeg(1200, 800) },
    ]);

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("Postcard front must be 2400x1600 (got 1200x800)");
  });

  it("rejects postcard back parts", async () => {
    const res = await postMultipart([
      ...fields(),
      frontPart(),
      { name: "postcardBack", filename: "postcard-back.png", contentType: "image/png", content: fakePng() },
    ]);

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toMatch(/rendered by the server/);
    expect(haikuService.shareHaikuByEmailForUser).not.toHaveBeenCalled();
  });

  it("rejects a front that is not a JPEG or PNG", async () => {
    const res = await postMultipart([...fields(), frontPart(Buffer.from("not really a png"))]);

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ ok: false, error: "Postcard front must be a JPEG or PNG" });
  });

  it("rejects a front with the wrong dimensions", async () => {
    const res = await postMultipart([...fields(), frontPart(fakePng(1200, 800))]);

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("Postcard front must be 2400x1600 (got 1200x800)");
    expect(haikuService.shareHaikuByEmailForUser).not.toHaveBeenCalled();
  });

  it("rejects messages longer than the postcard character limit", async () => {
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

  it.each([
    ["message_too_long", 400, "The message does not fit on the postcard"],
    ["send_failed", 502, "Could not send the postcard email"],
    ["enqueue_failed", 500, "Could not queue the postcards"],
  ])("maps service failure %s to %i", async (reason, status, error) => {
    haikuService.shareHaikuByEmailForUser.mockResolvedValue({ ok: false, reason });
    const res = await postMultipart([...fields(), frontPart()]);

    expect(res.statusCode).toBe(status);
    expect(res.json()).toEqual({ ok: false, error });
  });
});
