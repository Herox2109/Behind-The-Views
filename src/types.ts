export interface RawPost {
  date: string;
  likes: number; // like count
  plays?: number; // playCount (views)
  shares?: number; // shareCount
  comments?: number; // commentCount
  duration?: number; // videoMeta.duration (seconds)
  isAd?: boolean; // isAd
  hashtagsCount?: number;
  createTime?: string; // createTimeISO
}

export interface PhaseDef {
  id: string;
  name: string;
  color: string;
  start: string;
  end: string;
  description: string;
}

export interface EnrichedPost {
  index: number;
  date: string;
  dateObj: Date;
  likes: number;
  logLikes: number;
  plays: number;
  shares: number;
  comments: number;
  duration: number;
  isAd: boolean;
  hashtagsCount: number;
  createTime: string;
  gapDays: number;
  phase: PhaseDef;
  cumulativeLikes: number;
  cumulativePlays: number;
  dayOfWeek: string;
  timeEstimate: string; // 9:40 AM standard routine
  isViralOutlier: boolean;
  isTop5: boolean;
  soundLabel: string;
  likeToPlayRatio: number;
  shareToLikeRatio: number;
}

export interface PhaseStats {
  phase: PhaseDef;
  postCount: number;
  totalLikes: number;
  totalPlays: number;
  minLikes: number;
  medianLikes: number;
  meanLikes: number;
  maxLikes: number;
  minPlays: number;
  medianPlays: number;
  maxPlays: number;
  medianLikesExcludingViral: number;
  postsPerWeek: number;
  startDate: string;
  endDate: string;
}

export interface ChannelMetrics {
  totalPosts: number;
  totalLikes: number;
  totalPlays: number;
  totalShares: number;
  totalComments: number;
  dateRangeDays: number;
  startDate: string;
  endDate: string;
  overallMedianLikes: number;
  overallMeanLikes: number;
  overallMedianPlays: number;
  overallMedianDuration: number;
  top2LikesSum: number;
  top2Percentage: number;
  breakDurationDays: number;
  medianGapDays: number;
  maxGapDays: number;
  averageWeeklyPosts: number;
  morningPostPercentage: number;
}

export interface CustomChartConfig {
  xAxis: 'date' | 'index' | 'gapDays' | 'dayOfWeek' | 'phase';
  yAxis: 'likes' | 'logLikes' | 'cumulativeLikes' | 'gapDays' | 'rollingAvg';
  chartType: 'bar' | 'scatter' | 'line' | 'area';
  colorBy: 'phase' | 'single' | 'intensity';
  filterScript: string;
  transformScript: string;
}
