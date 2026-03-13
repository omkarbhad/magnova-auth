import { json, parseBody, sql } from '../_lib/db.js';
import { verifyToken } from '../_lib/firebaseAdmin.js';

const COOKIE_NAME = 'magnova_session';
const COOKIE_MAX_AGE = 3600;

export const config = { runtime: 'edge' };

function buildCookie(req: Request, token: string): string {
  const { hostname, protocol } = new URL(req.url);
  const cookieParts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'Path=/',
  ];

  if (protocol === 'https:') {
    cookieParts.push('Secure');
  }

  const configuredDomain = process.env.SESSION_COOKIE_DOMAIN;
  if (configuredDomain) {
    cookieParts.push(`Domain=${configuredDomain}`);
  } else if (hostname.endsWith('.magnova.ai')) {
    cookieParts.push('Domain=.magnova.ai');
  }

  return cookieParts.join('; ');
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.get('cookie') ?? '';
  return Object.fromEntries(
    header.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

export default async function handler(req: Request): Promise<Response> {
  try {
    // GET — check if session cookie is valid and return user
    if (req.method === 'GET') {
      const cookies = parseCookies(req);
      const uid = cookies[COOKIE_NAME];
      if (!uid) return new Response('Unauthorized', { status: 401 });

      const [user] = await sql`
        SELECT id, firebase_uid AS auth_id, email,
               COALESCE(display_name, name) AS display_name,
               avatar_url, role, is_banned, credits, credits_used,
               github_token, github_username, last_login_at, created_at
        FROM users WHERE firebase_uid = ${uid}
      `;
      if (!user) return new Response('Unauthorized', { status: 401 });
      return json({ user });
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const { token: bodyToken, githubToken, githubUsername } = await parseBody<{ token?: string; githubToken?: string; githubUsername?: string }>(req);
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

    const [astrovaUser] = await sql`
      INSERT INTO users (
        firebase_uid,
        email,
        name,
        display_name,
        avatar_url,
        github_token,
        github_username,
        credits,
        last_login_at,
        updated_at
      )
      VALUES (
        ${decoded.uid},
        ${email},
        ${displayName},
        ${displayName},
        ${avatarUrl},
        ${githubToken ?? null},
        ${githubUsername ?? null},
        10,
        now(),
        now()
      )
      ON CONFLICT(firebase_uid)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        display_name = COALESCE(EXCLUDED.display_name, users.display_name, users.name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        github_token = COALESCE(EXCLUDED.github_token, users.github_token),
        github_username = COALESCE(EXCLUDED.github_username, users.github_username),
        last_login_at = now(),
        updated_at = now()
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
        github_token,
        github_username,
        last_login_at,
        created_at`;

    const response = json({ user: astrovaUser ?? null });
    response.headers.set('Set-Cookie', buildCookie(req, decoded.uid));
    return response;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[auth][session]', msg);
    if (error instanceof Response) return error;
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
