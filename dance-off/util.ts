
const ScoreLabels = [
  'SS', // 90%
  'S', // 80%
  'A', // 70%
  'B', // 60%
  'C', // 50%
  'D', // 40%
  'E', // 30%
];

export function mapScoreToText(score: number) {
  const scoreInt = Math.round(score);
  return ScoreLabels[Math.round(score)] ?? scoreInt.toString();
}
