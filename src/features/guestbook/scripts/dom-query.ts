export const queryElement = <T extends HTMLElement>(selector: string): T | null =>
  document.querySelector(selector) as T | null;

export const queryElements = (selector: string): HTMLElement[] =>
  Array.from(document.querySelectorAll(selector)) as HTMLElement[];