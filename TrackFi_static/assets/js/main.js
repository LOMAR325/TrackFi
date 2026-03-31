import {
  budgetGoals,
  overviewChartData,
  sidebarItems,
  spendingCategories,
  statsCards,
  transactions,
  userProfile,
} from "./data.js";
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
  initTransactionModal();
  initUserDropdown();
});

function populateStaticFields() {
  document
    .querySelectorAll("[data-user-name], [data-user-greeting]")
    .forEach((element) => {
      element.textContent = userProfile.name;
    });

  const avatar = document.querySelector(".user-dropdown__avatar");
  if (avatar) {
    avatar.textContent = userProfile.initials;
  }

  const userMenu = document.getElementById("userDropdownMenu");
  if (userMenu) {
    userMenu.innerHTML = renderUserMenu(userProfile.menuItems);
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
    transactionsList.innerHTML = renderTransactions(transactions);
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

  if (typeof Chart === "undefined") {
    injectChartFallback(overviewCanvas, "Chart.js could not be loaded for the overview chart.");
    injectChartFallback(spendingCanvas, "Chart.js could not be loaded for the spending chart.");
    return;
  }

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
