import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export type Sql = NeonQueryFunction<false, false>;

const sql = neon(process.env.DATABASE_URL!);

export { sql };

export function getDb(): Sql {
  return sql;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function parseBody<T>(req: Request): Promise<T> {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 1_048_576) {
    throw new Response(JSON.stringify({ error: 'Request body too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    return (await req.json()) as T;
  } catch {
    throw new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
