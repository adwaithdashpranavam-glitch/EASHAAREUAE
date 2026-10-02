export function getNextCheckTime(now, bestTimes) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new TypeError('now must be a valid Date');
  }

  const slots = bestTimes
    .map((t) => {
      const [h, m] = t.split(':').map(Number);
      if (
        !Number.isInteger(h) ||
        !Number.isInteger(m) ||
        h < 0 || h > 23 || m < 0 || m > 59
      ) {
        throw new TypeError(`Invalid time: ${t}`);
      }
      const candidate = new Date(now);
      candidate.setHours(h, m, 0, 0);
      return candidate;
    })
    .sort((a, b) => a - b);

  const nextToday = slots.find((d) => d.getTime() > now.getTime());
  if (nextToday) return nextToday;

  const nextDay = new Date(slots[0]);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
}

export function formatCountdown(ms) {
  if (ms <= 0) return 'NOW';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

export function calculateChecklistProgress(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const completed = items.filter(Boolean).length;
  const total = items.length;
  const percent = Math.round((completed / total) * 100);

  return { completed, total, percent };
}

export function truncateLog(logEntries, max = 30) {
  if (!Array.isArray(logEntries)) {
    throw new TypeError('logEntries must be an array');
  }
  return logEntries.slice(0, max);
}

export function renderChecklist({ items, percentEl, progressBarEl }) {
  const { percent } = calculateChecklistProgress(items);
  const value = `${percent}%`;
  percentEl.textContent = value;
  progressBarEl.style.width = value;
}
