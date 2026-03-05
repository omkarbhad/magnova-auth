import { neon } from '@neondatabase/serverless';

// Shared Magnova users DB (neondb)
export const sql = neon(process.env.DATABASE_URL!);

export async function upsertUser(firebaseUid: string, email: string, displayName?: string, avatarUrl?: string) {
  const [user] = await sql`
    INSERT INTO magnova_users (firebase_uid, email, display_name, avatar_url)
    VALUES (${firebaseUid}, ${email}, ${displayName ?? null}, ${avatarUrl ?? null})
    ON CONFLICT (firebase_uid) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, magnova_users.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, magnova_users.avatar_url),
      updated_at = now()
    RETURNING *
  `;
  return user;
}

export async function getUserByFirebaseUid(uid: string) {
  const [user] = await sql`SELECT * FROM magnova_users WHERE firebase_uid = ${uid} LIMIT 1`;
  return user ?? null;
}
