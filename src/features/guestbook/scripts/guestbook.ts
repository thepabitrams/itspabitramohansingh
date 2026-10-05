import { dispatch, listen } from './event-bus';
import { getSession, signIn, signOut } from '../../../core/auth/client';
import { setupAvatarFallback } from './utils';
import type { GuestbookUser, VisitorMessage } from './types';

let currentUser: GuestbookUser | null = null;
let visitorMessages: VisitorMessage[] = [];
let activeVisitorId: number | null = null;

async function fetchSession(): Promise<void> {
  currentUser = await getSession();
  dispatch('auth:session-changed', { user: currentUser });
}

async function fetchMessages(): Promise<void> {
  try {
    const response = await fetch('/api/guestbook');
    const payload = (await response.json()) as { messages?: VisitorMessage[] };
    visitorMessages = payload.messages ?? [];
    dispatch('visitor:list-updated', {
      messages: visitorMessages,
      activeId: activeVisitorId,
    });
  } catch (error) {
    console.error('Failed to load messages', error);
  }
}

async function submitMessage(text: string): Promise<void> {
  if (!currentUser) return;

  try {
    const response = await fetch('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      const errorPayload = (await response.json()) as { error?: string };
      dispatch('toast:show', { text: errorPayload.error || 'Failed to post' });
      dispatch('message:posted', { success: false });
      return;
    }

    dispatch('toast:show', { text: 'Posted' });
    await fetchMessages();

    if (visitorMessages.length > 0) {
      activeVisitorId = visitorMessages[0].id;
      dispatch('visitor:active-changed', { id: activeVisitorId });
      dispatch('visitor:selected', { id: activeVisitorId });
    }

    dispatch('message:posted', { success: true });
  } catch (error) {
    dispatch('toast:show', { text: 'Network error' });
    dispatch('message:posted', { success: false });
    console.error('Failed to submit message', error);
  }
}

async function handleSignIn(provider: 'google' | 'github'): Promise<void> {
  try {
    await signIn(provider);
  } catch (error) {
    console.error('Sign-in error:', error);
    dispatch('toast:show', { text: 'Sign-in failed. Try again.' });
  }
}

async function handleSignOut(): Promise<void> {
  try {
    await signOut();
    currentUser = null;
    dispatch('auth:session-changed', { user: null });
    dispatch('toast:show', { text: 'Signed out' });
  } catch (error) {
    dispatch('toast:show', { text: 'Sign-out failed' });
    console.error('Sign-out error:', error);
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
    const message = visitorMessages.find((visitor) => visitor.id === id) ?? null;
    dispatch('visitor:single-data', { message });
  });

  listen<{ id: number }>('visitor:request-single', ({ id }) => {
    const message = visitorMessages.find((visitor) => visitor.id === id) ?? null;
    dispatch('visitor:single-data', { message });
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