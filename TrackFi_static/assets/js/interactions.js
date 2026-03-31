const MOBILE_BREAKPOINT = 768;

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

export function initTransactionModal() {
  const modal = document.getElementById("transactionModal");
  const openButton = document.getElementById("openTransactionModal");

  if (!modal || !openButton) {
    return;
  }

  const form = document.getElementById("transactionModalForm");
  const typeControl = document.getElementById("transactionType");
  const typeWrapper = modal.querySelector("[data-transaction-type-wrap]");
  const closeButtons = modal.querySelectorAll("[data-transaction-modal-close]");
  const firstField = typeControl ?? modal.querySelector("input, select, textarea, button");

  let lastFocusedElement = null;

  const closeModal = () => {
    if (modal.hidden) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove("modal-open");
    openButton.setAttribute("aria-expanded", "false");
    form?.reset();
    syncTransactionTypeTone(typeControl, typeWrapper);

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

  syncTransactionTypeTone(typeControl, typeWrapper);

  openButton.addEventListener("click", openModal);

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  typeControl?.addEventListener("change", () => {
    syncTransactionTypeTone(typeControl, typeWrapper);
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}
