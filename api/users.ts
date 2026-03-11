import { getDb, json, jsonError, parseBody } from './_lib/db.js';
import { requireAuth } from './_lib/auth.js';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  try {
    const payload = await requireAuth(req);
    const sql = getDb();

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
        WHERE firebase_uid = ${payload.firebase_uid}
        LIMIT 1`;
      return json(rows[0] ?? null);
    }

    if (req.method === 'POST') {
      let email: string;
      let displayName: string | undefined;
      let avatarUrl: string | undefined;
      try {
        const body = await parseBody<{
          email?: string; displayName?: string; avatarUrl?: string;
        }>(req);
        email = body.email || '';
        displayName = body.displayName;
        avatarUrl = body.avatarUrl;
      } catch (parseErr) {
        console.error('[users] Parse error:', parseErr);
        return jsonError('Invalid request body', 400);
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return jsonError('Valid email is required');
      }

      const existing = await sql`SELECT id FROM users WHERE firebase_uid = ${payload.firebase_uid} LIMIT 1`;

      if (existing[0]) {
        try {
          const updated = await sql`
            UPDATE users
            SET email = ${email},
                name = COALESCE(${displayName ?? null}, name),
                display_name = COALESCE(${displayName ?? null}, display_name, name),
                avatar_url = COALESCE(${avatarUrl ?? null}, avatar_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE firebase_uid = ${payload.firebase_uid}
            RETURNING
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
              created_at`;
          if (!updated[0]) return jsonError('User update failed', 404);
          return json(updated[0]);
        } catch (updateErr) {
          console.error('[users] Update error:', updateErr);
          return jsonError('Failed to update user profile', 500);
        }
      }

      const safeName = displayName ?? (email.includes('@') ? email.split('@')[0] : 'User');
      const newUser = await sql`
        INSERT INTO users (firebase_uid, email, name, display_name, avatar_url, credits)
        VALUES (${payload.firebase_uid}, ${email}, ${safeName}, ${safeName}, ${avatarUrl ?? null}, 10)
        RETURNING
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
          created_at`;
      if (!newUser[0]) return jsonError('User creation failed', 500);
      return json(newUser[0], 201);
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error('[users]', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
