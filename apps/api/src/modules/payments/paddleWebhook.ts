import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { env } from "../../env";

let paddle: Paddle | null = null;

const getPaddle = () => {
  if (!paddle) {
    paddle = new Paddle(env.PADDLE_API_KEY, {
      environment: env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
    });
  }
  return paddle;
};

export const verifyPaddleWebhook = (rawBody: string, signature: string) =>
  getPaddle().webhooks.unmarshal(rawBody, env.PADDLE_WEBHOOK_SECRET, signature);
