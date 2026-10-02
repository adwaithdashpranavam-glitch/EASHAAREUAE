import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateChecklistProgress,
  formatCountdown,
  getNextCheckTime,
  renderChecklist,
  truncateLog,
} from '../src/checklist.js';

const bestTimes = ['07:00', '09:30', '12:00'];

test('getNextCheckTime returns next slot on exact boundary', () => {
  const now = new Date('2026-05-11T07:00:00.000Z');
  assert.equal(getNextCheckTime(now, bestTimes).toISOString(), '2026-05-11T09:30:00.000Z');
});

test('getNextCheckTime returns same day next slot', () => {
  const now = new Date('2026-05-11T09:29:59.000Z');
  assert.equal(getNextCheckTime(now, bestTimes).toISOString(), '2026-05-11T09:30:00.000Z');
});

test('getNextCheckTime rolls to next day after last slot', () => {
  const now = new Date('2026-05-11T23:59:59.000Z');
  assert.equal(getNextCheckTime(now, bestTimes).toISOString(), '2026-05-12T07:00:00.000Z');
});

test('getNextCheckTime handles just after midnight', () => {
  const now = new Date('2026-05-11T00:00:01.000Z');
  assert.equal(getNextCheckTime(now, bestTimes).toISOString(), '2026-05-11T07:00:00.000Z');
});

test('formatCountdown returns NOW when ms <= 0', () => {
  assert.equal(formatCountdown(0), 'NOW');
  assert.equal(formatCountdown(-1), 'NOW');
});

test('truncateLog trims 31 entries down to 30', () => {
  const log = Array.from({ length: 31 }, (_, i) => `entry-${i + 1}`);
  const trimmed = truncateLog(log);
  assert.equal(trimmed.length, 30);
  assert.equal(trimmed.at(-1), 'entry-30');
});

test('renderChecklist integration updates percent text and progress width consistently', () => {
  const percentEl = { textContent: '' };
  const progressBarEl = { style: { width: '' } };

  renderChecklist({
    items: [true, false, true, true],
    percentEl,
    progressBarEl,
  });

  assert.equal(calculateChecklistProgress([true, false, true, true]).percent, 75);
  assert.equal(percentEl.textContent, '75%');
  assert.equal(progressBarEl.style.width, '75%');
});
