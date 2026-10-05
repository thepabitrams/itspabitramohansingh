import { queryElement, queryElements } from './dom-query';
import { dispatch } from './event-bus';

export function setupSignInModal(): void {
  const modalElement = queryElement<HTMLElement>('#modal');
  const closeButton = queryElement<HTMLButtonElement>('#modalClose');
  let lastFocusedElement: HTMLElement | null = null;

  function openModal(): void {
    if (!modalElement || !closeButton) return;
    lastFocusedElement = document.activeElement as HTMLElement | null;
    modalElement.hidden = false;
    void modalElement.offsetWidth;
    modalElement.classList.remove('opacity-0', 'invisible');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeButton.focus(), 60);
  }

  function closeModal(): void {
    if (!modalElement) return;
    modalElement.classList.add('opacity-0', 'invisible');
    document.body.style.overflow = '';
    setTimeout(() => {
      modalElement.hidden = true;
      if (lastFocusedElement?.focus) lastFocusedElement.focus();
    }, 180);
  }

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.id === 'signInBtn') openModal();
  });

  closeButton?.addEventListener('click', closeModal);

  modalElement?.addEventListener('click', (event) => {
    if (event.target === modalElement) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      modalElement &&
      !modalElement.hidden &&
      !modalElement.classList.contains('invisible')
    ) {
      closeModal();
    }
  });

  queryElements('.provider').forEach((providerButton) => {
    providerButton.addEventListener('click', () => {
      const provider = providerButton.dataset.provider;
      if (provider !== 'google' && provider !== 'github') return;
      dispatch('auth:sign-in-requested', { provider });
    });
  });
}