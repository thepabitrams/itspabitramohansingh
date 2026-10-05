import { queryElement } from './dom-query';
import { dispatch, listen } from './event-bus';
import { escapeHtml, buildAvatarMarkup } from './utils';
import type { VisitorMessage } from './types';

export function setupVisitorGrid(): void {
  const visitorGridElement = queryElement<HTMLElement>('#visitorGrid');

  listen<{ messages: VisitorMessage[]; activeId: number | null }>(
    'visitor:list-updated',
    ({ messages, activeId }) => {
      if (!visitorGridElement) return;
      visitorGridElement.innerHTML = messages
        .map((visitor) => {
          const isActive = visitor.id === activeId;
          const ringClass = isActive
            ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-neutral-900'
            : 'group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-blue-300 dark:group-hover:ring-offset-neutral-900';
          return `
            <button
              type="button"
              role="listitem"
              data-id="${visitor.id}"
              aria-pressed="${isActive}"
              title="${escapeHtml(visitor.name)}"
              class="vbtn group relative border-0 bg-transparent p-0 flex flex-col items-center gap-2 rounded-[10px] cursor-pointer font-inherit text-inherit transition-transform duration-[120ms] hover:-translate-y-0.5"
            >
              <span class="relative grid place-items-center">
                <span class="inline-block rounded-full transition-shadow duration-[140ms] ${ringClass}">
                  ${buildAvatarMarkup(visitor.name, visitor.picture, 'w-[52px] h-[52px] text-[14px] max-[520px]:w-12 max-[520px]:h-12 max-[520px]:text-[13px]')}
                </span>
              </span>
              <span class="text-[11.5px] max-[520px]:text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-[1.35] text-center w-full min-h-[2.7em] line-clamp-3 [overflow-wrap:anywhere] [word-break:break-word] transition-colors group-hover:text-neutral-900 dark:group-hover:text-white">
                ${escapeHtml(visitor.name)}
              </span>
            </button>
          `;
        })
        .join('');
    }
  );

  listen<{ id: number | null }>('visitor:active-changed', ({ id }) => {
    document.querySelectorAll('.vbtn').forEach((buttonNode) => {
      const buttonElement = buttonNode as HTMLElement;
      buttonElement.setAttribute(
        'aria-pressed',
        String(Number(buttonElement.dataset.id) === id)
      );
    });
  });

  visitorGridElement?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const visitorButton = target.closest('.vbtn') as HTMLElement | null;
    if (!visitorButton) return;
    const visitorId = Number(visitorButton.dataset.id);
    if (Number.isFinite(visitorId)) dispatch('visitor:selected', { id: visitorId });
  });

  dispatch('visitor:request-data');
}