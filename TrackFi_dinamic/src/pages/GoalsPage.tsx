import { useAppState } from "../app/AppContext";
import { PageHero } from "../components/common/PageHero";
import { ProgressBar } from "../components/common/ProgressBar";
import { SummaryList } from "../components/common/SummaryList";
import { formatCurrency } from "../utils/formatters";
import { getGoalProgress, getGoalProgressColor } from "../utils/goals";

function GoalsPage() {
  const { deleteGoal, goals, startGoalContribution, startGoalCreate, startGoalEdit } = useAppState();

  return (
    <main className="goals-page">
      <PageHero
        actionLabel="New Goal"
        onAction={startGoalCreate}
        subtitle="Review all your goals."
        title="Goals"
        titleId="goalsPageTitle"
        variant="goals"
      />

      <section className="transactions-summary-card goals-summary-card" aria-label="Financial summary">
        <SummaryList />
      </section>

      <section className="goals-manager-card" aria-label="Goals list">
        <div className="goals-manager" role="list">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal);
            const progressColor = getGoalProgressColor(progress);

            return (
              <article className="goal-row" key={goal.id} role="listitem">
                <div className="goal-row__content">
                  <div className="goal-row__meta">
                    <div className="goal-row__title-group">
                      <p className="goal-row__name">{goal.name}</p>
                      <p className="goal-row__label">Savings Progress</p>
                    </div>
                    <p className="goal-row__value">
                      <span className="goal-row__value-current">{formatCurrency(goal.current)}</span>
                      <span className="goal-row__value-separator"> / </span>
                      <span className="goal-row__value-target">{formatCurrency(goal.target)}</span>
                    </p>
                  </div>
                  <ProgressBar color={progressColor} label={`${goal.name} progress`} progress={progress} trackClassName="goal-row__track" barClassName="goal-row__bar" />
                </div>
                <div className="goal-row__actions" role="group" aria-label={`${goal.name} actions`}>
                  <button className="goal-row__contribute" type="button" onClick={() => startGoalContribution(goal)}>
                    Contribute
                  </button>
                  <div className="goal-row__minor-actions">
                    <button className="category-action" type="button" onClick={() => startGoalEdit(goal)}>
                      Edit
                    </button>
                    <button className="category-action category-action--delete" type="button" onClick={() => deleteGoal(goal.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default GoalsPage;
