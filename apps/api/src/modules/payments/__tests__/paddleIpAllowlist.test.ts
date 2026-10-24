import { cidrsContain, createPaddleIpAllowlist, parseCidr, parseIpv4 } from "../paddleIpAllowlist";

const listResponse = (cidrs: unknown) => ({ ok: true, status: 200, json: async () => ({ data: { ipv4_cidrs: cidrs } }) });

describe("IPv4 / CIDR parsing", () => {
  it("parses dotted and IPv4-mapped addresses", () => {
    expect(parseIpv4("34.237.3.244")).toBe(((34 * 256 + 237) * 256 + 3) * 256 + 244);
    expect(parseIpv4("::ffff:34.237.3.244")).toBe(parseIpv4("34.237.3.244"));
    expect(parseIpv4("256.1.1.1")).toBeNull();
    expect(parseIpv4("2001:db8::1")).toBeNull();
    expect(parseIpv4(undefined)).toBeNull();
  });

  it("matches /32 exactly and wider ranges by prefix", () => {
    const cidrs = [parseCidr("34.237.3.244/32"), parseCidr("10.0.0.0/8")].filter((c) => c !== null);
    expect(cidrsContain(cidrs, "34.237.3.244")).toBe(true);
    expect(cidrsContain(cidrs, "::ffff:34.237.3.244")).toBe(true);
    expect(cidrsContain(cidrs, "34.237.3.245")).toBe(false);
    expect(cidrsContain(cidrs, "10.200.1.2")).toBe(true);
    expect(cidrsContain(cidrs, "11.0.0.1")).toBe(false);
    expect(parseCidr("1.2.3.4/33")).toBeNull();
  });
});

describe("createPaddleIpAllowlist", () => {
  it("is unavailable until the first list loads, then allows only listed sources", async () => {
    const fetchFn = jest.fn().mockResolvedValue(listResponse(["34.237.3.244/32", "52.11.166.252/32"]));
    const allowlist = createPaddleIpAllowlist({ url: "https://sandbox-api.paddle.com/ips", fetchFn });
    expect(allowlist.check("34.237.3.244")).toBe("unavailable");
    await expect(allowlist.refresh()).resolves.toBe(true);
    expect(fetchFn).toHaveBeenCalledWith("https://sandbox-api.paddle.com/ips", expect.anything());
    expect(allowlist.check("52.11.166.252")).toBe("allowed");
    expect(allowlist.check("203.0.113.9")).toBe("denied");
    expect(allowlist.check(undefined)).toBe("denied");
  });

  it("keeps the last good list when a refresh fails or returns nothing", async () => {
    const onError = jest.fn();
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(listResponse(["34.237.3.244/32"]))
      .mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) })
      .mockResolvedValueOnce(listResponse([]))
      .mockRejectedValueOnce(new Error("network down"));
    const allowlist = createPaddleIpAllowlist({ url: "u", fetchFn, onError });
    await allowlist.refresh();
    for (let i = 0; i < 3; i += 1) await expect(allowlist.refresh()).resolves.toBe(false);
    expect(onError).toHaveBeenCalledTimes(3);
    expect(allowlist.check("34.237.3.244")).toBe("allowed");
  });

  it("stays unavailable when Paddle's endpoint cannot be reached at all", async () => {
    const allowlist = createPaddleIpAllowlist({ url: "u", fetchFn: jest.fn().mockRejectedValue(new Error("offline")) });
    await allowlist.refresh();
    expect(allowlist.check("34.237.3.244")).toBe("unavailable");
  });
});
