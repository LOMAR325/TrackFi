import { Link, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { useAppState } from "../app/useAppState";
import { BrandIcon, Icon } from "../components/icons/Icon";
import { Button } from "../components/ui";
import { getValidationMessage, loginSchema } from "../validation";

function LoginPage() {
  const { setUserEmail } = useAppState();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const passwordIsShort = password.length > 0 && password.length < 4;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsedLogin = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsedLogin.success) {
      window.alert(getValidationMessage(parsedLogin.error));
      return;
    }

    setUserEmail(parsedLogin.data.email);
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="login-page">
      <header className="app-header login-page__header">
        <Link className="brand" to="/" aria-label="TrackFi home">
          <span className="brand__icon" aria-hidden="true">
            <BrandIcon />
          </span>
          <span className="brand__label">TrackFi</span>
        </Link>
      </header>

      <main className="login-page__main">
        <section className="login-card" aria-labelledby="loginTitle">
          <div className="login-card__intro">
            <h1 className="login-card__title" id="loginTitle">
              Welcome back
            </h1>
            <p className="login-card__subtitle">Log in to manage your finances</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field" htmlFor="loginEmail">
              <span className="login-field__label">Email</span>
              <span className={`login-field__control ${passwordIsShort ? "is-invalid" : ""}`}>
                <span className="login-field__icon login-field__icon--mail" aria-hidden="true">
                  <Icon name="mail" />
                </span>
                <input
                  autoComplete="email"
                  className="login-field__input"
                  id="loginEmail"
                  name="email"
                  placeholder="Email address"
                  required
                  type="email"
                />
              </span>
            </label>
            <label className="login-field" htmlFor="loginPassword">
              <span className="login-field__label">Password</span>
              <span className="login-field__control">
                <span className="login-field__icon login-field__icon--password" aria-hidden="true">
                  <Icon name="lock" />
                </span>
                <input
                  autoComplete="current-password"
                  className="login-field__input"
                  id="loginPassword"
                  minLength={4}
                  name="password"
                  placeholder="Password"
                  required
                  type="password"
                  value={password}
                  aria-invalid={passwordIsShort}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </span>
            </label>
            <Button className="login-submit" type="submit">
              Log in
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
