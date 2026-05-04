import {
  STORAGE_KEYS,
  formatDisplayDate,
  parseDate,
  toIsoDate,
  readState,
  writeState,
} from "./app-state.js";

const MOBILE_BREAKPOINT = 768;
const DEFAULT_THEME = "dark";
const THEME_VALUES = new Set(["light", "dark"]);

let activePopover = null;
let toastTimer = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return map[character];
  });
}

function getStoredTheme() {
  const storedTheme = readState(STORAGE_KEYS.theme, DEFAULT_THEME);
  return THEME_VALUES.has(storedTheme) ? storedTheme : DEFAULT_THEME;
}

export function applyTheme(theme = getStoredTheme()) {
  const nextTheme = THEME_VALUES.has(theme) ? theme : DEFAULT_THEME;

  document.documentElement.dataset.theme = nextTheme;
  writeState(STORAGE_KEYS.theme, nextTheme);
  syncThemeButtons(nextTheme);
  document.dispatchEvent(new CustomEvent("trackfi:themechange", { detail: { theme: nextTheme } }));

  return nextTheme;
}

export function initTheme() {
  return applyTheme(getStoredTheme());
}

export function initThemeControls() {
  const buttons = document.querySelectorAll("[data-theme-option]");

  if (!buttons.length) {
    return;
  }

  syncThemeButtons(getStoredTheme());

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.themeOption);
    });
  });
}

function syncThemeButtons(theme) {
  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    const isActive = button.dataset.themeOption === theme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function syncTransactionTypeTone(control, wrapper) {
  if (!control || !wrapper) {
    return;
  }

  wrapper.dataset.tone = control.value === "income" ? "income" : "expense";
}

export function initSidebarToggle() {
  const toggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");

  if (!toggle || !sidebar || !backdrop) {
    return;
  }

  const syncToggleState = () => {
    toggle.setAttribute(
      "aria-expanded",
      document.body.classList.contains("sidebar-open") ? "true" : "false",
    );
  };

  const closeSidebar = () => {
    document.body.classList.remove("sidebar-open");
    syncToggleState();
  };

  toggle.addEventListener("click", () => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      return;
    }

    document.body.classList.toggle("sidebar-open");
    syncToggleState();
  });

  backdrop.addEventListener("click", closeSidebar);

  sidebar.addEventListener("click", (event) => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      return;
    }

    if (event.target.closest(".sidebar__item")) {
      closeSidebar();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      closeSidebar();
    }
    closeActivePopover();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });
}

export function initUserDropdown() {
  const root = document.getElementById("userDropdown");
  const trigger = document.getElementById("userDropdownTrigger");
  const menu = document.getElementById("userDropdownMenu");

  if (!root || !trigger || !menu) {
    return;
  }

  const openDropdown = () => {
    root.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  };

  const closeDropdown = () => {
    root.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();

    if (root.classList.contains("is-open")) {
      closeDropdown();
      return;
    }

    openDropdown();
  });

  menu.addEventListener("click", (event) => {
    event.stopPropagation();

    if (event.target.closest(".user-dropdown__menu-item")) {
      closeDropdown();
    }
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdown();
    }
  });
}

export function initTransactionModal(options = {}) {
  const modal = document.getElementById("transactionModal");
  const openButton = document.getElementById("openTransactionModal");

  if (!modal || !openButton) {
    return;
  }

  const form = document.getElementById("transactionModalForm");
  const typeControl = document.getElementById("transactionType");
  const typeWrapper = modal.querySelector("[data-transaction-type-wrap]");
  const closeButtons = modal.querySelectorAll("[data-transaction-modal-close]");
  const dateInput = document.getElementById("transactionDate");
  const firstField = typeControl ?? modal.querySelector("input, select, textarea, button");

  let lastFocusedElement = null;

  const resetForm = () => {
    form?.reset();
    if (dateInput) {
      setTextDateValue(dateInput, options.defaultDate ?? new Date());
    }
    syncTransactionTypeTone(typeControl, typeWrapper);
  };

  const closeModal = () => {
    if (modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("modal-open");
    openButton.setAttribute("aria-expanded", "false");
    resetForm();

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  const openModal = () => {
    lastFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : openButton;

    modal.hidden = false;
    document.body.classList.add("modal-open");
    openButton.setAttribute("aria-expanded", "true");
    syncTransactionTypeTone(typeControl, typeWrapper);

    window.requestAnimationFrame(() => {
      if (firstField && typeof firstField.focus === "function") {
        firstField.focus();
      }
    });
  };

  resetForm();
  initTextDatePicker(dateInput);

  openButton.addEventListener("click", openModal);

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  typeControl?.addEventListener("change", () => {
    syncTransactionTypeTone(typeControl, typeWrapper);
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const amount = String(formData.get("amount") ?? "").trim();
    const numericAmount = Number(amount.replace(/[^0-9.-]/g, ""));

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }

    options.onSubmit?.({
      type: String(formData.get("type") ?? "expense"),
      category: String(formData.get("category") ?? ""),
      date: dateInput?.value ?? "",
      dateIso: dateInput?.dataset.iso ?? toIsoDate(new Date()),
      amount,
      note: String(formData.get("note") ?? "").trim(),
    });

    showToast("Transaction added");
    closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}

export function initTextDatePicker(textInput) {
  if (!textInput) {
    return;
  }

  const wrapper = textInput.closest(".transaction-modal__input-wrap") ?? textInput.parentElement;
  const nativeInput = document.createElement("input");

  nativeInput.className = "native-date-input";
  nativeInput.type = "date";
  nativeInput.value = textInput.dataset.iso || toIsoDate(parseDate(textInput.value));
  nativeInput.setAttribute("aria-label", "Choose date");
  textInput.dataset.iso = nativeInput.value;

  wrapper?.append(nativeInput);

  const openPicker = () => {
    if (typeof nativeInput.showPicker === "function") {
      nativeInput.showPicker();
      return;
    }

    nativeInput.focus();
    nativeInput.click();
  };

  wrapper?.addEventListener("click", (event) => {
    if (event.target === nativeInput) {
      return;
    }
    openPicker();
  });

  textInput.addEventListener("focus", openPicker);

  nativeInput.addEventListener("change", () => {
    setTextDateValue(textInput, nativeInput.value);
  });
}

export function setTextDateValue(textInput, value) {
  const date = parseDate(value);

  textInput.dataset.iso = toIsoDate(date);
  textInput.value = formatDisplayDate(date, true);

  const nativeInput = textInput.parentElement?.querySelector(".native-date-input");
  if (nativeInput) {
    nativeInput.value = textInput.dataset.iso;
  }
}

export function openMenu(anchor, items, options = {}) {
  closeActivePopover();

  const popover = document.createElement("div");
  popover.className = `floating-popover ${options.className ?? ""}`.trim();
  popover.setAttribute("role", "menu");

  items.forEach((item) => {
    const button = document.createElement("button");
    button.className = "floating-popover__item";
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.textContent = item.label;

    if (item.active) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      item.onSelect?.(item);
      closeActivePopover();
    });

    popover.append(button);
  });

  document.body.append(popover);
  positionPopover(anchor, popover);
  activePopover = popover;

  window.requestAnimationFrame(() => {
    popover.classList.add("is-open");
  });

  return popover;
}

export function openCustomPopover(anchor, content, options = {}) {
  closeActivePopover();

  const popover = document.createElement("div");
  popover.className = `floating-popover ${options.className ?? ""}`.trim();
  popover.append(content);
  document.body.append(popover);
  positionPopover(anchor, popover);
  activePopover = popover;

  window.requestAnimationFrame(() => {
    popover.classList.add("is-open");
  });

  return popover;
}

export function closeActivePopover() {
  if (!activePopover) {
    return;
  }

  activePopover.remove();
  activePopover = null;
}

function positionPopover(anchor, popover) {
  const rect = anchor.getBoundingClientRect();
  const popoverWidth = Math.max(rect.width, Number.parseFloat(popover.dataset.minWidth) || 180);
  const left = Math.min(window.innerWidth - popoverWidth - 12, Math.max(12, rect.left));

  popover.style.minWidth = `${popoverWidth}px`;
  popover.style.width = `${popoverWidth}px`;
  popover.style.left = `${left + window.scrollX}px`;
  popover.style.top = `${rect.bottom + window.scrollY + 8}px`;
}

document.addEventListener("click", (event) => {
  if (!activePopover) {
    return;
  }

  if (activePopover.contains(event.target) || event.target.closest(".filter-control")) {
    return;
  }

  closeActivePopover();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeActivePopover();
  }
});

export function openFormDialog(config) {
  const dialog = document.createElement("div");
  dialog.className = "form-dialog";
  dialog.innerHTML = `
    <button class="form-dialog__backdrop" type="button" aria-label="Close dialog"></button>
    <section class="form-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="formDialogTitle">
      <header class="form-dialog__header">
        <h2 class="form-dialog__title" id="formDialogTitle">${escapeHtml(config.title)}</h2>
        <button class="form-dialog__close" type="button" aria-label="Close dialog">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
          </svg>
        </button>
      </header>
      <form class="form-dialog__form">
        ${renderDialogFields(config.fields ?? [])}
        <div class="form-dialog__actions">
          <button class="form-dialog__button form-dialog__button--secondary" type="button" data-dialog-cancel>
            ${escapeHtml(config.cancelText ?? "Cancel")}
          </button>
          <button class="form-dialog__button form-dialog__button--primary" type="submit">
            ${escapeHtml(config.submitText ?? "Save")}
          </button>
        </div>
      </form>
    </section>
  `;

  const closeDialog = () => {
    document.body.classList.remove("modal-open");
    dialog.remove();
  };

  const form = dialog.querySelector(".form-dialog__form");

  dialog.querySelector(".form-dialog__backdrop")?.addEventListener("click", closeDialog);
  dialog.querySelector(".form-dialog__close")?.addEventListener("click", closeDialog);
  dialog.querySelector("[data-dialog-cancel]")?.addEventListener("click", closeDialog);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const shouldClose = config.onSubmit?.(values) !== false;

    if (shouldClose) {
      closeDialog();
    }
  });

  document.body.append(dialog);
  document.body.classList.add("modal-open");
  dialog.querySelector("input, select, textarea, button")?.focus();

  return { close: closeDialog, element: dialog };
}

function renderDialogFields(fields) {
  return fields
    .map((field) => {
      if (field.type === "description") {
        return `<p class="form-dialog__description">${escapeHtml(field.label)}</p>`;
      }

      const commonAttributes = `
        id="${escapeHtml(field.name)}"
        name="${escapeHtml(field.name)}"
        ${field.required ? "required" : ""}
      `;

      if (field.type === "select") {
        return `
          <label class="form-dialog__field" for="${escapeHtml(field.name)}">
            <span class="form-dialog__label">${escapeHtml(field.label)}</span>
            <select class="form-dialog__control" ${commonAttributes}>
              ${(field.options ?? [])
                .map(
                  (option) => `
                    <option value="${escapeHtml(option.value)}" ${
                      String(option.value) === String(field.value ?? "") ? "selected" : ""
                    }>
                      ${escapeHtml(option.label)}
                    </option>
                  `,
                )
                .join("")}
            </select>
          </label>
        `;
      }

      return `
        <label class="form-dialog__field" for="${escapeHtml(field.name)}">
          <span class="form-dialog__label">${escapeHtml(field.label)}</span>
          <input
            class="form-dialog__control"
            ${commonAttributes}
            type="${escapeHtml(field.type ?? "text")}"
            value="${escapeHtml(field.value ?? "")}"
            placeholder="${escapeHtml(field.placeholder ?? "")}"
            ${field.min != null ? `min="${escapeHtml(field.min)}"` : ""}
            ${field.step != null ? `step="${escapeHtml(field.step)}"` : ""}
          >
        </label>
      `;
    })
    .join("");
}

export function openConfirmDialog(config) {
  return openFormDialog({
    title: config.title ?? "Are you sure?",
    submitText: config.confirmText ?? "Delete",
    cancelText: config.cancelText ?? "Cancel",
    fields: [
      {
        name: "message",
        label: config.message ?? "This action cannot be undone.",
        type: "description",
      },
    ],
    onSubmit: () => config.onConfirm?.(),
  });
}

export function showToast(message, tone = "success") {
  let toast = document.querySelector(".app-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "app-toast";
    toast.setAttribute("role", "status");
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

initTheme();
