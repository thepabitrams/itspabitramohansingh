import { queryElement } from './dom-query';
import { listen } from './event-bus';

export function setupToaster(): void {
  const toastContainer = queryElement<HTMLElement>('#toasts');
  if (!toastContainer) return;

  listen<{ text: string }>('toast:show', ({ text }) => {
    const toastElement = document.createElement('div');
    toastElement.setAttribute('role', 'status');
    toastElement.className =
      'pointer-events-auto px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-[13.5px] shadow-lg opacity-0 translate-y-2 transition-[opacity,transform] duration-150';
    toastElement.textContent = text;
    toastContainer.appendChild(toastElement);
    requestAnimationFrame(() =>
      toastElement.classList.remove('opacity-0', 'translate-y-2')
    );
    setTimeout(() => {
      toastElement.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toastElement.remove(), 200);
    }, 2800);
  });
}