import { paddleClientEnvironment, readPaddleClientEnv } from "./paddleClientEnv";

describe("readPaddleClientEnv", () => {
  const originalToken = process.env.PADDLE_CLIENT_TOKEN;
  const originalEnv = process.env.PADDLE_ENV;
  const originalPriceId = process.env.PADDLE_PRICE_ID_100_HAIKUS;

  afterEach(() => {
    if (originalToken === undefined) delete process.env.PADDLE_CLIENT_TOKEN;
    else process.env.PADDLE_CLIENT_TOKEN = originalToken;

    if (originalEnv === undefined) delete process.env.PADDLE_ENV;
    else process.env.PADDLE_ENV = originalEnv;

    if (originalPriceId === undefined) delete process.env.PADDLE_PRICE_ID_100_HAIKUS;
    else process.env.PADDLE_PRICE_ID_100_HAIKUS = originalPriceId;
  });

  it("is sandbox and unconfigured when paddle client env is missing", () => {
    delete process.env.PADDLE_CLIENT_TOKEN;
    delete process.env.PADDLE_ENV;
    delete process.env.PADDLE_PRICE_ID_100_HAIKUS;

    expect(paddleClientEnvironment()).toBe("sandbox");
    expect(readPaddleClientEnv()).toEqual({
      token: null,
      environment: "sandbox",
      priceId: null,
      configured: false,
    });
  });

  it("uses production when PADDLE_ENV is production", () => {
    process.env.PADDLE_CLIENT_TOKEN = " tok ";
    process.env.PADDLE_ENV = "production";
    process.env.PADDLE_PRICE_ID_100_HAIKUS = " pri_100 ";

    expect(readPaddleClientEnv()).toEqual({
      token: "tok",
      environment: "production",
      priceId: "pri_100",
      configured: true,
    });
  });
});
