# Behind the Views — A Data-Driven Analysis of My TikTok Journey

An independent, reproducible data-science project analyzing 11 months of TikTok video publishing history (see generated dataset statistics below) by 17-year-old creator and student analyst **Behruzbek Shodmonov** ([@herox.cc](https://www.tiktok.com/@herox.cc?_r=1&_t=ZP-99Tn9fZhK9e)).

[![GitHub Profile](https://img.shields.io/badge/GitHub-Herox2109-181717?style=flat&logo=github)](https://github.com/Herox2109)
[![TikTok](https://img.shields.io/badge/TikTok-@herox.cc-000000?style=flat&logo=tiktok)](https://www.tiktok.com/@herox.cc?_r=1&_t=ZP-99Tn9fZhK9e)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Project Goals

1. **Empirical Grounding**: Transform a personal TikTok privacy JSON export (`user_data_tiktok.json`) into an automated, verifiable data science pipeline.
2. **Power-Law Analysis**: Investigate the concentration of engagement in the two most-liked videos.
3. **Hiatus Dynamics**: Analyze the statistical repercussions of a 73-day break between February 18 and April 30, 2026.
4. **Modeling Demonstration**: Show how explicit, manually chosen assumptions change an illustrative logistic score. Training and evaluation remain future work.
5. **Audience Sentiment & NLP**: Parse public comments from viral videos to cluster viewer feedback and technical tutorial inquiries.

---

## Implemented data flow

`data/posts.json` is read by the React analytics module, Express API and FastAPI
service. `scripts/update-readme.ts` generates the statistics below. The browser
also provides an illustrative score and a whole-word keyword sentiment demo.

The methodology panel contains labeled educational examples, not an executed
end-to-end training pipeline. No raw privacy export is published here.

---

## Key Statistical Findings

<!-- dataset-stats:start -->
- Posts: **69**; total likes: **294,111**.
- Overall median: **149 likes**; rounded mean: **4262 likes**.
- Top two posts: **266,900 likes (90.7%)**.
- Launch median: **97.5 likes**.
- Pre-break median excluding posts over 50,000 likes: **153**; post-break median: **46**.
- Posts published between 09:35:00 and 10:05:00 UTC (inclusive): **68.1%**. This does not establish scheduled publishing.
<!-- dataset-stats:end -->

The canonical dataset is `data/posts.json`, migrated without changing any of the
69 records from the existing frontend dataset. The original TikTok export was not
available for independent verification. Counts represent this repository snapshot;
they are not a live TikTok feed. Both backends read this same data.

Run `npm run stats:update` after editing the dataset. `npm test` checks that this
README block is current. Python deployment must include the repository's `data/`
directory alongside `backend/`.

---

## Modeling status: illustrative, not evaluated

The interactive score uses manually selected coefficients and a logistic transform.
It is a 0–100 demonstration score, not a calibrated probability, a trained model,
or a validated forecast of likes, plays or shares. The interface shows each rule's
contribution so the calculation can be inspected.

No reproducible training run, held-out predictions or saved model artifact is
provided. Previously hard-coded accuracy, precision, recall, F1, ROC-AUC and
confusion-matrix figures have been removed rather than presented as measurements.
Future evaluation should use training-only preprocessing and thresholds, a
chronological holdout, a baseline, and published predictions with uncertainty.

The simulator covers the canonical dataset's publication months (August 2025 to
July 2026). Its observed curve accumulates snapshot likes by publication month;
it is not a historical record of when those likes arrived. The hypothetical
curve is an explicitly assumed scenario, not a model forecast.

---

## Quickstart & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Herox2109/behind-the-views.git
cd behind-the-views
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run local dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Contact & Links

- **Creator / Analyst**: Behruzbek Shodmonov
- **GitHub**: [https://github.com/Herox2109](https://github.com/Herox2109)
- **TikTok**: [https://www.tiktok.com/@herox.cc](https://www.tiktok.com/@herox.cc?_r=1&_t=ZP-99Tn9fZhK9e)


## API input limits

`POST /api/bespoke-eval` accepts an `expression` containing only numeric literals,
`post.likes`, `post.index`, `post.logLikes`, parentheses, and `+ - * / %`.
Example: `post.likes / (post.index + 1)`. JavaScript functions, property traversal,
and statements are not supported. Expressions are limited to 256 characters,
128 tokens and 32 nesting levels; non-finite results return HTTP 400.

`POST /api/simulate` requires a JSON object. Optional fields:

- `postingFrequencyPerWeek`: finite number from 0.2 to 7 (default 1.7).
- `baselineMedian`: finite number from 10 to 1000 (default: pre-break non-viral median from the dataset).
- `includeViralSpike`: boolean (default false).

Invalid values return HTTP 400 rather than being coerced or silently clamped.
Generated simulations have an additional hard ceiling of 100 posts.

Run security regression tests with `npm test`; run type checks with `npm run lint`.

