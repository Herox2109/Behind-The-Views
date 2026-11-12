import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasKeyword } from './keywords';

test('matches whole words and phrases without substring false positives', () => {
  assert.equal(hasKeyword('A MASTERPIECE!', 'masterpiece'), true);
  for (const text of ['masterpiece', 'classic', 'passion']) assert.equal(hasKeyword(text, 'ass'), false);
  assert.equal(hasKeyword('this is ass!', 'ass'), true);
  assert.equal(hasKeyword('video', 'id'), false);
  assert.equal(hasKeyword('artwork', 'art'), false);
  assert.equal(hasKeyword('what\nplugins?', 'what plugins'), true);
  assert.equal(hasKeyword('why?', '?'), true);
  assert.equal(hasKeyword('éassé', 'ass'), false);
  assert.equal(hasKeyword('use c++?', 'c++'), true);
});
