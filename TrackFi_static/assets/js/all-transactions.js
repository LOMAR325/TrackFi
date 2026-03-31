import { userProfile } from "./data.js";
import {
  transactionFilters,
  transactionsPageContent,
  transactionsSidebarItems,
  transactionsSummary,
  transactionTableColumns,
  transactionTableRows,
} from "./all-transactions-data.js";
import {
  initSidebarToggle,
  initTransactionModal,
  initUserDropdown,
} from "./interactions.js";
import {
  renderSidebar,
  renderTransactionsSummary,
  renderTransactionsTable,
  renderUserMenu,
} from "./renderers.js";

document.addEventListener("DOMContentLoaded", () => {
  populateSharedShell();
  populatePageCopy();
  renderPageSections();
  initSidebarToggle();
  initTransactionModal();
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
    sidebar.innerHTML = renderSidebar(transactionsSidebarItems);
  }
}

function populatePageCopy() {
  const title = document.querySelector("[data-page-title]");
  const subtitle = document.querySelector("[data-page-subtitle]");
  const dateRange = document.getElementById("transactionsDateRange");
  const type = document.querySelector("#transactionsTypeFilter .filter-control__text");
  const category = document.querySelector("#transactionsCategoryFilter .filter-control__text");
  const account = document.querySelector("#transactionsAccountFilter .filter-control__text");
  const sortBy = document.getElementById("transactionsSortBy");
  const search = document.getElementById("transactionsSearch");

  if (title) {
    title.textContent = transactionsPageContent.title;
  }

  if (subtitle) {
    subtitle.textContent = transactionsPageContent.subtitle;
  }

  if (dateRange) {
    dateRange.textContent = transactionFilters.dateRange;
  }

  if (type) {
    type.textContent = transactionFilters.type;
  }

  if (category) {
    category.textContent = transactionFilters.category;
  }

  if (account) {
    account.textContent = transactionFilters.account;
  }

  if (sortBy) {
    sortBy.textContent = transactionFilters.sortBy;
  }

  if (search) {
    search.placeholder = transactionFilters.searchPlaceholder;
  }
}

function renderPageSections() {
  const summary = document.getElementById("transactionsSummary");
  const table = document.getElementById("transactionsTable");

  if (summary) {
    summary.innerHTML = renderTransactionsSummary(transactionsSummary);
  }

  if (table) {
    table.innerHTML = renderTransactionsTable(transactionTableColumns, transactionTableRows);
  }
}
