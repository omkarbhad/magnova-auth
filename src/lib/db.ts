import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export type User = {
  id: string;
  firebase_uid: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export async function getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM magnova_users WHERE firebase_uid = ${firebaseUid} LIMIT 1`;
  return rows[0] as User | null;
}

export async function upsertUser(
  firebaseUid: string,
  email: string,
  name?: string,
  avatarUrl?: string
): Promise<User> {
  const rows = await sql`
    INSERT INTO magnova_users (firebase_uid, email, name, avatar_url)
    VALUES (${firebaseUid}, ${email}, ${name ?? null}, ${avatarUrl ?? null})
    ON CONFLICT (firebase_uid) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, magnova_users.name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, magnova_users.avatar_url),
      updated_at = NOW()
    RETURNING *
  `;
  return rows[0] as User;
}
