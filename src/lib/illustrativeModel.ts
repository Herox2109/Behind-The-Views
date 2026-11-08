// Hand-selected demonstration weights. No fitting, calibration or evaluation is claimed.
export interface ScenarioInputs {
  gapDays: number;
  dayOfWeek: number;
  uploadHour: number;
  duration: number;
  isPreBreak: boolean;
}
export function illustrativeScore(input: ScenarioInputs) {
  const contributions = [
    { label: 'Intercept', value: 0.35 },
    { label: 'Gap days × −0.065', value: input.gapDays * -0.065 },
    { label: 'Morning (09:00–10:59 UTC)', value: input.uploadHour >= 9 && input.uploadHour <= 10 ? 0.72 : 0 },
    { label: 'Tuesday or Wednesday', value: [2, 3].includes(input.dayOfWeek) ? 0.48 : 0 },
    { label: 'Assumed momentum state', value: input.isPreBreak ? 1.15 : -0.95 },
    { label: 'Assumed duration effect', value: input.duration >= 18 && input.duration <= 25 ? 0.55 : input.duration > 40 ? -0.65 : 0 },
  ];
  const logit = contributions.reduce((sum, item) => sum + item.value, 0);
  return { contributions, logit, score: 100 / (1 + Math.exp(-logit)) };
}
