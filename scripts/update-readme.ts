import { readFileSync, writeFileSync } from 'node:fs';
import { CHANNEL_METRICS as m, BREAK_STATS as b, PHASE_STATS } from '../src/data/postsData';
const path = new URL('../README.md', import.meta.url);
const original = readFileSync(path, 'utf8');
const block = `<!-- dataset-stats:start -->
- Posts: **${m.totalPosts}**; total likes: **${m.totalLikes.toLocaleString('en-US')}**.
- Overall median: **${m.overallMedianLikes} likes**; rounded mean: **${m.overallMeanLikes} likes**.
- Top two posts: **${m.top2LikesSum.toLocaleString('en-US')} likes (${m.top2Percentage}%)**.
- Launch median: **${PHASE_STATS[0].medianLikes} likes**.
- Pre-break median excluding posts over 50,000 likes: **${b.beforeMedianLikesExcludingViral}**; post-break median: **${b.afterMedianLikes}**.
- Posts published between 09:35:00 and 10:05:00 UTC (inclusive): **${m.morningPostPercentage}%**. This does not establish scheduled publishing.
<!-- dataset-stats:end -->`;
const updated = original.replace(/<!-- dataset-stats:start -->[\s\S]*?<!-- dataset-stats:end -->/, block);
if (!original.includes('<!-- dataset-stats:start -->')) throw new Error('Missing README statistics block');
if (process.argv.includes('--check')) {
  if (updated !== original) throw new Error('README statistics are stale: run npm run stats:update');
} else writeFileSync(path, updated);
