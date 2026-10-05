export const escapeHtml = (input: string): string =>
  String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const getInitials = (name: string): string => {
  const parts = String(name).trim().split(/\s+/);
  if (!parts[0]) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AVATAR_HUES: readonly number[] = [210, 160, 28, 340, 280, 190, 130, 250, 12, 300];

const computeHue = (name: string): number => {
  let hash = 0;
  const source = String(name);
  for (let index = 0; index < source.length; index++) {
    hash = source.charCodeAt(index) + ((hash << 5) - hash);
  }
  return AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length];
};

export const getAvatarStyle = (name: string): string => {
  const hue = computeHue(name);
  return `background:hsl(${hue} 32% 92%);color:hsl(${hue} 32% 34%)`;
};

export const formatRelativeTime = (timestamp: number): string => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 45) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const isUsablePicture = (picture: string | null | undefined): boolean => {
  if (!picture) return false;
  const trimmed = picture.trim();
  if (trimmed === '') return false;
  if (trimmed.includes('default-user')) return false;
  if (trimmed.includes('default_profile')) return false;
  if (trimmed.includes('photo.jpg')) return false;
  return true;
};

export const buildAvatarMarkup = (
  name: string,
  picture: string | null,
  sizeClass: string
): string => {
  const baseClass = `shrink-0 grid place-items-center rounded-full overflow-hidden select-none font-semibold tracking-wide ${sizeClass}`;

  if (isUsablePicture(picture)) {
    return `<span class="${baseClass}"><img src="${escapeHtml(picture!)}" alt="" class="w-full h-full object-cover" data-fallback-name="${escapeHtml(name)}" data-fallback-size="${sizeClass}" /></span>`;
  }

  return `<span class="${baseClass}" style="${getAvatarStyle(name)}">${escapeHtml(getInitials(name))}</span>`;
};

export function setupAvatarFallback(): void {
  document.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName !== 'IMG') return;

      const imageElement = target as HTMLImageElement;
      const fallbackName = imageElement.dataset.fallbackName;
      const fallbackSize = imageElement.dataset.fallbackSize;
      if (!fallbackName || !fallbackSize) return;

      const baseClass = `shrink-0 grid place-items-center rounded-full overflow-hidden select-none font-semibold tracking-wide ${fallbackSize}`;
      const parentElement = imageElement.parentElement;
      if (parentElement) {
        parentElement.className = baseClass;
        parentElement.style.cssText = getAvatarStyle(fallbackName);
        parentElement.textContent = getInitials(fallbackName);
        parentElement.removeAttribute('data-fallback-name');
        parentElement.removeAttribute('data-fallback-size');
      }
    },
    true
  );
}

export const MAX_CHARS = 500;