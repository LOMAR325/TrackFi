import { buildSidebarItems } from "./data.js";

export const analyticsPageContent = {
  title: "Analytics",
  subtitle: "Review all your Analytics",
};

export const analyticsSidebarItems = buildSidebarItems("analytics");

export const analyticsSummary = [
  { label: "Income", value: "$4,200", tone: "income" },
  { label: "Expenses", value: "$3,150", tone: "expense" },
  { label: "Balance", value: "$1,050", tone: "balance" },
];

export const analyticsOverviewChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  incomeBars: [540, 680, 820, 560, 980, 1400, 1360, 780, 1490, 1540, 1320, 760],
  expenseBars: [710, 1030, 1440, 980, 560, 1880, 1360, 1090, 450, 400, 1100, 1390],
  incomeLine: [2350, 2050, 3300, 2480, 2550, 3460, 3220, 3400, 3680, 3150, 3360, 2950],
  expenseLine: [1580, 1500, 2320, 1760, 1820, 2360, 2330, 2310, 2520, 2130, 2320, 1910],
  suggestedMax: 4000,
  stepSize: 1000,
  barThickness: 18,
};

export const analyticsSpendingCategories = [
  { label: "Investments", value: 920, color: "#3D65AC" },
  { label: "Travel Fund", value: 560, color: "#75B656" },
  { label: "Utilities", value: 410, color: "#E8932B" },
  { label: "Health Care", value: 320, color: "#69AF58" },
  { label: "Subscriptions", value: 210, color: "#5645B1" },
  { label: "Education", value: 280, color: "#DE5D61" },
];

export const analyticsSpendingLegendPrimary = analyticsSpendingCategories.slice(0, 3);
export const analyticsSpendingLegendSecondary = analyticsSpendingCategories.slice(3);
