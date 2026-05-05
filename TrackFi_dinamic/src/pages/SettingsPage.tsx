import { useRef, useState } from "react";
import { useAppState } from "../app/AppContext";
import { Icon } from "../components/icons/Icon";
import { Button } from "../components/ui";
import { getValidationMessage, settingsSchema } from "../validation";

function SettingsPage() {
  const { openModal, setTheme, setUserName, theme, userEmail, userName } = useAppState();
  const [draftName, setDraftName] = useState(userName);
  const nameInputRef = useRef<HTMLInputElement>(null);

  function saveSettings() {
    const parsedSettings = settingsSchema.safeParse({ name: draftName });

    if (!parsedSettings.success) {
      window.alert(getValidationMessage(parsedSettings.error));
      nameInputRef.current?.focus();
      return;
    }

    setUserName(parsedSettings.data.name);
    window.alert("Settings saved");
  }

  return (
    <main className="settings-page">
      <section className="settings-page__hero" aria-labelledby="settingsPageTitle">
        <h1 className="settings-page__title" id="settingsPageTitle">
          Settings
        </h1>
      </section>

      <section className="settings-layout" aria-label="Settings panels">
        <article className="settings-card account-settings-card">
          <div className="settings-card__header">
            <h2 className="settings-card__title">Account Settings</h2>
          </div>
          <div className="account-settings-card__body">
            <div className="account-settings-card__row">
              <label className="settings-field" htmlFor="settingsName">
                <span className="settings-field__label">Name</span>
                <input
                  className="settings-field__input"
                  id="settingsName"
                  ref={nameInputRef}
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                />
              </label>
              <p className="settings-field__email">{userEmail}</p>
              <button
                className="settings-edit-button"
                type="button"
                onClick={() => {
                  nameInputRef.current?.focus();
                  nameInputRef.current?.select();
                }}
              >
                Edit
              </button>
            </div>
            <button className="settings-link" type="button" onClick={() => openModal("password")}>
              Change password
            </button>
          </div>
        </article>

        <article className="settings-card appearance-card">
          <div className="settings-card__header">
            <h2 className="settings-card__title">Appearance</h2>
          </div>
          <div className="appearance-card__body">
            <div className="appearance-card__group">
              <p className="appearance-card__label">Theme</p>
              <div className="theme-toggle" role="group" aria-label="Theme">
                <button
                  className={`theme-toggle__option ${theme === "light" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setTheme("light")}
                >
                  <span className="theme-toggle__icon" aria-hidden="true">
                    <Icon name="sun" />
                  </span>
                  <span className="theme-toggle__label">Light</span>
                </button>
                <button
                  className={`theme-toggle__option ${theme === "dark" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setTheme("dark")}
                >
                  <span className="theme-toggle__icon" aria-hidden="true">
                    <Icon name="moon" />
                  </span>
                  <span className="theme-toggle__label">Dark</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <div className="settings-actions">
        <Button className="save-settings-button" type="button" onClick={saveSettings}>
          Save Changes
        </Button>
      </div>
    </main>
  );
}

export default SettingsPage;
