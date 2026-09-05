import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { X } from 'lucide-react';
import { CHANNEL_METRICS } from '../data/postsData';

interface ScenarioSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ isOpen, onClose }) => {
  const [preventBreak, setPreventBreak] = useState<boolean>(true);
  const [targetCadence, setTargetCadence] = useState<number>(1.8); // posts per week
  const [baselineMedian] = useState<number>(145);
  const [includeViralSpike, setIncludeViralSpike] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute counterfactual trajectory
  const simulationResult = React.useMemo(() => {
    const breakWeeks = 73 / 7;
    const additionalPostsCount = preventBreak ? Math.round(breakWeeks * targetCadence) : 0;
    
    let syntheticLikes = 0;
    for (let i = 0; i < additionalPostsCount; i++) {
      const factor = 0.85 + ((i * 17) % 7) * 0.05;
      syntheticLikes += Math.round(baselineMedian * factor);
    }

    if (includeViralSpike && preventBreak) {
      syntheticLikes += 65000;
    }

    const baselineTotal = CHANNEL_METRICS.totalLikes;
    const projectedTotal = baselineTotal + syntheticLikes;
    const gainPct = ((syntheticLikes / baselineTotal) * 100).toFixed(1);

    return {
      additionalPostsCount,
      syntheticLikes,
      projectedTotal,
      gainPct
    };
  }, [preventBreak, targetCadence, baselineMedian, includeViralSpike]);

  // Render D3 trajectory comparison
  useEffect(() => {
    if (!svgRef.current || !isOpen) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 680;
    const height = 260;
    const margin = { top: 25, right: 30, bottom: 40, left: 60 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const actualCumulative = [500, 2500, 99000, 102000, 273000, 279000, 285000, 291000, 292000, 292000, 292000, 293710];

    const simCumulative = [...actualCumulative];
    if (preventBreak) {
      const monthlyAdd = simulationResult.syntheticLikes / 3;
      simCumulative[9] += monthlyAdd * 0.4;
      simCumulative[10] += monthlyAdd * 1.5;
      simCumulative[11] += simulationResult.syntheticLikes;
    }

    const xScale = d3.scaleLinear()
      .domain([0, months.length - 1])
      .range([margin.left, width - margin.right]);

    const maxVal = Math.max(...simCumulative) * 1.08;
    const yScale = d3.scaleLinear()
      .domain([0, maxVal])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    svg.append('g')
      .selectAll('line')
      .data(yScale.ticks(4))
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
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(12).tickFormat((_, i) => months[i]).tickSize(0).tickPadding(8))
      .call(g => g.select('.domain').remove())
      .attr('class', 'text-ink-faint text-[11px] font-mono');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(d => `${Math.round(Number(d) / 1000)}k`).tickSize(0).tickPadding(8))
      .call(g => g.select('.domain').remove())
      .attr('class', 'text-ink-faint text-[11px] font-mono');

    // Actual Line
    const lineAct = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(actualCumulative)
      .attr('fill', 'none')
      .attr('stroke', '#2b96a8')
      .attr('stroke-width', 2.5)
      .attr('d', lineAct);

    // Simulated Line
    if (preventBreak) {
      svg.append('path')
        .datum(simCumulative)
        .attr('fill', 'none')
        .attr('stroke', '#e3a45f')
        .attr('stroke-width', 2.2)
        .attr('stroke-dasharray', '4 4')
        .attr('d', lineAct);
    }

  }, [isOpen, simulationResult, preventBreak]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="clean-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-base shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-black/5 dark:border-white/5">
          <div>
            <span className="text-xs font-mono text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider block mb-1">
              Counterfactual Simulator
            </span>
            <h2 className="text-xl font-bold text-ink">
              What if the 73-day break had not occurred?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full clean-card-tight text-ink-soft hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl clean-card-tight">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold text-ink uppercase">Fill 73-Day Break</label>
              <input
                type="checkbox"
                checked={preventBreak}
                onChange={(e) => setPreventBreak(e.target.checked)}
                className="w-4 h-4 accent-teal-600 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              Models continuous publishing across Feb – May 2026.
            </p>
          </div>

          <div className="p-4 rounded-xl clean-card-tight">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono font-bold text-ink uppercase">Cadence</label>
              <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">{targetCadence} / wk</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              disabled={!preventBreak}
              value={targetCadence}
              onChange={(e) => setTargetCadence(parseFloat(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-ink-faint mt-1">
              <span>0.5/wk</span>
              <span>1.7/wk (winter)</span>
              <span>4/wk</span>
            </div>
          </div>

          <div className="p-4 rounded-xl clean-card-tight">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold text-ink uppercase">Spring Viral Spike</label>
              <input
                type="checkbox"
                disabled={!preventBreak}
                checked={includeViralSpike}
                onChange={(e) => setIncludeViralSpike(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              Hypothesizes a 3rd viral hit (+65k likes) in spring.
            </p>
          </div>
        </div>

        {/* D3 Simulation Chart */}
        <div className="p-4 rounded-xl clean-card-tight mb-6">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-mono text-[11px] font-bold text-ink uppercase">
              Actual vs Counterfactual Lifetime Likes
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-teal-700 dark:text-teal-400">Actual (293.7k)</span>
              <span className="text-amber-600 dark:text-amber-400">Simulated ({Math.round(simulationResult.projectedTotal / 1000)}k)</span>
            </div>
          </div>
          <svg ref={svgRef} className="w-full h-auto select-none" />
        </div>

        {/* Result Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-center font-mono">
          <div className="p-3 rounded-xl clean-card-tight">
            <div className="text-[10px] text-ink-faint uppercase mb-0.5">Synthetic Posts</div>
            <div className="text-lg font-bold text-ink">{simulationResult.additionalPostsCount}</div>
          </div>
          <div className="p-3 rounded-xl clean-card-tight">
            <div className="text-[10px] text-ink-faint uppercase mb-0.5">Simulated Delta</div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              +{simulationResult.syntheticLikes.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl clean-card-tight">
            <div className="text-[10px] text-ink-faint uppercase mb-0.5">Projected Total</div>
            <div className="text-lg font-bold text-teal-700 dark:text-teal-400">
              {simulationResult.projectedTotal.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl clean-card-tight">
            <div className="text-[10px] text-ink-faint uppercase mb-0.5">Relative Gain</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{simulationResult.gainPct}%</div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-black/5 dark:border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-teal-700 dark:bg-teal-500 text-white font-mono text-xs font-bold hover:bg-teal-800 transition-colors"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
