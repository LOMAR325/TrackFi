import { buildSidebarItems } from "./data.js";

export const transactionsPageContent = {
  title: "All Transactions",
  subtitle: "Review all your financial transactions.",
};

export const transactionsSidebarItems = buildSidebarItems("transactions");

export const transactionFilters = {
  dateRange: "Apr 1, 2024 - Apr 30, 2024",
  type: "All Types",
  category: "All Categories",
  account: "All Accounts",
  searchPlaceholder: "Search",
  sortBy: "Sort by: Date",
};

export const transactionsSummary = [
  { label: "Income", value: "$4,200", tone: "income" },
  { label: "Expenses", value: "$3,150", tone: "expense" },
  { label: "Balance", value: "$1,050", tone: "balance" },
];

export const transactionTableColumns = [
  { key: "date", label: "Date" },
  { key: "type", label: "Type" },
  { key: "category", label: "Category" },
  { key: "description", label: "Discription" },
  { key: "amount", label: "Amount", align: "right" },
];

export const transactionTableRows = [
  {
    id: "t-1",
    date: "April 25",
    type: "INCOME",
    category: "Salary",
    description: "Coffe (2 capuchinos)",
    amount: "$2,500",
    tone: "income",
  },
  {
    id: "t-2",
    date: "April 25",
    type: "EXPENSE",
    category: "Grocery Store",
    description: "milk",
    amount: "$85.70",
    tone: "expense",
  },
  {
    id: "t-3",
    date: "April 25",
    type: "INCOME",
    category: "Salary",
    description: "Coffe (2 capuchinos)",
    amount: "$2,500",
    tone: "income",
  },
  {
    id: "t-4",
    date: "April 25",
    type: "EXPENSE",
    category: "Grocery Store",
    description: "milk",
    amount: "$85.70",
    tone: "expense",
  },
  {
    id: "t-5",
    date: "April 25",
    type: "INCOME",
    category: "Salary",
    description: "Coffe (2 capuchinos)",
    amount: "$2,500",
    tone: "income",
  },
  {
    id: "t-6",
    date: "April 25",
    type: "EXPENSE",
    category: "Grocery Store",
    description: "milk",
    amount: "$85.70",
    tone: "expense",
  },
  {
    id: "t-7",
    date: "April 25",
    type: "INCOME",
    category: "Salary",
    description: "Coffe (2 capuchinos)",
    amount: "$2,500",
    tone: "income",
  },
  {
    id: "t-8",
    date: "April 25",
    type: "EXPENSE",
    category: "Grocery Store",
    description: "milk",
    amount: "$85.70",
    tone: "expense",
  },
  {
    id: "t-9",
    date: "April 25",
    type: "INCOME",
    category: "Salary",
    description: "Coffe (2 capuchinos)",
    amount: "$2,500",
    tone: "income",
  },
  {
    id: "t-10",
    date: "April 25",
    type: "EXPENSE",
    category: "Grocery Store",
    description: "milk",
    amount: "$85.70",
    tone: "expense",
  },
  {
    id: "t-11",
    date: "April 25",
    type: "INCOME",
    category: "Salary",
    description: "Coffe (2 capuchinos)",
    amount: "$2,500",
    tone: "income",
  },
  {
    id: "t-12",
    date: "April 25",
    type: "EXPENSE",
    category: "Grocery Store",
    description: "milk",
    amount: "$85.70",
    tone: "expense",
  },
];
