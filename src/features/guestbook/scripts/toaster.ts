import { $ } from './dom';
import { listen } from './events';

export function setupToaster(): void {
  const container = $<HTMLElement>('#toasts');
  if (!container) return;

  listen<{ text: string }>('toast:show', ({ text }) => {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.className =
      'pointer-events-auto px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-[13.5px] shadow-lg opacity-0 translate-y-2 transition-[opacity,transform] duration-150';
    el.textContent = text;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.remove('opacity-0', 'translate-y-2'));
    setTimeout(() => {
      el.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => el.remove(), 200);
    }, 2800);
  });
}