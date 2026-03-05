import { json, parseBody, sql } from '../_lib/db.js';
import { verifyToken } from '../_lib/firebaseAdmin.js';

const APP_NAME = 'astrova';
const COOKIE_NAME = 'magnova_session';
const COOKIE_DOMAIN = '.magnova.ai';
const COOKIE_MAX_AGE = 3600;

export const config = { runtime: 'edge' };

function buildCookie(token: string): string {
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Secure',
    `Domain=${COOKIE_DOMAIN}`,
    'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'Path=/',
  ].join('; ');
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const { token: bodyToken } = await parseBody<{ token?: string }>(req);
    const header = req.headers.get('authorization');
    const headerToken = header?.toLowerCase().startsWith('bearer ')
      ? header.slice(7).trim()
      : undefined;
    const token = headerToken || bodyToken;
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decoded = await verifyToken(token);
    const email = decoded.email ?? '';
    const displayName = decoded.name ?? null;
    const avatarUrl = decoded.picture ?? null;

    const existing = await sql`SELECT id FROM magnova_users WHERE firebase_uid = ${decoded.uid} LIMIT 1`;
    const isNewUser = !existing[0];

    const [userRow] = await sql`
      INSERT INTO magnova_users (firebase_uid, email, display_name, avatar_url)
      VALUES (${decoded.uid}, ${email}, ${displayName}, ${avatarUrl})
      ON CONFLICT(firebase_uid)
      DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url
      RETURNING id, email, display_name`;
    if (!userRow) {
      throw new Response('Failed to upsert user', { status: 500 });
    }

    const userId = userRow.id;

    await sql`
      INSERT INTO app_access (user_id, app)
      VALUES (${userId}, ${APP_NAME})
      ON CONFLICT (user_id, app) DO NOTHING`;

    if (isNewUser) {
      await sql`
        INSERT INTO user_credits (user_id, app, balance)
        VALUES (${userId}, ${APP_NAME}, 100)
        ON CONFLICT (user_id, app) DO NOTHING`;
    }

    await sql`
      INSERT INTO auth_events (user_id, event, app)
      VALUES (${userId}, 'login', ${APP_NAME})`;

    const [creditRow] = await sql`
      SELECT balance FROM user_credits
      WHERE user_id = ${userId} AND app = ${APP_NAME}
      LIMIT 1`;
    const credits = creditRow?.balance ?? 0;

    const response = json({
      user: {
        id: userId,
        email: userRow.email,
        displayName: userRow.display_name ?? '',
        credits,
      },
    });
    response.headers.set('Set-Cookie', buildCookie(token));
    return response;
  } catch (error) {
    console.error('[auth][session]', error);
    if (error instanceof Response) return error;
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
