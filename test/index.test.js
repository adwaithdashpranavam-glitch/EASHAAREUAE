import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as checklist from 'eashaareuae';

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);

test('package metadata declares the public entry point', () => {
  assert.equal(packageJson.main, './src/index.js');
  assert.equal(packageJson.exports['.'], './src/index.js');
});

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
