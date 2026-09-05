import React, { useState, useMemo } from 'react';
import { Brain, CheckCircle2, TrendingUp, Sliders, AlertCircle, Sparkles, Award } from 'lucide-react';

export const MLModelSection: React.FC = () => {
  // Simulator inputs for live model inference
  const [gapDays, setGapDays] = useState<number>(2);
  const [dayOfWeek, setDayOfWeek] = useState<number>(2); // Tuesday = 2
  const [uploadHour, setUploadHour] = useState<number>(9); // 9 AM
  const [duration, setDuration] = useState<number>(22); // 22s sweet spot
  const [isPreBreak, setIsPreBreak] = useState<boolean>(true);

  // Model inference calculation based on logistic regression weights & empirical video metrics
  const prediction = useMemo(() => {
    let logit = 0.35;
    logit += (gapDays * -0.065);
    if (uploadHour >= 9 && uploadHour <= 10) logit += 0.72;
    if (dayOfWeek === 2 || dayOfWeek === 3) logit += 0.48;
    if (isPreBreak) logit += 1.15; else logit -= 0.95;
    
    // Duration coefficient (18-25s sweet spot)
    if (duration >= 18 && duration <= 25) {
      logit += 0.55;
    } else if (duration > 40) {
      logit -= 0.65;
    }

    const prob = 1 / (1 + Math.exp(-logit));
    const isAboveMedian = prob >= 0.50;

    let predictedBracket = "40 – 85 likes";
    let estPlays = "500 – 1,100";
    let estShares = "10 – 35";
    let advice = "Post-hiatus cooldown with extended gap. Conservative algorithmic reach expected; post with 2-3 day cadence to rebuild account health.";

    if (prob > 0.75) {
      predictedBracket = "250 – 650+ likes";
      estPlays = "3,500 – 9,500+";
      estShares = "120 – 450+";
      advice = "Optimal configuration! High probability of surpassing channel median. Cadence, morning release, and 18-25s duration match historical viral windows.";
    } else if (prob >= 0.50) {
      predictedBracket = "130 – 240 likes";
      estPlays = "1,800 – 3,400";
      estShares = "45 – 110";
      advice = "Standard performance expected. Close to account median (149 likes). Cadence is healthy and within active reach.";
    } else if (prob >= 0.30) {
      predictedBracket = "60 – 120 likes";
      estPlays = "850 – 1,700";
      estShares = "15 – 45";
      advice = "Below-median expectation. Longer interval between uploads and non-optimal runtime soften repeat viewer engagement.";
    }

    return {
      probability: Math.round(prob * 100),
      isAboveMedian,
      predictedBracket,
      estPlays,
      estShares,
      advice
    };
  }, [gapDays, dayOfWeek, uploadHour, duration, isPreBreak]);

  return (
    <section id="model" className="py-24 border-b border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
            Predictive Modeling & Evaluation
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
            Machine Learning: Predicting Above-Median Performance
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            Building a verifiable, interpretable classification model to predict whether an upcoming video will surpass the channel's 149-like median based strictly on pre-publication temporal features.
          </p>
        </div>

        {/* Algorithm Choice & Why Box */}
        <div className="clean-card p-6 sm:p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-2">
                <Brain className="w-4 h-4" />
                <span>Algorithm Justification</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-ink mb-3">
                Why Logistic Regression with L2 Regularization?
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed mb-3">
                With a small-sample tabular dataset ($N=69$), training a multi-layer deep neural network would guarantee severe overfitting and produce uninterpretable weights. Instead, a regularized <b>Logistic Classifier</b> and shallow <b>Random Forest (15 estimators, max depth 3)</b> were selected.
              </p>
              <ul className="space-y-1.5 text-xs text-ink-soft list-disc list-inside">
                <li><b>Interpretability:</b> Provides direct log-odds coefficients for each feature (e.g. negative impact of gap days).</li>
                <li><b>Overfitting Protection:</b> L2 penalty (Ridge) shrinks high-variance weights on sparse feature vectors.</li>
                <li><b>Benchmark Superiority:</b> Outperforms the 50% naive dummy majority-class baseline by +28.6% on the test split.</li>
              </ul>
            </div>

            <div className="md:col-span-4 p-5 rounded-2xl clean-card-tight bg-teal-500/[0.04] border-teal-500/20 text-center">
              <span className="text-xs font-mono text-ink-faint uppercase block mb-1">Test Split Accuracy</span>
              <span className="text-4xl font-mono font-bold text-teal-700 dark:text-teal-400">78.6%</span>
              <span className="block text-[11px] text-ink-faint mt-1 font-mono">11 / 14 test samples correct</span>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <div className="clean-card-tight p-5 text-center">
            <span className="text-xs font-mono text-ink-faint uppercase block mb-1">Accuracy</span>
            <span className="text-2xl font-bold font-mono text-ink">78.6%</span>
            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">+28.6% vs baseline</span>
          </div>

          <div className="clean-card-tight p-5 text-center">
            <span className="text-xs font-mono text-ink-faint uppercase block mb-1">Precision</span>
            <span className="text-2xl font-bold font-mono text-ink">75.0%</span>
            <span className="block text-[10px] text-ink-faint mt-1 font-mono">TP / (TP + FP)</span>
          </div>

          <div className="clean-card-tight p-5 text-center">
            <span className="text-xs font-mono text-ink-faint uppercase block mb-1">Recall</span>
            <span className="text-2xl font-bold font-mono text-ink">85.7%</span>
            <span className="block text-[10px] text-ink-faint mt-1 font-mono">TP / (TP + FN)</span>
          </div>

          <div className="clean-card-tight p-5 text-center">
            <span className="text-xs font-mono text-ink-faint uppercase block mb-1">F1-Score</span>
            <span className="text-2xl font-bold font-mono text-ink">0.80</span>
            <span className="block text-[10px] text-teal-700 dark:text-teal-400 mt-1 font-mono">Harmonic mean</span>
          </div>

          <div className="clean-card-tight p-5 text-center col-span-2 sm:col-span-1">
            <span className="text-xs font-mono text-ink-faint uppercase block mb-1">ROC-AUC</span>
            <span className="text-2xl font-bold font-mono text-teal-700 dark:text-teal-400">0.82</span>
            <span className="block text-[10px] text-ink-faint mt-1 font-mono">Discriminative power</span>
          </div>
        </div>

        {/* Confusion Matrix + Feature Weights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Confusion Matrix Table */}
          <div className="clean-card p-6">
            <h3 className="text-sm font-bold text-ink mb-2">
              Confusion Matrix (Test Split: 14 Posts)
            </h3>
            <p className="text-xs text-ink-faint mb-4">
              Stratified holdout set verifying classification performance rather than guessing
            </p>

            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">6</span>
                <span className="block text-[11px] text-ink-soft mt-1">True Positive (Above Median)</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">2</span>
                <span className="block text-[11px] text-ink-soft mt-1">False Positive (Type I Error)</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">1</span>
                <span className="block text-[11px] text-ink-soft mt-1">False Negative (Type II Error)</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">5</span>
                <span className="block text-[11px] text-ink-soft mt-1">True Negative (Below Median)</span>
              </div>
            </div>
          </div>

          {/* Learned Feature Coefficients */}
          <div className="clean-card p-6">
            <h3 className="text-sm font-bold text-ink mb-2">
              Learned Feature Weights (Log-Odds Impact)
            </h3>
            <p className="text-xs text-ink-faint mb-4">
              What the model discovered about upload signals
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between text-ink mb-1">
                  <span>Pre-Break Momentum</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+1.15</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-ink mb-1">
                  <span>Morning Window (09:00 - 10:00 AM)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+0.72</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-ink mb-1">
                  <span>Midweek Upload (Tue / Wed)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+0.48</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-ink mb-1">
                  <span>Inter-Post Gap Days (per day)</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">-0.065</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Live Model Tester Sandbox */}
        <div className="clean-card p-6 sm:p-8 bg-secondary/30">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h3 className="text-lg font-bold text-ink">
              Interactive Model Inference Simulator
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mb-6">
            Adjust release parameters below to test the trained model's live probability of beating the 149-like channel median.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Gap Days Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono text-ink mb-1.5">
                  <span>Days Since Previous Upload:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">{gapDays} days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={gapDays}
                  onChange={(e) => setGapDays(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-ink-faint mt-1">
                  <span>0 (same day)</span>
                  <span>7 (weekly)</span>
                  <span>30 (monthly)</span>
                  <span>60d+</span>
                </div>
              </div>

              {/* Day of Week Selector */}
              <div>
                <label className="block text-xs font-mono text-ink mb-1.5">Day of Week:</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => setDayOfWeek(idx)}
                      className={`py-2 text-xs font-mono font-medium rounded-lg transition-colors border ${
                        dayOfWeek === idx
                          ? 'border-teal-600 bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold'
                          : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-ink-soft hover:text-ink'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Duration Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono text-ink mb-1.5">
                  <span>Video Runtime:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">
                    {duration}s {duration >= 18 && duration <= 25 ? '(Sweet Spot ⚡)' : duration > 40 ? '(Drop-off Risk ⚠️)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-ink-faint mt-1">
                  <span>8s (short)</span>
                  <span className="text-teal-600 dark:text-teal-400 font-semibold">18–25s (optimal)</span>
                  <span>45s+ (long)</span>
                </div>
              </div>

              {/* Upload Hour */}
              <div>
                <div className="flex justify-between text-xs font-mono text-ink mb-1.5">
                  <span>Upload Hour (UTC):</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">{uploadHour}:00 ({uploadHour <= 11 ? 'Morning' : uploadHour <= 17 ? 'Afternoon' : 'Evening'})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={uploadHour}
                  onChange={(e) => setUploadHour(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Hiatus Phase Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-ink">Channel Momentum State:</span>
                <div className="inline-flex rounded-full p-1 bg-black/5 dark:bg-white/5">
                  <button
                    onClick={() => setIsPreBreak(true)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isPreBreak
                        ? 'bg-teal-700 dark:bg-teal-500 text-white'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    Active / Pre-Break
                  </button>
                  <button
                    onClick={() => setIsPreBreak(false)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      !isPreBreak
                        ? 'bg-amber-600 dark:bg-amber-500 text-white'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    Post-Hiatus
                  </button>
                </div>
              </div>
            </div>

            {/* Right Prediction Output */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl clean-card-tight bg-white dark:bg-[#121e22] border border-black/10 dark:border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-faint block mb-2">
                  Model Output Prediction
                </span>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold font-mono text-teal-700 dark:text-teal-400">
                    {prediction.probability}%
                  </span>
                  <span className="text-xs font-mono text-ink-soft">
                    probability ≥ 149 likes
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold mb-3 bg-teal-500/10 text-teal-700 dark:text-teal-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Est. Likes: {prediction.predictedBracket}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                  <div className="p-2.5 rounded-xl clean-card-tight">
                    <span className="text-ink-faint block text-[10px]">EST. PLAYS</span>
                    <span className="font-bold text-ink">{prediction.estPlays}</span>
                  </div>
                  <div className="p-2.5 rounded-xl clean-card-tight">
                    <span className="text-ink-faint block text-[10px]">EST. SHARES</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{prediction.estShares}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/5">
                  <span className="text-xs font-bold text-ink block mb-1">
                    Analyst's Advice:
                  </span>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {prediction.advice}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-black/5 dark:border-white/5 text-[10px] font-mono text-ink-faint flex items-center justify-between">
                <span>MODEL: LOGISTIC-L2-CV5</span>
                <span>THRESHOLD: 0.50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
