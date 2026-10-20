import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePlayerProgress,
  computeSkillProfile,
  slideAndMergeRow,
  evaluateWordleGuess,
  findBestTicTacToeMove,
} from './gameRules.ts';

test('calculatePlayerProgress handles 0 and low XP', () => {
  const p0 = calculatePlayerProgress(0);
  assert.equal(p0.level, 1);
  assert.equal(p0.progressPercent, 0);
  assert.equal(typeof p0.title, 'string');
});

test('calculatePlayerProgress advances levels properly', () => {
  const p1 = calculatePlayerProgress(500);
  assert.ok(p1.level >= 2);
  assert.ok(p1.progressPercent >= 0 && p1.progressPercent <= 100);
  assert.ok(p1.nextLevelXp > p1.currentLevelBaseXp);
});

test('computeSkillProfile returns balanced baseline when empty', () => {
  const stats = computeSkillProfile([]);
  assert.equal(stats.speed, 40);
  assert.equal(stats.reflex, 40);
  assert.equal(stats.logic, 40);
  assert.equal(stats.strategy, 40);
});

test('computeSkillProfile boosts reflex and speed with reflex/arcade plays', () => {
  const stats = computeSkillProfile([
    { genre: 'reflex', score: 100, durationSeconds: 60 },
    { genre: 'reflex', score: 120, durationSeconds: 60 },
    { genre: 'arcade', score: 200, durationSeconds: 120 },
  ]);
  assert.ok(stats.reflex > 40);
  assert.ok(stats.speed > 40);
});

test('slideAndMergeRow compresses and merges numbers correctly', () => {
  const { newRow: r1, scoreGained: s1 } = slideAndMergeRow([2, 2, 4, 8]);
  assert.deepEqual(r1, [4, 4, 8, 0]);
  assert.equal(s1, 4);

  const { newRow: r2, scoreGained: s2 } = slideAndMergeRow([0, 2, 0, 2]);
  assert.deepEqual(r2, [4, 0, 0, 0]);
  assert.equal(s2, 4);

  const { newRow: r3 } = slideAndMergeRow([4, 4, 4, 4]);
  assert.deepEqual(r3, [8, 8, 0, 0]);
});

test('evaluateWordleGuess scores matches accurately', () => {
  const result = evaluateWordleGuess('ROBOT', 'REACT');
  assert.equal(result[0], 'correct'); // R is correct
  assert.equal(result[1], 'absent');  // O absent
  assert.equal(result[2], 'absent');  // B absent
  assert.equal(result[3], 'absent');  // O absent
  assert.equal(result[4], 'correct'); // T is correct
});

test('findBestTicTacToeMove finds winning move for O', () => {
  const board = [
    'O', 'O', null,
    'X', 'X', null,
    null, null, null,
  ];
  const bestMove = findBestTicTacToeMove(board);
  assert.equal(bestMove, 2);
});

test('findBestTicTacToeMove blocks player win if AI cannot win immediately', () => {
  const board = [
    'X', 'X', null,
    'O', null, null,
    null, null, null,
  ];
  const bestMove = findBestTicTacToeMove(board);
  assert.equal(bestMove, 2);
});
