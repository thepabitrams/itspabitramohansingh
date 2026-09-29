export const esc = (str: string): string =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const initials = (name: string): string => {
  const parts = String(name).trim().split(/\s+/);
  if (!parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const HUES: number[] = [210, 160, 28, 340, 280, 190, 130, 250, 12, 300];

const hueFor = (name: string): number => {
  let h = 0;
  const s = String(name);
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return HUES[Math.abs(h) % HUES.length];
};

export const avaStyle = (name: string): string => {
  const h = hueFor(name);
  return `background:hsl(${h} 32% 92%);color:hsl(${h} 32% 34%)`;
};

export const relTime = (ts: number): string => {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 45) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const isUsablePicture = (picture: string | null | undefined): boolean => {
  if (!picture) return false;
  const trimmed = picture.trim();
  if (trimmed === '') return false;
  if (trimmed.includes('default-user')) return false;
  if (trimmed.includes('default_profile')) return false;
  if (trimmed.includes('photo.jpg')) return false;
  return true;
};

export const avatarMarkup = (
  name: string,
  picture: string | null,
  sizeClass: string
): string => {
  const base = `shrink-0 grid place-items-center rounded-full overflow-hidden select-none font-semibold tracking-wide ${sizeClass}`;

  if (isUsablePicture(picture)) {
    return `<span class="${base}"><img src="${esc(picture!)}" alt="" class="w-full h-full object-cover" data-fallback-name="${esc(name)}" data-fallback-size="${sizeClass}" /></span>`;
  }

  return `<span class="${base}" style="${avaStyle(name)}">${esc(initials(name))}</span>`;
};

export function setupAvatarFallback(): void {
  document.addEventListener(
    'error',
    (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'IMG') return;

      const img = target as HTMLImageElement;
      const name = img.dataset.fallbackName;
      const sizeClass = img.dataset.fallbackSize;
      if (!name || !sizeClass) return;

      const base = `shrink-0 grid place-items-center rounded-full overflow-hidden select-none font-semibold tracking-wide ${sizeClass}`;
      const parent = img.parentElement;
      if (parent) {
        parent.className = base;
        parent.style.cssText = avaStyle(name);
        parent.textContent = initials(name);
        parent.removeAttribute('data-fallback-name');
        parent.removeAttribute('data-fallback-size');
      }
    },
    true
  );
}

export const MAX_CHARS = 500;