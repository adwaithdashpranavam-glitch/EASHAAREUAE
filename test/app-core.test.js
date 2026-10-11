import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateChecklistProgress, formatCountdown, getNextCheckTime, truncateLogs } from '../app-core.js';

const local = (iso) => new Date(iso);
test('selects the first future time', () => assert.equal(getNextCheckTime(local('2026-01-05T08:00:00'), ['07:00', '09:30']).getHours(), 9));
test('selects the current boundary at 07:00', () => assert.equal(getNextCheckTime(local('2026-01-05T07:00:00'), ['07:00', '09:30']).getHours(), 7));
test('selects the current boundary at 09:30', () => assert.equal(getNextCheckTime(local('2026-01-05T09:30:00'), ['07:00', '09:30']).getMinutes(), 30));
test('rolls past times to tomorrow', () => assert.equal(getNextCheckTime(local('2026-01-05T10:00:00'), ['07:00', '09:30']).getDate(), 6));
test('returns null without check times', () => assert.equal(getNextCheckTime(new Date(), []), null));
test('countdown displays NOW at and below zero', () => { assert.equal(formatCountdown(0), 'NOW'); assert.equal(formatCountdown(-10), 'NOW'); });
test('countdown rounds partial seconds up', () => assert.equal(formatCountdown(3_600_001), '01:00:01'));
test('checklist percentage is deterministic', () => { assert.equal(calculateChecklistProgress([true, false, true, false]), 50); assert.equal(calculateChecklistProgress([]), 0); });
test('log truncation keeps newest entries and caps at 30', () => { const logs = Array.from({ length: 35 }, (_, id) => ({ id })); assert.deepEqual(truncateLogs(logs).map(({ id }) => id), Array.from({ length: 30 }, (_, id) => id)); });
