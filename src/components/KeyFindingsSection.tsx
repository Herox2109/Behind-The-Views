import React from 'react';

export const KeyFindingsSection: React.FC = () => {
  const findings = [
    {
      index: "01",
      stat: "90.8%",
      title: "Two videos carried the entire channel",
      body: "Of 293,710 lifetime likes across 69 posts, 266,728 — 90.8% — came from just two videos, posted Aug 26 and Oct 1, 2025. Every other post combined accounts for the remaining 9.2%."
    },
    {
      index: "02",
      stat: "268 → 46",
      title: "Typical reach fell in step with posting frequency",
      body: "Median likes (excluding the two viral posts) were highest during the two most active phases and lowest during the least active one. Frequency and typical performance moved together throughout the dataset.",
      hedge: "This is a correlation across four phases, not a controlled comparison — content, audio trends, and platform-side factors could have shifted at the same time."
    },
    {
      index: "03",
      stat: "73 days",
      title: "The break is an outlier in its own right",
      body: "The next-longest gap between posts anywhere in the dataset is 17 days. The 73-day break is more than four times longer than any other pause in eleven months of posting."
    },
    {
      index: "04",
      stat: "Lowest phase",
      title: "Reach hadn't recovered by the end of the dataset",
      body: "The five posts after the break median 46 likes — lower than any other phase, including the very first week of posting before the account had any track record at all.",
      hedge: "The data ends two months after the break; it can't say whether this is a lasting reset or simply a slow restart."
    },
    {
      index: "05",
      stat: "70%",
      title: "Posting was scheduled, not spontaneous",
      body: "70% of all 69 posts went up between 9:35 and 10:05 AM. That's a routine, not a reaction to a trend or a sudden idea — which makes the changes in frequency more likely a change in effort or motivation than a change in access or opportunity."
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
