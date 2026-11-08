import { CHANNEL_METRICS } from '../data/postsData';
import React from 'react';
import { X, Github, ExternalLink, Terminal, Copy, Check } from 'lucide-react';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const cloneCmd = `git clone https://github.com/Herox2109/behind-the-views.git\ncd behind-the-views\nnpm install\nnpm run dev`;

  const copyClone = () => {
    navigator.clipboard.writeText(cloneCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="clean-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-base shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <div>
              <span className="text-xs font-mono text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider block">
                Repository Documentation
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-ink">
                README.md · Behind the Views
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full clean-card-tight text-ink-soft hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Markdown-style content */}
        <div className="space-y-6 text-xs sm:text-sm text-ink-soft leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-ink mb-1.5">Project Overview</h3>
            <p>
              <b>Behind the Views</b> is an open-source, reproducible data science investigation analyzing 11 months of TikTok posting history (69 posts, {CHANNEL_METRICS.totalLikes.toLocaleString()} lifetime likes) from student video editor <a href="https://www.tiktok.com/@herox.cc?_r=1&_t=ZP-99Tn9fZhK9e" target="_blank" rel="noopener noreferrer" className="text-teal-700 dark:text-teal-400 underline">@herox.cc</a>.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-ink mb-1.5">Core Goals</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><b>Demystify Social Media Reach:</b> Expose how two viral outliers accounted for {`${CHANNEL_METRICS.top2Percentage}%`} of lifetime likes.</li>
              <li><b>Measure Cadence Dynamics:</b> Analyze the statistical impact of an extended 73-day hiatus.</li>
              <li><b>Explore Modeling Assumptions:</b> Inspect a manual logistic score; no trained model or validated performance is claimed.</li>
              <li><b>Analyze Audience Sentiment:</b> Use NLP and TF-IDF clustering to parse viewer questions and feedback on top viral edits.</li>
            </ul>
          </div>

          {/* Quickstart Installation */}
          <div className="p-4 rounded-xl clean-card-tight">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-ink flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>Quickstart Installation</span>
              </span>
              <button
                onClick={copyClone}
                className="text-[11px] font-mono text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-[#0a1215] text-[#b4d2db] font-mono text-xs overflow-x-auto leading-relaxed">
              {cloneCmd}
            </pre>
          </div>

          <div>
            <h3 className="text-base font-bold text-ink mb-1.5">Project Architecture</h3>
            <pre className="p-3 rounded-lg bg-secondary/30 font-mono text-xs text-ink">
{`Raw TikTok JSON (user_data_tiktok.json)
        ↓
Python Data Cleaning & Extraction (load_and_clean.py)
        ↓
Time-Series Phase Segmentation (segment_phases.py)
        ↓
Illustrative manual score (src/lib/illustrativeModel.ts; not evaluated)
        ↓
Audience NLP Sentiment Analysis (nlp_sentiment.py)
        ↓
Interactive D3.js Visualizations (React + Tailwind)`}
            </pre>
          </div>

          {/* Links */}
          <div className="pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs font-mono">
              <a
                href="https://github.com/Herox2109"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>github.com/Herox2109</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>·</span>
              <a
                href="https://www.tiktok.com/@herox.cc?_r=1&_t=ZP-99Tn9fZhK9e"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>tiktok.com/@herox.cc</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-teal-700 dark:bg-teal-500 text-white font-mono text-xs font-bold hover:bg-teal-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

