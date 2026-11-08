import { BREAK_STATS } from '../data/postsData';
import { CHANNEL_METRICS } from '../data/postsData';
import React from 'react';

export const KeyFindingsSection: React.FC = () => {
  const findings = [
    {
      index: "01",
      stat: `${CHANNEL_METRICS.top2Percentage}%`,
      title: "Two videos carried the entire channel",
      body: `Of ${CHANNEL_METRICS.totalLikes.toLocaleString()} likes across ${CHANNEL_METRICS.totalPosts} posts, ${CHANNEL_METRICS.top2LikesSum.toLocaleString()} (${CHANNEL_METRICS.top2Percentage}%) came from the top two videos.`
    },
    {
      index: "02",
      stat: `${BREAK_STATS.beforeMedianLikesExcludingViral} → ${BREAK_STATS.afterMedianLikes}`,
      title: "Typical reach fell in step with posting frequency",
      body: "Median likes (excluding the two viral posts) were highest during the two most active phases and lowest during the least active one. Frequency and typical performance moved together throughout the dataset.",
      hedge: "This is a correlation across four phases, not a controlled comparison — content, audio trends, and platform-side factors could have shifted at the same time."
    },
    {
      index: "03",
      stat: "73 days",
      title: "The break is an outlier in its own right",
      body: "The next-longest gap is 44 days. The 73-day break is the longest observed interval."
    },
    {
      index: "04",
      stat: "Lowest phase",
      title: "Reach hadn't recovered by the end of the dataset",
      body: `The ${BREAK_STATS.afterPostCount} posts after the break have a median of ${BREAK_STATS.afterMedianLikes} likes, lower than the other defined phases.`,
      hedge: "The data ends two months after the break; it can't say whether this is a lasting reset or simply a slow restart."
    },
    {
      index: "05",
      stat: `${CHANNEL_METRICS.morningPostPercentage}%`,
      title: "Uploads cluster in a recurring window",
      body: `${CHANNEL_METRICS.morningPostPercentage}% of posts were published between 09:35 and 10:05 UTC. Timestamps show a recurring upload window, but do not establish that uploads were scheduled.`
    }
  ];

  return (
    <section id="findings" className="py-24 border-b border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
            Synthesis
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
            What the data says
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            Five observations from the analysis above. Where the data can only show correlation, that's stated plainly rather than dressed up as proof.
          </p>
        </div>

        {/* Clean Findings Rows */}
        <div className="divide-y divide-black/5 dark:divide-white/5 border-t border-b border-black/5 dark:border-white/5">
          {findings.map(f => (
            <div key={f.index} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-2 flex md:flex-col items-baseline justify-between md:justify-start gap-4">
                <span className="text-sm font-bold font-mono text-teal-600 dark:text-teal-400">
                  {f.index}
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-ink">
                  {f.stat}
                </span>
              </div>
              <div className="md:col-span-10">
                <h3 className="text-lg sm:text-xl font-bold text-ink mb-2">
                  {f.title}
                </h3>
                <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
                  {f.body}
                </p>
                {f.hedge && (
                  <p className="mt-3 text-xs text-ink-faint italic leading-relaxed border-l-2 border-amber-500/40 pl-3">
                    {f.hedge}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

