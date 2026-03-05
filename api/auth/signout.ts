import { json } from '../_lib/db.js';

const COOKIE_NAME = 'magnova_session';
const COOKIE_DOMAIN = '.magnova.ai';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'DELETE') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const cookie = [
    `${COOKIE_NAME}=`,
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    `Domain=${COOKIE_DOMAIN}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ');

  const response = json({ ok: true });
  response.headers.set('Set-Cookie', cookie);
  return response;
}
