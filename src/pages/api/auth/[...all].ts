import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createAuth } from '../../../core/auth/auth';

export const ALL: APIRoute = async (context) => {
  const auth = createAuth(env as any);
  return auth.handler(context.request);
};