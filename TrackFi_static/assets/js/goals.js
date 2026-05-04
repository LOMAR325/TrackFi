import { userProfile as defaultUserProfile } from "./data.js";
import {
  goalsManagerItems as fallbackGoals,
  goalsPageContent,
  goalsSidebarItems,
  goalsSummary,
} from "./goals-data.js";
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
import {
  renderGoalsManager,
  renderSidebar,
  renderTransactionsSummary,
  renderUserMenu,
} from "./renderers.js";

let goals = [];

document.addEventListener("DOMContentLoaded", () => {
  goals = readState(STORAGE_KEYS.goals, fallbackGoals);

  populateSharedShell();
  populatePageCopy();
  renderPageSections();
  initSidebarToggle();
  initUserDropdown();
  initGoalActions();
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

function initGoalActions() {
  document.querySelector(".goals-page .new-transaction-button")?.addEventListener("click", () => {
    openGoalDialog();
  });

  document.getElementById("goalsManager")?.addEventListener("click", (event) => {
    const action = event.target.closest("[data-goal-action]");
    const row = event.target.closest("[data-goal-id]");

    if (!action || !row) {
      return;
    }

    const goal = goals.find((item) => item.id === row.dataset.goalId);

    if (!goal) {
      return;
    }

    const actionName = action.dataset.goalAction;

    if (actionName === "edit") {
      openGoalDialog(goal);
      return;
    }

    if (actionName === "contribute") {
      openContributionDialog(goal);
      return;
    }

    openConfirmDialog({
      title: "Delete Goal",
      message: `Delete ${goal.name}?`,
      confirmText: "Delete",
      onConfirm() {
        goals = goals.filter((item) => item.id !== goal.id);
        persistAndRender("Goal deleted");
      },
    });
  });
}

function openGoalDialog(goal = null) {
  openFormDialog({
    title: goal ? "Edit Goal" : "New Goal",
    submitText: goal ? "Save Goal" : "Add Goal",
    fields: [
      {
        name: "name",
        label: "Name",
        value: goal?.name ?? "",
        placeholder: "Goal name",
        required: true,
      },
      {
        name: "current",
        label: "Saved",
        type: "number",
        value: goal?.current ?? 0,
        min: 0,
        step: 1,
        required: true,
      },
      {
        name: "target",
        label: "Target",
        type: "number",
        value: goal?.target ?? 1000,
        min: 1,
        step: 1,
        required: true,
      },
    ],
    onSubmit(values) {
      const nextGoal = normalizeGoal(values, goal);

      if (!nextGoal) {
        return false;
      }

      if (goal) {
        goals = goals.map((item) => (item.id === goal.id ? nextGoal : item));
        persistAndRender("Goal updated");
        return true;
      }

      goals = [...goals, nextGoal];
      persistAndRender("Goal added");
      return true;
    },
  });
}

function openContributionDialog(goal) {
  openFormDialog({
    title: `Contribute to ${goal.name}`,
    submitText: "Contribute",
    fields: [
      {
        name: "amount",
        label: "Amount",
        type: "number",
        min: 1,
        step: 1,
        required: true,
      },
    ],
    onSubmit(values) {
      const amount = Number(values.amount);

      if (!amount || amount <= 0) {
        showToast("Enter a positive amount", "error");
        return false;
      }

      goals = goals.map((item) =>
        item.id === goal.id ? { ...item, current: Math.min(item.current + amount, item.target) } : item,
      );
      persistAndRender("Contribution added");
      return true;
    },
  });
}

function normalizeGoal(values, existingGoal = null) {
  const name = String(values.name ?? "").trim();
  const current = Number(values.current);
  const target = Number(values.target);

  if (!name || Number.isNaN(current) || Number.isNaN(target) || target <= 0 || current < 0) {
    showToast("Fill in valid goal values", "error");
    return null;
  }

  return {
    id: existingGoal?.id ?? generateId("goal"),
    name,
    progressLabel: existingGoal?.progressLabel ?? "Savings Progress",
    current: Math.min(current, target),
    target,
    contributeLabel: "Contribute",
    editLabel: "Edit",
    deleteLabel: "Delete",
  };
}

function renderPageSections() {
  const summary = document.getElementById("goalsSummary");
  const goalsManager = document.getElementById("goalsManager");

  if (summary) {
    summary.innerHTML = renderTransactionsSummary(goalsSummary);
  }

  if (goalsManager) {
    goalsManager.innerHTML = renderGoalsManager(goals);
  }
}

function persistAndRender(message) {
  writeState(STORAGE_KEYS.goals, goals);
  renderPageSections();
  showToast(message);
}
