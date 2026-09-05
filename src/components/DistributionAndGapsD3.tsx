import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HISTOGRAM_BINS, ENRICHED_POSTS } from '../data/postsData';

export const DistributionAndGapsD3: React.FC = () => {
  const histSvgRef = useRef<SVGSVGElement | null>(null);
  const gapSvgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredHist, setHoveredHist] = useState<{ label: string; count: number } | null>(null);
  const [hoveredGap, setHoveredGap] = useState<{ index: number; gap: number; date: string } | null>(null);

  // Render Histogram
  useEffect(() => {
    if (!histSvgRef.current) return;
    const svg = d3.select(histSvgRef.current);
    svg.selectAll('*').remove();

    const width = 460;
    const height = 280;
    const margin = { top: 20, right: 15, bottom: 40, left: 35 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3.scaleBand()
      .domain(HISTOGRAM_BINS.map(b => b.label))
      .range([margin.left, width - margin.right])
      .padding(0.25);

    const y = d3.scaleLinear()
      .domain([0, Math.max(...HISTOGRAM_BINS.map(b => b.count)) + 2])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    svg.append('g')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-dasharray', '2 3');

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(8))
      .call(g => g.select('.domain').remove())
      .attr('class', 'text-ink-faint text-[11px] font-mono');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8))
      .call(g => g.select('.domain').remove())
      .attr('class', 'text-ink-faint text-[11px] font-mono');

    // Bars
    svg.selectAll('.hist-bar')
      .data(HISTOGRAM_BINS)
      .enter()
      .append('rect')
      .attr('class', 'hist-bar')
      .attr('x', d => x(d.label) || 0)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - margin.bottom - y(d.count))
      .attr('rx', 4)
      .attr('fill', '#2b96a8')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => setHoveredHist(d))
      .on('mouseleave', () => setHoveredHist(null));

    // Count labels on bars
    svg.selectAll('.bar-label')
      .data(HISTOGRAM_BINS)
      .enter()
      .append('text')
      .attr('x', d => (x(d.label) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.8)
      .text(d => d.count);

  }, []);

  // Render Inter-Post Gap Bar Chart
  useEffect(() => {
    if (!gapSvgRef.current) return;
    const svg = d3.select(gapSvgRef.current);
    svg.selectAll('*').remove();

    const width = 460;
    const height = 280;
    const margin = { top: 20, right: 15, bottom: 40, left: 35 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const gapPosts = ENRICHED_POSTS.slice(1);
    const xScale = d3.scaleLinear()
      .domain([0, gapPosts.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 75])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    svg.append('g')
      .selectAll('line')
      .data([10, 20, 40, 60, 73])
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-dasharray', '2 3');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickValues([0, 20, 40, 60, 73]).tickSize(0).tickPadding(8))
      .call(g => g.select('.domain').remove())
      .attr('class', 'text-ink-faint text-[11px] font-mono');

    // X Axis baseline
    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', height - margin.bottom)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.15);

    // Bars for gaps
    svg.selectAll('.gap-bar')
      .data(gapPosts)
      .enter()
      .append('rect')
      .attr('class', 'gap-bar')
      .attr('x', (d, i) => xScale(i) - 2)
      .attr('y', d => yScale(d.gapDays))
      .attr('width', 4)
      .attr('height', d => height - margin.bottom - yScale(d.gapDays))
      .attr('rx', 2)
      .attr('fill', d => d.gapDays >= 70 ? '#e3a45f' : (d.gapDays > 10 ? '#8ec1a1' : '#2b96a8'))
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => setHoveredGap({ index: d.index, gap: d.gapDays, date: d.date }))
      .on('mouseleave', () => setHoveredGap(null));

    // Callout for the 73d break
    const breakPostIdx = gapPosts.findIndex(p => p.gapDays >= 70);
    if (breakPostIdx >= 0) {
      const bx = xScale(breakPostIdx);
      const by = yScale(73);

      svg.append('text')
        .attr('x', bx)
        .attr('y', by - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('fill', '#e3a45f')
        .text('73d Break');
    }

  }, []);

  return (
    <section className="py-20 border-b border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
            Exploratory Data Analysis · Question 03
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
            What does a "typical" post look like, and how often did I actually post?
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            Comparing the right-skewed like distribution against the intervals between consecutive releases.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Histogram Card */}
          <div className="clean-card p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-ink">
                Likes per post — distribution
              </h3>
              {hoveredHist && (
                <span className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400">
                  {hoveredHist.label}: {hoveredHist.count} posts
                </span>
              )}
            </div>
            <div className="w-full">
              <svg ref={histSvgRef} className="w-full h-auto" />
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 text-xs text-ink-faint">
              Median: 149 likes. Mean: 4,257 — pulled up entirely by two outliers.
            </div>
          </div>

          {/* Inter-post Gap Card */}
          <div className="clean-card p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-ink">
                Days between consecutive posts
              </h3>
              {hoveredGap && (
                <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {hoveredGap.date}: {hoveredGap.gap}d gap
                </span>
              )}
            </div>
            <div className="w-full">
              <svg ref={gapSvgRef} className="w-full h-auto" />
            </div>
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 text-xs text-ink-faint">
              Median gap: 2 days. The tallest bar — 73 days — is <b className="text-amber-600 dark:text-amber-400">The Break</b>, more than 4× the next-longest gap.
            </div>
          </div>
        </div>

        {/* Finding Box */}
        <div className="mt-8 p-5 rounded-2xl clean-card-tight bg-teal-500/[0.04] border-teal-500/20">
          <p className="text-sm text-ink-soft leading-relaxed">
            <b className="text-ink">Finding — </b>
            the distribution is heavily right-skewed, which is typical of social platforms: most posts perform modestly, and a small number carry disproportionate reach. Posting rhythm was near-daily to every few days for the first four months, then stretched out increasingly before collapsing into the break.
          </p>
        </div>
      </div>
    </section>
  );
};
