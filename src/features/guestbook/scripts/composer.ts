import { $ } from './dom';
import { dispatch, listen } from './events';
import { initials, avaStyle, esc, MAX_CHARS } from './utils';
import type { GuestbookUser } from './types';

export function setupComposer(): void {
  const composer = $<HTMLFormElement>('#composer');
  const composerAva = $<HTMLElement>('#composerAva');
  const entryText = $<HTMLTextAreaElement>('#entryText');
  const counter = $<HTMLElement>('#counter');
  const postBtn = $<HTMLButtonElement>('#postBtn');
  const signOutBtn = $<HTMLButtonElement>('#signOutBtn');

  listen<{ user: GuestbookUser | null }>('auth:session-changed', ({ user }) => {
    if (!composer) return;
    composer.hidden = !user;

    if (user && composerAva) {
      const base =
        'shrink-0 grid place-items-center rounded-full w-9 h-9 text-[11px] font-semibold tracking-wide select-none overflow-hidden';

      const picture = user.image?.trim();
      const isUsablePicture =
        picture &&
        picture.length > 0 &&
        !picture.includes('default-user') &&
        !picture.includes('default_profile') &&
        !picture.includes('photo.jpg');

      if (isUsablePicture) {
        composerAva.className = base;
        composerAva.style.cssText = '';
        composerAva.innerHTML = `<img src="${esc(picture)}" alt="" class="w-full h-full object-cover" data-fallback-name="${esc(user.name)}" data-fallback-size="w-9 h-9 text-[11px]" />`;
      } else {
        composerAva.className = base;
        composerAva.style.cssText = avaStyle(user.name);
        composerAva.textContent = initials(user.name);
      }
    }
  });

  function autoGrow(): void {
    if (!entryText) return;
    entryText.style.height = 'auto';
    entryText.style.height = Math.min(entryText.scrollHeight, 200) + 'px';
  }

  function updateComposer(): void {
    if (!entryText || !counter || !postBtn) return;
    const len = entryText.value.length;
    const hasText = entryText.value.trim().length > 0;
    const isWarn = len >= MAX_CHARS * 0.85 && len < MAX_CHARS;
    const isDanger = len >= MAX_CHARS;

    counter.textContent = `${len} / ${MAX_CHARS}`;
    counter.className = `font-mono text-[11.5px] tabular-nums ${
      isDanger
        ? 'text-red-600 dark:text-red-500 font-semibold'
        : isWarn
        ? 'text-amber-700 dark:text-amber-500'
        : 'text-neutral-400'
    }`;
    postBtn.disabled = !hasText || len > MAX_CHARS;
  }

  entryText?.addEventListener('input', () => {
    autoGrow();
    updateComposer();
  });

  entryText?.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && postBtn && !postBtn.disabled) {
      e.preventDefault();
      composer?.requestSubmit();
    }
  });

  composer?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!entryText || !postBtn) return;
    const text = entryText.value.trim();
    if (!text) return;
    postBtn.disabled = true;
    dispatch('composer:submit', { text });
  });

  listen<{ success: boolean }>('message:posted', ({ success }) => {
    if (success && entryText) {
      entryText.value = '';
      autoGrow();
      updateComposer();
    } else if (postBtn) {
      postBtn.disabled = false;
    }
  });

  signOutBtn?.addEventListener('click', () => {
    dispatch('auth:sign-out');
  });

  updateComposer();
}