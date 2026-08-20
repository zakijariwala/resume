export const json = (body: unknown, status = 200, extra?: HeadersInit): Response =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...(extra as Record<string, string>) },
  });

export const notFound = (path: string): Response => json({ error: 'not found', path }, 404);
