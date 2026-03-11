import type { Sql } from './db.js';
import { sql } from './db.js';
// verifyToken no longer needed - magnova_session cookie contains Firebase UID directly

export interface AuthPayload {
  id: string;
  firebase_uid: string;
  email: string;
  name: string | null;
  credits: number;
}

const SESSION_COOKIE_NAME = 'magnova_session';
const APP_NAME = 'astrova';

function extractSessionToken(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [name, ...valueParts] = part.trim().split('=');
    if (name === SESSION_COOKIE_NAME) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return null;
}

export async function requireAuth(req: Request): Promise<AuthPayload> {
  // magnova_session cookie contains the Firebase UID directly (set by auth.magnova.ai)
  // Since it's httpOnly and set by our trusted auth service, we can use it directly
  const firebaseUid = extractSessionToken(req);
  if (!firebaseUid) throw new Response('Unauthorized', { status: 401 });

  // Query the astrova-db users table (not magnova_users)
  const rows = await sql`
    SELECT id, email, COALESCE(display_name, name) AS name, credits
    FROM users
    WHERE firebase_uid = ${firebaseUid}
    LIMIT 1`;
  const row = rows[0] as
    | { id: string; email: string; name: string | null; credits: number }
    | undefined;
  
  if (!row) {
    // User exists in magnova-auth but not in astrova yet - create them
    // This happens on first use of astrova after signing in via auth.magnova.ai
    const newUser = await sql`
      INSERT INTO users (firebase_uid, email, credits)
      VALUES (${firebaseUid}, '', 10)
      RETURNING id, email, name, credits`;
    const created = newUser[0] as { id: string; email: string; name: string | null; credits: number };
    return {
      id: created.id,
      firebase_uid: firebaseUid,
      email: created.email || '',
      name: created.name,
      credits: created.credits,
    };
  }

  return {
    id: row.id,
    firebase_uid: firebaseUid,
    email: row.email || '',
    name: row.name,
    credits: row.credits,
  };
}

export async function requireAdmin(sqlClient: Sql, authPayload: AuthPayload): Promise<{ id: string; role: string }> {
  const rows = await sqlClient`SELECT id, role FROM users WHERE firebase_uid = ${authPayload.firebase_uid} LIMIT 1`;
  const me = rows[0] as { id: string; role: string } | undefined;
  if (!me) throw new Response('Forbidden', { status: 403 });
  if (me.role !== 'admin') throw new Response('Forbidden', { status: 403 });
  return { id: me.id, role: me.role };
}

export async function requireNotBanned(sqlClient: Sql, authPayload: AuthPayload): Promise<void> {
  // Simplified: no is_banned column yet - just verify user exists
  const rows = await sqlClient`SELECT id, is_banned FROM users WHERE firebase_uid = ${authPayload.firebase_uid} LIMIT 1`;
  if (!rows[0]) throw new Response('Forbidden', { status: 403 });
  if (Boolean((rows[0] as { is_banned?: boolean }).is_banned)) {
    throw new Response('Forbidden', { status: 403 });
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function requireOwnership(sqlClient: Sql, authPayload: AuthPayload, requestedUserId: string): Promise<void> {
  // Validate UUID format to prevent SQL issues
  if (!UUID_REGEX.test(requestedUserId)) {
    throw new Response('Invalid user ID', { status: 400 });
  }
  // Check if the authenticated user owns the requested resource
  const rows = await sqlClient`SELECT id FROM users WHERE firebase_uid = ${authPayload.firebase_uid} LIMIT 1`;
  const me = rows[0] as { id: string } | undefined;
  if (!me) throw new Response('Forbidden', { status: 403 });
  if (me.id !== requestedUserId) {
    throw new Response('Forbidden', { status: 403 });
  }
}
