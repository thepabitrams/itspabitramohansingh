import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb, schema } from '../../db';

export function createAuth(environment: Cloudflare.Env) {
  const database = createDb(environment.DB);

  return betterAuth({
    secret: environment.BETTER_AUTH_SECRET,
    baseURL: environment.BETTER_AUTH_URL,
    database: drizzleAdapter(database, {
      provider: 'sqlite',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    account: {
      storeStateStrategy: 'database',
      skipStateCookieCheck: true,
    },
    socialProviders: {
      google: {
        clientId: environment.GOOGLE_CLIENT_ID,
        clientSecret: environment.GOOGLE_CLIENT_SECRET,
      },
    },
  });
}