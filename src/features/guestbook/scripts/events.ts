export function dispatch<T = unknown>(name: string, detail?: T): void {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

export function listen<T = unknown>(
  name: string,
  handler: (detail: T) => void
): void {
  document.addEventListener(name, ((e: CustomEvent<T>) => {
    handler(e.detail);
  }) as EventListener);
}