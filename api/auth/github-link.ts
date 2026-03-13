import { json, jsonError, parseBody, sql } from '../_lib/db.js';

export const config = { runtime: 'edge' };

const COOKIE_NAME = 'magnova_session';
const COOKIE_MAX_AGE = 3600;

function buildCookie(req: Request, token: string): string {
  const { hostname, protocol } = new URL(req.url);
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'Path=/',
  ];
  if (protocol === 'https:') parts.push('Secure');
  if (hostname.endsWith('.magnova.ai')) parts.push('Domain=.magnova.ai');
  else if (process.env.SESSION_COOKIE_DOMAIN) parts.push(`Domain=${process.env.SESSION_COOKIE_DOMAIN}`);
  return parts.join('; ');
}

// When GitHub login fails because the email already has a Google account,
// the client sends the GitHub-verified email + GitHub token here.
// We look up the existing user by email, store the GitHub token, and create a session.
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { email, githubToken, githubUsername } = await parseBody<{
      email?: string;
      githubToken?: string;
      githubUsername?: string;
    }>(req);
    if (!email) return jsonError('Missing email', 400);

    // Find existing user by email
    const [user] = await sql`
      UPDATE users SET
        github_token = COALESCE(${githubToken ?? null}, github_token),
        github_username = COALESCE(${githubUsername ?? null}, github_username),
        last_login_at = now(),
        updated_at = now()
      WHERE email = ${email}
      RETURNING
        id,
        firebase_uid,
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
        created_at
    `;

    if (!user) return jsonError('No account found for this email', 404);

    const response = json({ ok: true, user });
    response.headers.set('Set-Cookie', buildCookie(req, user.firebase_uid as string));
    // Also set the non-httpOnly auth flag
    response.headers.append('Set-Cookie', [
      'magnova_auth=1',
      'SameSite=Lax',
      `Max-Age=${COOKIE_MAX_AGE}`,
      'Path=/',
      ...(req.url.includes('.magnova.ai') ? ['Domain=.magnova.ai'] : []),
      'Secure',
    ].join('; '));
    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[auth][github-link]', msg);
    return jsonError(msg, 500);
  }
}
