import { queryElement } from './dom-query';
import { listen, dispatch } from './event-bus';
import { escapeHtml, formatRelativeTime, buildAvatarMarkup } from './utils';
import type { VisitorMessage } from './types';

function renderEmptyState(detailElement: HTMLElement): void {
  detailElement.setAttribute('aria-busy', 'false');
  detailElement.innerHTML = `
    <div class="flex-1 grid place-items-center px-6 py-10 text-center">
      <div>
        <svg class="w-7 h-7 text-neutral-400 dark:text-neutral-500 mx-auto mb-3 block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p class="text-[13.5px] text-neutral-400 dark:text-neutral-500 max-w-[34ch] m-0">
          Tap a visitor on the left to read their message.
        </p>
      </div>
    </div>
  `;
}

function renderVisitorDetail(detailElement: HTMLElement, visitor: VisitorMessage): void {
  detailElement.setAttribute('aria-busy', 'false');
  const messageHtml = escapeHtml(visitor.message.trim()).replace(/\n/g, '<br>');
  detailElement.innerHTML = `
    <div class="flex-1 min-h-0 overflow-y-auto px-7 pt-[26px] pb-[22px] max-[520px]:px-5 max-[520px]:pt-5 max-[520px]:pb-4">
      <div class="flex items-center justify-between gap-[22px] max-[520px]:gap-4 pb-5 max-[520px]:pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div class="min-w-0">
          <div class="text-[21px] max-[520px]:text-[18px] font-semibold tracking-tight leading-[1.2] text-neutral-900 dark:text-white [overflow-wrap:anywhere]">
            ${escapeHtml(visitor.name)}
          </div>
        </div>
        ${buildAvatarMarkup(visitor.name, visitor.picture, 'w-[76px] h-[76px] text-[22px] max-[520px]:w-16 max-[520px]:h-16 max-[520px]:text-[19px]')}
      </div>
      <div class="pt-4">
        <div class="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-400 dark:text-neutral-500 mb-1.5">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Message
        </div>
        <div class="text-left text-[14.5px] leading-[1.7] text-neutral-600 dark:text-neutral-400 [overflow-wrap:anywhere]">${messageHtml}</div>
      </div>
    </div>
    <div class="shrink-0 px-7 max-[520px]:px-5 pt-3.5 max-[520px]:pt-3 pb-[18px] max-[520px]:pb-[15px] text-[12.5px] text-neutral-400 dark:text-neutral-500 flex items-center gap-3 border-t border-neutral-200 dark:border-neutral-800">
      <span class="flex-1 h-px bg-neutral-200 dark:bg-neutral-800"></span>
      <span>${escapeHtml(formatRelativeTime(visitor.createdAt))}</span>
      <span class="flex-1 h-px bg-neutral-200 dark:bg-neutral-800"></span>
    </div>
  `;
}

export function setupDetailPanel(): void {
  const detailElement = queryElement<HTMLElement>('#detail');
  if (!detailElement) return;

  listen<{ id: number | null }>('visitor:selected', ({ id }) => {
    if (id === null) {
      renderEmptyState(detailElement);
      return;
    }
    dispatch('visitor:request-single', { id });
  });

  listen<{ message: VisitorMessage | null }>('visitor:single-data', ({ message }) => {
    if (!message) {
      renderEmptyState(detailElement);
      return;
    }
    renderVisitorDetail(detailElement, message);
  });

  renderEmptyState(detailElement);
}