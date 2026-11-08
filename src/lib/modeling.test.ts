import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthlyTimeline } from './monthlyTimeline';
import { illustrativeScore } from './illustrativeModel';
import { RAW_POSTS, CHANNEL_METRICS } from '../data/postsData';

test('timeline uses August–July, fills empty months and reconciles snapshot totals', () => {
  const timeline = monthlyTimeline(RAW_POSTS);
  assert.equal(timeline.length, 12);
  assert.equal(timeline[0].month, '2025-08');
  assert.equal(timeline[0].label, 'Aug 25');
  assert.equal(timeline.at(-1)?.month, '2026-07');
  assert.equal(timeline.at(-1)?.label, 'Jul 26');
  assert.equal(timeline.at(-1)?.cumulativeLikes, CHANNEL_METRICS.totalLikes);
  for (const month of ['2026-03', '2026-04']) {
    const index = timeline.findIndex(point => point.month === month);
    assert.equal(timeline[index].cumulativeLikes, timeline[index - 1].cumulativeLikes);
  }
  assert.deepEqual(monthlyTimeline([]), []);
  assert.deepEqual(monthlyTimeline([...RAW_POSTS].reverse()), timeline);
});

test('illustrative score is deterministic and exposes the full calculation', () => {
  const input = { gapDays: 2, dayOfWeek: 2, uploadHour: 9, duration: 22, isPreBreak: true };
  const result = illustrativeScore(input);
  assert.ok(Math.abs(result.logit - 3.12) < 1e-10);
  assert.equal(result.score, 100 / (1 + Math.exp(-result.logit)));
  assert.deepEqual(illustrativeScore(input), result);
  assert.ok(illustrativeScore({ ...input, gapDays: 60 }).score < result.score);
  assert.ok(illustrativeScore({ ...input, isPreBreak: false }).score < result.score);
  assert.equal(illustrativeScore({ ...input, uploadHour: 11 }).contributions[2].value, 0);
  assert.equal(illustrativeScore({ ...input, duration: 41 }).contributions[5].value, -0.65);
});
