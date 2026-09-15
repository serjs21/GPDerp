type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  if (!path?.length) {
    return new Response("Not found", { status: 404 });
  }

  const upstreamUrl = `https://sandbox-cdn.paddle.com/${path.map(encodeURIComponent).join("/")}`;
  const upstream = await fetch(upstreamUrl, {
    next: { revalidate: 3600 },
  });

  if (!upstream.ok) {
    return new Response("Failed to fetch Paddle sandbox asset", {
      status: upstream.status,
    });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=3600");

  return new Response(upstream.body, { status: 200, headers });
}
