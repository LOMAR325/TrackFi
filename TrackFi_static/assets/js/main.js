import {
  budgetGoals,
  overviewChartData,
  sidebarItems,
  spendingCategories,
  statsCards,
  transactions as fallbackTransactions,
  userProfile,
} from "./data.js";
import {
  createTransactionFromForm,
  getSavedUserProfile,
  readTransactions,
  transactionToRecentItem,
  writeTransactions,
} from "./app-state.js";
import { createOverviewChart, createSpendingChart } from "./charts.js";
import {
  initSidebarToggle,
  initTransactionModal,
  initUserDropdown,
} from "./interactions.js";
import {
  renderBudgetGoals,
  renderSidebar,
  renderSpendingLegend,
  renderStats,
  renderTransactions,
  renderUserMenu,
} from "./renderers.js";

document.addEventListener("DOMContentLoaded", () => {
  populateStaticFields();
  renderDashboardSections();
  initializeCharts();
  initSidebarToggle();
  initTransactionModal({
    defaultDate: new Date(2026, 3, 1),
    onSubmit(values) {
      const savedTransactions = readTransactions(fallbackTransactions);
      writeTransactions([createTransactionFromForm(values), ...savedTransactions]);
      renderDashboardSections();
    },
  });
  initUserDropdown();
});

function populateStaticFields() {
  const profile = getSavedUserProfile(userProfile);

  document
    .querySelectorAll("[data-user-name], [data-user-greeting]")
    .forEach((element) => {
      element.textContent = profile.name;
    });

  const avatar = document.querySelector(".user-dropdown__avatar");
  if (avatar) {
    avatar.textContent = profile.initials;
  }

  const userMenu = document.getElementById("userDropdownMenu");
  if (userMenu) {
    userMenu.innerHTML = renderUserMenu(profile.menuItems);
  }
}

function renderDashboardSections() {
  const sidebar = document.getElementById("sidebarNav");
  const stats = document.getElementById("statsGrid");
  const transactionsList = document.getElementById("transactionsList");
  const spendingLegend = document.getElementById("spendingLegend");
  const budgetGoalsList = document.getElementById("budgetGoalsList");

  if (sidebar) {
    sidebar.innerHTML = renderSidebar(sidebarItems);
  }

  if (stats) {
    stats.innerHTML = renderStats(statsCards);
  }

  if (transactionsList) {
    const savedTransactions = readTransactions([]);
    const recentTransactions = savedTransactions.length
      ? savedTransactions.slice(0, 7).map(transactionToRecentItem)
      : fallbackTransactions;

    transactionsList.innerHTML = renderTransactions(recentTransactions);
  }

  if (spendingLegend) {
    spendingLegend.innerHTML = renderSpendingLegend(spendingCategories);
  }

  if (budgetGoalsList) {
    budgetGoalsList.innerHTML = renderBudgetGoals(budgetGoals);
  }
}

function initializeCharts() {
  const overviewCanvas = document.getElementById("overviewChart");
  const spendingCanvas = document.getElementById("spendingChart");

  createOverviewChart(overviewCanvas, overviewChartData);
  createSpendingChart(spendingCanvas, spendingCategories);
}

function injectChartFallback(canvas, message) {
  if (!canvas || !canvas.parentElement) {
    return;
  }

  canvas.hidden = true;

  const fallback = document.createElement("p");
  fallback.className = "chart-shell__fallback";
  fallback.textContent = message;

  canvas.parentElement.append(fallback);
}
