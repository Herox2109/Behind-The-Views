import { CHANNEL_METRICS } from '../data/postsData';
import React, { useState } from 'react';
import { Terminal, Copy, Check, FileCode, ExternalLink, Github, BookOpen, Share2 } from 'lucide-react';

export const MethodologyAndCode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clean' | 'segment' | 'model' | 'nlp' | 'deploy'>('clean');
  const [copied, setCopied] = useState<boolean>(false);

  const codeSnippets = {
    clean: {
      fileName: 'load_and_clean.py',
      language: 'python',
      code: `import json, pandas as pd

# 1. Load Raw TikTok Privacy GDPR Export
with open("user_data_tiktok.json", "r", encoding="utf-8") as f:
    raw = json.load(f)

# Navigate nested structure: Post -> Posts -> VideoList
video_list = raw["Post"]["Posts"]["VideoList"]
df = pd.DataFrame(video_list)

# 2. Handle Data Types & Missing Values
# Dates & Likes arrive as string literals
df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
df["Likes"] = pd.to_numeric(df["Likes"], errors="coerce").fillna(0).astype(int)

# 3. Clean and verify chronological sorting
df = df.dropna(subset=["Date"]).sort_values("Date").reset_index(drop=True)
print(f"Loaded {len(df)} posts successfully. Date range: {df['Date'].min()} to {df['Date'].max()}")`,
      explain: "Loads the raw TikTok JSON archive, navigates nested structures, parses ISO timestamps, coerces like counts to integers, and verifies chronological order."
    },
    segment: {
      fileName: 'segment_phases.py',
      language: 'python',
      code: `import pandas as pd

# Calculate inter-post interval in fractional days
df["gap_days"] = df["Date"].diff().dt.total_seconds() / 86400.0
df["gap_days"] = df["gap_days"].fillna(0)

# Statistical partition: A gap > 10 days marks a distinct behavioral phase
df["phase_break"] = df["gap_days"] > 10
df["phase_id"] = df["phase_break"].cumsum()

# Aggregate robust phase metrics (median, IQR, count)
phase_summary = df.groupby("phase_id").agg(
    start_date=("Date", "min"),
    end_date=("Date", "max"),
    total_posts=("Date", "count"),
    median_likes=("Likes", "median"),
    mean_likes=("Likes", "mean")
)
print(phase_summary)`,
      explain: "Identifies natural cadence transitions by measuring inter-post gaps without arbitrary manual dates, identifying the 73-day hiatus as a natural statistical boundary."
    },
    model: {
      fileName: 'train_model.py',
      language: 'python',
      code: `import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score

# Feature Engineering
X = pd.DataFrame({
    "gap_days": df["gap_days"],
    "is_morning": df["Date"].dt.hour.isin([9, 10]).astype(int),
    "is_midweek": df["Date"].dt.dayofweek.isin([1, 2]).astype(int),
    "is_pre_break": (df["Date"] < "2026-02-18").astype(int)
})

# Target threshold computed from the dataset
y = (df["Likes"] >= df["Likes"].median()).astype(int)

# Model: L2-Regularized Logistic Regression for small-sample stability
model = LogisticRegression(penalty="l2", C=1.0, random_state=42)

# 5-Fold Stratified Cross-Validation
cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
print(f"5-Fold CV Accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

model.fit(X, y)
print("Coefficients:", dict(zip(X.columns, model.coef_[0])))`,
      explain: "Trains an L2-regularized logistic classifier using stratified cross-validation, ensuring the small sample size doesn't lead to overfitted predictions."
    },
    nlp: {
      fileName: 'nlp_sentiment.py',
      language: 'python',
      code: `from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer

analyzer = SentimentIntensityAnalyzer()

# Scraped public comments from top viral video (#1: 170k likes)
comments = [
    "bro the transition at 0:08 was literally cinema",
    "what plugins did you use for that motion blur in After Effects?",
    "song name please??? is this on Spotify or soundcloud",
    "underrated editor on this whole app hands down"
]

results = []
for c in comments:
    vs = analyzer.polarity_scores(c)
    sentiment = "Positive" if vs["compound"] >= 0.05 else ("Negative" if vs["compound"] <= -0.05 else "Neutral")
    results.append({"text": c, "compound": vs["compound"], "sentiment": sentiment})

print(pd.DataFrame(results))`,
      explain: "Performs VADER sentiment polarity analysis and keyword classification on audience comments to measure reaction sentiment and categorize technical questions."
    },
    deploy: {
      fileName: 'deploy_app.py',
      language: 'python',
      code: `# Option A: Streamlit Live Interactive Dashboard
# Run: streamlit run app.py
import streamlit as st
import pandas as pd

st.set_page_config(page_title="Behind the Views", layout="wide")
st.title("Behind the Views — TikTok Analytics")

df = pd.read_parquet("cleaned_posts.parquet")
st.metric("Total Likes", f"{df['Likes'].sum():,}")
st.metric("Median Likes", int(df['Likes'].median()))
st.line_chart(df.set_index("Date")["Likes"])

# Option B: Hugging Face Spaces
# Push repository to huggingface.co/spaces with Dockerfile or requirements.txt`,
      explain: "Instructions for running interactive companion dashboards with Streamlit or deploying zero-cost replicas on Hugging Face Spaces."
    }
  };

  const current = codeSnippets[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="methodology" className="py-24 border-b border-black/5 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 uppercase tracking-wider font-mono">
            Technical Rigor & Reproducibility
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight mb-4">
            Pipeline Code & Engineering Methodology
          </h2>
          <p className="text-base text-ink-soft leading-relaxed">
            The end-to-end Python pipeline used to parse raw JSON, extract timestamps, compute inter-post gaps, train the ML classifier, and analyze audience comments.
          </p>
        </div>

        {/* Code Viewer Container */}
        <div className="clean-card overflow-hidden mb-12">
          {/* Tabs bar */}
          <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 bg-secondary/40">
            <div className="flex flex-wrap gap-1">
              {(Object.keys(codeSnippets) as Array<keyof typeof codeSnippets>).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    activeTab === key
                      ? 'bg-white dark:bg-[#121e22] text-ink font-bold shadow-sm'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {codeSnippets[key].fileName}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono clean-card-tight text-ink-soft hover:text-ink transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="p-6 font-mono text-xs overflow-x-auto bg-[#0a1215] text-[#b4d2db]">
            <pre className="leading-relaxed whitespace-pre">{current.code}</pre>
          </div>

          {/* Code Explanation Footer */}
          <div className="p-4 border-t border-black/5 dark:border-white/5 bg-secondary/20 text-xs text-ink-soft flex items-start gap-2">
            <FileCode className="w-4 h-4 text-teal-700 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <p>{current.explain}</p>
          </div>
        </div>

        {/* Real-World Impact Statement Box */}
        <div className="clean-card p-6 sm:p-8 mb-12">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Real-World Impact Statement</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-ink mb-3">
            Who Benefits From This Project & What Results Mean in Practice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="p-5 rounded-2xl clean-card-tight">
              <h4 className="text-sm font-bold text-ink mb-1.5">Solo Digital Creators</h4>
              <p className="text-xs text-ink-soft leading-relaxed">
                Removes algorithm mystique. Demonstrates that power-law concentration is normal (2 videos = {`${CHANNEL_METRICS.top2Percentage}%`} of likes) and that taking extended breaks introduces a measurable cadence penalty requiring deliberate rebuilding.
              </p>
            </div>
            <div className="p-5 rounded-2xl clean-card-tight">
              <h4 className="text-sm font-bold text-ink mb-1.5">Audience & Data Analysts</h4>
              <p className="text-xs text-ink-soft leading-relaxed">
                Illustrates how to conduct honest exploratory data analysis on limited privacy exports, explicitly avoiding claims of causation when confounding variables (audio trends, platform shifts) exist.
              </p>
            </div>
            <div className="p-5 rounded-2xl clean-card-tight">
              <h4 className="text-sm font-bold text-ink mb-1.5">Student Researchers & Self-Learners</h4>
              <p className="text-xs text-ink-soft leading-relaxed">
                Provides a transparent, practical template for transforming personal data exports into an empirical study, emphasizing honest error reporting, code clarity, and reproducibility over vanity numbers.
              </p>
            </div>
          </div>
        </div>

        {/* GitHub & Deployment Quickstart */}
        <div className="p-6 sm:p-8 rounded-2xl clean-card-tight bg-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-ink font-bold text-base mb-1">
              <Github className="w-5 h-5" />
              <span>Project Repository & Documentation</span>
            </div>
            <p className="text-xs sm:text-sm text-ink-soft">
              Open source scripts, dataset schema, and deployment configurations on GitHub.
            </p>
          </div>

          <a
            href="https://github.com/Herox2109"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-700 dark:bg-teal-500 text-white text-xs font-mono font-semibold hover:bg-teal-800 transition-colors flex-shrink-0"
          >
            <span>github.com/Herox2109</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

