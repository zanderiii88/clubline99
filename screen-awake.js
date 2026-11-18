// The preference survives navigation. The lock belongs only to the visible page.
const preference = 'clubline-keep-screen-on';
let enabled = false;
try { enabled = localStorage.getItem(preference) === 'on'; } catch {}
let lock = null;
let requesting = false;
let generation = 0;
let message = '';
let pageActive = true;
const supported = window.parent === window && Boolean(navigator.wakeLock?.request);
const wanted = () => supported && enabled && pageActive && !document.hidden;

function refresh() {
  for (const control of document.querySelectorAll('club-screen-awake')) control.update();
}

async function syncLock() {
  if (!wanted()) {
    generation++;
    const previous = lock;
    lock = null;
    if (previous) await previous.release().catch(() => {});
    refresh();
    return;
  }
  if (lock || requesting) return;
  const requestGeneration = generation;
  requesting = true;
  try {
    const acquired = await navigator.wakeLock.request('screen');
    if (!wanted() || requestGeneration !== generation) {
      await acquired.release();
    } else {
      lock = acquired;
      message = '';
      acquired.addEventListener('release', () => {
        if (lock !== acquired) return;
        lock = null;
        message = 'The device released the screen lock.';
        refresh();
      });
    }
  } catch {
    message = 'The device could not keep the screen awake.';
  } finally {
    requesting = false;
    refresh();
    if (wanted() && requestGeneration !== generation) void syncLock();
  }
}

customElements.define('club-screen-awake', class extends HTMLElement {
  connectedCallback() {
    if (!this.firstElementChild) {
      this.innerHTML = '<label><input type="checkbox"> Keep screen on while playing</label><small role="status"></small>';
      this.querySelector('input').onchange = event => {
        enabled = event.target.checked;
        message = '';
        try { localStorage.setItem(preference, enabled ? 'on' : 'off'); } catch {}
        void syncLock();
      };
    }
    this.update();
  }
  update() {
    const input = this.querySelector('input');
    if (!input) return;
    input.checked = enabled;
    input.disabled = !supported;
    this.querySelector('small').textContent = !supported ? 'Screen wake lock is unavailable in this browser.'
      : enabled ? lock ? 'Screen awake' : message || 'Requesting screen lock…' : '';
  }
});

document.addEventListener('visibilitychange', syncLock);
window.addEventListener('pageshow', () => { pageActive = true; void syncLock(); });
window.addEventListener('pagehide', () => { pageActive = false; void syncLock(); });
void syncLock();
