import type { SessionUser } from './types';

interface SessionPayload {
  user?: SessionUser | null;
}

export async function signIn(provider: 'google' | 'github'): Promise<void> {
  const { createAuthClient } = await import('better-auth/client');
  const authClient = createAuthClient({ baseURL: window.location.origin });
  await authClient.signIn.social({ provider, callbackURL: '/guestbook' });
}

export async function signOut(): Promise<void> {
  const { createAuthClient } = await import('better-auth/client');
  const authClient = createAuthClient({ baseURL: window.location.origin });
  await authClient.signOut();
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const response = await fetch('/api/auth/get-session');
    const payload = (await response.json()) as SessionPayload;
    return payload.user ?? null;
  } catch {
    return null;
  }
}