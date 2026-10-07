import { useState } from "react";
import "./AuthPage.css";

function AuthPage({ error, isSubmitting, mode, onModeChange, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignUp = mode === "signup";

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...(isSignUp ? { name } : {}), email, password });
  }

  return (
    <main className="auth-page">
      <a
        className="auth-brand"
        href="#home"
        onClick={(event) => {
          event.preventDefault();
          onModeChange("home");
        }}
      >
        <span className="auth-mark">C</span>
        <span>
          chronos<span>.</span>
        </span>
      </a>

      <section className="auth-panel" aria-labelledby="auth-heading">
        <div className="auth-intro">
          <p className="auth-kicker">A CLEARER WAY TO GET THERE</p>
          <h1 id="auth-heading">{isSignUp ? "Start with a plan." : "Welcome back."}</h1>
          <p>{isSignUp ? "Create your account and make your next deadline feel manageable." : "Sign in to pick up where your focus left off."}</p>
        </div>

        <div className="auth-switch" role="tablist" aria-label="Account access">
          <button aria-selected={!isSignUp} className={!isSignUp ? "selected" : ""} onClick={() => onModeChange("login")} role="tab" type="button">
            Log in
          </button>
          <button aria-selected={isSignUp} className={isSignUp ? "selected" : ""} onClick={() => onModeChange("signup")} role="tab" type="button">
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp ? (
            <label className="auth-field">
              <span>Your name</span>
              <input
                autoComplete="name"
                maxLength="100"
                onChange={(event) => setName(event.target.value)}
                placeholder="Jamie Rivera"
                required
                value={name}
              />
            </label>
          ) : null}
          <label className="auth-field">
            <span>Email address</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength="8"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Please wait..." : isSignUp ? "Create account" : "Log in"}
            {!isSubmitting ? <span aria-hidden="true">→</span> : null}
          </button>
        </form>
        <p className="auth-privacy">Your account keeps your plans ready when you return.</p>
      </section>

      <button className="auth-back" onClick={() => onModeChange("home")} type="button">
        ← Back to home
      </button>
    </main>
  );
}

export default AuthPage;
