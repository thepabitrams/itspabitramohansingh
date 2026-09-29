import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { eq, and, isNull, asc, desc } from 'drizzle-orm';
import { createDb } from '../../db';
import { messages, settings } from '../../db/schema';

const DEFAULT_MAX_VISITORS = 20;

async function getMaxVisitors(db: any): Promise<number> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'max_visitors'))
    .get();
  return row ? parseInt(row.value, 10) : DEFAULT_MAX_VISITORS;
}

async function getApprovedMessages(db: any) {
  return db
    .select()
    .from(messages)
    .where(and(eq(messages.status, 'approved'), isNull(messages.deletedAt)))
    .orderBy(desc(messages.createdAt))
    .all();
}

async function moderateMessage(
  env: CloudflareEnv,
  text: string
): Promise<boolean> {
  try {
    const result: any = await env.AI.run('@cf/meta/llama-guard-3-8b', {
      messages: [{ role: 'user', content: text }],
    });

    console.log('[moderation] raw response:', JSON.stringify(result));

    const raw =
      typeof result === 'string'
        ? result
        : result?.response ?? result?.result ?? '';

    const verdict = String(raw).trim().toLowerCase();

    if (verdict.startsWith('unsafe')) {
      console.log('[moderation] BLOCKED:', verdict);
      return false;
    }

    if (verdict.startsWith('safe')) {
      console.log('[moderation] ALLOWED:', verdict);
      return true;
    }

    console.warn('[moderation] unexpected response, allowing:', verdict);
    return true;
  } catch (err) {
    console.warn('[moderation] AI call failed, allowing message:', err);
    return true;
  }
}

async function runAutoDelete(db: any, maxVisitors: number) {
  const rows = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.status, 'approved'),
        eq(messages.pinned, 0),
        isNull(messages.deletedAt)
      )
    )
    .orderBy(asc(messages.createdAt))
    .all();

  const overflow = rows.length - maxVisitors;
  if (overflow <= 0) return 0;

  const toDelete = rows.slice(0, overflow);
  const now = new Date();

  for (const row of toDelete) {
    await db
      .update(messages)
      .set({ deletedAt: now })
      .where(eq(messages.id, row.id));
  }

  return toDelete.length;
}

export const GET: APIRoute = async () => {
  const db = createDb(env.DB);
  const [list, maxVisitors] = await Promise.all([
    getApprovedMessages(db),
    getMaxVisitors(db),
  ]);

  return new Response(
    JSON.stringify({
      messages: list.map((m: any) => ({
        id: m.id,
        name: m.name,
        picture: m.picture,
        message: m.message,
        pinned: m.pinned === 1,
        createdAt: m.createdAt
          ? Math.floor(new Date(m.createdAt).getTime() / 1000)
          : Math.floor(Date.now() / 1000),
      })),
      maxVisitors,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not signed in' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { message?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const text = (body.message || '').trim();

  if (!text || text.length < 2 || text.length > 500) {
    return new Response(
      JSON.stringify({ error: 'Message must be 2–500 characters' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const isSafe = await moderateMessage(env as any, text);
  if (!isSafe) {
    return new Response(
      JSON.stringify({ error: 'Message flagged by moderation' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const db = createDb(env.DB);

  const inserted = await db
    .insert(messages)
    .values({
      userId: user.id,
      name: user.name,
      picture: user.image ?? null,
      message: text,
      status: 'approved',
      pinned: 0,
    })
    .returning()
    .get();

  const maxVisitors = await getMaxVisitors(db);
  await runAutoDelete(db, maxVisitors);

  return new Response(
    JSON.stringify({
      success: true,
      message: {
        id: inserted.id,
        name: inserted.name,
        picture: inserted.picture,
        message: inserted.message,
        pinned: inserted.pinned === 1,
        createdAt: inserted.createdAt
          ? Math.floor(new Date(inserted.createdAt).getTime() / 1000)
          : Math.floor(Date.now() / 1000),
      },
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};