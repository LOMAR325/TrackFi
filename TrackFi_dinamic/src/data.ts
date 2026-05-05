export type Theme = "light" | "dark";
export type TransactionType = "income" | "expense";
export type NavId =
  | "dashboard"
  | "transactions"
  | "categories"
  | "analytics"
  | "goals"
  | "settings";

export type NavigationItem = {
  id: NavId;
  label: string;
  icon: NavId;
  to: string;
};

export type Transaction = {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
};

export type Category = {
  id: string;
  name: string;
};

export type Goal = {
  id: string;
  name: string;
  current: number;
  target: number;
};

export type StatCard = {
  title: string;
  valueText: string;
  tone: "balance" | "success" | "danger" | "summary";
  columnSpan: 2 | 4;
};

export type SummaryItem = {
  label: string;
  value: string;
  tone: "income" | "expense" | "balance";
};

export type ChartData = {
  labels: string[];
  incomeBars: number[];
  expenseBars: number[];
  incomeLine: number[];
  expenseLine: number[];
  suggestedMax: number;
};

export type SpendingCategory = {
  label: string;
  value: number;
  color: string;
};

export const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", to: "/dashboard" },
  { id: "transactions", label: "All Transactions", icon: "transactions", to: "/transactions" },
  { id: "categories", label: "Categories", icon: "categories", to: "/categories" },
  { id: "analytics", label: "Analytics", icon: "analytics", to: "/analytics" },
  { id: "goals", label: "Goals", icon: "goals", to: "/goals" },
  { id: "settings", label: "Settings", icon: "settings", to: "/settings" },
];

export const initialUser = {
  name: "user",
  email: "",
};

export const dashboardStats: StatCard[] = [
  { title: "Total Balance", valueText: "$12,540.75", tone: "balance", columnSpan: 4 },
  { title: "This Month's Income", valueText: "$4,200", tone: "success", columnSpan: 2 },
  { title: "This Month's Expenses", valueText: "$3,150", tone: "danger", columnSpan: 2 },
  { title: "Monthly Summary", valueText: "$1,050 Savings", tone: "summary", columnSpan: 4 },
];

export const pageSummary: SummaryItem[] = [
  { label: "Income", value: "$4,200", tone: "income" },
  { label: "Expenses", value: "$3,150", tone: "expense" },
  { label: "Balance", value: "$1,050", tone: "balance" },
];

export const dashboardChartData: ChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "June"],
  incomeBars: [540, 680, 820, 560, 980, 810],
  expenseBars: [710, 1030, 1440, 980, 1490, 1880],
  incomeLine: [2350, 2050, 3300, 2480, 2550, 3460],
  expenseLine: [1580, 1500, 2320, 1760, 1820, 2360],
  suggestedMax: 4000,
};

export const analyticsChartData: ChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  incomeBars: [540, 680, 820, 560, 980, 1400, 1360, 780, 1490, 1540, 1320, 760],
  expenseBars: [710, 1030, 1440, 980, 560, 1880, 1360, 1090, 450, 400, 1100, 1390],
  incomeLine: [2350, 2050, 3300, 2480, 2550, 3460, 3220, 3400, 3680, 3150, 3360, 2950],
  expenseLine: [1580, 1500, 2320, 1760, 1820, 2360, 2330, 2310, 2520, 2130, 2320, 1910],
  suggestedMax: 4000,
};

export const dashboardSpending: SpendingCategory[] = [
  { label: "Housing", value: 1100, color: "#3D65AC" },
  { label: "Food & Dining", value: 630, color: "#75B656" },
  { label: "Transportation", value: 450, color: "#E8932B" },
  { label: "Entertainment", value: 300, color: "#69AF58" },
  { label: "Shopping", value: 230, color: "#5645B1" },
  { label: "Others", value: 350, color: "#DE5D61" },
];

export const analyticsSpending: SpendingCategory[] = [
  { label: "Investments", value: 920, color: "#3D65AC" },
  { label: "Travel Fund", value: 560, color: "#75B656" },
  { label: "Utilities", value: 410, color: "#E8932B" },
  { label: "Health Care", value: 320, color: "#69AF58" },
  { label: "Subscriptions", value: 210, color: "#5645B1" },
  { label: "Education", value: 280, color: "#DE5D61" },
];

export const initialCategories: Category[] = [
  { id: "housing", name: "Housing" },
  { id: "food-drinks", name: "Food & Drinks" },
  { id: "transportation", name: "Transportation" },
  { id: "shopping", name: "Shopping" },
];

export const initialGoals: Goal[] = [
  { id: "travel", name: "Travel", current: 500, target: 600 },
  { id: "house", name: "House", current: 2700, target: 75000 },
  { id: "spa-center", name: "Spa Center", current: 250, target: 500 },
  { id: "car", name: "Car", current: 20000, target: 55000 },
  { id: "iphone", name: "IPhone 18 Ultra Pro Max", current: 800, target: 1000 },
];

export const initialTransactions: Transaction[] = [
  {
    id: "salary-apr-15",
    date: "2026-04-15",
    type: "income",
    category: "Salary",
    description: "Salary",
    amount: 2500,
  },
  {
    id: "grocery-apr-14",
    date: "2026-04-14",
    type: "expense",
    category: "Food",
    description: "Grocery Store",
    amount: 85.7,
  },
  {
    id: "gas-apr-13",
    date: "2026-04-13",
    type: "expense",
    category: "Transport",
    description: "Gas Station",
    amount: 45,
  },
  {
    id: "movie-apr-13",
    date: "2026-04-13",
    type: "expense",
    category: "Entertainment",
    description: "Movie Tickets",
    amount: 30,
  },
  {
    id: "bonus-apr-13",
    date: "2026-04-13",
    type: "income",
    category: "Bonus",
    description: "Bonus",
    amount: 250,
  },
  {
    id: "gas-2-apr-13",
    date: "2026-04-13",
    type: "expense",
    category: "Transport",
    description: "Gas Station",
    amount: 75.3,
  },
  {
    id: "coffee-apr-25-1",
    date: "2026-04-25",
    type: "income",
    category: "Salary",
    description: "Coffe (2 capuchinos)",
    amount: 2500,
  },
  {
    id: "milk-apr-25-1",
    date: "2026-04-25",
    type: "expense",
    category: "Grocery Store",
    description: "milk",
    amount: 85.7,
  },
  {
    id: "coffee-apr-25-2",
    date: "2026-04-25",
    type: "income",
    category: "Salary",
    description: "Coffe (2 capuchinos)",
    amount: 2500,
  },
  {
    id: "milk-apr-25-2",
    date: "2026-04-25",
    type: "expense",
    category: "Grocery Store",
    description: "milk",
    amount: 85.7,
  },
  {
    id: "coffee-apr-25-3",
    date: "2026-04-25",
    type: "income",
    category: "Salary",
    description: "Coffe (2 capuchinos)",
    amount: 2500,
  },
  {
    id: "milk-apr-25-3",
    date: "2026-04-25",
    type: "expense",
    category: "Grocery Store",
    description: "milk",
    amount: 85.7,
  },
];
