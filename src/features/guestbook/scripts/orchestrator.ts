import { dispatch, listen } from './events';
import { getSession, signIn, signOut } from '../../../core/auth/client';
import { setupAvatarFallback } from './utils';
import type { GuestbookUser, VisitorMessage } from './types';

let currentUser: GuestbookUser | null = null;
let visitorList: VisitorMessage[] = [];
let activeVisitorId: number | null = null;

async function fetchSession(): Promise<void> {
  currentUser = await getSession();
  dispatch('auth:session-changed', { user: currentUser });
}

async function fetchMessages(): Promise<void> {
  try {
    const res = await fetch('/api/guestbook');
    const data: any = await res.json();
    visitorList = data.messages ?? [];
    dispatch('visitor:list-updated', {
      messages: visitorList,
      activeId: activeVisitorId,
    });
  } catch (err) {
    console.error('Failed to load messages', err);
  }
}

async function submitMessage(text: string): Promise<void> {
  if (!currentUser) return;

  try {
    const res = await fetch('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      const err: any = await res.json();
      dispatch('toast:show', { text: err.error || 'Failed to post' });
      dispatch('message:posted', { success: false });
      return;
    }

    dispatch('toast:show', { text: 'Posted' });
    await fetchMessages();

    if (visitorList.length > 0) {
      activeVisitorId = visitorList[0].id;
      dispatch('visitor:active-changed', { id: activeVisitorId });
      dispatch('visitor:selected', { id: activeVisitorId });
    }

    dispatch('message:posted', { success: true });
  } catch {
    dispatch('toast:show', { text: 'Network error' });
    dispatch('message:posted', { success: false });
  }
}

async function handleSignIn(provider: 'google' | 'github'): Promise<void> {
  try {
    await signIn(provider);
  } catch (err) {
    console.error('Sign-in error:', err);
    dispatch('toast:show', { text: 'Sign-in failed. Try again.' });
  }
}

async function handleSignOut(): Promise<void> {
  try {
    await signOut();
    currentUser = null;
    dispatch('auth:session-changed', { user: null });
    dispatch('toast:show', { text: 'Signed out' });
  } catch {
    dispatch('toast:show', { text: 'Sign-out failed' });
  }
}

export function initGuestbook(): void {
  setupAvatarFallback();

  listen('visitor:request-data', () => {
    void fetchMessages();
  });

  listen<{ id: number }>('visitor:selected', ({ id }) => {
    activeVisitorId = id;
    dispatch('visitor:active-changed', { id });
    const msg = visitorList.find((v) => v.id === id) ?? null;
    dispatch('visitor:single-data', { message: msg });
  });

  listen<{ id: number }>('visitor:request-single', ({ id }) => {
    const msg = visitorList.find((v) => v.id === id) ?? null;
    dispatch('visitor:single-data', { message: msg });
  });

  listen<{ text: string }>('composer:submit', ({ text }) => {
    void submitMessage(text);
  });

  listen<{ provider: 'google' | 'github' }>(
    'auth:sign-in-requested',
    ({ provider }) => {
      void handleSignIn(provider);
    }
  );

  listen('auth:sign-out', () => {
    void handleSignOut();
  });

  void fetchSession();
  void fetchMessages();
}