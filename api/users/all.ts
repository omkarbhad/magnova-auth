import { getDb, json } from '../_lib/db.js';
import { requireAuth, requireAdmin } from '../_lib/auth.js';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  try {
    const payload = await requireAuth(req);
    const sql = getDb();

    await requireAdmin(sql, payload);

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT
          id,
          firebase_uid AS auth_id,
          email,
          COALESCE(display_name, name) AS display_name,
          avatar_url,
          role,
          is_banned,
          credits,
          credits_used,
          last_login_at,
          created_at
        FROM users
        ORDER BY created_at DESC`;
      return json(rows);
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error('[users/all]', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
