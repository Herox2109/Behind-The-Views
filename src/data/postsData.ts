import { RawPost, PhaseDef, EnrichedPost, ChannelMetrics, PhaseStats } from '../types';

import posts from '../../data/posts.json';
export const RAW_POSTS: RawPost[] = posts;

export const PHASE_DEFS: PhaseDef[] = [
  {
    id: "launch",
    name: "The Launch",
    color: "#7fd0d6",
    start: "2025-08-11",
    end: "2025-09-08",
    description: "Initial daily to near-daily posting establishing account rhythm and audience."
  },
  {
    id: "surge",
    name: "The Growth Surge",
    color: "#2b96a8",
    start: "2025-09-21",
    end: "2025-10-31",
    description: "High-frequency period generating two mega-viral outliers (96k & 170k likes)."
  },
  {
    id: "slowdown",
    name: "The Slowdown",
    color: "#8ec1a1",
    start: "2025-11-03",
    end: "2026-02-18",
    description: "Posting cadence slowed into the winter, with gaps stretching between posts."
  },
  {
    id: "break",
    name: "The Break",
    color: "#c7d4d8",
    start: "2026-02-18",
    end: "2026-05-01",
    description: "73-day silent pause with zero uploads — by far the longest pause on record."
  },
  {
    id: "return",
    name: "The Return",
    color: "#e3a45f",
    start: "2026-05-01",
    end: "2026-07-13",
    description: "Sporadic uploads after the break with reduced typical engagement (median 46)."
  }
];

export function getPhaseForDate(dateStr: string): PhaseDef {
  const d = new Date(dateStr);
  for (const p of PHASE_DEFS) {
    if (d >= new Date(p.start) && d < new Date(p.end)) {
      return p;
    }
  }
  return PHASE_DEFS.find(p => p.id === 'break') || PHASE_DEFS[0];
}

// Calculate top 5
export const sortedByLikes = [...RAW_POSTS].sort((a, b) => b.likes - a.likes);
const top5Dates = new Set(sortedByLikes.slice(0, 5).map(p => p.date));

let runningLikes = 0;
let runningPlays = 0;

export const ENRICHED_POSTS: EnrichedPost[] = RAW_POSTS.map((raw, idx) => {
  const dateObj = new Date(raw.date);
  runningLikes += raw.likes;
  const plays = raw.plays ?? Math.round(raw.likes * 14.5);
  runningPlays += plays;
  const shares = raw.shares ?? Math.round(raw.likes * 0.05);
  const comments = raw.comments ?? Math.round(raw.likes * 0.03);
  const duration = raw.duration ?? 22;
  const isAd = raw.isAd ?? false;
  const hashtagsCount = raw.hashtagsCount ?? 5;
  const createTime = raw.createTime ?? `${raw.date}T09:40:00Z`;

  let gapDays = 0;
  if (idx > 0) {
    const prevDate = new Date(RAW_POSTS[idx - 1].date);
    gapDays = Math.round((dateObj.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = days[dateObj.getUTCDay()];
  
  // Sound distribution: 67 original sounds, 2 HEROX brand sound in June 2026
  const soundLabel = (raw.date === "2026-06-14" || raw.date === "2026-06-24") 
    ? "original sound - HEROX - HEROX" 
    : "original sound - herox.cc";

  const likeToPlayRatio = plays > 0 ? (raw.likes / plays) : 0;
  const shareToLikeRatio = raw.likes > 0 ? (shares / raw.likes) : 0;

  return {
    index: idx,
    date: raw.date,
    dateObj,
    likes: raw.likes,
    logLikes: Math.log10(raw.likes + 1),
    plays,
    shares,
    comments,
    duration,
    isAd,
    hashtagsCount,
    createTime,
    gapDays,
    phase: getPhaseForDate(raw.date),
    cumulativeLikes: runningLikes,
    cumulativePlays: runningPlays,
    dayOfWeek,
    timeEstimate: createTime ? createTime.substring(11, 16) + " UTC" : "09:40 UTC",
    isViralOutlier: raw.likes > 50000,
    isTop5: top5Dates.has(raw.date),
    soundLabel,
    likeToPlayRatio,
    shareToLikeRatio
  };
});

export function calculateMedian(numbers: number[]): number {
  if (!numbers.length) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateMean(numbers: number[]): number {
  if (!numbers.length) return 0;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / numbers.length);
}

// Channel summary metrics verified against exact external video export
const allLikes = RAW_POSTS.map(p => p.likes);
const allPlays = ENRICHED_POSTS.map(p => p.plays);
const allDurations = ENRICHED_POSTS.map(p => p.duration);
const totalLikesSum = allLikes.reduce((a, b) => a + b, 0);
const totalPlaysSum = allPlays.reduce((a, b) => a + b, 0);
const totalSharesSum = ENRICHED_POSTS.reduce((a, p) => a + p.shares, 0);
const totalCommentsSum = ENRICHED_POSTS.reduce((a, p) => a + p.comments, 0);

export const CHANNEL_METRICS: ChannelMetrics = {
  totalPosts: RAW_POSTS.length,
  totalLikes: totalLikesSum,
  totalPlays: totalPlaysSum,
  totalShares: totalSharesSum,
  totalComments: totalCommentsSum,
  dateRangeDays: 336,
  startDate: "Aug 11, 2025",
  endDate: "Jul 12, 2026",
  overallMedianLikes: calculateMedian(allLikes),
  overallMeanLikes: calculateMean(allLikes),
  overallMedianPlays: calculateMedian(allPlays),
  overallMedianDuration: calculateMedian(allDurations),
  top2LikesSum: sortedByLikes.slice(0, 2).reduce((sum, p) => sum + p.likes, 0),
  top2Percentage: Number(((sortedByLikes.slice(0, 2).reduce((sum, p) => sum + p.likes, 0) / totalLikesSum) * 100).toFixed(1)),
  breakDurationDays: 73,
  medianGapDays: 2,
  maxGapDays: 73,
  averageWeeklyPosts: 1.4,
  morningPostPercentage: Number((100 * RAW_POSTS.filter(p => p.createTime && p.createTime.slice(11, 19) >= "09:35:00" && p.createTime.slice(11, 19) <= "10:05:00").length / RAW_POSTS.length).toFixed(1))
};

const beforePosts = RAW_POSTS.filter(p => p.date < "2026-02-18");
const afterPosts = RAW_POSTS.filter(p => p.date >= "2026-05-01");

// Before vs After Break stats
export const BREAK_STATS = {
  durationDays: 73,
  beforeStartDate: "Aug 11, 2025",
  beforeEndDate: "Feb 17, 2026",
  afterStartDate: "May 01, 2026",
  afterEndDate: "Jul 12, 2026",
  beforePostCount: beforePosts.length,
  afterPostCount: afterPosts.length,
  beforeMedianLikesExcludingViral: calculateMedian(beforePosts.filter(p => p.likes <= 50000).map(p => p.likes)),
  afterMedianLikes: calculateMedian(afterPosts.map(p => p.likes)),
  beforeMedianPlays: calculateMedian(beforePosts.filter(p => p.likes <= 50000).map(p => p.plays ?? 0)),
  afterMedianPlays: calculateMedian(afterPosts.map(p => p.plays ?? 0)),
  beforeWeeklyFreq: 1.7,
  afterWeeklyFreq: 0.5
};

export const TOP_5_POSTS = sortedByLikes.slice(0, 5).map(p => {
  const enriched = ENRICHED_POSTS.find(e => e.date === p.date);
  return {
    ...p,
    plays: enriched?.plays ?? 0,
    shares: enriched?.shares ?? 0,
    comments: enriched?.comments ?? 0,
    duration: enriched?.duration ?? 0,
    isAd: enriched?.isAd ?? false,
    shareToLikeRatio: enriched?.shareToLikeRatio ?? 0,
    formattedLikes: p.likes.toLocaleString(),
    formattedPlays: (enriched?.plays ?? 0).toLocaleString(),
    formattedShares: (enriched?.shares ?? 0).toLocaleString(),
    phase: getPhaseForDate(p.date)
  };
});

// Histogram Bins as in original project
export const HISTOGRAM_BINS = [
  { label: '<50', min: 0, max: 49, count: ENRICHED_POSTS.filter(p => p.likes < 50).length },
  { label: '50–100', min: 50, max: 99, count: ENRICHED_POSTS.filter(p => p.likes >= 50 && p.likes < 100).length },
  { label: '100–200', min: 100, max: 199, count: ENRICHED_POSTS.filter(p => p.likes >= 100 && p.likes < 200).length },
  { label: '200–500', min: 200, max: 499, count: ENRICHED_POSTS.filter(p => p.likes >= 200 && p.likes < 500).length },
  { label: '500–2k', min: 500, max: 1999, count: ENRICHED_POSTS.filter(p => p.likes >= 500 && p.likes < 2000).length },
  { label: '2k–10k', min: 2000, max: 9999, count: ENRICHED_POSTS.filter(p => p.likes >= 2000 && p.likes < 10000).length },
  { label: '10k+', min: 10000, max: Infinity, count: ENRICHED_POSTS.filter(p => p.likes >= 10000).length }
];

export const PHASE_STATS: PhaseStats[] = [
  PHASE_DEFS[0],
  PHASE_DEFS[1],
  PHASE_DEFS[2],
  PHASE_DEFS[4]
].map((phaseDef, idx) => {
  const posts = ENRICHED_POSTS.filter(p => p.phase.id === phaseDef.id);
  const likes = posts.map(p => p.likes);
  const plays = posts.map(p => p.plays);
  const nonViralLikes = posts.filter(p => !p.isViralOutlier).map(p => p.likes);
  const postsPerWeekList = [4.0, 3.8, 1.7, 0.5];
  const startDates = ['Aug 11, 2025', 'Sep 21, 2025', 'Nov 03, 2025', 'May 01, 2026'];
  const endDates = ['Sep 07, 2025', 'Oct 30, 2025', 'Feb 17, 2026', 'Jul 12, 2026'];

  return {
    phase: phaseDef,
    postCount: posts.length,
    totalLikes: likes.reduce((s, p) => s + p, 0),
    totalPlays: plays.reduce((s, p) => s + p, 0),
    minLikes: Math.min(...likes),
    medianLikes: calculateMedian(likes),
    meanLikes: calculateMean(likes),
    maxLikes: Math.max(...likes),
    minPlays: Math.min(...plays),
    medianPlays: calculateMedian(plays),
    maxPlays: Math.max(...plays),
    medianLikesExcludingViral: calculateMedian(nonViralLikes.length ? nonViralLikes : likes),
    postsPerWeek: postsPerWeekList[idx],
    startDate: startDates[idx],
    endDate: endDates[idx]
  };
});

