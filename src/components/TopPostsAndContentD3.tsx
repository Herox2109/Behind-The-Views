import { BREAK_STATS } from '../data/postsData';
import { CHANNEL_METRICS } from '../data/postsData';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TOP_5_POSTS, ENRICHED_POSTS, sortedByLikes } from '../data/postsData';
import { Eye, Heart, Share2, MessageCircle, Clock, Tag, Flame, ShieldAlert, ArrowUpDown, Info } from 'lucide-react';
import { EnrichedPost } from '../types';

export const TopPostsAndContentD3: React.FC = () => {
  const barSvgRef = useRef<SVGSVGElement | null>(null);
  const donutSvgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredTopPost, setHoveredTopPost] = useState<{ date: string; likes: number; plays: number } | null>(null);
  const [hoveredDonut, setHoveredDonut] = useState<{ label: string; count: number; pct: string } | null>(null);

  // Table filtering & sorting state
  const [sortField, setSortField] = useState<'likes' | 'plays' | 'shares' | 'comments' | 'duration' | 'shareToLikeRatio'>('likes');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [filterView, setFilterView] = useState<'all' | 'viral' | 'postBreak'>('all');
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<EnrichedPost | null>(null);

  // Top 5 Bar Chart (horizontal)
  useEffect(() => {
    if (!barSvgRef.current) return;
    const svg = d3.select(barSvgRef.current);
    svg.selectAll('*').remove();

    const width = 460;
    const height = 260;
    const margin = { top: 15, right: 40, bottom: 25, left: 84 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const top5 = TOP_5_POSTS.slice(0, 5);

    const yScale = d3.scaleBand()
      .domain(top5.map(d => d.date))
      .range([margin.top, height - margin.bottom])
      .padding(0.28);

    const xScale = d3.scaleLog()
      .domain([1000, 250000])
      .range([margin.left, width - margin.right]);

    // Bars
    svg.selectAll<SVGRectElement, typeof top5[0]>('.top-bar')
      .data(top5)
      .enter()
      .append('rect')
      .attr('class', 'top-bar')
      .attr('y', d => yScale(d.date) || 0)
      .attr('x', margin.left)
      .attr('height', yScale.bandwidth())
      .attr('width', d => Math.max(xScale(d.likes) - margin.left, 4))
      .attr('rx', 4)
      .attr('fill', (_d, i) => i < 2 ? '#2b96a8' : '#7fd0d6')
      .attr('cursor', 'pointer')
      .on('mouseenter', (_event, d) => setHoveredTopPost({ date: d.date, likes: d.likes, plays: d.plays }))
      .on('mouseleave', () => setHoveredTopPost(null));

    // Y Axis (Date labels)
    svg.append('g')
      .attr('transform', `translate(${margin.left - 8},0)`)
      .call(d3.axisLeft(yScale).tickSize(0))
      .call(g => g.select('.domain').remove())
      .attr('class', 'text-ink font-mono text-xs');

    // Values on bars
    svg.selectAll<SVGTextElement, typeof top5[0]>('.bar-val')
      .data(top5)
      .enter()
      .append('text')
      .attr('y', d => (yScale(d.date) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('x', d => xScale(d.likes) + 6)
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '700')
      .attr('fill', 'currentColor')
      .text(d => d.likes.toLocaleString());

  }, []);

  // Sound field Donut Chart
  useEffect(() => {
    if (!donutSvgRef.current) return;
    const svg = d3.select(donutSvgRef.current);
    svg.selectAll('*').remove();

    const width = 460;
    const height = 260;
    const radius = Math.min(width, height) / 2 - 25;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const donutData = [
      { label: '"original sound - herox.cc"', count: 67, color: '#2b96a8', pct: '97.1%' },
      { label: '"original sound - HEROX - HEROX"', count: 2, color: '#e3a45f', pct: '2.9%' }
    ];

    const pie = d3.pie<typeof donutData[0]>()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<typeof donutData[0]>>()
      .innerRadius(radius * 0.65)
      .outerRadius(radius)
      .cornerRadius(4);

    g.selectAll('path')
      .data(pie(donutData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'var(--bg-base)')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseenter', (_event, d) => setHoveredDonut(d.data))
      .on('mouseleave', () => setHoveredDonut(null));

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('font-size', '20px')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', 'currentColor')
      .text('69');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.3em')
      .attr('font-size', '11px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .text('posts total');

  }, []);

  // Filter and sort the posts table
  const displayPosts = useMemo(() => {
    let posts = [...ENRICHED_POSTS];
    if (filterView === 'viral') {
      posts = posts.filter(p => p.likes >= 1000);
    } else if (filterView === 'postBreak') {
      posts = posts.filter(p => p.phase.id === 'return');
    }

    return posts.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      switch (sortField) {
        case 'likes':
          valA = a.likes;
          valB = b.likes;
          break;
        case 'plays':
          valA = a.plays;
          valB = b.plays;
          break;
        case 'shares':
          valA = a.shares;
          valB = b.shares;
          break;
        case 'comments':
          valA = a.comments;
          valB = b.comments;
          break;
        case 'duration':
          valA = a.duration;
          valB = b.duration;
          break;
        case 'shareToLikeRatio':
          valA = a.shareToLikeRatio;
          valB = b.shareToLikeRatio;
          break;
      }

      return sortAsc ? valA - valB : valB - valA;
    });
  }, [sortField, sortAsc, filterView]);

  return (
    <section className="py-20 border-b border-black/5 dark:border-white/5 bg-secondary/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
            Exploratory Data Analysis · Question 04
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
            Which posts performed best, and what does the full video metrics export reveal?
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            In addition to the raw GDPR likes export, we analyzed the creator's video metrics sheet containing plays (views), shares, comments, duration, and advertising tags across all 69 uploads.
          </p>
        </div>

        {/* 2-Column Responsive Layout for Top 5 and Sound */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top 5 Posts */}
          <div className="clean-card p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-ink">
                Top 5 posts by likes
              </h3>
              {hoveredTopPost && (
                <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">
                  {hoveredTopPost.likes.toLocaleString()} likes · {hoveredTopPost.plays.toLocaleString()} plays
                </span>
              )}
            </div>
            <div className="w-full">
              <svg ref={barSvgRef} className="w-full h-auto" />
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 text-xs text-ink-faint">
              The #1 and #2 posts are separated from #3 by more than an order of magnitude.
            </div>
          </div>

          {/* Export Content Audit */}
          <div className="clean-card p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-ink">
                Sound Attribution Distribution
              </h3>
              {hoveredDonut && (
                <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">
                  {hoveredDonut.count} posts ({hoveredDonut.pct})
                </span>
              )}
            </div>
            <div className="w-full">
              <svg ref={donutSvgRef} className="w-full h-auto" />
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 text-xs text-ink-faint leading-relaxed">
              "Sound" in the personal export: TikTok labels 97.1% as "original sound - herox.cc", while 2 late posts carry the brand tag "original sound - HEROX - HEROX".
            </div>
          </div>
        </div>

        {/* Hotbar Metrics Explanation Card */}
        <div className="clean-card p-6 sm:p-8 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h3 className="text-base font-bold text-ink">
              External Video Metrics Hotbar & Schema Guide
            </h3>
          </div>
          <p className="text-xs text-ink-soft mb-6 leading-relaxed">
            The external export hotbar decodes the core performance indicators recorded per post. Below is the exact data dictionary:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div className="p-4 rounded-xl clean-card-tight">
              <div className="flex items-center gap-2 text-ink font-bold mb-1">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Like Count</span>
              </div>
              <p className="text-ink-soft leading-relaxed text-[11px]">
                Total double-tap likes. Acts as the primary endorsement score and our dataset's central ranking metric.
              </p>
            </div>

            <div className="p-4 rounded-xl clean-card-tight">
              <div className="flex items-center gap-2 text-ink font-bold mb-1">
                <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Plays (playCount)</span>
              </div>
              <p className="text-ink-soft leading-relaxed text-[11px]">
                Total video impressions / view events. Reaches 1.30M on the Oct 01 mega-viral outlier.
              </p>
            </div>

            <div className="p-4 rounded-xl clean-card-tight">
              <div className="flex items-center gap-2 text-ink font-bold mb-1">
                <Share2 className="w-4 h-4 text-amber-500" />
                <span>Shares (shareCount)</span>
              </div>
              <p className="text-ink-soft leading-relaxed text-[11px]">
                Video shares to friends, chats, and other networks. <b>The single strongest predictor of algorithm breakout</b>.
              </p>
            </div>

            <div className="p-4 rounded-xl clean-card-tight">
              <div className="flex items-center gap-2 text-ink font-bold mb-1">
                <MessageCircle className="w-4 h-4 text-sky-500" />
                <span>Comments (commentCount)</span>
              </div>
              <p className="text-ink-soft leading-relaxed text-[11px]">
                Community discussions, audio sourcing questions, and technique inquiries.
              </p>
            </div>

            <div className="p-4 rounded-xl clean-card-tight">
              <div className="flex items-center gap-2 text-ink font-bold mb-1">
                <Clock className="w-4 h-4 text-violet-500" />
                <span>Duration (videoMeta.duration)</span>
              </div>
              <p className="text-ink-soft leading-relaxed text-[11px]">
                Video runtime in seconds. The median is 22 seconds, with top viral content clustered in the 18–25s window.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Analytical Findings from the External Dataset */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-5 rounded-2xl clean-card-tight bg-white dark:bg-[#121e22]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 dark:text-teal-400 mb-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>INSIGHT 1: THE SHARE MULTIPLIER AS THE VIRAL TRIGGER</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              In normal posts, the share-to-like ratio stays between <b>3% and 5%</b>. However, on the top outlier video (Oct 01, 170.7k likes), the share count reached <b>28,700 shares</b> — an unprecedented <b>16.8% share-to-like ratio</b>! Similarly, post #3 (Oct 04) achieved a <b>25.2% share ratio</b> (2,090 shares on 8,303 likes). This confirms peer-to-peer forwarding is what pushed these videos past standard algorithmic boundaries.
            </p>
          </div>

          <div className="p-5 rounded-2xl clean-card-tight bg-white dark:bg-[#121e22]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 dark:text-teal-400 mb-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>INSIGHT 2: THE 18–25 SECOND SWEET SPOT</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Every single video in the top 5 was between <b>18 and 25 seconds long</b> (21s, 22s, 25s, 19s, 18s). Shorter videos (&lt;12s) lacked enough narrative pacing for audience retention, while the single longest video in the dataset (102 seconds on Sep 07) stalled at only 854 plays and 36 likes.
            </p>
          </div>

          <div className="p-5 rounded-2xl clean-card-tight bg-white dark:bg-[#121e22]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 dark:text-teal-400 mb-2">
              <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>INSIGHT 3: 2.74 MILLION TOTAL IMPRESSIONS</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Across all 69 uploads, the channel accumulated <b>{CHANNEL_METRICS.totalPlays.toLocaleString()} total plays</b> and <b>{CHANNEL_METRICS.totalLikes.toLocaleString()} total likes</b>. The top two posts alone generated <b>2,278,800 plays</b> (83.3% of total channel impressions), mathematically illustrating the power-law distribution characteristic of TikTok's recommendation engine.
            </p>
          </div>

          <div className="p-5 rounded-2xl clean-card-tight bg-white dark:bg-[#121e22]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 dark:text-teal-400 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>INSIGHT 4: POST-BREAK COLD-START DEPRECIATION</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Before the 73-day hiatus, the median non-viral video garnered <b>{BREAK_STATS.beforeMedianPlays.toLocaleString()} plays</b> and <b>{BREAK_STATS.beforeMedianLikesExcludingViral} likes</b>. After the return, median plays dropped to <b>{BREAK_STATS.afterMedianPlays} plays</b> and <b>{BREAK_STATS.afterMedianLikes} likes</b>. This before/after comparison does not establish that the break caused the change.
            </p>
          </div>
        </div>

        {/* Video Performance Data Explorer Table */}
        <div className="clean-card overflow-hidden">
          <div className="p-6 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-ink">
                Verified Video Performance Explorer (All 69 Posts)
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Default order matches the dataset's like counts descending. Click column headers to re-sort.
              </p>
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterView('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  filterView === 'all'
                    ? 'bg-teal-700 dark:bg-teal-500 text-white font-bold'
                    : 'clean-card-tight text-ink-soft hover:text-ink'
                }`}
              >
                All 69 Posts
              </button>
              <button
                onClick={() => setFilterView('viral')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  filterView === 'viral'
                    ? 'bg-teal-700 dark:bg-teal-500 text-white font-bold'
                    : 'clean-card-tight text-ink-soft hover:text-ink'
                }`}
              >
                Viral (&gt;1k likes)
              </button>
              <button
                onClick={() => setFilterView('postBreak')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  filterView === 'postBreak'
                    ? 'bg-teal-700 dark:bg-teal-500 text-white font-bold'
                    : 'clean-card-tight text-ink-soft hover:text-ink'
                }`}
              >
                Post-Break
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-base z-10 border-b border-black/10 dark:border-white/10 shadow-sm">
                <tr className="text-ink-faint font-mono uppercase text-[10px]">
                  <th className="px-5 py-3">Rank / Date</th>
                  <th 
                    className="px-5 py-3 cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => {
                      if (sortField === 'likes') setSortAsc(!sortAsc);
                      else { setSortField('likes'); setSortAsc(false); }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Like Count</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-5 py-3 cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => {
                      if (sortField === 'plays') setSortAsc(!sortAsc);
                      else { setSortField('plays'); setSortAsc(false); }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Plays (Views)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-5 py-3 cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => {
                      if (sortField === 'shares') setSortAsc(!sortAsc);
                      else { setSortField('shares'); setSortAsc(false); }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Shares</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-5 py-3 cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => {
                      if (sortField === 'comments') setSortAsc(!sortAsc);
                      else { setSortField('comments'); setSortAsc(false); }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Comments</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-5 py-3 cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => {
                      if (sortField === 'duration') setSortAsc(!sortAsc);
                      else { setSortField('duration'); setSortAsc(false); }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Duration</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    className="px-5 py-3 cursor-pointer hover:text-teal-600 transition-colors"
                    onClick={() => {
                      if (sortField === 'shareToLikeRatio') setSortAsc(!sortAsc);
                      else { setSortField('shareToLikeRatio'); setSortAsc(false); }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Share / Like Ratio</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono">
                {displayPosts.map((post, idx) => {
                  const isTopPost = post.likes >= 1000;
                  const likeToPlay = post.plays > 0 ? ((post.likes / post.plays) * 100).toFixed(1) : '0.0';
                  const shareRatio = (post.shareToLikeRatio * 100).toFixed(1);

                  return (
                    <tr 
                      key={post.date + idx} 
                      className={`hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${
                        isTopPost ? 'bg-teal-500/[0.03]' : ''
                      }`}
                      onClick={() => setSelectedPostForDetail(post)}
                    >
                      <td className="px-5 py-3 text-ink">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-ink-faint w-5 font-bold">#{idx + 1}</span>
                          <span className="font-semibold text-xs">{post.date}</span>
                          {post.likes > 50000 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              VIRAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-bold text-teal-700 dark:text-teal-400">
                        {post.likes.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-ink font-semibold">
                        {post.plays.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-ink-soft">
                        {post.shares.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-ink-soft">
                        {post.comments.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-ink-soft">
                        {post.duration}s
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          post.shareToLikeRatio > 0.12
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-black/5 dark:bg-white/5 text-ink-faint'
                        }`}>
                          {shareRatio}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-faint text-[11px]">
                        {likeToPlay}% like/play
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for selected post detail */}
        {selectedPostForDetail && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="clean-card p-6 sm:p-8 max-w-lg w-full bg-base border border-black/10 dark:border-white/10 relative">
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
                <div>
                  <span className="text-xs font-mono uppercase text-teal-700 dark:text-teal-400 font-semibold">
                    Post Detail Inspection
                  </span>
                  <h3 className="text-lg font-bold text-ink">
                    Upload Date: {selectedPostForDetail.date}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPostForDetail(null)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono clean-card-tight text-ink hover:text-rose-500"
                >
                  Close ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
                <div className="p-3 rounded-xl clean-card-tight">
                  <span className="text-ink-faint block text-[10px]">TOTAL LIKES (DIGGS)</span>
                  <span className="text-lg font-bold text-teal-700 dark:text-teal-400">{selectedPostForDetail.likes.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl clean-card-tight">
                  <span className="text-ink-faint block text-[10px]">TOTAL PLAYS (VIEWS)</span>
                  <span className="text-lg font-bold text-ink">{selectedPostForDetail.plays.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl clean-card-tight">
                  <span className="text-ink-faint block text-[10px]">SHARES</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{selectedPostForDetail.shares.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl clean-card-tight">
                  <span className="text-ink-faint block text-[10px]">COMMENTS</span>
                  <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{selectedPostForDetail.comments.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono mb-4 text-ink-soft">
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-ink-faint">Video Runtime:</span>
                  <span className="font-bold text-ink">{selectedPostForDetail.duration} seconds</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-ink-faint">Share-to-Like Ratio:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {(selectedPostForDetail.shareToLikeRatio * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-ink-faint">Like-to-Play Conversion:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {selectedPostForDetail.plays > 0 ? ((selectedPostForDetail.likes / selectedPostForDetail.plays) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-faint">Associated Audio:</span>
                  <span className="font-bold text-ink truncate max-w-[200px]">{selectedPostForDetail.soundLabel}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPostForDetail(null)}
                className="w-full py-2.5 rounded-xl bg-teal-700 dark:bg-teal-500 text-white font-mono text-xs font-semibold hover:bg-teal-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

