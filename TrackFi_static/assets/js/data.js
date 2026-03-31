// Shared view data is kept in plain objects so it can move into React props or state later.
export const userProfile = {
  name: "Vladislav",
  initials: "V",
  menuItems: [
    { label: "Profile" },
    { label: "Notifications" },
    { label: "Sign Out", href: "./login.html" },
  ],
};

export const sidebarDefinitions = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "./index.html" },
  {
    id: "transactions",
    label: "All Transactions",
    icon: "transactions",
    href: "./all-transactions.html",
  },
  { id: "categories", label: "Categories", icon: "categories", href: "./categories.html" },
  { id: "analytics", label: "Analytics", icon: "analytics", href: "./analytics.html" },
  { id: "goals", label: "Goals", icon: "goals", href: "./goals.html" },
  { id: "settings", label: "Settings", icon: "settings", href: "./settings.html" },
];

export function buildSidebarItems(activeId) {
  return sidebarDefinitions.map((item) => ({
    ...item,
    active: item.id === activeId,
  }));
}

export const sidebarItems = buildSidebarItems("dashboard");

export const statsCards = [
  { title: "Total Balance", valueText: "$12,540.75", tone: "balance", columnSpan: 4 },
  { title: "This Month's Income", valueText: "$4,200", tone: "success", columnSpan: 2 },
  { title: "This Month's Expenses", valueText: "$3,150", tone: "danger", columnSpan: 2 },
  { title: "Monthly Summary", valueText: "$1,050 Savings", tone: "summary", columnSpan: 4 },
];

export const overviewChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "June"],
  incomeBars: [540, 680, 820, 560, 980, 810],
  expenseBars: [710, 1030, 1440, 980, 1490, 1880],
  incomeLine: [2350, 2050, 3300, 2480, 2550, 3460],
  expenseLine: [1580, 1500, 2320, 1760, 1820, 2360],
};

export const transactions = [
  { id: "salary", title: "Salary", category: "", amount: 2500, date: "Apr 15" },
  { id: "groceries-1", title: "Grocery Store", category: "Food", amount: -85.7, date: "Apr 14" },
  { id: "gas-1", title: "Gas Station", category: "Transport", amount: -45, date: "Apr 13" },
  { id: "movie", title: "Movie Tickets", category: "Entertainment", amount: -30, date: "Apr 13" },
  { id: "bonus", title: "Bonus", category: "", amount: 250, date: "Apr 13" },
  { id: "gas-2", title: "Gas Station", category: "Transport", amount: -75.3, date: "Apr 13" },
];

export const spendingCategories = [
  { label: "Housing", value: 1100, color: "#3D65AC" },
  { label: "Food & Dining", value: 630, color: "#75B656" },
  { label: "Transportation", value: 450, color: "#E8932B" },
  { label: "Entertainment", value: 300, color: "#69AF58" },
  { label: "Shopping", value: 230, color: "#5645B1" },
  { label: "Others", value: 350, color: "#DE5D61" },
];

export const budgetGoals = [
  { name: "Travel", current: 500, target: 600, color: "#2F7C33" },
  { name: "House", current: 2700, target: 75000, color: "#CD1F2E" },
  { name: "Spa Center", current: 250, target: 500, color: "#FFD500" },
  { name: "Car", current: 20000, target: 55000, color: "#FF8A00" },
  { name: "iPhone 18 Ultra Pro Max", current: 800, target: 1000, color: "#A1C900" },
];
