let backgroundPlayer: HTMLAudioElement | null = null;
let toggleButton: HTMLElement | null = null;
let hasUserInteracted = false;
let isMusicPlaying = false;
let isInitialized = false;

const ACTIVATION_EVENTS = ['pointerdown', 'keydown', 'click'] as const;

function bind(): void {
  backgroundPlayer = document.getElementById('background-music') as HTMLAudioElement | null;
  toggleButton = document.getElementById('music-toggle');
  if (backgroundPlayer && toggleButton) attachToggleListener();
}

function syncButtonState(playing: boolean): void {
  isMusicPlaying = playing;
  toggleButton?.classList.toggle('is-playing', playing);
  toggleButton?.setAttribute('aria-pressed', String(playing));
  toggleButton?.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
}

function play(): void {
  backgroundPlayer?.play()
    .then(() => syncButtonState(true))
    .catch(() => syncButtonState(false));
}

function pause(): void {
  backgroundPlayer?.pause();
  syncButtonState(false);
}

function removeActivationListeners(): void {
  for (const eventName of ACTIVATION_EVENTS) {
    document.removeEventListener(eventName, onUserActivation, true);
  }
}

function isToggleButtonEvent(event: Event): boolean {
  if (!toggleButton) return false;
  const target = event.target;
  return target instanceof Node && toggleButton.contains(target);
}

function onUserActivation(event: Event): void {
  if (hasUserInteracted) return;
  if (isToggleButtonEvent(event)) return;
  hasUserInteracted = true;
  removeActivationListeners();
  play();
}

function attachToggleListener(): void {
  if (!toggleButton || toggleButton.dataset.bound === 'true') return;
  toggleButton.dataset.bound = 'true';
  toggleButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!hasUserInteracted) {
      hasUserInteracted = true;
      removeActivationListeners();
    }
    isMusicPlaying ? pause() : play();
  });
}

function onPageLoad(): void {
  bind();
  if (isMusicPlaying && toggleButton) {
    toggleButton.classList.remove('is-playing');
    void toggleButton.offsetWidth;
    toggleButton.classList.add('is-playing');
  }
}

export function initMusic(): void {
  if (isInitialized) return;
  isInitialized = true;

  for (const eventName of ACTIVATION_EVENTS) {
    document.addEventListener(eventName, onUserActivation, { capture: true, passive: true });
  }

  bind();
  document.addEventListener('astro:page-load', onPageLoad);
}