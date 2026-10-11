/** Return the next check time, including a check exactly at `now`. */
export function getNextCheckTime(now, bestTimes) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new TypeError('now must be a valid Date');
  if (!Array.isArray(bestTimes) || bestTimes.length === 0) return null;

  const candidates = bestTimes.map((time) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new TypeError(`Invalid time: ${time}`);
    const [hours, minutes] = time.split(':').map(Number);
    const candidate = new Date(now);
    candidate.setHours(hours, minutes, 0, 0);
    return candidate;
  }).sort((a, b) => a - b);

  return candidates.find((candidate) => candidate >= now) ?? new Date(candidates[0].getTime() + 86_400_000);
}

export function formatCountdown(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return 'NOW';
  const seconds = Math.ceil(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function calculateChecklistProgress(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return Math.round((items.filter(Boolean).length / items.length) * 100);
}

export function truncateLogs(logs, maximum = 30) {
  if (!Array.isArray(logs)) return [];
  return logs.slice(0, Math.max(0, maximum));
}
