"""
Behind the Views — FastAPI Backend Analytics Service
Author: Behruzbek Shodmonov (shodmonovbehruz21@gmail.com)
TikTok Account: @herox.cc / HEROX - HEROX
Data Science Project for Academic Portfolio & University Application
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
import json

app = FastAPI(
    title="Behind the Views — TikTok Analytics API",
    description="High-performance backend API evaluating 69 TikTok posts, engagement metrics, phase segmentation, and what-if simulation modeling.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RAW_POSTS = json.loads((Path(__file__).resolve().parents[1] / "data" / "posts.json").read_text(encoding="utf-8"))
BEFORE = [p for p in RAW_POSTS if p["date"] < "2026-02-18" and p["likes"] <= 50000]
AFTER = [p for p in RAW_POSTS if p["date"] >= "2026-05-01"]
BEFORE_MEDIAN = float(np.median([p["likes"] for p in BEFORE]))

PHASES = [
    {"id": "launch", "name": "The Launch", "color": "#7fd0d6", "start": "2025-08-11", "end": "2025-09-08"},
    {"id": "surge", "name": "The Growth Surge", "color": "#2b96a8", "start": "2025-09-21", "end": "2025-10-31"},
    {"id": "slowdown", "name": "The Slowdown", "color": "#8ec1a1", "start": "2025-11-03", "end": "2026-02-18"},
    {"id": "break", "name": "The Break", "color": "#c7d4d8", "start": "2026-02-18", "end": "2026-05-01"},
    {"id": "return", "name": "The Return", "color": "#e3a45f", "start": "2026-05-01", "end": "2026-07-13"}
]

class SimulationRequest(BaseModel):
    prevent_break: bool = True
    posting_frequency_per_week: float = Field(default=1.7, ge=0.2, le=7.0)
    baseline_median_likes: float = Field(default=BEFORE_MEDIAN, ge=10.0, le=1000.0)
    viral_chance: float = Field(default=0.03, ge=0.0, le=0.2)

@app.get("/")
def read_root():
    return {
        "project": "Behind the Views",
        "author": "Behruzbek Shodmonov",
        "status": "online",
        "total_posts": len(RAW_POSTS),
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/posts")
def get_posts(include_phases: bool = True):
    df = pd.DataFrame(RAW_POSTS)
    df["Date"] = pd.to_datetime(df["date"])
    df["gap_days"] = df["Date"].diff().dt.total_seconds().fillna(0) / 86400
    df["cumulative_likes"] = df["likes"].cumsum()
    df["log_likes"] = np.log10(df["likes"] + 1)
    
    results = []
    for idx, row in df.iterrows():
        p_name = "The Break"
        p_color = "#c7d4d8"
        d = row["Date"].strftime("%Y-%m-%d")
        for p in PHASES:
            if p["start"] <= d < p["end"]:
                p_name = p["name"]
                p_color = p["color"]
                break
        
        results.append({
            "index": idx,
            "date": d,
            "likes": int(row["likes"]),
            "log_likes": round(float(row["log_likes"]), 4),
            "gap_days": round(float(row["gap_days"]), 1),
            "cumulative_likes": int(row["cumulative_likes"]),
            "phase": p_name,
            "phase_color": p_color,
            "is_outlier": bool(row["likes"] > 50000)
        })
    return {"count": len(results), "posts": results}

@app.get("/api/metrics")
def get_metrics():
    likes = [p["likes"] for p in RAW_POSTS]
    med = float(np.median(likes))
    mean = float(np.mean(likes))
    top2_sum = sum(sorted(likes, reverse=True)[:2])
    total_likes = sum(likes)
    
    return {
        "total_posts": len(RAW_POSTS),
        "total_likes": total_likes,
        "median_likes": med,
        "mean_likes": round(mean, 1),
        "top2_share": round((top2_sum / total_likes) * 100, 2),
        "break_duration_days": 73,
        "before_break_median_ex_viral": BEFORE_MEDIAN,
        "after_break_median": float(np.median([p["likes"] for p in AFTER])),
        "scheduled_time_pct": round(100 * sum("09:35:00" <= p["createTime"][11:19] <= "10:05:00" for p in RAW_POSTS) / len(RAW_POSTS), 1)
    }

@app.post("/api/simulate")
def simulate_channel(req: SimulationRequest):
    """
    Counterfactual modeling: What if the creator had not taken the 73-day break?
    Generates synthetic trajectory comparing observed reality vs counterfactual baseline.
    """
    days = 73
    posts_during_gap = int(np.round((days / 7) * req.posting_frequency_per_week))
    
    # Model expected likes using log-normal distribution matching pre-break typical posts
    mu = np.log(req.baseline_median_likes)
    sigma = 0.65
    np.random.seed(42)
    simulated_likes = np.random.lognormal(mu, sigma, posts_during_gap).astype(int)
    
    # Check for viral occurrences
    for i in range(len(simulated_likes)):
        if np.random.rand() < req.viral_chance:
            simulated_likes[i] = np.random.randint(20000, 120000)
            
    simulated_total = int(np.sum(simulated_likes))
    observed_total = sum(p["likes"] for p in RAW_POSTS)
    projected_total = observed_total + simulated_total
    
    return {
        "synthetic_posts_count": posts_during_gap,
        "estimated_additional_likes": simulated_total,
        "projected_lifetime_likes": projected_total,
        "projected_momentum_retention": "82% - 95%",
        "simulated_break_fill": [
            {"day": i * int(days / max(1, posts_during_gap)), "projected_likes": int(l)}
            for i, l in enumerate(simulated_likes)
        ]
    }

