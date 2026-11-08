import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Clock, TrendingUp, Calendar, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { ENRICHED_POSTS, CHANNEL_METRICS, PHASE_DEFS } from '../data/postsData';
import { EnrichedPost } from '../types';

export const HeroSection: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredPost, setHoveredPost] = useState<EnrichedPost | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 480;
    const height = 300;
    const pad = 24;
    const n = ENRICHED_POSTS.length;
    const midY = height / 2 + 10;

    // Defs for gradient
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'heroLineGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    grad.append('stop').attr('offset', '0%').attr('stop-color', '#7fd0d6');
    grad.append('stop').attr('offset', '45%').attr('stop-color', '#2b96a8');
    grad.append('stop').attr('offset', '75%').attr('stop-color', '#8ec1a1');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#e3a45f');

    // Central axis line
    svg.append('line')
      .attr('x1', pad)
      .attr('y1', midY)
      .attr('x2', width - pad)
      .attr('y2', midY)
      .attr('stroke', 'url(#heroLineGrad)')
      .attr('stroke-width', 1.6)
      .attr('stroke-opacity', 0.6);

    const xScale = d3.scaleLinear()
      .domain([0, n - 1])
      .range([pad, width - pad]);

    const rScale = (likes: number) => 3.2 + Math.sqrt(Math.log10(likes + 1)) * 3.4;

    // Draw circles for each post
    const nodes = svg.selectAll('g.post-node')
      .data(ENRICHED_POSTS)
      .enter()
      .append('g')
      .attr('class', 'post-node')
      .attr('transform', (d, i) => {
        const cx = xScale(i);
        const jitter = ((i * 37) % 17 - 8) * 0.95;
        return `translate(${cx}, ${midY + jitter})`;
      });

    // Outer ring for viral outliers
    nodes.filter(d => d.isViralOutlier)
      .append('circle')
      .attr('r', d => rScale(d.likes) + 4)
      .attr('fill', d => d.phase.color)
      .attr('fill-opacity', 0.25);

    // Main circle
    nodes.append('circle')
      .attr('r', d => rScale(d.likes))
      .attr('fill', d => d.phase.color)
      .attr('fill-opacity', 0.9)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.2)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(150)
          .attr('r', rScale(d.likes) + 3)
          .attr('stroke-width', 2.5);
        setHoveredPost(d);
        const bounds = svgRef.current?.getBoundingClientRect();
        if (bounds) {
          setHoverPos({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top
          });
        }
      })
      .on('mouseleave', (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(150)
          .attr('r', rScale(d.likes))
          .attr('stroke-width', 1.2);
        setHoveredPost(null);
        setHoverPos(null);
      });

    // Milestone labels on top outliers
    nodes.filter(d => d.likes === Math.max(...ENRICHED_POSTS.map(p => p.likes)))
      .append('text')
      .attr('y', -24)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', '#1c7482')
      .text('Viral #1 (170k)');

    nodes.filter(d => d.likes === 96055)
      .append('text')
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', '#1c7482')
      .text('Viral #2 (96k)');

  }, []);

  return (
    <section id="hero" className="atmosphere pt-36 pb-20 border-b border-black/5 dark:border-white/5">
      {/* Soft atmospheric cloud orbs */}
      <div className="cloud-orb w-80 h-80 -top-24 right-10" />
      <div className="cloud-orb w-60 h-60 top-16 -left-12 opacity-40" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Narrative Headline */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 mb-5 text-teal-700 dark:text-teal-400 font-semibold text-sm">
              <Clock className="w-4 h-4" />
              <span>A personal data science project</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-ink leading-none mb-4">
              Behind<br />the Views
            </h1>

            <p className="text-xl sm:text-2xl font-medium text-ink-soft mb-5">
              A Data-Driven Analysis of My TikTok Journey
            </p>

            <p className="text-base sm:text-lg text-ink-soft leading-relaxed max-w-xl mb-8">
              A close look at my own TikTok export — 69 posts spanning eleven months — to understand how my posting habits and my audience's response to them shifted over time, including the three-month stretch where I stopped posting entirely.
            </p>

            {/* Meta Stats Row */}
            <div className="flex flex-wrap items-center gap-8 text-sm text-ink-faint pt-4 border-t border-black/5 dark:border-white/5">
              <div>
                <strong className="block text-2xl font-semibold text-ink font-mono">69</strong>
                <span>posts examined</span>
              </div>
              <div>
                <strong className="block text-2xl font-semibold text-ink font-mono">11 mo</strong>
                <span>span of activity</span>
              </div>
              <div>
                <strong className="block text-2xl font-semibold text-amber-600 dark:text-amber-400 font-mono">1</strong>
                <span>major break (73d)</span>
              </div>
              <div>
                <strong className="block text-2xl font-semibold text-teal-700 dark:text-teal-400 font-mono">{`${CHANNEL_METRICS.top2Percentage}%`}</strong>
                <span>likes from top 2</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Timeline Canvas */}
          <div className="lg:col-span-5">
            <div className="clean-card p-6 sm:p-7 relative min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="text-xs text-ink-faint font-mono mb-1">
                  Aug 2025 → Jul 2026
                </div>
                <div className="text-base font-semibold text-ink mb-3">
                  Every post, in order of posting
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono mb-2">
                  {PHASE_DEFS.map(p => (
                    <span key={p.name} className="inline-flex items-center gap-1 text-ink-soft">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name.replace('The ', '')}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 text-ink-faint">
                    <span className="w-2 h-2 rounded-full bg-[#c7d4d8]" />
                    Hiatus
                  </span>
                </div>
              </div>

              {/* D3 Vector Canvas */}
              <div className="relative my-auto flex justify-center items-center py-2 overflow-hidden">
                <svg
                  ref={svgRef}
                  viewBox="0 0 480 300"
                  className="w-full h-auto select-none"
                />

                {/* Hover Tooltip */}
                {hoveredPost && hoverPos && (
                  <div
                    className="absolute z-20 pointer-events-none clean-card-tight p-2.5 text-xs shadow-xl border border-black/10 dark:border-white/10"
                    style={{
                      left: `${Math.min(Math.max(hoverPos.x - 70, 10), 320)}px`,
                      top: `${Math.max(hoverPos.y - 80, 10)}px`,
                    }}
                  >
                    <div className="font-mono text-[10px] text-ink-faint">
                      Post #{hoveredPost.index + 1} · {hoveredPost.date} ({hoveredPost.dayOfWeek})
                    </div>
                    <div className="font-bold text-ink text-sm font-mono mt-0.5">
                      {hoveredPost.likes.toLocaleString()} likes
                    </div>
                    <div className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                      Phase: {hoveredPost.phase.name}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-ink-faint font-mono">
                <span>Radius ∝ log(likes)</span>
                <span>Hover circle for details</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

