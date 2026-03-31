import { buildSidebarItems } from "./data.js";

export const settingsPageContent = {
  title: "Settings",
  saveLabel: "Save Changes",
};

export const settingsSidebarItems = buildSidebarItems("settings");

export const accountSettings = {
  title: "Account Settings",
  nameLabel: "Name",
  nameValue: "Vladislav",
  emailValue: "vladislav@zholudz.com",
  editLabel: "Edit",
  changePasswordLabel: "Change password",
};

export const appearanceSettings = {
  title: "Appearance",
  themeLabel: "Theme",
  options: [
    { id: "light", label: "Light", active: false },
    { id: "dark", label: "Dark", active: true },
  ],
};
