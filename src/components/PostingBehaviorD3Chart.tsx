import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ENRICHED_POSTS, PHASE_DEFS } from '../data/postsData';

interface WeekDatum {
  startDate: Date;
  endDate: Date;
  label: string;
  count: number;
  phase: { id: string; name: string; color: string; start: string; end: string; description: string };
  posts: string[];
}

export const PostingBehaviorD3Chart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activePhaseFilter, setActivePhaseFilter] = useState<string | null>(null);
  const [hoveredWeek, setHoveredWeek] = useState<{
    label: string;
    count: number;
    phaseName: string;
    phaseColor: string;
    posts: string[];
    x: number;
    y: number;
  } | null>(null);

  // Compute weekly bins
  const weeklyData = useMemo<WeekDatum[]>(() => {
    const start = new Date('2025-08-04T00:00:00');
    const end = new Date('2026-07-20T00:00:00');
    const weeks: WeekDatum[] = [];

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 7)) {
      const wStart = new Date(d);
      const wEnd = new Date(d);
      wEnd.setDate(wEnd.getDate() + 7);

      const inWeekPosts = ENRICHED_POSTS.filter(p => p.dateObj >= wStart && p.dateObj < wEnd);
      const count = inWeekPosts.length;
      
      let phase = { id: 'break', name: 'The Break', color: '#c7d4d8', start: '2026-02-18', end: '2026-05-01', description: 'Break' };
      if (inWeekPosts.length > 0) {
        phase = inWeekPosts[0].phase;
      } else {
        const midDateStr = new Date(wStart.getTime() + 3.5 * 24 * 3600 * 1000).toISOString().split('T')[0];
        if (midDateStr >= '2026-02-18' && midDateStr <= '2026-05-01') {
          phase = { id: 'break', name: 'The Break', color: '#c7d4d8', start: '2026-02-18', end: '2026-05-01', description: 'Break' };
        } else {
          phase = { id: 'gap', name: 'No uploads', color: '#e2e8eb', start: '', end: '', description: '' };
        }
      }

      weeks.push({
        startDate: wStart,
        endDate: wEnd,
        label: wStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
        phase,
        posts: inWeekPosts.map(p => `${p.date} (${p.likes.toLocaleString()} likes)`)
      });
    }

    return weeks;
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 40, left: 36 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height);

    const x = d3.scaleBand()
      .domain(weeklyData.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.25);

    const maxCount = Math.max(...weeklyData.map(d => d.count), 5);
    const y = d3.scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    const yTicks = y.ticks(5);
    svg.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-dasharray', '2 3');

    // Y Axis Labels
    svg.append('g')
      .selectAll('text')
      .data(yTicks)
      .enter()
      .append('text')
      .attr('x', margin.left - 10)
      .attr('y', d => y(d) + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .text(d => d);

    // X Axis Labels (every ~4 weeks)
    const tickFilter = (_d: string, i: number) => i % 4 === 0;
    svg.append('g')
      .selectAll('text')
      .data(weeklyData.filter((d, i) => tickFilter(d.label, i)))
      .enter()
      .append('text')
      .attr('x', (d: any) => (x(d.label) || 0) + x.bandwidth() / 2)
      .attr('y', height - margin.bottom + 22)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .text((d: any) => d.label);

    // Bars
    svg.append('g')
      .selectAll('rect')
      .data(weeklyData)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.label) || 0)
      .attr('width', x.bandwidth())
      .attr('y', (d: any) => d.count > 0 ? y(d.count) : y(0) - 2)
      .attr('height', (d: any) => d.count > 0 ? (height - margin.bottom - y(d.count)) : 2)
      .attr('rx', 3)
      .attr('fill', (d: any) => {
        if (activePhaseFilter && d.phase.id !== activePhaseFilter) {
          return '#e2e8eb40';
        }
        return d.count === 0 ? '#c7d4d840' : d.phase.color;
      })
      .attr('cursor', 'pointer')
      .on('mouseenter', (event: any, d: any) => {
        const bounds = container.getBoundingClientRect();
        setHoveredWeek({
          label: d.label,
          count: d.count,
          phaseName: d.phase.name,
          phaseColor: d.phase.color,
          posts: d.posts,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top
        });
      })
      .on('mouseleave', () => setHoveredWeek(null));

    // Hiatus bracket label
    const breakWeeks = weeklyData.filter(d => d.phase.id === 'break');
    if (breakWeeks.length > 0) {
      const firstX = (x(breakWeeks[0].label) || 0);
      const lastX = (x(breakWeeks[breakWeeks.length - 1].label) || 0) + x.bandwidth();

      svg.append('line')
        .attr('x1', firstX)
        .attr('x2', lastX)
        .attr('y1', margin.top + 8)
        .attr('y2', margin.top + 8)
        .attr('stroke', '#e3a45f')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3 3');

      svg.append('text')
        .attr('x', (firstX + lastX) / 2)
        .attr('y', margin.top + 24)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e3a45f')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('font-family', 'Inter, sans-serif')
        .text('The 73-Day Break (0 posts)');
    }

  }, [weeklyData, activePhaseFilter]);

  return (
    <section id="eda" className="py-20 border-b border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
            Exploratory Data Analysis · Question 01
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
            How did my posting behavior change over time?
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            Tracking posts per week reveals how cadence progressed across eleven months, highlighting the sudden 73-day interruption in early 2026.
          </p>
        </div>

        {/* Chart Card */}
        <div className="clean-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-ink">
                Posts per week, by phase
              </h3>
              <p className="text-xs text-ink-faint mt-0.5">
                Weeks with zero posts are shown as gaps — the widest one is The Break
              </p>
            </div>

            {/* Phase Filter Legend */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setActivePhaseFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activePhaseFilter === null
                    ? 'bg-teal-700 dark:bg-teal-500 text-white'
                    : 'bg-black/5 dark:bg-white/5 text-ink-soft hover:text-ink'
                }`}
              >
                All
              </button>
              {PHASE_DEFS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePhaseFilter(activePhaseFilter === p.id ? null : p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors border ${
                    activePhaseFilter === p.id
                      ? 'border-teal-600 bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold'
                      : 'border-transparent bg-black/5 dark:bg-white/5 text-ink-soft hover:text-ink'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name.replace('The ', '')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* D3 Canvas */}
          <div ref={containerRef} className="relative w-full overflow-hidden">
            <svg ref={svgRef} className="w-full h-auto select-none" />

            {/* Hover Tooltip */}
            {hoveredWeek && (
              <div
                className="absolute pointer-events-none z-30 px-3 py-2 rounded-xl clean-card-tight border border-black/10 dark:border-white/10 shadow-xl text-xs"
                style={{
                  left: Math.min(containerRef.current?.clientWidth! - 180, Math.max(10, hoveredWeek.x - 70)),
                  top: Math.max(10, hoveredWeek.y - 75)
                }}
              >
                <div className="flex items-center justify-between gap-3 font-semibold">
                  <span className="text-ink">Week of {hoveredWeek.label}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                    style={{ backgroundColor: `${hoveredWeek.phaseColor}25`, color: hoveredWeek.phaseColor }}
                  >
                    {hoveredWeek.phaseName}
                  </span>
                </div>
                <div className="text-sm font-bold text-teal-700 dark:text-teal-400 font-mono mt-0.5">
                  {hoveredWeek.count} post{hoveredWeek.count === 1 ? '' : 's'}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 text-xs text-ink-faint">
            Weekly post count across the full period. Weeks with zero posts are shown as empty slots.
          </div>
        </div>

        {/* Finding Box */}
        <div className="mt-6 p-5 rounded-2xl clean-card-tight bg-teal-500/[0.04] border-teal-500/20">
          <p className="text-sm text-ink-soft leading-relaxed">
            <b className="text-ink">Finding — </b>
            posting cadence fell in four visible steps: from roughly 4 posts a week during the first two phases, to under 2 a week through the winter, down to under 1 every two weeks after the break. The decline was gradual until the break, then sudden.
          </p>
        </div>
      </div>
    </section>
  );
};
