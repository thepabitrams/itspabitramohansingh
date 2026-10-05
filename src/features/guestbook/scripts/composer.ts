import { queryElement } from './dom-query';
import { dispatch, listen } from './event-bus';
import {
  getInitials,
  getAvatarStyle,
  escapeHtml,
  isUsablePicture,
  MAX_CHARS,
} from './utils';
import type { GuestbookUser } from './types';

export function setupComposer(): void {
  const composerForm = queryElement<HTMLFormElement>('#composer');
  const composerAvatar = queryElement<HTMLElement>('#composerAva');
  const entryTextArea = queryElement<HTMLTextAreaElement>('#entryText');
  const characterCounter = queryElement<HTMLElement>('#counter');
  const postButton = queryElement<HTMLButtonElement>('#postBtn');
  const signOutButton = queryElement<HTMLButtonElement>('#signOutBtn');

  listen<{ user: GuestbookUser | null }>('auth:session-changed', ({ user }) => {
    if (!composerForm) return;
    composerForm.hidden = !user;

    if (user && composerAvatar) {
      const avatarBaseClass =
        'shrink-0 grid place-items-center rounded-full w-9 h-9 text-[11px] font-semibold tracking-wide select-none overflow-hidden';

      const picture = user.image?.trim();

      if (isUsablePicture(picture)) {
        composerAvatar.className = avatarBaseClass;
        composerAvatar.style.cssText = '';
        composerAvatar.innerHTML = `<img src="${escapeHtml(picture!)}" alt="" class="w-full h-full object-cover" data-fallback-name="${escapeHtml(user.name)}" data-fallback-size="w-9 h-9 text-[11px]" />`;
      } else {
        composerAvatar.className = avatarBaseClass;
        composerAvatar.style.cssText = getAvatarStyle(user.name);
        composerAvatar.textContent = getInitials(user.name);
      }
    }
  });

  function autoGrowTextArea(): void {
    if (!entryTextArea) return;
    entryTextArea.style.height = 'auto';
    entryTextArea.style.height = Math.min(entryTextArea.scrollHeight, 200) + 'px';
  }

  function updateComposerState(): void {
    if (!entryTextArea || !characterCounter || !postButton) return;
    const length = entryTextArea.value.length;
    const hasText = entryTextArea.value.trim().length > 0;
    const isWarning = length >= MAX_CHARS * 0.85 && length < MAX_CHARS;
    const isDanger = length >= MAX_CHARS;

    characterCounter.textContent = `${length} / ${MAX_CHARS}`;
    characterCounter.className = `font-mono text-[11.5px] tabular-nums ${
      isDanger
        ? 'text-red-600 dark:text-red-500 font-semibold'
        : isWarning
        ? 'text-amber-700 dark:text-amber-500'
        : 'text-neutral-400'
    }`;
    postButton.disabled = !hasText || length > MAX_CHARS;
  }

  entryTextArea?.addEventListener('input', () => {
    autoGrowTextArea();
    updateComposerState();
  });

  entryTextArea?.addEventListener('keydown', (event) => {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key === 'Enter' &&
      postButton &&
      !postButton.disabled
    ) {
      event.preventDefault();
      composerForm?.requestSubmit();
    }
  });

  composerForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!entryTextArea || !postButton) return;
    const text = entryTextArea.value.trim();
    if (!text) return;
    postButton.disabled = true;
    dispatch('composer:submit', { text });
  });

  listen<{ success: boolean }>('message:posted', ({ success }) => {
    if (success && entryTextArea) {
      entryTextArea.value = '';
      autoGrowTextArea();
      updateComposerState();
    } else if (postButton) {
      postButton.disabled = false;
    }
  });

  signOutButton?.addEventListener('click', () => {
    dispatch('auth:sign-out');
  });

  updateComposerState();
}