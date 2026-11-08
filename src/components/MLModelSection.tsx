import React, { useState } from 'react';
import { CHANNEL_METRICS } from '../data/postsData';
import { illustrativeScore, ScenarioInputs } from '../lib/illustrativeModel';

export const MLModelSection: React.FC = () => {
  const [inputs, setInputs] = useState<ScenarioInputs>({ gapDays: 2, dayOfWeek: 2, uploadHour: 9, duration: 22, isPreBreak: true });
  const result = illustrativeScore(inputs);
  const sliders = [
    { key: 'gapDays', label: 'Days since previous upload', min: 0, max: 60 },
    { key: 'uploadHour', label: 'Upload hour (UTC)', min: 0, max: 23 },
    { key: 'duration', label: 'Video duration (seconds)', min: 8, max: 60 },
  ] as const;
  return (
    <section id="model" className="py-24 border-b border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase font-mono">Modeling demonstration</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-ink mb-4">Illustrative engagement score</h2>
          <p className="text-ink-soft">Explore how manually chosen assumptions change a logistic score. These weights were not learned from the dataset, and the score is not a calibrated probability of future engagement.</p>
        </div>
        <div className="clean-card p-6 mb-8 border border-amber-500/30" role="note">
          <h3 className="font-bold text-ink mb-2">Evaluation status: not evaluated</h3>
          <p className="text-sm text-ink-soft">No reproducible training run, held-out predictions or model artifact is provided. Accuracy, precision, recall, F1, ROC-AUC and a confusion matrix are therefore not reported. The former fixed evaluation figures have been removed.</p>
          <p className="text-sm text-ink-soft mt-3">Observed dataset reference: {CHANNEL_METRICS.totalPosts} posts, median {CHANNEL_METRICS.overallMedianLikes} likes. These descriptive statistics do not validate this demonstration.</p>
        </div>
        <div className="clean-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-ink">Adjust the assumptions</h3>
            {sliders.map(({ key, label, min, max }) => (
              <div key={key}>
                <label htmlFor={`model-${key}`} className="block text-sm text-ink mb-2">{label}: <b>{inputs[key]}</b></label>
                <input id={`model-${key}`} type="range" min={min} max={max} value={inputs[key]} onChange={event => setInputs(previous => ({ ...previous, [key]: Number(event.target.value) }))} className="w-full accent-teal-600" />
              </div>
            ))}
            <div>
              <label htmlFor="model-weekday" className="block text-sm text-ink mb-2">Day of week</label>
              <select id="model-weekday" value={inputs.dayOfWeek} onChange={event => setInputs(previous => ({ ...previous, dayOfWeek: Number(event.target.value) }))} className="w-full rounded-lg p-2 bg-base text-ink border border-black/20 dark:border-white/20">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => <option key={day} value={index}>{day}</option>)}
              </select>
            </div>
            <label className="flex gap-3 items-center text-sm text-ink">
              <input type="checkbox" checked={inputs.isPreBreak} onChange={event => setInputs(previous => ({ ...previous, isPreBreak: event.target.checked }))} />
              Assume active / pre-break momentum
            </label>
          </div>
          <div className="clean-card-tight p-6">
            <div className="text-xs uppercase font-mono text-ink-faint">Illustrative score · 0–100 scale</div>
            <output aria-live="polite" className="block text-4xl font-bold font-mono text-teal-700 dark:text-teal-400 my-4">{result.score.toFixed(1)} / 100</output>
            <p className="text-sm text-ink-soft mb-5">A higher score only reflects the chosen rules. It is not an estimated percentage chance, predicted like count, or recommendation supported by validation.</p>
            <h4 className="font-bold text-ink mb-3">Manual contributions</h4>
            <dl className="space-y-2 text-xs font-mono text-ink-soft">
              {result.contributions.map(item => <div key={item.label} className="flex justify-between gap-3"><dt>{item.label}</dt><dd>{item.value.toFixed(3)}</dd></div>)}
              <div className="flex justify-between border-t border-black/10 dark:border-white/10 pt-2"><dt>Sum (z)</dt><dd>{result.logit.toFixed(3)}</dd></div>
            </dl>
            <p className="text-xs font-mono text-ink-faint mt-4">score = 100 / (1 + exp(−z))</p>
          </div>
        </div>
        <p className="text-sm text-ink-soft mt-6">To report model performance later: define the prediction task, use training-only preprocessing and target thresholds, evaluate against a baseline on a chronological holdout, and publish the code, split and predictions. With this small dataset, uncertainty must be reported.</p>
      </div>
    </section>
  );
};
