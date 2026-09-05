import React, { useState } from 'react';
import { Database, Calendar, BarChart3, Layers, CheckCircle2, AlertTriangle, FileCode2, ChevronDown, ChevronUp } from 'lucide-react';
import { CHANNEL_METRICS, PHASE_STATS } from '../data/postsData';

export const DataOverviewSection: React.FC = () => {
  const [showCleaningDetails, setShowCleaningDetails] = useState(false);

  return (
    <section id="overview" className="py-20 border-b border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
            Data overview & Pipeline
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
            What's in this dataset
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            This study examines 69 public video uploads spanning 336 days, combining the raw TikTok GDPR archive with external video performance metrics — tracking likes, plays (impressions), shares, comments, duration, and sound metadata.
          </p>
        </div>

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="clean-card p-6 flex flex-col justify-between">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-teal-700 dark:text-teal-400">
              69
            </span>
            <div className="mt-3">
              <div className="text-sm font-semibold text-ink">Posts analyzed</div>
              <div className="text-xs text-ink-faint mt-0.5">Every public post in the account history</div>
            </div>
          </div>

          <div className="clean-card p-6 flex flex-col justify-between">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-teal-700 dark:text-teal-400">
              {(CHANNEL_METRICS.totalPlays / 1000000).toFixed(2)}M
            </span>
            <div className="mt-3">
              <div className="text-sm font-semibold text-ink">Total video plays</div>
              <div className="text-xs text-ink-faint mt-0.5">{CHANNEL_METRICS.totalPlays.toLocaleString()} total verified views</div>
            </div>
          </div>

          <div className="clean-card p-6 flex flex-col justify-between">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-teal-700 dark:text-teal-400">
              {(CHANNEL_METRICS.totalLikes / 1000).toFixed(1)}k
            </span>
            <div className="mt-3">
              <div className="text-sm font-semibold text-ink">Total likes (Like Count)</div>
              <div className="text-xs text-ink-faint mt-0.5">Median of {CHANNEL_METRICS.overallMedianLikes} likes / post</div>
            </div>
          </div>

          <div className="clean-card p-6 flex flex-col justify-between">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {(CHANNEL_METRICS.totalShares / 1000).toFixed(1)}k
            </span>
            <div className="mt-3">
              <div className="text-sm font-semibold text-ink">Total shares</div>
              <div className="text-xs text-ink-faint mt-0.5">Viral driver: 35,972 total shares</div>
            </div>
          </div>
        </div>

        {/* Secondary Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 text-xs font-mono">
          <div className="p-3 rounded-xl clean-card-tight flex items-center justify-between">
            <span className="text-ink-faint">Total Comments:</span>
            <span className="font-bold text-ink">{CHANNEL_METRICS.totalComments.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-xl clean-card-tight flex items-center justify-between">
            <span className="text-ink-faint">Date Window:</span>
            <span className="font-bold text-ink">336 Days</span>
          </div>
          <div className="p-3 rounded-xl clean-card-tight flex items-center justify-between">
            <span className="text-ink-faint">Median Duration:</span>
            <span className="font-bold text-teal-700 dark:text-teal-400">{CHANNEL_METRICS.overallMedianDuration}s</span>
          </div>
          <div className="p-3 rounded-xl clean-card-tight flex items-center justify-between">
            <span className="text-ink-faint">Cadence:</span>
            <span className="font-bold text-ink">1.4 posts/wk</span>
          </div>
        </div>

        {/* Data Collection & Cleaning Accordion / Box */}
        <div className="clean-card p-6 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="text-base font-bold text-ink">
                  Data Collection and Cleaning Pipeline
                </h3>
              </div>
              <p className="text-xs text-ink-soft mt-1">
                How raw JSON from TikTok was validated, parsed, and converted into an analysis-ready DataFrame
              </p>
            </div>
            <button
              onClick={() => setShowCleaningDetails(!showCleaningDetails)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-teal-700 dark:text-teal-400 hover:bg-teal-500/10 transition-colors w-fit"
            >
              <span>{showCleaningDetails ? 'Hide Cleaning Rules' : 'Inspect Cleaning Rules'}</span>
              {showCleaningDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>1. Raw JSON Extraction</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Extracted from TikTok's GDPR archive: <code className="font-mono text-[11px] text-teal-700 dark:text-teal-400">Post → Posts → VideoList</code>. Verified 69 post objects with zero payload drop.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>2. Datetime & Type Casting</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Dates converted to Python <code className="font-mono text-[11px]">pd.to_datetime()</code>. String likes (e.g. <code className="font-mono text-[11px]">"170673"</code>) converted to 64-bit integers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink mb-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>3. Missing Fields & External App Data</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                <code className="font-mono text-[11px]">Title</code> and <code className="font-mono text-[11px]">AlternateText</code> were blank or "N/A" in the raw GDPR export, and views/reach were omitted by default. To resolve this, external performance data exported directly from the TikTok app analytics was integrated — introducing verified play counts (views), shares, comments, video durations, and exact upload timestamps across all 69 posts.
              </p>
            </div>
          </div>

          {showCleaningDetails && (
            <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5">
              <div className="code-terminal p-4 text-xs font-mono overflow-x-auto">
                <div className="text-slate-400 mb-2 font-bold">// python load_and_clean.py + app analytics join summary</div>
                <div className="text-emerald-400">Enriched DataFrame Shape: (69 rows, 11 columns)</div>
                <div className="text-slate-300 mt-1">Columns: ['Date', 'Likes', 'Plays', 'Shares', 'Comments', 'Duration_s', 'Sound', 'gap_days', 'phase', 'like_rate', 'share_ratio']</div>
                <div className="text-slate-400 mt-1">Missing Values: 0 across all core metrics | Verified with app analytics</div>
                <div className="text-slate-400 mt-1">Chronological Sort: True (2025-08-11 13:35:01 to 2026-07-12 09:39:32)</div>
              </div>
            </div>
          )}
        </div>

        {/* Phase Segmentation Table */}
        <div className="clean-card overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5 dark:border-white/5">
            <h3 className="text-sm font-bold text-ink">
              Phase Segmentation
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              Boundary defined whenever the inter-post pause exceeded 10 days
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-ink-faint font-mono uppercase text-[10px]">
                  <th className="px-6 py-3 font-semibold">Phase</th>
                  <th className="px-6 py-3 font-semibold">Dates</th>
                  <th className="px-6 py-3 font-semibold">Posts</th>
                  <th className="px-6 py-3 font-semibold">Cadence</th>
                  <th className="px-6 py-3 font-semibold">Median Likes</th>
                  <th className="px-6 py-3 font-semibold">Max Likes</th>
                  <th className="px-6 py-3 font-semibold">Baseline Median (Excl. Viral)</th>
                  <th className="px-6 py-3 font-semibold">Median Plays</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {PHASE_STATS.map((ps) => (
                  <tr key={ps.phase.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 font-medium flex items-center gap-2 text-ink">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ps.phase.color }} />
                      <span>{ps.phase.name}</span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-ink-soft">{ps.startDate} – {ps.endDate}</td>
                    <td className="px-6 py-3.5 font-mono font-semibold text-ink">{ps.postCount}</td>
                    <td className="px-6 py-3.5 font-mono text-ink-soft">{ps.postsPerWeek}/wk</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-teal-700 dark:text-teal-400">
                      {ps.medianLikes.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {ps.maxLikes.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-ink-soft">
                      {ps.medianLikesExcludingViral.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-ink-soft">
                      {ps.medianPlays.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
