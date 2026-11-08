import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RAW_POSTS, CHANNEL_METRICS, BREAK_STATS, calculateMedian } from '../data/postsData';

test('canonical snapshot and independently calculated summaries agree', () => {
  assert.equal(RAW_POSTS.length, 69);
  assert.equal(RAW_POSTS.reduce((sum, post) => sum + post.likes, 0), 294111);
  assert.equal(CHANNEL_METRICS.totalLikes, 294111);
  assert.equal(CHANNEL_METRICS.top2LikesSum, 266900);
  assert.equal(BREAK_STATS.beforeMedianLikesExcludingViral, 153);
  assert.equal(BREAK_STATS.afterMedianLikes, 46);
  assert.deepEqual(RAW_POSTS.map(p => p.date), RAW_POSTS.map(p => p.date).sort());
});

test('even-sized samples retain fractional medians', () => {
  assert.equal(calculateMedian([104, 91]), 97.5);
  assert.equal(calculateMedian([5, 1, 3]), 3);
});
