import { userProfile } from "./data.js";
import {
  accountSettings,
  appearanceSettings,
  settingsPageContent,
  settingsSidebarItems,
} from "./settings-data.js";
import { initSidebarToggle, initUserDropdown } from "./interactions.js";
import { renderSidebar, renderUserMenu } from "./renderers.js";

document.addEventListener("DOMContentLoaded", () => {
  populateSharedShell();
  populatePageCopy();
  populateSettingsFields();
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
    nameInput.value = accountSettings.nameValue;
  }

  if (email) {
    email.textContent = accountSettings.emailValue;
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

function syncThemeOption(element, option) {
  if (!element || !option) {
    return;
  }

  const label = element.querySelector(".theme-toggle__label");

  if (label) {
    label.textContent = option.label;
  }

  element.classList.toggle("is-active", option.active);
}
