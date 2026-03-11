import { getDb, json, jsonError, parseBody } from './_lib/db.js';
import { requireAuth, requireOwnership } from './_lib/auth.js';

export const config = { runtime: 'edge' };

// [FIX #34] Allowed settings keys
const ALLOWED_SETTINGS_KEYS = [
  'theme', 'language', 'notifications', 'default_model',
  'birth_data', 'chart_preferences', 'ai_preferences',
  'default_timezone', 'chart_style', 'ayanamsa',
] as const;
const DIRECT_SETTING_COLUMNS = new Set(['default_timezone', 'chart_style', 'ayanamsa']);
const MAX_KEY_LEN = 100;
// [FIX #35] Max value size (50KB serialized)
const MAX_VALUE_SIZE = 50_000;

function parsePreferences(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

export default async function handler(req: Request): Promise<Response> {
  try {
    const auth = await requireAuth(req);
    const sql = getDb();

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId') ?? '';
      const key = url.searchParams.get('key') ?? '';
      if (!userId || !key) return json({ value: null });
      await requireOwnership(sql, auth, userId);

      const rows = await sql`
        SELECT id, default_timezone, chart_style, ayanamsa, preferences
        FROM user_settings
        WHERE user_id = ${userId}
        ORDER BY updated_at DESC
        LIMIT 1`;
      if (!rows[0]) return json({ value: null });

      const row = rows[0] as Record<string, unknown>;
      if (DIRECT_SETTING_COLUMNS.has(key)) {
        return json({ value: row[key] ?? null });
      }

      const preferences = parsePreferences(row.preferences);
      return json({ value: preferences[key] ?? null });
    }

    if (req.method === 'POST') {
      // [FIX #21] Safe JSON parsing
      const { userId, key, value } = await parseBody<{ userId: string; key: string; value: unknown }>(req);
      await requireOwnership(sql, auth, userId);

      // [FIX #34] Validate key
      if (!key || typeof key !== 'string' || key.length > MAX_KEY_LEN) {
        return jsonError(`Setting key must be a string (max ${MAX_KEY_LEN} chars)`);
      }
      if (!(ALLOWED_SETTINGS_KEYS as readonly string[]).includes(key)) {
        return jsonError('Unsupported setting key');
      }
      // [FIX #35] Validate value size
      const serialized = JSON.stringify(value);
      if (serialized.length > MAX_VALUE_SIZE) {
        return jsonError('Setting value too large');
      }

      const existing = await sql`
        SELECT id
        FROM user_settings
        WHERE user_id = ${userId}
        ORDER BY updated_at DESC
        LIMIT 1`;

      if (DIRECT_SETTING_COLUMNS.has(key)) {
        const stringValue = value == null ? null : String(value);

        if (existing[0]) {
          if (key === 'default_timezone') {
            await sql`
              UPDATE user_settings
              SET default_timezone = ${stringValue}, updated_at = now()
              WHERE id = ${existing[0].id as string}`;
          } else if (key === 'chart_style') {
            await sql`
              UPDATE user_settings
              SET chart_style = ${stringValue}, updated_at = now()
              WHERE id = ${existing[0].id as string}`;
          } else {
            await sql`
              UPDATE user_settings
              SET ayanamsa = ${stringValue}, updated_at = now()
              WHERE id = ${existing[0].id as string}`;
          }
        } else if (key === 'default_timezone') {
          await sql`
            INSERT INTO user_settings (user_id, default_timezone, preferences, created_at, updated_at)
            VALUES (${userId}, ${stringValue}, ${JSON.stringify({})}::jsonb, now(), now())`;
        } else if (key === 'chart_style') {
          await sql`
            INSERT INTO user_settings (user_id, chart_style, preferences, created_at, updated_at)
            VALUES (${userId}, ${stringValue}, ${JSON.stringify({})}::jsonb, now(), now())`;
        } else {
          await sql`
            INSERT INTO user_settings (user_id, ayanamsa, preferences, created_at, updated_at)
            VALUES (${userId}, ${stringValue}, ${JSON.stringify({})}::jsonb, now(), now())`;
        }

        return json({ ok: true });
      }

      const patch = JSON.stringify({ [key]: value });

      if (existing[0]) {
        await sql`
          UPDATE user_settings
          SET preferences = COALESCE(preferences, '{}'::jsonb) || ${patch}::jsonb,
              updated_at = now()
          WHERE id = ${existing[0].id as string}`;
      } else {
        await sql`
          INSERT INTO user_settings (user_id, preferences, created_at, updated_at)
          VALUES (${userId}, ${patch}::jsonb, now(), now())`;
      }
      return json({ ok: true });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error('[settings]', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
