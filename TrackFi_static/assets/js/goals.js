import { userProfile } from "./data.js";
import {
  goalsManagerItems,
  goalsPageContent,
  goalsSidebarItems,
  goalsSummary,
} from "./goals-data.js";
import { initSidebarToggle, initUserDropdown } from "./interactions.js";
import {
  renderGoalsManager,
  renderSidebar,
  renderTransactionsSummary,
  renderUserMenu,
} from "./renderers.js";

document.addEventListener("DOMContentLoaded", () => {
  populateSharedShell();
  populatePageCopy();
  renderPageSections();
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
    sidebar.innerHTML = renderSidebar(goalsSidebarItems);
  }
}

function populatePageCopy() {
  const title = document.querySelector("[data-page-title]");
  const subtitle = document.querySelector("[data-page-subtitle]");
  const cta = document.querySelector("[data-goals-cta-label]");

  if (title) {
    title.textContent = goalsPageContent.title;
  }

  if (subtitle) {
    subtitle.textContent = goalsPageContent.subtitle;
  }

  if (cta) {
    cta.textContent = goalsPageContent.ctaLabel;
  }
}

function renderPageSections() {
  const summary = document.getElementById("goalsSummary");
  const goalsManager = document.getElementById("goalsManager");

  if (summary) {
    summary.innerHTML = renderTransactionsSummary(goalsSummary);
  }

  if (goalsManager) {
    goalsManager.innerHTML = renderGoalsManager(goalsManagerItems);
  }
}
