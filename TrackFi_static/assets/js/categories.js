import { userProfile as defaultUserProfile } from "./data.js";
import {
  categoriesList as fallbackCategories,
  categoriesPageContent,
  categoriesSidebarItems,
} from "./categories-data.js";
import {
  STORAGE_KEYS,
  generateId,
  getSavedUserProfile,
  readState,
  writeState,
} from "./app-state.js";
import {
  initSidebarToggle,
  initUserDropdown,
  openConfirmDialog,
  openFormDialog,
  showToast,
} from "./interactions.js";
import { renderCategoriesList, renderSidebar, renderUserMenu } from "./renderers.js";

let categories = [];

document.addEventListener("DOMContentLoaded", () => {
  categories = readState(STORAGE_KEYS.categories, fallbackCategories);

  populateSharedShell();
  populatePageCopy();
  renderPageSections();
  initSidebarToggle();
  initUserDropdown();
  initCategoryActions();
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

function initCategoryActions() {
  document.querySelector(".categories-page .new-transaction-button")?.addEventListener("click", () => {
    openCategoryDialog();
  });

  document.getElementById("categoriesList")?.addEventListener("click", (event) => {
    const action = event.target.closest("[data-category-action]");
    const row = event.target.closest("[data-category-id]");

    if (!action || !row) {
      return;
    }

    const category = categories.find((item) => item.id === row.dataset.categoryId);

    if (!category) {
      return;
    }

    if (action.dataset.categoryAction === "edit") {
      openCategoryDialog(category);
      return;
    }

    openConfirmDialog({
      title: "Delete Category",
      message: `Delete ${category.name}?`,
      confirmText: "Delete",
      onConfirm() {
        categories = categories.filter((item) => item.id !== category.id);
        persistAndRender("Category deleted");
      },
    });
  });
}

function openCategoryDialog(category = null) {
  openFormDialog({
    title: category ? "Edit Category" : "New Category",
    submitText: category ? "Save Category" : "Add Category",
    fields: [
      {
        name: "name",
        label: "Name",
        value: category?.name ?? "",
        placeholder: "Category name",
        required: true,
      },
    ],
    onSubmit(values) {
      const name = String(values.name ?? "").trim();

      if (!name) {
        showToast("Category name is required", "error");
        return false;
      }

      if (category) {
        categories = categories.map((item) => (item.id === category.id ? { ...item, name } : item));
        persistAndRender("Category updated");
        return true;
      }

      categories = [
        ...categories,
        {
          id: generateId("category"),
          name,
          editLabel: "Edit",
          deleteLabel: "Delete",
        },
      ];
      persistAndRender("Category added");
      return true;
    },
  });
}

function renderPageSections() {
  const categoriesListElement = document.getElementById("categoriesList");

  if (categoriesListElement) {
    categoriesListElement.innerHTML = renderCategoriesList(categories);
  }
}

function persistAndRender(message) {
  writeState(STORAGE_KEYS.categories, categories);
  renderPageSections();
  showToast(message);
}
