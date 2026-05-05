import type { Goal } from "../data";

export function getGoalProgress(goal: Goal) {
  return Math.min(Math.max((goal.current / goal.target) * 100, 0), 100);
}

export function getGoalProgressColor(progress: number) {
  const hue = Math.round((progress / 100) * 120);
  const lightness = progress < 8 ? 52 : 42;

  return `hsl(${hue} 78% ${lightness}%)`;
}
