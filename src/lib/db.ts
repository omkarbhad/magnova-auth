import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export type User = {
  id: string;
  firebase_uid: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  github_token: string | null;
  github_username: string | null;
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
  avatarUrl?: string,
  githubToken?: string,
  githubUsername?: string
): Promise<User> {
  const rows = await sql`
    INSERT INTO magnova_users (firebase_uid, email, name, avatar_url, github_token, github_username)
    VALUES (${firebaseUid}, ${email}, ${name ?? null}, ${avatarUrl ?? null}, ${githubToken ?? null}, ${githubUsername ?? null})
    ON CONFLICT (firebase_uid) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, magnova_users.name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, magnova_users.avatar_url),
      github_token = COALESCE(EXCLUDED.github_token, magnova_users.github_token),
      github_username = COALESCE(EXCLUDED.github_username, magnova_users.github_username),
      updated_at = NOW()
    RETURNING *
  `;
  return rows[0] as User;
}

/** Update only the GitHub token for a user (e.g. on re-auth) */
export async function updateGitHubToken(
  firebaseUid: string,
  githubToken: string,
  githubUsername?: string
): Promise<void> {
  await sql`
    UPDATE magnova_users
    SET github_token = ${githubToken},
        github_username = ${githubUsername ?? null},
        updated_at = NOW()
    WHERE firebase_uid = ${firebaseUid}
  `;
}
