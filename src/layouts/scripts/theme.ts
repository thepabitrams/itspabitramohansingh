let initialized = false;

function applyFromStorage(): void {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = stored === 'dark' || (!stored && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
}

function bind(): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn || btn.dataset.bound === 'true') return;
  btn.dataset.bound = 'true';
  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

function onPageLoad(): void {
  bind();
}

export function initTheme(): void {
  if (initialized) return;
  initialized = true;
  applyFromStorage();
  bind();
  document.addEventListener('astro:page-load', onPageLoad);
}