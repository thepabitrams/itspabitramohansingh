import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { createAuth } from './core/auth/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const auth = createAuth(env);
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  context.locals.user = session?.user ?? null;
  context.locals.session = session?.session ?? null;

  return next();
});