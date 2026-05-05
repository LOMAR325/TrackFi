import { useAppState } from "../app/useAppState";
import { OverviewCard, SpendingCard } from "../components/charts/FinanceCharts";
import { BudgetGoalItem } from "../components/common/BudgetGoalItem";
import { CardHeader } from "../components/common/CardHeader";
import { PrimaryAction } from "../components/common/PrimaryAction";
import { TransactionList } from "../components/transactions/TransactionList";
import { dashboardChartData, dashboardSpending, dashboardStats } from "../data";

function DashboardPage() {
  const { goals, openModal, transactions, userName } = useAppState();
  const recentTransactions = transactions.slice(0, 6);

  return (
    <main className="dashboard">
      <section className="dashboard-hero" aria-labelledby="dashboardHeading">
        <div className="dashboard-hero__content">
          <h1 className="dashboard-hero__title" id="dashboardHeading">
            Welcome back, <span>{userName}</span>!
          </h1>
          <p className="dashboard-hero__subtitle">Here&apos;s your financial overview.</p>
        </div>
        <PrimaryAction label="New Transaction" onClick={() => openModal("transaction")} />
      </section>

      <section className="dashboard-stats" aria-label="Financial highlights">
        {dashboardStats.map((card) => (
          <article className={`stat-card stat-card--span-${card.columnSpan} stat-card--${card.tone}`} key={card.title}>
            <p className="stat-card__label">{card.title}</p>
            <p className="stat-card__value">{card.valueText}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-columns" aria-label="Dashboard insights">
        <div className="dashboard-column">
          <OverviewCard data={dashboardChartData} title="Income & Expense Overview" />
          <SpendingCard categories={dashboardSpending} title="Spending Breakdown" />
        </div>

        <div className="dashboard-column">
          <article className="card recent-transactions-card" aria-labelledby="recentTransactionsTitle">
            <CardHeader actionTo="/transactions" actionText="View All" id="recentTransactionsTitle" title="Recent Transactions" />
            <div className="card__body">
              <TransactionList transactions={recentTransactions} />
            </div>
          </article>

          <article className="card budget-goals-card" aria-labelledby="budgetGoalsTitle">
            <CardHeader actionTo="/goals" actionText="View All" id="budgetGoalsTitle" title="Budget Goals" />
            <div className="card__body">
              <div className="budget-goals-list">
                {goals.slice(0, 5).map((goal) => (
                  <BudgetGoalItem goal={goal} key={goal.id} />
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
