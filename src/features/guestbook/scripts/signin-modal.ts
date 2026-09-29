import { $, $$ } from './dom';
import { dispatch } from './events';

export function setupSignInModal(): void {
  const modal = $<HTMLElement>('#modal');
  const modalClose = $<HTMLButtonElement>('#modalClose');
  let lastFocused: HTMLElement | null = null;

  function open(): void {
    if (!modal || !modalClose) return;
    lastFocused = document.activeElement as HTMLElement | null;
    modal.hidden = false;
    void modal.offsetWidth;
    modal.classList.remove('opacity-0', 'invisible');
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalClose.focus(), 60);
  }

  function close(): void {
    if (!modal) return;
    modal.classList.add('opacity-0', 'invisible');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.hidden = true;
      if (lastFocused?.focus) lastFocused.focus();
    }, 180);
  }

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.id === 'signInBtn') open();
  });

  modalClose?.addEventListener('click', close);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' &&
      modal &&
      !modal.hidden &&
      !modal.classList.contains('invisible')
    ) {
      close();
    }
  });

  $$('.provider').forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.dataset.provider;
      if (provider !== 'google' && provider !== 'github') return;
      dispatch('auth:sign-in-requested', { provider });
    });
  });
}