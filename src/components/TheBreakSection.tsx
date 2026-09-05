import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ENRICHED_POSTS, BREAK_STATS } from '../data/postsData';

export const TheBreakSection: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1000;
    const height = 160;
    const midY = height / 2;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height);

    const before = ENRICHED_POSTS.filter(p => p.date < '2026-02-18');
    const after = ENRICHED_POSTS.filter(p => p.date >= '2026-05-01');
    const totalSlots = before.length + 15 + after.length; // 15 = visual gap weight

    const usable = width - 40;
    const beforeW = usable * (before.length / totalSlots);
    const gapW = usable * (15 / totalSlots);
    const afterW = usable * (after.length / totalSlots);

    // Background axis line
    svg.append('line')
      .attr('x1', 20)
      .attr('y1', midY)
      .attr('x2', width - 20)
      .attr('y2', midY)
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.15)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2 4');

    let cursor = 20;

    // Draw Before dots
    const rScale = (likes: number) => 3.0 + Math.sqrt(Math.log10(likes + 1)) * 2.2;

    before.forEach((p, i) => {
      const cx = cursor + (i / Math.max(1, before.length - 1)) * beforeW;
      svg.append('circle')
        .attr('cx', cx)
        .attr('cy', midY)
        .attr('r', rScale(p.likes))
        .attr('fill', p.phase.color)
        .attr('fill-opacity', 0.9)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1);
    });

    cursor += beforeW;

    // Draw Break Gap
    svg.append('rect')
      .attr('x', cursor + 10)
      .attr('y', midY - 36)
      .attr('width', gapW - 20)
      .attr('height', 72)
      .attr('rx', 12)
      .attr('fill', '#e3a45f')
      .attr('fill-opacity', 0.1)
      .attr('stroke', '#e3a45f')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4');

    svg.append('text')
      .attr('x', cursor + gapW / 2)
      .attr('y', midY - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', '#c98a4a')
      .text('73 days');

    svg.append('text')
      .attr('x', cursor + gapW / 2)
      .attr('y', midY + 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .text('no posts');

    cursor += gapW;

    // Draw After dots
    after.forEach((p, i) => {
      const cx = cursor + (i / Math.max(1, after.length - 1)) * afterW;
      svg.append('circle')
        .attr('cx', cx)
        .attr('cy', midY)
        .attr('r', rScale(p.likes))
        .attr('fill', '#e3a45f')
        .attr('fill-opacity', 0.9)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1);
    });

  }, []);

  return (
    <section id="break" className="py-24 border-b border-black/5 dark:border-white/5 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest font-mono mb-2">
            A turning point
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
            THE BREAK
          </h2>
          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            Between February 18 and April 30, 2026, I didn't post once. It's the longest gap in the entire dataset — by a wide margin.
          </p>
        </div>

        {/* Break Timeline Visualization */}
        <div className="clean-card p-6 sm:p-10 mb-10 overflow-hidden">
          <div className="w-full">
            <svg ref={svgRef} className="w-full h-auto select-none" />
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="clean-card-tight p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-ink font-mono">
              73 days
            </div>
            <div className="text-xs text-ink-soft mt-1.5">
              Length of the break
            </div>
          </div>

          <div className="clean-card-tight p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-ink font-mono">
              145 → 46
            </div>
            <div className="text-xs text-ink-soft mt-1.5">
              Median likes, before → after (excl. viral outliers)
            </div>
          </div>

          <div className="clean-card-tight p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-ink font-mono">
              1.7/wk → 0.5/wk
            </div>
            <div className="text-xs text-ink-soft mt-1.5">
              Posting frequency, before → after
            </div>
          </div>
        </div>

        {/* Observation Note */}
        <p className="text-xs sm:text-sm text-center text-ink-faint italic max-w-2xl mx-auto leading-relaxed">
          This is an observation, not a proof of causation — the data can't tell us why the break happened, or fully separate "I posted less" from "the account lost momentum" from "something about my content or TikTok's algorithm also changed" in the same window.
        </p>
      </div>
    </section>
  );
};
