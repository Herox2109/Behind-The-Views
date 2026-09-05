import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { DataOverviewSection } from './components/DataOverviewSection';
import { PostingBehaviorD3Chart } from './components/PostingBehaviorD3Chart';
import { EngagementTrendsD3Chart } from './components/EngagementTrendsD3Chart';
import { DistributionAndGapsD3 } from './components/DistributionAndGapsD3';
import { TopPostsAndContentD3 } from './components/TopPostsAndContentD3';
import { TheBreakSection } from './components/TheBreakSection';
import { PersonalContextSection } from './components/PersonalContextSection';
import { KeyFindingsSection } from './components/KeyFindingsSection';
import { MLModelSection } from './components/MLModelSection';
import { SentimentNLPSection } from './components/SentimentNLPSection';
import { MethodologyAndCode } from './components/MethodologyAndCode';
import { ConclusionSection } from './components/ConclusionSection';
import { FinalSectionAndFooter } from './components/FinalSectionAndFooter';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { ReadmeModal } from './components/ReadmeModal';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(false);
  const [readmeOpen, setReadmeOpen] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-base text-ink selection:bg-teal-300 selection:text-ink font-sans transition-colors duration-300">
      {/* Floating Hotbar Navigation */}
      <HeaderNav
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        onOpenSimulator={() => setSimulatorOpen(true)}
        onOpenReadme={() => setReadmeOpen(true)}
      />

      {/* Main Narrative Structure */}
      <main>
        <HeroSection />
        <DataOverviewSection />
        <PostingBehaviorD3Chart />
        <EngagementTrendsD3Chart />
        <DistributionAndGapsD3 />
        <TopPostsAndContentD3 />
        <TheBreakSection />
        <PersonalContextSection />
        <KeyFindingsSection />
        <MLModelSection />
        <SentimentNLPSection />
        <MethodologyAndCode />
        <ConclusionSection />
      </main>

      {/* Footer */}
      <FinalSectionAndFooter />

      {/* Interactive Modals */}
      <ScenarioSimulator
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      <ReadmeModal
        isOpen={readmeOpen}
        onClose={() => setReadmeOpen(false)}
      />
    </div>
  );
}
