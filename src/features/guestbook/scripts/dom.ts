export const $ = <T extends HTMLElement>(sel: string): T | null =>
  document.querySelector(sel) as T | null;

export const $$ = (sel: string): HTMLElement[] =>
  Array.from(document.querySelectorAll(sel)) as HTMLElement[];