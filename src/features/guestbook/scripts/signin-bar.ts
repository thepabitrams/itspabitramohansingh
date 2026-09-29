import { listen } from './events';
import { $ } from './dom';
import type { GuestbookUser } from './types';

export function setupSignInBar(): void {
  const lockBar = $<HTMLElement>('#lockBar');

  listen<{ user: GuestbookUser | null }>('auth:session-changed', ({ user }) => {
    if (lockBar) lockBar.hidden = !!user;
  });
}