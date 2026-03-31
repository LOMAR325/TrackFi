import { userProfile } from "./data.js";
import {
  categoriesList,
  categoriesPageContent,
  categoriesSidebarItems,
} from "./categories-data.js";
import { initSidebarToggle, initUserDropdown } from "./interactions.js";
import { renderCategoriesList, renderSidebar, renderUserMenu } from "./renderers.js";

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
    sidebar.innerHTML = renderSidebar(categoriesSidebarItems);
  }
}

function populatePageCopy() {
  const title = document.querySelector("[data-page-title]");
  const subtitle = document.querySelector("[data-page-subtitle]");
  const cta = document.querySelector("[data-categories-cta-label]");

  if (title) {
    title.textContent = categoriesPageContent.title;
  }

  if (subtitle) {
    subtitle.textContent = categoriesPageContent.subtitle;
  }

  if (cta) {
    cta.textContent = categoriesPageContent.ctaLabel;
  }
}

function renderPageSections() {
  const categoriesListElement = document.getElementById("categoriesList");

  if (categoriesListElement) {
    categoriesListElement.innerHTML = renderCategoriesList(categoriesList);
  }
}
