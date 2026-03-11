import { getDb, json, jsonError, parseBody } from '../_lib/db.js';
import { requireAuth, requireAdmin, requireOwnership } from '../_lib/auth.js';

export const config = { runtime: 'edge' };

const VALID_ROLES = ['user', 'admin'] as const;

export default async function handler(req: Request): Promise<Response> {
  try {
    const payload = await requireAuth(req);
    const sql = getDb();
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop()!;

    if (req.method === 'GET') {
      if (payload.id !== id) {
        await requireAdmin(sql, payload);
      } else {
        await requireOwnership(sql, payload, id);
      }
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
        WHERE id = ${id}
        LIMIT 1`;
      return json(rows[0] ?? null);
    }

    if (req.method === 'PATCH') {
      await requireAdmin(sql, payload);

      const body = await parseBody<Record<string, unknown>>(req);

      const role = 'role' in body
        ? (VALID_ROLES.includes(body.role as typeof VALID_ROLES[number]) ? body.role as string : undefined)
        : undefined;
      const isBanned = 'is_banned' in body
        ? (typeof body.is_banned === 'boolean' ? body.is_banned : undefined)
        : undefined;
      const credits = 'credits' in body
        ? (typeof body.credits === 'number' && Number.isFinite(body.credits) && body.credits >= 0
            ? Math.floor(body.credits) : undefined)
        : undefined;

      if ('role' in body && role === undefined) return jsonError('Invalid role. Must be "user" or "admin"');
      if ('is_banned' in body && isBanned === undefined) return jsonError('Invalid is_banned flag');
      if ('credits' in body && credits === undefined) return jsonError('Invalid credits. Must be a non-negative number');

      const existing = await sql`SELECT id FROM users WHERE id = ${id} LIMIT 1`;
      if (!existing[0]) return jsonError('User not found', 404);

      const hasUpdate = role !== undefined || credits !== undefined || isBanned !== undefined;
      if (!hasUpdate) return jsonError('No valid fields to update');

      if (role !== undefined) {
        await sql`UPDATE users SET role = ${role}, updated_at = now() WHERE id = ${id}`;
      }
      if (credits !== undefined) {
        await sql`UPDATE users SET credits = ${credits}, updated_at = now() WHERE id = ${id}`;
      }
      if (isBanned !== undefined) {
        await sql`UPDATE users SET is_banned = ${isBanned}, updated_at = now() WHERE id = ${id}`;
      }

      return json({ ok: true });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error('[users/[id]]', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
