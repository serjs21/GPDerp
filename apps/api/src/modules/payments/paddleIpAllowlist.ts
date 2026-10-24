import { PADDLE_IPS_FETCH_TIMEOUT_MS, PADDLE_IPS_REFRESH_MS, PADDLE_IPS_RETRY_MS } from "../../consts/paddle";

export type PaddleIpDecision = "allowed" | "denied" | "unavailable";

type Cidr = { base: number; mask: number };

const IPV4_MAPPED_PREFIX = "::ffff:";

/** Dotted IPv4 (also IPv4-mapped IPv6) as an unsigned 32-bit number, or null. */
export const parseIpv4 = (raw: string | undefined): number | null => {
  if (!raw) return null;
  const ip = raw.startsWith(IPV4_MAPPED_PREFIX) ? raw.slice(IPV4_MAPPED_PREFIX.length) : raw;
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part) || Number(part) > 255) return null;
    value = value * 256 + Number(part);
  }
  return value;
};

export const parseCidr = (cidr: string): Cidr | null => {
  const [ip, bitsRaw = "32"] = cidr.trim().split("/");
  const base = parseIpv4(ip);
  const bits = Number(bitsRaw);
  if (base === null || !Number.isInteger(bits) || bits < 0 || bits > 32) return null;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return { base: (base & mask) >>> 0, mask };
};

export const cidrsContain = (cidrs: readonly Cidr[], ip: string | undefined): boolean => {
  const value = parseIpv4(ip);
  if (value === null) return false;
  return cidrs.some(({ base, mask }) => ((value & mask) >>> 0) === base);
};

type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

type AllowlistOptions = {
  url: string;
  fetchFn?: FetchLike;
  onError?: (error: unknown) => void;
  onLoaded?: (count: number) => void;
};

/**
 * Paddle webhook source IPs from Paddle's `/ips` endpoint (`data.ipv4_cidrs`). The last good list is kept
 * when a refresh fails; until a first list loads every source is "unavailable".
 */
export function createPaddleIpAllowlist({ url, fetchFn = fetch, onError, onLoaded }: AllowlistOptions) {
  let cidrs: Cidr[] | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const refresh = async (): Promise<boolean> => {
    try {
      const response = await fetchFn(url, { signal: AbortSignal.timeout(PADDLE_IPS_FETCH_TIMEOUT_MS) });
      if (!response.ok) throw new Error(`Paddle IP list HTTP ${response.status}`);
      const body = (await response.json()) as { data?: { ipv4_cidrs?: unknown } };
      const list = Array.isArray(body.data?.ipv4_cidrs) ? body.data.ipv4_cidrs : [];
      const parsed = list.map((c) => (typeof c === "string" ? parseCidr(c) : null)).filter((c): c is Cidr => c !== null);
      if (!parsed.length) throw new Error("Paddle IP list is empty");
      cidrs = parsed;
      onLoaded?.(parsed.length);
      return true;
    } catch (error) {
      onError?.(error);
      return false;
    }
  };

  const schedule = (ms: number) => {
    if (stopped) return;
    timer = setTimeout(() => {
      void refresh().then((ok) => schedule(ok || cidrs ? PADDLE_IPS_REFRESH_MS : PADDLE_IPS_RETRY_MS));
    }, ms);
    timer.unref?.();
  };

  return {
    refresh,
    /** Loads the list now (without blocking callers on failure) and keeps it refreshed. */
    start() {
      void refresh().then((ok) => schedule(ok ? PADDLE_IPS_REFRESH_MS : PADDLE_IPS_RETRY_MS));
    },
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
    check(ip: string | undefined): PaddleIpDecision {
      if (!cidrs) return "unavailable";
      return cidrsContain(cidrs, ip) ? "allowed" : "denied";
    },
  };
}

export type PaddleIpAllowlist = ReturnType<typeof createPaddleIpAllowlist>;
