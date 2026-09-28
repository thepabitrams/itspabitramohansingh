let bgPlayer: HTMLAudioElement | null = null;
let toggleBtn: HTMLElement | null = null;
let hasUserInteracted = false;
let isMusicPlaying = false;
let initialized = false;

const ACTIVATION_EVENTS = ['click', 'keydown', 'touchend', 'mousedown'] as const;
const MOUSE_POINTER_TYPE = 'mouse';

function bind(): void {
  bgPlayer = document.getElementById('bg-music') as HTMLAudioElement | null;
  toggleBtn = document.getElementById('music-toggle');
  if (bgPlayer && toggleBtn) attachToggleListener();
}

function reflect(playing: boolean): void {
  isMusicPlaying = playing;
  toggleBtn?.classList.toggle('is-playing', playing);
  toggleBtn?.setAttribute('aria-pressed', String(playing));
  toggleBtn?.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
}

function play(): void {
  bgPlayer?.play().then(() => reflect(true)).catch(() => reflect(false));
}

function pause(): void {
  bgPlayer?.pause();
  reflect(false);
}

function removeActivationListeners(): void {
  ACTIVATION_EVENTS.forEach((e) =>
    document.removeEventListener(e, onUserActivation, true)
  );
  document.removeEventListener('pointerdown', onPointerDown, true);
  document.removeEventListener('pointerup', onPointerUp, true);
}

function onUserActivation(): void {
  if (hasUserInteracted) return;
  hasUserInteracted = true;
  removeActivationListeners();
  play();
}

function onPointerDown(e: PointerEvent): void {
  if (e.pointerType !== MOUSE_POINTER_TYPE) return;
  onUserActivation();
}

function onPointerUp(e: PointerEvent): void {
  if (e.pointerType === MOUSE_POINTER_TYPE) return;
  onUserActivation();
}

function attachToggleListener(): void {
  if (!toggleBtn || toggleBtn.dataset.bound === 'true') return;
  toggleBtn.dataset.bound = 'true';
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!hasUserInteracted) {
      hasUserInteracted = true;
      removeActivationListeners();
    }
    isMusicPlaying ? pause() : play();
  });
}

function onPageLoad(): void {
  bind();
  if (isMusicPlaying && toggleBtn) {
    toggleBtn.classList.remove('is-playing');
    void toggleBtn.offsetWidth;
    toggleBtn.classList.add('is-playing');
  }
}

export function initMusic(): void {
  if (initialized) return;
  initialized = true;

  ACTIVATION_EVENTS.forEach((e) =>
    document.addEventListener(e, onUserActivation, { capture: true, passive: true })
  );
  document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
  document.addEventListener('pointerup', onPointerUp, { capture: true, passive: true });

  bind();
  document.addEventListener('astro:page-load', onPageLoad);
}