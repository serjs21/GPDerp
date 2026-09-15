type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyPaddleCdn(base: string, path: string[]) {
  const upstreamUrl = `${base}/${path.map(encodeURIComponent).join("/")}`;
  const upstream = await fetch(upstreamUrl, {
    next: { revalidate: 3600 },
  });

  if (!upstream.ok) {
    return new Response("Failed to fetch Paddle asset", { status: upstream.status });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=3600");

  return new Response(upstream.body, { status: 200, headers });
}

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  if (!path?.length) {
    return new Response("Not found", { status: 404 });
  }
  return proxyPaddleCdn("https://cdn.paddle.com", path);
}
