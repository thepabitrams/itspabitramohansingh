import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { eq, and, isNull, asc, desc } from 'drizzle-orm';
import { createDb } from '../../db';
import { messages, settings } from '../../db/schema';
import type { VisitorMessage } from '../../features/guestbook/scripts/types';

type Database = ReturnType<typeof createDb>;

const DEFAULT_MAX_VISITOR_COUNT = 20;
const MIN_MESSAGE_LENGTH = 2;
const MAX_MESSAGE_LENGTH = 500;
const MODERATION_MODEL = '@cf/meta/llama-guard-3-8b';

interface ModerationResponse {
  response?: string;
  result?: string;
}

interface PostRequestBody {
  message?: string;
}

interface MessageRecord {
  id: number;
  name: string;
  picture: string | null;
  message: string;
  pinned: number;
  createdAt: Date | number | null;
}

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function toVisitorMessage(record: MessageRecord): VisitorMessage {
  return {
    id: record.id,
    name: record.name,
    picture: record.picture,
    message: record.message,
    pinned: record.pinned === 1,
    createdAt: record.createdAt
      ? Math.floor(new Date(record.createdAt).getTime() / 1000)
      : Math.floor(Date.now() / 1000),
  };
}

async function getMaxVisitorCount(database: Database): Promise<number> {
  const settingsRow = await database
    .select()
    .from(settings)
    .where(eq(settings.key, 'max_visitors'))
    .get();
  return settingsRow ? parseInt(settingsRow.value, 10) : DEFAULT_MAX_VISITOR_COUNT;
}

async function getApprovedMessages(database: Database) {
  return database
    .select()
    .from(messages)
    .where(and(eq(messages.status, 'approved'), isNull(messages.deletedAt)))
    .orderBy(desc(messages.createdAt))
    .all();
}

async function passesModeration(
  environment: Cloudflare.Env,
  content: string
): Promise<boolean> {
  try {
    const moderationResult = (await environment.AI.run(MODERATION_MODEL, {
      messages: [{ role: 'user', content }],
    })) as ModerationResponse | string;

    const rawResponse =
      typeof moderationResult === 'string'
        ? moderationResult
        : moderationResult.response ?? moderationResult.result ?? '';

    const verdict = String(rawResponse).trim().toLowerCase();

    if (verdict.startsWith('unsafe')) return false;
    if (verdict.startsWith('safe')) return true;
    return true;
  } catch (error) {
    console.warn('Moderation call failed, allowing message:', error);
    return true;
  }
}

async function pruneOldMessages(
  database: Database,
  maxVisitorCount: number
): Promise<number> {
  const approvedUnpinnedMessages = await database
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

  const excessCount = approvedUnpinnedMessages.length - maxVisitorCount;
  if (excessCount <= 0) return 0;

  const messagesToDelete = approvedUnpinnedMessages.slice(0, excessCount);
  const deletionTimestamp = new Date();

  for (const messageRecord of messagesToDelete) {
    await database
      .update(messages)
      .set({ deletedAt: deletionTimestamp })
      .where(eq(messages.id, messageRecord.id));
  }

  return messagesToDelete.length;
}

export const GET: APIRoute = async () => {
  const database = createDb(env.DB);
  const [approvedMessages, maxVisitorCount] = await Promise.all([
    getApprovedMessages(database),
    getMaxVisitorCount(database),
  ]);

  return jsonResponse(
    {
      messages: approvedMessages.map(toVisitorMessage),
      maxVisitors: maxVisitorCount,
    },
    200
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  const currentUser = locals.user;

  if (!currentUser) {
    return jsonResponse({ error: 'Not signed in' }, 401);
  }

  let requestBody: PostRequestBody;
  try {
    requestBody = (await request.json()) as PostRequestBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const messageText = (requestBody.message ?? '').trim();

  if (
    messageText.length < MIN_MESSAGE_LENGTH ||
    messageText.length > MAX_MESSAGE_LENGTH
  ) {
    return jsonResponse(
      {
        error: `Message must be ${MIN_MESSAGE_LENGTH}–${MAX_MESSAGE_LENGTH} characters`,
      },
      400
    );
  }

  const isAppropriate = await passesModeration(env, messageText);
  if (!isAppropriate) {
    return jsonResponse({ error: 'Message flagged by moderation' }, 400);
  }

  const database = createDb(env.DB);

  const createdMessage = await database
    .insert(messages)
    .values({
      userId: currentUser.id,
      name: currentUser.name,
      picture: currentUser.image ?? null,
      message: messageText,
      status: 'approved',
      pinned: 0,
    })
    .returning()
    .get();

  const maxVisitorCount = await getMaxVisitorCount(database);
  await pruneOldMessages(database, maxVisitorCount);

  return jsonResponse(
    {
      success: true,
      message: toVisitorMessage(createdMessage),
    },
    201
  );
};