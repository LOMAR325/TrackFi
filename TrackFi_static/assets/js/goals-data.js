import { buildSidebarItems } from "./data.js";

export const goalsPageContent = {
  title: "Goals",
  subtitle: "Review all your goals.",
  ctaLabel: "New Goal",
};

export const goalsSidebarItems = buildSidebarItems("goals");

export const goalsSummary = [
  { label: "Income", value: "$4,200", tone: "income" },
  { label: "Expenses", value: "$3,150", tone: "expense" },
  { label: "Balance", value: "$1,050", tone: "balance" },
];

export const goalsManagerItems = [
  {
    id: "travel",
    name: "Travel",
    progressLabel: "Savings Progress",
    current: 500,
    target: 600,
    color: "#2F7C33",
    contributeLabel: "Contribute",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
  {
    id: "house",
    name: "House",
    progressLabel: "Savings Progress",
    current: 2700,
    target: 75000,
    color: "#D92B3A",
    contributeLabel: "Contribute",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
  {
    id: "spa-center",
    name: "Spa Center",
    progressLabel: "Savings Progress",
    current: 250,
    target: 500,
    color: "#FFE900",
    contributeLabel: "Contribute",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
  {
    id: "car",
    name: "Car",
    progressLabel: "Savings Progress",
    current: 20000,
    target: 55000,
    color: "#FF8A00",
    contributeLabel: "Contribute",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
  {
    id: "iphone",
    name: "IPhone 18 Ultra Pro Max",
    progressLabel: "Savings Progress",
    current: 800,
    target: 1000,
    color: "#B6CF00",
    contributeLabel: "Contribute",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
];
