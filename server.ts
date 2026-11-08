import express from "express";
import path from "path";
import { compileExpression, validateSimulation, MAX_SIMULATED_POSTS } from "./server/safety";
import { createServer as createViteServer } from "vite";

import { RAW_POSTS, CHANNEL_METRICS, BREAK_STATS, calculateMedian } from './src/data/postsData';

const PHASES = [
  { id: "launch", name: "The Launch", color: "#7fd0d6", start: "2025-08-11", end: "2025-09-08" },
  { id: "surge", name: "The Growth Surge", color: "#2b96a8", start: "2025-09-21", end: "2025-10-31" },
  { id: "slowdown", name: "The Slowdown", color: "#8ec1a1", start: "2025-11-03", end: "2026-02-18" },
  { id: "break", name: "The Break", color: "#c7d4d8", start: "2026-02-18", end: "2026-05-01" },
  { id: "return", name: "The Return", color: "#e3a45f", start: "2026-05-01", end: "2026-07-13" }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      project: "Behind the Views",
      author: "Behruzbek Shodmonov",
      dataset: "69 TikTok posts (2025-08-11 to 2026-07-12)",
      uptime: process.uptime()
    });
  });

  app.get("/api/posts", (_req, res) => {
    let runningLikes = 0;
    const enriched = RAW_POSTS.map((p, idx) => {
      runningLikes += p.likes;
      let gapDays = 0;
      if (idx > 0) {
        const prev = new Date(RAW_POSTS[idx - 1].date);
        const curr = new Date(p.date);
        gapDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      }
      let phaseName = "The Break";
      let phaseColor = "#c7d4d8";
      for (const ph of PHASES) {
        if (p.date >= ph.start && p.date < ph.end) {
          phaseName = ph.name;
          phaseColor = ph.color;
          break;
        }
      }
      return {
        index: idx,
        date: p.date,
        likes: p.likes,
        logLikes: +(Math.log10(p.likes + 1)).toFixed(4),
        gapDays,
        cumulativeLikes: runningLikes,
        phase: phaseName,
        phaseColor,
        isViralOutlier: p.likes > 50000
      };
    });
    res.json({ count: enriched.length, posts: enriched });
  });

  app.get("/api/metrics", (_req, res) => {
    const likes = RAW_POSTS.map(p => p.likes).sort((a, b) => a - b);
    const totalLikes = likes.reduce((s, l) => s + l, 0);
    const median = calculateMedian(likes);
    const mean = Math.round(totalLikes / likes.length);
    const top2Sum = CHANNEL_METRICS.top2LikesSum;

    res.json({
      totalPosts: RAW_POSTS.length,
      totalLikes,
      overallMedian: median,
      overallMean: mean,
      top2Sum,
      top2Percentage: +((top2Sum / totalLikes) * 100).toFixed(2),
      breakDurationDays: 73,
      beforeBreakMedianExcludingViral: BREAK_STATS.beforeMedianLikesExcludingViral,
      afterBreakMedian: BREAK_STATS.afterMedianLikes,
      morningScheduledPercentage: CHANNEL_METRICS.morningPostPercentage
    });
  });

  app.post("/api/simulate", (req, res) => {
    let parameters: ReturnType<typeof validateSimulation>;
    try {
      parameters = validateSimulation(req.body);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
    const { postingFrequencyPerWeek, baselineMedian, includeViralSpike } = parameters;

    const breakDays = 73;
    const simulatedCount = Math.min(MAX_SIMULATED_POSTS, Math.max(1, Math.round((breakDays / 7) * postingFrequencyPerWeek)));
    let simulatedLikesSum = 0;
    const syntheticPoints = [];

    for (let i = 0; i < simulatedCount; i++) {
      // Log-normal variation around baseline
      const variance = 0.5;
      const val = Math.round(baselineMedian * Math.exp((Math.random() - 0.5) * variance));
      const finalLikes = (includeViralSpike && i === Math.floor(simulatedCount / 2)) ? 65000 : val;
      simulatedLikesSum += finalLikes;
      syntheticPoints.push({
        postNumber: i + 1,
        dayOffset: Math.round(i * (breakDays / simulatedCount)),
        projectedLikes: finalLikes
      });
    }

    const observedTotal = CHANNEL_METRICS.totalLikes;
    const projectedTotal = observedTotal + simulatedLikesSum;

    res.json({
      breakDays,
      simulatedCount,
      simulatedLikesSum,
      projectedTotal,
      retentionRateEstimate: "85% - 94%",
      syntheticPoints
    });
  });

  // Bounded arithmetic parser for Bespoke Charts (no JavaScript execution)
  app.post("/api/bespoke-eval", (req, res) => {
    const { expression } = req.body || {};
    if (!expression || typeof expression !== "string") {
      return res.status(400).json({ error: "Missing expression string" });
    }

    try {
      const evaluate = compileExpression(expression);
      const transformed = RAW_POSTS.map((p, idx) => {
        const post = { ...p, index: idx, logLikes: Math.log10(p.likes + 1) };
        return {
          date: p.date,
          originalLikes: p.likes,
          computedValue: evaluate(post)
        };
      });
      res.json({ success: true, count: transformed.length, data: transformed });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Behind the Views Server running on http://localhost:${PORT}`);
  });
}

startServer();


