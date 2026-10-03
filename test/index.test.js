import test from 'node:test';
import assert from 'node:assert/strict';
import * as checklist from 'eashaareuae';

test('package entry point exports all checklist helpers', () => {
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
