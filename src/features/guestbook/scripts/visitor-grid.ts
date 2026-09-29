import { $ } from './dom';
import { dispatch, listen } from './events';
import { esc, avatarMarkup } from './utils';
import type { VisitorMessage } from './types';

export function setupVisitorGrid(): void {
  const grid = $<HTMLElement>('#visitorGrid');

  listen<{ messages: VisitorMessage[]; activeId: number | null }>(
    'visitor:list-updated',
    ({ messages, activeId }) => {
      if (!grid) return;
      grid.innerHTML = messages
        .map((v) => {
          const isActive = v.id === activeId;
          const ringClass = isActive
            ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-neutral-900'
            : 'group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-blue-300 dark:group-hover:ring-offset-neutral-900';
          return `
            <button
              type="button"
              role="listitem"
              data-id="${v.id}"
              aria-pressed="${isActive}"
              title="${esc(v.name)}"
              class="vbtn group relative border-0 bg-transparent p-0 flex flex-col items-center gap-2 rounded-[10px] cursor-pointer font-inherit text-inherit transition-transform duration-[120ms] hover:-translate-y-0.5"
            >
              <span class="relative grid place-items-center">
                <span class="inline-block rounded-full transition-shadow duration-[140ms] ${ringClass}">
                  ${avatarMarkup(v.name, v.picture, 'w-[52px] h-[52px] text-[14px] max-[520px]:w-12 max-[520px]:h-12 max-[520px]:text-[13px]')}
                </span>
              </span>
              <span class="text-[11.5px] max-[520px]:text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-[1.35] text-center w-full min-h-[2.7em] line-clamp-3 [overflow-wrap:anywhere] [word-break:break-word] transition-colors group-hover:text-neutral-900 dark:group-hover:text-white">
                ${esc(v.name)}
              </span>
            </button>
          `;
        })
        .join('');
    }
  );

  listen<{ id: number | null }>('visitor:active-changed', ({ id }) => {
    document.querySelectorAll('.vbtn').forEach((b) => {
      const btn = b as HTMLElement;
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.id) === id));
    });
  });

  grid?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('.vbtn') as HTMLElement | null;
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (Number.isFinite(id)) dispatch('visitor:selected', { id });
  });

  dispatch('visitor:request-data');
}