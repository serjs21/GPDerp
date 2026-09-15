const PADDLE_JS_CDN = "https://cdn.paddle.com/paddle/v2/paddle.js";

/**
 * Same-origin proxy for Paddle.js so ad blockers that target cdn.paddle.com
 * do not prevent checkout from initializing.
 */
export async function GET() {
  const upstream = await fetch(PADDLE_JS_CDN, {
    headers: { Accept: "application/javascript,text/javascript,*/*" },
    next: { revalidate: 3600 },
  });

  if (!upstream.ok) {
    return new Response("Failed to fetch Paddle SDK", { status: 502 });
  }

  // Point asset CDNs at same-origin proxies so CSS/images are not blocked either.
  const body = (await upstream.text())
    .replaceAll("https://cdn.paddle.com", "/api/paddle-cdn")
    .replaceAll("https://sandbox-cdn.paddle.com", "/api/paddle-sandbox-cdn");

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
