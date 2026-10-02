import test from 'node:test';
import assert from 'node:assert/strict';
import * as checklist from '../src/index.js';

test('index exports all checklist helpers', () => {
  const expected = [
    'getNextCheckTime',
    'formatCountdown',
    'calculateChecklistProgress',
    'truncateLog',
    'renderChecklist',
  ];

  expected.forEach((name) => {
    assert.equal(typeof checklist[name], 'function');
  });
});
