import fp from "fastify-plugin";
import rawBody from "fastify-raw-body";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { PADDLE_IPS_URL } from "../../consts/paddle";
import { env } from "../../env";
import { GENERATION_CREDITS_SOCKET_KIND } from "./constants";
import { createPaddleIpAllowlist } from "./paddleIpAllowlist";
import { verifyPaddleWebhook } from "./paddleWebhook";
import { paymentsService } from "./payments.service";
import { confirmPurchaseBody } from "./utils/purchaseResponses";
const toRawBodyString = (rawBody: string | Buffer | undefined): string | null => {
  if (typeof rawBody === "string" && rawBody.length > 0) return rawBody;
  if (Buffer.isBuffer(rawBody) && rawBody.length > 0) return rawBody.toString("utf8");
  return null;
};

const paymentsPluginImpl = async (app: FastifyInstance) => {
  await app.register(rawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
  });

  app.post(
    "/payments/purchase",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const purchase = await paymentsService.createPendingPurchaseForUser(userId);
      return res.send({ ok: true, data: { purchaseId: purchase.id } });
    },
  );

  app.post(
    "/payments/checkout",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const checkout = await paymentsService.createCheckout(userId);
      return res.send({ ok: true, data: checkout });
    },
  );

  app.post(
    "/payments/confirm",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const body = (req.body as { transactionId?: string } | undefined) ?? {};
      const transactionId = typeof body.transactionId === "string" ? body.transactionId : "";
      const result = await paymentsService.confirmCompletedCheckout(userId, transactionId);
      if (!result.ok) {
        const status =
          result.reason === "not_found" || result.reason === "invalid_transaction" ? 404 : 400;
        return res.code(status).send({ ok: false, error: result.reason });
      }
      app.broadcastToUser(userId, {
        kind: GENERATION_CREDITS_SOCKET_KIND,
        data: { credits: result.credits },
      });
      const message = await paymentsService.confirmationMessageFor(result.purchaseId, (error) =>
        req.log.warn({ err: error, purchaseId: result.purchaseId }, "Purchase confirmation generation failed"),
      );
      return res.send(confirmPurchaseBody({ credits: result.credits, status: result.status, message }));
    },
  );

  app.get(
    "/payments/credits",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const result = await paymentsService.getCredits(userId);
      if (!result.ok) return res.code(404).send({ ok: false, error: "User not found" });
      return res.send({ ok: true, data: { credits: result.credits } });
    },
  );

  const ipAllowlist = env.PADDLE_WEBHOOK_IP_ALLOWLIST
    ? createPaddleIpAllowlist({
        url: env.PADDLE_ENV === "production" ? PADDLE_IPS_URL.production : PADDLE_IPS_URL.sandbox,
        onLoaded: (count) => app.log.info({ count, env: env.PADDLE_ENV }, "paddle webhook IP allowlist loaded"),
        onError: (err) => app.log.warn({ err }, "paddle webhook IP allowlist refresh failed"),
      })
    : null;
  ipAllowlist?.start();
  app.addHook("onClose", async () => ipAllowlist?.stop());

  app.post(
    "/webhooks/paddle",
    { config: { rawBody: true } },
    async (req: FastifyRequest, res: FastifyReply) => {
      // Defense in depth before the signature check: only Paddle's published source IPs may deliver.
      const source = ipAllowlist?.check(req.ip) ?? "allowed";
      if (source === "unavailable") {
        req.log.warn("paddle webhook rejected: IP allowlist not loaded yet");
        return res.code(503).send({ ok: false, error: "Temporarily unavailable" });
      }
      if (source === "denied") {
        req.log.warn({ sourceIp: req.ip }, "paddle webhook rejected: source IP not in Paddle's list");
        return res.code(403).send({ ok: false, error: "Forbidden" });
      }

      const signatureHeader = req.headers["paddle-signature"];
      const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
      const raw = toRawBodyString(req.rawBody);
      if (!signature || !raw) {
        return res.code(400).send({ ok: false, error: "Invalid webhook" });
      }

      try {
        const event = await verifyPaddleWebhook(raw, signature);
        const result = await paymentsService.handleVerifiedEvent(event);
        if (result.status === "granted" && "userId" in result && "credits" in result) {
          app.broadcastToUser(result.userId, {
            kind: GENERATION_CREDITS_SOCKET_KIND,
            data: { credits: result.credits },
          });
        }
        return res.send({ ok: true });
      } catch (error) {
        req.log.warn({ err: error }, "paddle webhook rejected");
        return res.code(400).send({ ok: false, error: "Invalid webhook" });
      }
    },
  );
};

export const paymentsPlugin = fp(paymentsPluginImpl, { name: "payments-routes" });
