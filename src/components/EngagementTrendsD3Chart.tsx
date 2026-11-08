import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ENRICHED_POSTS, CHANNEL_METRICS, PHASE_DEFS } from '../data/postsData';
import { EnrichedPost } from '../types';

export const EngagementTrendsD3Chart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [scaleMode, setScaleMode] = useState<'log' | 'linear'>('log');
  const [showRollingAverage, setShowRollingAverage] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<EnrichedPost | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Compute 5-post rolling median
  const rollingMedians = React.useMemo(() => {
    return ENRICHED_POSTS.map((_, idx, arr) => {
      const start = Math.max(0, idx - 2);
      const end = Math.min(arr.length, idx + 3);
      const windowLikes = arr.slice(start, end).map(p => p.likes).sort((a, b) => a - b);
      const med = windowLikes[Math.floor(windowLikes.length / 2)];
      return { index: idx, date: arr[idx].date, medianLikes: med };
    });
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 360;
    const margin = { top: 30, right: 30, bottom: 45, left: 56 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height);

    // X Scale
    const xScale = d3.scaleLinear()
      .domain([0, ENRICHED_POSTS.length - 1])
      .range([margin.left, width - margin.right]);

    // Y Scale
    let yScale: d3.ScaleContinuousNumeric<number, number>;
    if (scaleMode === 'log') {
      yScale = d3.scaleLog()
        .domain([10, 250000])
        .range([height - margin.bottom, margin.top]);
    } else {
      yScale = d3.scaleLinear()
        .domain([0, 180000])
        .nice()
        .range([height - margin.bottom, margin.top]);
    }

    // Grid lines
    const yTicks = scaleMode === 'log' ? [10, 100, 1000, 10000, 100000] : [25000, 50000, 100000, 150000];

    svg.append('g')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-dasharray', '2 3');

    // X Axis
    const xAxisTicks = [0, 15, 24, 38, 50, 63, 68];
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(xScale)
          .tickValues(xAxisTicks)
          .tickFormat(d => {
            const p = ENRICHED_POSTS[Number(d)];
            return p ? p.date : '';
          })
          .tickSize(0)
          .tickPadding(12)
      )
      .call(g => g.select('.domain').remove())
      .attr('class', 'text-ink-faint text-[11px] font-mono');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(yScale)
          .tickValues(yTicks)
          .tickFormat(d => {
            const v = Number(d);
            if (v >= 1000) return `${v / 1000}k`;
            return `${v}`;
          })
          .tickSize(0)
          .tickPadding(10)
      )
      .call(g => g.select('.domain').remove())
      .attr('class', 'text-ink-faint text-[11px] font-mono');

    // Trend connector line
    const lineGenerator = d3.line<EnrichedPost>()
      .x(d => xScale(d.index))
      .y(d => yScale(Math.max(d.likes, scaleMode === 'log' ? 10 : 0)))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(ENRICHED_POSTS)
      .attr('fill', 'none')
      .attr('stroke', '#2b96a8')
      .attr('stroke-opacity', 0.35)
      .attr('stroke-width', 1.6)
      .attr('d', lineGenerator);

    // Rolling Median line
    if (showRollingAverage) {
      const rollingLineGen = d3.line<{ index: number; medianLikes: number }>()
        .x(d => xScale(d.index))
        .y(d => yScale(Math.max(d.medianLikes, scaleMode === 'log' ? 10 : 0)))
        .curve(d3.curveBasis);

      svg.append('path')
        .datum(rollingMedians)
        .attr('fill', 'none')
        .attr('stroke', '#e3a45f')
        .attr('stroke-width', 2.2)
        .attr('stroke-dasharray', '4 4')
        .attr('d', rollingLineGen);
    }

    // Circles
    const rScale = (likes: number) => {
      if (scaleMode === 'log') {
        return 3.0 + Math.sqrt(Math.log10(likes + 1)) * 2.8;
      }
      return 3.5 + Math.min(Math.sqrt(likes) * 0.04, 14);
    };

    svg.append('g')
      .selectAll('circle')
      .data(ENRICHED_POSTS)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.index))
      .attr('cy', d => yScale(Math.max(d.likes, scaleMode === 'log' ? 10 : 0)))
      .attr('r', d => rScale(d.likes))
      .attr('fill', d => d.phase.color)
      .attr('fill-opacity', 0.9)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.2)
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        const bounds = container.getBoundingClientRect();
        setHoveredPoint(d);
        setTooltipPos({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top
        });
      })
      .on('mouseleave', () => {
        setHoveredPoint(null);
        setTooltipPos(null);
      });

    // Annotations for viral outliers
    const viral1 = ENRICHED_POSTS.find(p => p.likes === 170673);
    if (viral1) {
      const xPos = xScale(viral1.index);
      const yPos = yScale(viral1.likes);
      svg.append('line')
        .attr('x1', xPos)
        .attr('y1', yPos - 10)
        .attr('x2', xPos)
        .attr('y2', yPos - 28)
        .attr('stroke', '#1c7482')
        .attr('stroke-width', 1.2);

      svg.append('text')
        .attr('x', xPos)
        .attr('y', yPos - 32)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', '#1c7482')
        .text('Oct 1: 170,673 likes (#1)');
    }

    const viral2 = ENRICHED_POSTS.find(p => p.likes === 96055);
    if (viral2) {
      const vx = xScale(viral2.index);
      const vy = yScale(viral2.likes);
      svg.append('line')
        .attr('x1', vx)
        .attr('y1', vy - 10)
        .attr('x2', vx)
        .attr('y2', vy - 28)
        .attr('stroke', '#1c7482')
        .attr('stroke-width', 1.2);

      svg.append('text')
        .attr('x', vx)
        .attr('y', vy - 32)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', '#1c7482')
        .text('Aug 26: 96,055 likes (#2)');
    }

  }, [scaleMode, showRollingAverage]);

  return (
    <section className="py-20 border-b border-black/5 dark:border-white/5 bg-secondary/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
            Exploratory Data Analysis · Question 02
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
            How did engagement per post change over time?
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            Likes per post plotted chronologically, capturing the massive magnitude gap between ordinary uploads and two viral hits.
          </p>
        </div>

        {/* Chart Card */}
        <div className="clean-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-ink">
                Likes per post over time ({scaleMode} scale)
              </h3>
              <p className="text-xs text-ink-faint mt-0.5">
                Log scale is used because two posts are 100–1,000× larger than typical posts
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="inline-flex rounded-full p-1 bg-black/5 dark:bg-white/5">
                <button
                  onClick={() => setScaleMode('log')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    scaleMode === 'log'
                      ? 'bg-teal-700 dark:bg-teal-500 text-white'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Log
                </button>
                <button
                  onClick={() => setScaleMode('linear')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    scaleMode === 'linear'
                      ? 'bg-teal-700 dark:bg-teal-500 text-white'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Linear
                </button>
              </div>

              <button
                onClick={() => setShowRollingAverage(!showRollingAverage)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-colors ${
                  showRollingAverage
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium'
                    : 'border-transparent bg-black/5 dark:bg-white/5 text-ink-soft hover:text-ink'
                }`}
              >
                <span className="w-2 h-0.5 border-b-2 border-dashed border-amber-500" />
                <span>Rolling Median</span>
              </button>
            </div>
          </div>

          {/* D3 Canvas */}
          <div ref={containerRef} className="relative w-full overflow-hidden">
            <svg ref={svgRef} className="w-full h-auto select-none" />

            {/* Tooltip */}
            {hoveredPoint && tooltipPos && (
              <div
                className="absolute pointer-events-none z-30 px-3 py-2 rounded-xl clean-card-tight border border-black/10 dark:border-white/10 shadow-xl text-xs"
                style={{
                  left: Math.min(containerRef.current?.clientWidth! - 200, Math.max(10, tooltipPos.x - 80)),
                  top: Math.max(10, tooltipPos.y - 95)
                }}
              >
                <div className="flex items-center justify-between gap-2 font-semibold">
                  <span className="text-ink">Post #{hoveredPoint.index + 1}</span>
                  <span
                    className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold"
                    style={{ backgroundColor: `${hoveredPoint.phase.color}25`, color: hoveredPoint.phase.color }}
                  >
                    {hoveredPoint.phase.name}
                  </span>
                </div>
                <div className="text-ink-faint text-[11px] font-mono mt-0.5">
                  {hoveredPoint.date} · Gap: {hoveredPoint.gapDays}d
                </div>
                <div className="text-sm font-bold text-teal-700 dark:text-teal-400 font-mono mt-1">
                  {hoveredPoint.likes.toLocaleString()} likes
                </div>
                <div className="text-[10px] text-ink-faint font-mono mt-0.5">
                  {((hoveredPoint.likes / CHANNEL_METRICS.totalLikes) * 100).toFixed(2)}% of lifetime likes
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 text-xs text-ink-faint">
            Log scale is used because two posts (Aug 26 and Oct 1) are 100–1,000× larger than a typical post and would otherwise flatten every other point.
          </div>
        </div>

        {/* Finding Box */}
        <div className="mt-6 p-5 rounded-2xl clean-card-tight bg-teal-500/[0.04] border-teal-500/20">
          <p className="text-sm text-ink-soft leading-relaxed">
            <b className="text-ink">Finding — </b>
            two posts account for {`${CHANNEL_METRICS.top2Percentage}%`} of every like this account has ever received. Set those two aside, and the "typical" post held fairly steady around 100–270 likes through 2025, then dropped to its lowest levels of the whole dataset after the break.
          </p>
        </div>
      </div>
    </section>
  );
};

