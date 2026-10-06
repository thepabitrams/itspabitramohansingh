/// <reference types="astro/client" />

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      AI: Ai;
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
    }
  }
}

type Runtime = import('@astrojs/cloudflare').Runtime<Cloudflare.Env>;

declare namespace App {
  interface Locals extends Runtime {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    } | null;
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
    } | null;
  }
}