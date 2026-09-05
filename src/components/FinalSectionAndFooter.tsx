import React from 'react';
import { Github, ExternalLink, Video } from 'lucide-react';

export const FinalSectionAndFooter: React.FC = () => {
  return (
    <footer className="py-16 border-t border-black/5 dark:border-white/5 bg-secondary/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400" />
              <span className="font-bold text-base text-ink tracking-tight">
                Behind the Views
              </span>
            </div>
            <p className="text-xs text-ink-faint">
              A data-driven analysis of my TikTok journey · Behruzbek Shodmonov · N=69 Posts (2025–2026)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <a
              href="https://github.com/Herox2109"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full clean-card-tight text-ink hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Contact via GitHub / Project Repository</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="https://www.tiktok.com/@herox.cc?_r=1&_t=ZP-99Tn9fZhK9e"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full clean-card-tight text-ink hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>TikTok: @herox.cc</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-ink-faint">
          <span>Independent Data Science Project · Open Source Code</span>
          <span>Reproducible Analysis with Python, Pandas, scikit-learn & D3.js</span>
        </div>
      </div>
    </footer>
  );
};
