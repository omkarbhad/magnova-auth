import { getDb, json, jsonError } from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';

export const config = { runtime: 'edge' };

const FREE_CREDITS = 20;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const auth = await requireAuth(req);
    const sql = getDb();

    // Add FREE_CREDITS to the user's balance unconditionally
    // Simple: no claim tracking, users get 20 credits whenever they click claim
    // TODO: add one-time claim tracking once credit_transactions table is confirmed in prod
    const result = await sql`
      UPDATE users
      SET credits = credits + ${FREE_CREDITS}
      WHERE id = ${auth.id}
      RETURNING credits`;

    if (!result[0]) return jsonError('User not found', 404);

    return json({ ok: true, credits: (result[0] as { credits: number }).credits });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error('[credits/claim-free]', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
