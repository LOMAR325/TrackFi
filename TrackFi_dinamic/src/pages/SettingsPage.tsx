import { useEffect, useRef, useState } from "react";
import { useAppState } from "../app/useAppState";
import { Icon } from "../components/icons/Icon";
import { Button } from "../components/ui";
import type { Theme } from "../data";
import { getValidationMessage, settingsSchema } from "../validation";

function SettingsPage() {
  const { openModal, setTheme, setUserEmail, setUserName, theme, userEmail, userName } = useAppState();
  const [emailEditing, setEmailEditing] = useState(false);
  const [draftEmail, setDraftEmail] = useState(userEmail);
  const [draftName, setDraftName] = useState(userName);
  const [draftTheme, setDraftTheme] = useState<Theme>(theme);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftName(userName);
  }, [userName]);

  useEffect(() => {
    setDraftEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    setDraftTheme(theme);
  }, [theme]);

  function saveSettings() {
    const parsedSettings = settingsSchema.safeParse({ email: draftEmail, name: draftName, theme: draftTheme });

    if (!parsedSettings.success) {
      window.alert(getValidationMessage(parsedSettings.error));
      const firstIssuePath = parsedSettings.error.issues[0]?.path[0];
      const fieldToFocus = firstIssuePath === "email" ? emailInputRef : nameInputRef;
      fieldToFocus.current?.focus();
      return;
    }

    setEmailEditing(false);
    setUserEmail(parsedSettings.data.email);
    setUserName(parsedSettings.data.name);
    setTheme(parsedSettings.data.theme);
    window.alert("Settings saved");
  }

  function enableEmailEditing() {
    setEmailEditing(true);
    window.setTimeout(() => {
      emailInputRef.current?.focus();
      emailInputRef.current?.select();
    }, 0);
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
              <label className="settings-field settings-field--email" htmlFor="settingsEmail">
                <span className="settings-field__label">Email</span>
                <input
                  className={`settings-field__input ${emailEditing ? "" : "settings-field__input--readonly"}`}
                  id="settingsEmail"
                  readOnly={!emailEditing}
                  ref={emailInputRef}
                  type="email"
                  value={draftEmail}
                  onChange={(event) => setDraftEmail(event.target.value)}
                />
              </label>
              <button
                className="settings-edit-button"
                type="button"
                onClick={enableEmailEditing}
              >
                {emailEditing ? "Editing" : "Edit"}
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
                  className={`theme-toggle__option ${draftTheme === "light" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setDraftTheme("light")}
                >
                  <span className="theme-toggle__icon" aria-hidden="true">
                    <Icon name="sun" />
                  </span>
                  <span className="theme-toggle__label">Light</span>
                </button>
                <button
                  className={`theme-toggle__option ${draftTheme === "dark" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setDraftTheme("dark")}
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
