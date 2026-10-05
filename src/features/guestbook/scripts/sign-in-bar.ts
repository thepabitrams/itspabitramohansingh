import { listen } from './event-bus';
import { queryElement } from './dom-query';
import type { GuestbookUser } from './types';

export function setupSignInBar(): void {
  const lockBarElement = queryElement<HTMLElement>('#lockBar');

  listen<{ user: GuestbookUser | null }>('auth:session-changed', ({ user }) => {
    if (lockBarElement) lockBarElement.hidden = !!user;
  });
}