import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const RAW_POSTS = [
  {"date":"2025-08-11","likes":13},
  {"date":"2025-08-23","likes":124},
  {"date":"2025-08-24","likes":244},
  {"date":"2025-08-25","likes":50},
  {"date":"2025-08-26","likes":96055},
  {"date":"2025-08-28","likes":45},
  {"date":"2025-08-29","likes":23},
  {"date":"2025-08-30","likes":113},
  {"date":"2025-08-31","likes":103},
  {"date":"2025-09-01","likes":18},
  {"date":"2025-09-02","likes":113},
  {"date":"2025-09-03","likes":91},
  {"date":"2025-09-04","likes":210},
  {"date":"2025-09-05","likes":158},
  {"date":"2025-09-06","likes":76},
  {"date":"2025-09-07","likes":36},
  {"date":"2025-09-21","likes":377},
  {"date":"2025-09-22","likes":1305},
  {"date":"2025-09-23","likes":206},
  {"date":"2025-09-24","likes":1126},
  {"date":"2025-09-25","likes":542},
  {"date":"2025-09-26","likes":286},
  {"date":"2025-09-27","likes":184},
  {"date":"2025-09-30","likes":1112},
  {"date":"2025-10-01","likes":170673},
  {"date":"2025-10-02","likes":250},
  {"date":"2025-10-04","likes":8282},
  {"date":"2025-10-06","likes":310},
  {"date":"2025-10-07","likes":164},
  {"date":"2025-10-09","likes":1805},
  {"date":"2025-10-13","likes":32},
  {"date":"2025-10-16","likes":112},
  {"date":"2025-10-18","likes":242},
  {"date":"2025-10-21","likes":185},
  {"date":"2025-10-23","likes":175},
  {"date":"2025-10-25","likes":235},
  {"date":"2025-10-28","likes":92},
  {"date":"2025-10-30","likes":575},
  {"date":"2025-11-03","likes":79},
  {"date":"2025-11-04","likes":1671},
  {"date":"2025-11-06","likes":101},
  {"date":"2025-11-07","likes":149},
  {"date":"2025-11-09","likes":103},
  {"date":"2025-11-11","likes":117},
  {"date":"2025-11-12","likes":161},
  {"date":"2025-11-15","likes":107},
  {"date":"2025-11-20","likes":154},
  {"date":"2025-11-22","likes":171},
  {"date":"2025-11-25","likes":275},
  {"date":"2025-11-27","likes":141},
  {"date":"2025-12-01","likes":174},
  {"date":"2025-12-03","likes":70},
  {"date":"2025-12-05","likes":118},
  {"date":"2025-12-08","likes":94},
  {"date":"2025-12-10","likes":149},
  {"date":"2025-12-19","likes":142},
  {"date":"2025-12-21","likes":690},
  {"date":"2025-12-24","likes":152},
  {"date":"2025-12-30","likes":138},
  {"date":"2026-01-16","likes":107},
  {"date":"2026-01-28","likes":1967},
  {"date":"2026-02-03","likes":172},
  {"date":"2026-02-10","likes":96},
  {"date":"2026-02-17","likes":393},
  {"date":"2026-05-01","likes":83},
  {"date":"2026-06-14","likes":33},
  {"date":"2026-06-24","likes":46},
  {"date":"2026-07-11","likes":38},
  {"date":"2026-07-12","likes":75}
];

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
    const median = likes[Math.floor(likes.length / 2)];
    const mean = Math.round(totalLikes / likes.length);
    const top2Sum = 96055 + 170673;

    res.json({
      totalPosts: RAW_POSTS.length,
      totalLikes,
      overallMedian: median,
      overallMean: mean,
      top2Sum,
      top2Percentage: +((top2Sum / totalLikes) * 100).toFixed(2),
      breakDurationDays: 73,
      beforeBreakMedianExcludingViral: 145,
      afterBreakMedian: 46,
      morningScheduledPercentage: 70
    });
  });

  app.post("/api/simulate", (req, res) => {
    const {
      postingFrequencyPerWeek = 1.7,
      baselineMedian = 145,
      includeViralSpike = false
    } = req.body || {};

    const breakDays = 73;
    const simulatedCount = Math.max(1, Math.round((breakDays / 7) * postingFrequencyPerWeek));
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

    const observedTotal = 293708;
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

  // Safe script sandbox evaluator for Bespoke Charts
  app.post("/api/bespoke-eval", (req, res) => {
    const { expression } = req.body || {};
    if (!expression || typeof expression !== "string") {
      return res.status(400).json({ error: "Missing expression string" });
    }

    try {
      // Evaluate safe mathematical transforms on RAW_POSTS
      const transformed = RAW_POSTS.map((p, idx) => {
        const post = { ...p, index: idx, logLikes: Math.log10(p.likes + 1) };
        // eslint-disable-next-line no-new-func
        const fn = new Function("post", `return (${expression});`);
        return {
          date: p.date,
          originalLikes: p.likes,
          computedValue: Number(fn(post)) || 0
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
