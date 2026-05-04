import { userProfile as defaultUserProfile } from "./data.js";
import {
  accountSettings,
  appearanceSettings,
  settingsPageContent,
  settingsSidebarItems,
} from "./settings-data.js";
import {
  getInitials,
  getSavedUserProfile,
  saveUserProfile,
} from "./app-state.js";
import {
  initSidebarToggle,
  initThemeControls,
  initUserDropdown,
  openFormDialog,
  showToast,
} from "./interactions.js";
import { renderSidebar, renderUserMenu } from "./renderers.js";

let userProfile = getSavedUserProfile({
  ...defaultUserProfile,
  email: accountSettings.emailValue,
});

document.addEventListener("DOMContentLoaded", () => {
  populateSharedShell();
  populatePageCopy();
  populateSettingsFields();
  initSidebarToggle();
  initUserDropdown();
  initThemeControls();
  initSettingsActions();
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
    sidebar.innerHTML = renderSidebar(settingsSidebarItems);
  }
}

function populatePageCopy() {
  const title = document.querySelector("[data-page-title]");
  const saveButtonLabel = document.querySelector("[data-save-label]");

  if (title) {
    title.textContent = settingsPageContent.title;
  }

  if (saveButtonLabel) {
    saveButtonLabel.textContent = settingsPageContent.saveLabel;
  }
}

function populateSettingsFields() {
  const accountTitle = document.querySelector("[data-account-title]");
  const nameLabel = document.querySelector("[data-name-label]");
  const nameInput = document.getElementById("settingsName");
  const email = document.querySelector("[data-email-value]");
  const editLabel = document.querySelector("[data-account-edit-label]");
  const changePassword = document.querySelector("[data-change-password-label]");
  const appearanceTitle = document.querySelector("[data-appearance-title]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const lightOption = document.querySelector("[data-theme-option='light']");
  const darkOption = document.querySelector("[data-theme-option='dark']");

  if (accountTitle) {
    accountTitle.textContent = accountSettings.title;
  }

  if (nameLabel) {
    nameLabel.textContent = accountSettings.nameLabel;
  }

  if (nameInput) {
    nameInput.value = userProfile.name;
  }

  if (email) {
    email.textContent = userProfile.email || accountSettings.emailValue;
  }

  if (editLabel) {
    editLabel.textContent = accountSettings.editLabel;
  }

  if (changePassword) {
    changePassword.textContent = accountSettings.changePasswordLabel;
  }

  if (appearanceTitle) {
    appearanceTitle.textContent = appearanceSettings.title;
  }

  if (themeLabel) {
    themeLabel.textContent = appearanceSettings.themeLabel;
  }

  syncThemeOption(lightOption, appearanceSettings.options.find((option) => option.id === "light"));
  syncThemeOption(darkOption, appearanceSettings.options.find((option) => option.id === "dark"));
}

function initSettingsActions() {
  const nameInput = document.getElementById("settingsName");
  const saveButton = document.querySelector(".save-settings-button");
  const editButton = document.querySelector(".settings-edit-button");
  const changePassword = document.querySelector("[data-change-password-label]");

  editButton?.addEventListener("click", () => {
    nameInput?.focus();
    nameInput?.select();
  });

  saveButton?.addEventListener("click", () => {
    const name = nameInput?.value.trim() || userProfile.name;

    userProfile = {
      ...userProfile,
      name,
      initials: getInitials(name),
    };

    saveUserProfile(userProfile);
    populateSharedShell();
    showToast("Settings saved");
  });

  changePassword?.addEventListener("click", (event) => {
    event.preventDefault();
    openFormDialog({
      title: "Change Password",
      submitText: "Update Password",
      fields: [
        { name: "current", label: "Current Password", type: "password", required: true },
        { name: "next", label: "New Password", type: "password", required: true },
      ],
      onSubmit() {
        showToast("Password updated");
      },
    });
  });
}

function syncThemeOption(element, option) {
  if (!element || !option) {
    return;
  }

  const label = element.querySelector(".theme-toggle__label");

  if (label) {
    label.textContent = option.label;
  }
}
