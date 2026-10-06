import { listen } from './event-bus';
import { queryElement } from './dom-query';
import type { SessionUser } from '../../../core/auth/types';

export function setupSignInBar(): void {
  const lockBarElement = queryElement<HTMLElement>('#lockBar');

  listen<{ user: SessionUser | null }>('auth:session-changed', ({ user }) => {
    if (lockBarElement) lockBarElement.hidden = !!user;
  });
}