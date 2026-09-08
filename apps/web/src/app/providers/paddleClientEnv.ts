export type PaddleClientEnvironment = "sandbox" | "production";

export type PaddleClientEnv = {
  token: string | null;
  environment: PaddleClientEnvironment;
  priceId: string | null;
  configured: boolean;
};

const readOptional = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const paddleClientEnvironment = (): PaddleClientEnvironment =>
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";

export const readPaddleClientEnv = (): PaddleClientEnv => {
  const token = readOptional(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
  const priceId = readOptional(process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_100_HAIKUS);
  return {
    token,
    environment: paddleClientEnvironment(),
    priceId,
    configured: Boolean(token && priceId),
  };
};
