import { userProfile as defaultUserProfile } from "./data.js";
import {
  transactionFilters,
  transactionsPageContent,
  transactionsSidebarItems,
  transactionTableColumns,
  transactionTableRows,
} from "./all-transactions-data.js";
import {
  STORAGE_KEYS,
  calculateTransactionSummary,
  createTransactionFromForm,
  formatDisplayDate,
  getSavedUserProfile,
  readTransactions,
  transactionToTableRow,
  writeTransactions,
} from "./app-state.js";
import {
  initSidebarToggle,
  initTransactionModal,
  initUserDropdown,
  closeActivePopover,
  openCustomPopover,
  openMenu,
} from "./interactions.js";
import {
  renderSidebar,
  renderTransactionsSummary,
  renderTransactionsTable,
  renderUserMenu,
} from "./renderers.js";

const DEFAULT_RANGE = {
  from: "2026-04-01",
  to: "2026-04-30",
};

const SORT_OPTIONS = [
  { value: "date-desc", label: "Sort by: Date" },
  { value: "date-asc", label: "Sort by: Oldest" },
  { value: "amount-desc", label: "Sort by: Amount" },
  { value: "category-asc", label: "Sort by: Category" },
];

const filterState = {
  dateFrom: DEFAULT_RANGE.from,
  dateTo: DEFAULT_RANGE.to,
  type: "all",
  category: "all",
  account: "all",
  search: "",
  sort: "date-desc",
};

let transactions = [];

document.addEventListener("DOMContentLoaded", () => {
  transactions = readTransactions(transactionTableRows);

  populateSharedShell();
  populatePageCopy();
  renderPageSections();
  initSidebarToggle();
  initTransactionModal({
    defaultDate: new Date(2026, 3, 25),
    onSubmit(values) {
      transactions = [createTransactionFromForm(values), ...transactions];
      writeTransactions(transactions);
      renderPageSections();
    },
  });
  initUserDropdown();
  initTransactionFilters();
});

function populateSharedShell() {
  const userProfile = getSavedUserProfile(defaultUserProfile);

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
  const search = document.getElementById("transactionsSearch");

  if (title) {
    title.textContent = transactionsPageContent.title;
  }

  if (subtitle) {
    subtitle.textContent = transactionsPageContent.subtitle;
  }

  if (search) {
    search.placeholder = transactionFilters.searchPlaceholder;
  }

  syncFilterLabels();
}

function initTransactionFilters() {
  const dateButton = document.getElementById("transactionsDateRange")?.closest(".filter-control");
  const typeButton = document.getElementById("transactionsTypeFilter");
  const categoryButton = document.getElementById("transactionsCategoryFilter");
  const accountButton = document.getElementById("transactionsAccountFilter");
  const sortButton = document.querySelector(".transactions-summary__sort");
  const search = document.getElementById("transactionsSearch");

  dateButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    openDateRangePopover(dateButton);
  });

  typeButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    openFilterMenu(typeButton, "type", [
      { value: "all", label: "All Types" },
      { value: "income", label: "Income" },
      { value: "expense", label: "Expenses" },
    ]);
  });

  categoryButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    openFilterMenu(categoryButton, "category", [
      { value: "all", label: "All Categories" },
      ...getUniqueOptions("category"),
    ]);
  });

  accountButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    openFilterMenu(accountButton, "account", [
      { value: "all", label: "All Accounts" },
      ...getUniqueOptions("account"),
    ]);
  });

  sortButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    openMenu(
      sortButton,
      SORT_OPTIONS.map((option) => ({
        ...option,
        active: option.value === filterState.sort,
        onSelect() {
          filterState.sort = option.value;
          renderPageSections();
        },
      })),
    );
  });

  search?.addEventListener("input", () => {
    filterState.search = search.value.trim().toLowerCase();
    renderPageSections();
  });
}

function openFilterMenu(button, key, options) {
  openMenu(
    button,
    options.map((option) => ({
      ...option,
      active: option.value === filterState[key],
      onSelect() {
        filterState[key] = option.value;
        renderPageSections();
      },
    })),
  );
}

function openDateRangePopover(button) {
  const content = document.createElement("form");
  content.className = "date-range-popover";
  content.innerHTML = `
    <label class="date-range-popover__field">
      <span>From</span>
      <input type="date" name="from" value="${filterState.dateFrom}">
    </label>
    <label class="date-range-popover__field">
      <span>To</span>
      <input type="date" name="to" value="${filterState.dateTo}">
    </label>
    <div class="date-range-popover__actions">
      <button type="button" class="date-range-popover__button" data-range-reset>Reset</button>
      <button type="submit" class="date-range-popover__button date-range-popover__button--primary">Apply</button>
    </div>
  `;

  content.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(content);
    filterState.dateFrom = String(formData.get("from") || "");
    filterState.dateTo = String(formData.get("to") || "");
    renderPageSections();
    closeActivePopover();
  });

  content.querySelector("[data-range-reset]")?.addEventListener("click", () => {
    filterState.dateFrom = DEFAULT_RANGE.from;
    filterState.dateTo = DEFAULT_RANGE.to;
    renderPageSections();
    closeActivePopover();
  });

  openCustomPopover(button, content, { className: "floating-popover--date" });
}

function renderPageSections() {
  const summary = document.getElementById("transactionsSummary");
  const table = document.getElementById("transactionsTable");
  const filteredTransactions = getFilteredTransactions();

  if (summary) {
    summary.innerHTML = renderTransactionsSummary(calculateTransactionSummary(filteredTransactions));
  }

  if (table) {
    table.innerHTML = renderTransactionsTable(
      transactionTableColumns,
      filteredTransactions.map(transactionToTableRow),
    );
  }

  syncFilterLabels();
}

function getFilteredTransactions() {
  return transactions
    .filter((transaction) => {
      const typeMatches = filterState.type === "all" || transaction.type === filterState.type;
      const categoryMatches =
        filterState.category === "all" || transaction.category === filterState.category;
      const accountMatches = filterState.account === "all" || transaction.account === filterState.account;
      const dateMatches =
        (!filterState.dateFrom || transaction.dateIso >= filterState.dateFrom) &&
        (!filterState.dateTo || transaction.dateIso <= filterState.dateTo);
      const haystack = [
        transaction.category,
        transaction.description,
        transaction.account,
        transaction.type,
        formatDisplayDate(transaction.dateIso),
      ]
        .join(" ")
        .toLowerCase();
      const searchMatches = !filterState.search || haystack.includes(filterState.search);

      return typeMatches && categoryMatches && accountMatches && dateMatches && searchMatches;
    })
    .sort((first, second) => {
      if (filterState.sort === "date-asc") {
        return first.dateIso.localeCompare(second.dateIso);
      }

      if (filterState.sort === "amount-desc") {
        return Math.abs(second.amount) - Math.abs(first.amount);
      }

      if (filterState.sort === "category-asc") {
        return first.category.localeCompare(second.category);
      }

      return second.dateIso.localeCompare(first.dateIso);
    });
}

function syncFilterLabels() {
  const dateRange = document.getElementById("transactionsDateRange");
  const type = document.querySelector("#transactionsTypeFilter .filter-control__text");
  const category = document.querySelector("#transactionsCategoryFilter .filter-control__text");
  const account = document.querySelector("#transactionsAccountFilter .filter-control__text");
  const sortBy = document.getElementById("transactionsSortBy");

  if (dateRange) {
    dateRange.textContent =
      filterState.dateFrom && filterState.dateTo
        ? `${formatDisplayDate(filterState.dateFrom, true)} - ${formatDisplayDate(filterState.dateTo, true)}`
        : transactionFilters.dateRange;
  }

  if (type) {
    type.textContent = labelForValue("type", filterState.type);
  }

  if (category) {
    category.textContent = labelForValue("category", filterState.category);
  }

  if (account) {
    account.textContent = labelForValue("account", filterState.account);
  }

  if (sortBy) {
    sortBy.textContent = SORT_OPTIONS.find((option) => option.value === filterState.sort)?.label;
  }
}

function labelForValue(key, value) {
  const labels = {
    type: {
      all: "All Types",
      income: "Income",
      expense: "Expenses",
    },
    category: {
      all: "All Categories",
    },
    account: {
      all: "All Accounts",
    },
  };

  return labels[key]?.[value] ?? value;
}

function getUniqueOptions(key) {
  return [...new Set(transactions.map((transaction) => transaction[key]).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second))
    .map((value) => ({ value, label: value }));
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEYS.transactions) {
    transactions = readTransactions(transactionTableRows);
    renderPageSections();
  }
});
