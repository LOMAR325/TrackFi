import { OverviewCard, SpendingCard } from "../components/charts/FinanceCharts";
import { PageHero } from "../components/common/PageHero";
import { SummaryList } from "../components/common/SummaryList";
import { analyticsChartData, analyticsSpending } from "../data";

function AnalyticsPage() {
  return (
    <main className="analytics-page">
      <PageHero
        subtitle="Review all your Analytics"
        title="Analytics"
        titleId="analyticsPageTitle"
        variant="analytics"
      />
      <section className="transactions-summary-card analytics-summary-card" aria-label="Financial summary">
        <SummaryList />
      </section>
      <OverviewCard cardClassName="analytics-overview-card" chartClassName="analytics-overview-card__chart" data={analyticsChartData} title="Income & Expense Overview" />
      <SpendingCard
        cardClassName="analytics-spending-card"
        categories={analyticsSpending}
        legendClassName="analytics-spending-card__legends"
        title="Spending Breakdown"
      />
    </main>
  );
}

export default AnalyticsPage;
