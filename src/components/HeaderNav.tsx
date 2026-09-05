import React, { useState } from 'react';
import { Sun, Moon, Download, Sliders, Github, Terminal, ChevronDown } from 'lucide-react';
import { RAW_POSTS } from '../data/postsData';

interface HeaderNavProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSimulator: () => void;
  onOpenReadme: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenSimulator,
  onOpenReadme,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(RAW_POSTS, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "behind_the_views_tiktok_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  };

  const downloadCSV = () => {
    const headers = "date,likes\n";
    const rows = RAW_POSTS.map(p => `${p.date},${p.likes}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", "behind_the_views_cleaned_dataset.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-3 px-4 pointer-events-none">
      {/* Primary Pill Hotbar exactly like the reference */}
      <div className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-2 topbar-pill text-xs shadow-md">
        <a href="#hero" className="flex items-center gap-2 text-ink hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="font-semibold text-ink">Behind the Views</span>
          <span className="hidden sm:inline text-ink-faint">· 69 posts · Aug 2025 – Jul 2026</span>
        </a>

        {/* Quick Nav Anchors */}
        <nav className="hidden md:flex items-center gap-3 text-[11px] text-ink-soft px-2 border-l border-r border-black/10 dark:border-white/10 font-mono">
          <a href="#overview" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Overview</a>
          <a href="#eda" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">EDA</a>
          <a href="#break" className="hover:text-amber-500 transition-colors">The Break</a>
          <a href="#model" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">ML Model</a>
          <a href="#sentiment" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">NLP</a>
          <a href="#findings" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Findings</a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* What-If Simulator Trigger */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-medium transition-colors"
            title="Open What-If Simulator"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulator</span>
          </button>

          {/* README / Pipeline Docs */}
          <button
            onClick={onOpenReadme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-ink-soft transition-colors"
            title="View Project README & Architecture"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pipeline</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-ink-soft transition-colors"
              title="Download verified dataset"
            >
              <Download className="w-3.5 h-3.5" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl clean-card-tight p-2 shadow-xl border border-black/10 dark:border-white/10 text-left z-50">
                <div className="px-2 py-1 text-[10px] font-mono text-ink-faint uppercase font-bold">
                  Verified Data Exports
                </div>
                <button
                  onClick={downloadJSON}
                  className="w-full text-left px-2 py-1.5 text-xs text-ink hover:bg-teal-500/10 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span>JSON Payload</span>
                  <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">69 posts</span>
                </button>
                <button
                  onClick={downloadCSV}
                  className="w-full text-left px-2 py-1.5 text-xs text-ink hover:bg-teal-500/10 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span>CSV Dataset</span>
                  <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">2 columns</span>
                </button>
              </div>
            )}
          </div>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/Herox2109"
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-full text-ink-soft hover:text-ink transition-colors"
            title="GitHub: @Herox2109"
          >
            <Github className="w-3.5 h-3.5" />
          </a>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-1 rounded-full text-ink-soft hover:text-ink transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-teal-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
