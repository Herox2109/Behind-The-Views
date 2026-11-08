import { BREAK_STATS } from '../data/postsData';
import React from 'react';
import { AlertCircle, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';

export const ConclusionSection: React.FC = () => {
  const limits = [
    {
      num: "01",
      title: "No second-by-second retention curves",
      body: "While total view counts (plays), shares, comments, and durations are now integrated from app analytics, TikTok does not export second-by-second viewer drop-off or completion curves. Average watch time and early drops (e.g. at second 3 vs. second 15) must be estimated from duration and engagement ratios rather than continuous telemetry."
    },
    {
      num: "02",
      title: "Audience demographics & traffic sources",
      body: "We have verified video engagement totals and sound metadata, but the export lacks geographic breakdown, audience age distributions, and referral channel percentages (For You feed discovery vs. profile page views vs. direct share links)."
    },
    {
      num: "03",
      title: "Single-channel N=1 case study",
      body: "Everything here describes one video editing account run by one person over eleven months (69 uploads). While offering high internal validity and granular tracking, these dynamics reflect a specific creative journey rather than a universal platform law."
    },
    {
      num: "04",
      title: "Post-break sample size (N=5)",
      body: "The post-hiatus return phase contains 5 posts across two months. The decline from 1,852 median plays to 540 median plays reflects an immediate loss in reach, but 5 uploads are too small a sample to prove that algorithmic suppression was permanent."
    }
  ];

  return (
    <>
      {/* LIMITS SECTION: What this data cannot say */}
      <section className="py-24 border-b border-black/5 dark:border-white/5 bg-secondary/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
              Honest accounting
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
              What this data cannot say
            </h2>
            <p className="text-base text-ink-soft leading-relaxed">
              Real data science requires being honest about the limits of the dataset rather than dressing up assumptions as facts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {limits.map(item => (
              <div key={item.num} className="clean-card p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <span className="text-sm font-bold font-mono text-teal-700 dark:text-teal-400 block mb-2">
                    {item.num}
                  </span>
                  <h3 className="text-base font-bold text-ink mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING SECTION: A project about honesty */}
      <section className="py-24 border-b border-black/5 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
              Closing Reflection
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
              A project about honesty
            </h2>
          </div>

          <div className="clean-card p-8 sm:p-12 space-y-5 text-base sm:text-lg text-ink-soft leading-relaxed">
            <p>
              A lot of beginner data science projects take a clean, pre-packaged Kaggle dataset, run it through five standard models, and present neat conclusions. That is a great way to practice syntax. But it skips the hardest part of working with real data: figuring out what your dataset actually is, what it isn't, and what questions it has the right to answer.
            </p>
            <p>
              This dataset came from a real account I built and posted to as a 17-year-old student creator. The numbers are real, the drop in posting is real, and the quiet period at the end is real. The most honest thing this project can do is report all three with equal care — acknowledging the 170k-like viral spike without pretending it was the norm, and measuring the {BREAK_STATS.afterMedianLikes}-like median without inventing a story to explain it away.
            </p>
          </div>

          {/* Advice to other creators */}
          <div className="mt-8 p-6 rounded-2xl clean-card-tight bg-teal-500/[0.04] border-teal-500/20">
            <h4 className="text-sm font-bold text-ink mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Analyst's Advice to Emerging Creators</span>
            </h4>
            <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
              Don't measure your baseline performance against viral spikes. Outliers belong to power-law dynamics, not day-to-day consistency. Protect your posting routine: extended hiatuses (like the 73-day pause here) break audience habit and algorithmic velocity, requiring patience and steady uploading to rebuild momentum.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

