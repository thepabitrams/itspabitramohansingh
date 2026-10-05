const ACTIVATION_EVENTS = ['touchend', 'click'] as const;

let backgroundPlayer: HTMLAudioElement | null = null;
let toggleButton: HTMLElement | null = null;
let isMusicPlaying = false;
let isInitialized = false;
let playInFlight = false;

function bind(): void {
  backgroundPlayer = document.getElementById('background-music') as HTMLAudioElement | null;
  toggleButton = document.getElementById('music-toggle');
  if (backgroundPlayer && toggleButton) {
    attachToggleListener();
  }
}

function syncButtonState(playing: boolean): void {
  isMusicPlaying = playing;
  toggleButton?.classList.toggle('is-playing', playing);
  toggleButton?.setAttribute('aria-pressed', String(playing));
  toggleButton?.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
}

function tryPlay(): void {
  if (!backgroundPlayer || playInFlight) return;
  playInFlight = true;

  backgroundPlayer.muted = false;

  const playPromise = backgroundPlayer.play();

  if (!playPromise || typeof playPromise.then !== 'function') {
    playInFlight = false;
    syncButtonState(true);
    removeActivationListeners();
    return;
  }

  playPromise
    .then(() => {
      playInFlight = false;
      syncButtonState(true);
      removeActivationListeners();
    })
    .catch((err) => {
      playInFlight = false;
      console.warn('[music] play() rejected:', err);
      syncButtonState(false);
    });
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
  if (isMusicPlaying || isToggleButtonEvent(event)) return;
  tryPlay();
}

function attachToggleListener(): void {
  if (!toggleButton || toggleButton.dataset.bound === 'true') return;
  toggleButton.dataset.bound = 'true';
  toggleButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (isMusicPlaying) {
      pause();
    } else {
      tryPlay();
    }
  });
}

function onPageLoad(): void {
  bind();
  const actuallyPlaying = !!backgroundPlayer && !backgroundPlayer.paused;
  syncButtonState(actuallyPlaying);
}

export function initMusic(): void {
  if (isInitialized) return;
  isInitialized = true;

  for (const eventName of ACTIVATION_EVENTS) {
    document.addEventListener(eventName, onUserActivation, {
      capture: true,
      passive: true,
    });
  }

  bind();
  document.addEventListener('astro:page-load', onPageLoad);
}