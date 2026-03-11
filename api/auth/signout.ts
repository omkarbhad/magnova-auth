import { json } from '../_lib/db.js';

const COOKIE_NAME = 'magnova_session';

export const config = { runtime: 'edge' };

function buildExpiredCookie(req: Request): string {
  const { hostname, protocol } = new URL(req.url);
  const cookieParts = [
    `${COOKIE_NAME}=`,
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'DELETE') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const response = json({ ok: true });
  response.headers.set('Set-Cookie', buildExpiredCookie(req));
  return response;
}
