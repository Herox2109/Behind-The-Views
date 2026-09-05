import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ENRICHED_POSTS } from '../data/postsData';

export const PersonalContextSection: React.FC = () => {
  const sparkSvgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!sparkSvgRef.current) return;
    const svg = d3.select(sparkSvgRef.current);
    svg.selectAll('*').remove();

    const width = 1200;
    const height = 220;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'none');

    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'personalSparkGrad')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');

    grad.append('stop').attr('offset', '0%').attr('stop-color', '#2b96a8').attr('stop-opacity', '0.35');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#2b96a8').attr('stop-opacity', '0.0');

    const n = ENRICHED_POSTS.length;
    const maxLogLikes = Math.max(...ENRICHED_POSTS.map(p => p.logLikes));

    const xScale = d3.scaleLinear()
      .domain([0, n - 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, maxLogLikes])
      .range([height - 10, 20]);

    // Area generator
    const areaGen = d3.area<typeof ENRICHED_POSTS[0]>()
      .x((_, i) => xScale(i))
      .y0(height)
      .y1(d => yScale(d.logLikes))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(ENRICHED_POSTS)
      .attr('fill', 'url(#personalSparkGrad)')
      .attr('d', areaGen);

    // Line stroke
    const lineGen = d3.line<typeof ENRICHED_POSTS[0]>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d.logLikes))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(ENRICHED_POSTS)
      .attr('fill', 'none')
      .attr('stroke', '#2b96a8')
      .attr('stroke-width', 1.6)
      .attr('stroke-opacity', 0.45)
      .attr('d', lineGen);

  }, []);

  return (
    <section className="relative py-28 overflow-hidden border-b border-black/5 dark:border-white/5 atmosphere">
      {/* Background D3 SVG Sparkline */}
      <div className="absolute inset-x-0 bottom-0 h-56 pointer-events-none opacity-40">
        <svg ref={sparkSvgRef} className="w-full h-full" />
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
        <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-widest font-mono mb-4">
          Personal context
        </div>
        <blockquote className="text-2xl sm:text-4xl font-bold text-ink leading-tight tracking-tight mb-6">
          "I wasn't just analyzing a dataset. I was analyzing something I had actually built."
        </blockquote>
        <p className="text-base sm:text-lg text-ink-soft leading-relaxed max-w-2xl mx-auto mb-6">
          Every point in these charts is a video I filmed, edited, and posted myself — at 9:40 in the morning, most of the time, before doing anything else that day. The spike in October is a real moment I remember. The flat line in the spring is a real stretch where I stepped away. Treating my own history as data meant being honest about both.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-ink-faint">
          <span><b>Creator:</b> Behruzbek Shodmonov (@herox.cc)</span>
          <span>·</span>
          <span><b>Cadence:</b> 09:35 – 10:05 AM routine</span>
          <span>·</span>
          <span><b>Lifetime total:</b> 293,710 likes</span>
        </div>
      </div>
    </section>
  );
};
