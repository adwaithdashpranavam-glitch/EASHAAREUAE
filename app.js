import { calculateChecklistProgress, formatCountdown, getNextCheckTime, truncateLogs } from './app-core.js';

const BEST_TIMES = ['07:00', '09:30', '12:00', '15:30'];
const CHECK_ITEMS = ['Identity document is ready', 'Required reference numbers are nearby', 'Contact details are current', 'Enough uninterrupted time is available'];

const reportError = (context, error) => console.warn(`[appointment-companion] ${context}`, error instanceof Error ? error.message : String(error));
const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (error) { reportError(`Could not read ${key}`, error); return fallback; } };
const writeJSON = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { reportError(`Could not save ${key}`, error); } };

export function renderChecklist(container, progressText, progressBar, state) {
  try {
    container.replaceChildren(...CHECK_ITEMS.map((text, index) => {
      const label = document.createElement('label'); label.className = 'check-item';
      const input = document.createElement('input'); input.type = 'checkbox'; input.checked = Boolean(state[index]); input.dataset.index = String(index);
      label.append(input, document.createTextNode(text)); return label;
    }));
    const percent = calculateChecklistProgress(CHECK_ITEMS.map((_, index) => Boolean(state[index])));
    progressText.textContent = `${percent}% ready`; progressBar.style.width = `${percent}%`;
  } catch (error) { reportError('Checklist rendering failed', error); }
}

function startApp() {
  const byId = (id) => document.getElementById(id);
  let checks = readJSON('checklist', []); let logs = truncateLogs(readJSON('attemptLogs', []));
  const checklist = byId('checklist');
  const refreshChecklist = () => renderChecklist(checklist, byId('progress-text'), byId('progress-bar'), checks);
  refreshChecklist();
  checklist.addEventListener('change', ({ target }) => { if (target.matches('input[type="checkbox"]')) { checks[Number(target.dataset.index)] = target.checked; writeJSON('checklist', checks); refreshChecklist(); } });
  byId('reset-checklist').addEventListener('click', () => { checks = []; writeJSON('checklist', checks); refreshChecklist(); });

  const renderLogs = () => {
    const list = byId('log-list'); list.replaceChildren();
    if (!logs.length) { const item = document.createElement('li'); item.className = 'empty'; item.textContent = 'No attempts logged yet.'; list.append(item); return; }
    logs.forEach(({ result, timestamp }) => { const item = document.createElement('li'); item.className = 'log-item'; const resultNode = document.createElement('strong'); resultNode.textContent = result; const time = document.createElement('time'); time.dateTime = timestamp; time.textContent = new Date(timestamp).toLocaleString(); item.append(resultNode, time); list.append(item); });
  };
  renderLogs();
  document.querySelectorAll('[data-result]').forEach((button) => button.addEventListener('click', () => { logs = truncateLogs([{ result: button.dataset.result, timestamp: new Date().toISOString() }, ...logs]); writeJSON('attemptLogs', logs); renderLogs(); button.textContent = 'Logged ✓'; setTimeout(() => { button.textContent = button.dataset.result === 'Slot seen' ? 'Log slot seen' : 'Log no slot'; }, 1200); }));
  byId('clear-logs').addEventListener('click', () => { logs = []; writeJSON('attemptLogs', logs); renderLogs(); });

  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => { document.querySelectorAll('.tab').forEach((item) => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); byId(item.getAttribute('aria-controls')).hidden = !active; }); }));
  const updateCountdown = () => { const now = new Date(); const next = getNextCheckTime(now, BEST_TIMES); byId('countdown').textContent = formatCountdown(next - now); byId('next-time').textContent = `Next window: ${next.toLocaleString([], { weekday:'short', hour:'2-digit', minute:'2-digit' })}`; };
  updateCountdown(); setInterval(updateCountdown, 1000);

  let installPrompt;
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPrompt = event; if (!sessionStorage.getItem('installDismissed')) byId('install-banner').hidden = false; });
  byId('dismiss-install').addEventListener('click', () => { byId('install-banner').hidden = true; sessionStorage.setItem('installDismissed', '1'); });
  byId('install-app').addEventListener('click', async () => { if (installPrompt) { await installPrompt.prompt(); installPrompt = null; byId('install-banner').hidden = true; } });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch((error) => reportError('Service worker registration failed', error));
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') startApp();
