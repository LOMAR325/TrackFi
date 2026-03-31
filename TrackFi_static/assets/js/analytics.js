import { userProfile } from "./data.js";
import { createOverviewChart, createSpendingChart } from "./charts.js";
import {
  analyticsOverviewChartData,
  analyticsPageContent,
  analyticsSidebarItems,
  analyticsSpendingCategories,
  analyticsSpendingLegendPrimary,
  analyticsSpendingLegendSecondary,
  analyticsSummary,
} from "./analytics-data.js";
import { initSidebarToggle, initUserDropdown } from "./interactions.js";
import {
  renderSidebar,
  renderSpendingLegend,
  renderTransactionsSummary,
  renderUserMenu,
} from "./renderers.js";

document.addEventListener("DOMContentLoaded", () => {
  populateSharedShell();
  populatePageCopy();
  renderPageSections();
  initializeCharts();
  initSidebarToggle();
  initUserDropdown();
});

function populateSharedShell() {
  document.querySelectorAll("[data-user-name]").forEach((element) => {
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

  const sidebar = document.getElementById("sidebarNav");
  if (sidebar) {
    sidebar.innerHTML = renderSidebar(analyticsSidebarItems);
  }
}

function populatePageCopy() {
  const title = document.querySelector("[data-page-title]");
  const subtitle = document.querySelector("[data-page-subtitle]");

  if (title) {
    title.textContent = analyticsPageContent.title;
  }

  if (subtitle) {
    subtitle.textContent = analyticsPageContent.subtitle;
  }
}

function renderPageSections() {
  const summary = document.getElementById("analyticsSummary");
  const legendPrimary = document.getElementById("analyticsLegendPrimary");
  const legendSecondary = document.getElementById("analyticsLegendSecondary");

  if (summary) {
    summary.innerHTML = renderTransactionsSummary(analyticsSummary);
  }

  if (legendPrimary) {
    legendPrimary.innerHTML = renderSpendingLegend(analyticsSpendingLegendPrimary);
  }

  if (legendSecondary) {
    legendSecondary.innerHTML = renderSpendingLegend(analyticsSpendingLegendSecondary);
  }
}

function initializeCharts() {
  const overviewCanvas = document.getElementById("analyticsOverviewChart");
  const spendingCanvas = document.getElementById("analyticsSpendingChart");

  if (typeof Chart === "undefined") {
    injectChartFallback(overviewCanvas, "Chart.js could not be loaded for the overview chart.");
    injectChartFallback(spendingCanvas, "Chart.js could not be loaded for the spending chart.");
    return;
  }

  createOverviewChart(overviewCanvas, analyticsOverviewChartData);
  createSpendingChart(spendingCanvas, analyticsSpendingCategories);
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
