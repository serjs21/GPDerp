import { paddleClientEnvironment, readPaddleClientEnv } from "./paddleClientEnv";

describe("readPaddleClientEnv", () => {
  const originalToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const originalEnv = process.env.NEXT_PUBLIC_PADDLE_ENV;
  const originalPriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_100_HAIKUS;

  afterEach(() => {
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN = originalToken;
    process.env.NEXT_PUBLIC_PADDLE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_100_HAIKUS = originalPriceId;
  });

  it("is sandbox and unconfigured when public env is missing", () => {
    delete process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    delete process.env.NEXT_PUBLIC_PADDLE_ENV;
    delete process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_100_HAIKUS;

    expect(paddleClientEnvironment()).toBe("sandbox");
    expect(readPaddleClientEnv()).toEqual({
      token: null,
      environment: "sandbox",
      priceId: null,
      configured: false,
    });
  });

  it("uses production when NEXT_PUBLIC_PADDLE_ENV is production", () => {
    process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN = " tok ";
    process.env.NEXT_PUBLIC_PADDLE_ENV = "production";
    process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_100_HAIKUS = " pri_100 ";

    expect(readPaddleClientEnv()).toEqual({
      token: "tok",
      environment: "production",
      priceId: "pri_100",
      configured: true,
    });
  });
});
