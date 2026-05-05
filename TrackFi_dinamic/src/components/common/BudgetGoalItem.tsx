import type { Goal } from "../../data";
import { formatCurrency } from "../../utils/formatters";
import { getGoalProgress, getGoalProgressColor } from "../../utils/goals";
import { ProgressBar } from "./ProgressBar";

export function BudgetGoalItem({ goal }: { goal: Goal }) {
  const progress = getGoalProgress(goal);
  const progressColor = getGoalProgressColor(progress);

  return (
    <article className="budget-goal">
      <div className="budget-goal__meta">
        <p className="budget-goal__name">{goal.name}</p>
        <p className="budget-goal__value">
          <span className="budget-goal__value-current">{formatCurrency(goal.current)}</span>
          <span className="budget-goal__value-separator"> / </span>
          <span className="budget-goal__value-target">{formatCurrency(goal.target)}</span>
        </p>
      </div>
      <ProgressBar color={progressColor} label={`${goal.name} progress`} progress={progress} trackClassName="budget-goal__track" barClassName="budget-goal__bar" />
    </article>
  );
}
