import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileExpression, validateSimulation } from './safety';

test('arithmetic respects precedence, fields and unary operators', () => {
  const post = { likes: 100, index: 3, logLikes: 2 };
  assert.equal(compileExpression('post.likes / (2 + 3) + -post.index')(post), 17);
  assert.equal(compileExpression('1e2 + .5 * 2 + post.logLikes % 2')(post), 101);
  assert.equal(compileExpression('0')(post), 0);
});

test('rejects JavaScript, arbitrary property access and unbounded expressions', () => {
  for (const expression of [
    'process.exit()', 'globalThis.process', 'post.constructor', 'post["likes"]',
    '(()=>1)()', 'Math.log(post.likes)', 'post.likes = 2', '1;2', '1,2',
    '1/**/+2', '2 ** 3', '1 +', '(1', '1 2', '', '1e309',
    '('.repeat(34) + '1' + ')'.repeat(34), '1+'.repeat(130) + '1',
  ]) assert.throws(() => compileExpression(expression), expression);
  assert.throws(() => compileExpression(null));
});

test('rejects non-finite arithmetic results', () => {
  for (const expression of ['1 / 0', '0 / 0', '1 % 0', '1e308 * 1e308']) {
    assert.throws(() => compileExpression(expression)({}));
  }
});

test('simulation defaults and boundaries are valid', () => {
  assert.deepEqual(validateSimulation({}), { postingFrequencyPerWeek: 1.7, baselineMedian: 145, includeViralSpike: false });
  assert.equal(validateSimulation({ postingFrequencyPerWeek: 0.2, baselineMedian: 10 }).baselineMedian, 10);
  assert.equal(validateSimulation({ postingFrequencyPerWeek: 7, baselineMedian: 1000, includeViralSpike: true }).postingFrequencyPerWeek, 7);
});

test('simulation rejects coercion, non-finite numbers and out-of-range values', () => {
  for (const value of [-1, 0, 7.1, 1e100, Infinity, NaN, '7', null, [], {}]) {
    assert.throws(() => validateSimulation({ postingFrequencyPerWeek: value }));
  }
  for (const value of [0, 1001, Infinity, '145', null]) {
    assert.throws(() => validateSimulation({ baselineMedian: value }));
  }
  for (const value of ['false', 1, null]) assert.throws(() => validateSimulation({ includeViralSpike: value }));
  for (const value of [null, [], 'input', 12]) assert.throws(() => validateSimulation(value));
});
