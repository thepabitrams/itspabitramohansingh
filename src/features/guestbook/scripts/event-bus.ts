type TrackedListener = { name: string; handler: EventListener };

const trackedListeners: TrackedListener[] = [];

export function dispatch<T = unknown>(name: string, detail?: T): void {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

export function listen<T = unknown>(
  name: string,
  handler: (detail: T) => void
): void {
  const listener = ((event: CustomEvent<T>) => {
    handler(event.detail);
  }) as EventListener;
  document.addEventListener(name, listener);
  trackedListeners.push({ name, handler: listener });
}

export function removeAllListeners(): void {
  for (const { name, handler } of trackedListeners) {
    document.removeEventListener(name, handler);
  }
  trackedListeners.length = 0;
}