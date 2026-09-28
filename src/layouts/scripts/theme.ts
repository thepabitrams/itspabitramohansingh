let isInitialized = false;

function applyFromStorage(): void {
  const storedTheme = localStorage.getItem('theme');
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = storedTheme === 'dark' || (!storedTheme && prefersDarkMode);
  document.documentElement.classList.toggle('dark', isDark);
}

function bind(): void {
  const toggleButton = document.getElementById('theme-toggle');
  if (!toggleButton || toggleButton.dataset.bound === 'true') return;
  toggleButton.dataset.bound = 'true';
  toggleButton.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

function onPageLoad(): void {
  bind();
}

export function initTheme(): void {
  if (isInitialized) return;
  isInitialized = true;
  applyFromStorage();
  bind();
  document.addEventListener('astro:page-load', onPageLoad);
  document.addEventListener('astro:after-swap', applyFromStorage);
}