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

export async function getSession() {
  try {
    const res = await fetch('/api/auth/get-session');
    const data:any = await res.json();
    return (data as any).user ?? null;
  } catch {
    return null;
  }
}