import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { AuthInput, SocialButtons } from "./AuthFields";
import { loginUser, googleLogin } from "../services/authApi";

export default function LoginPage({ onSignup, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await loginUser({ email, password });
      onLogin();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credential) {
    setError("");
    try {
      await googleLogin(credential);
      onLogin();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>
          Welcome back <span>👋</span>
        </h1>
        <p className="auth-subtitle">Login to continue to Feedly</p>
        <AuthInput
          label="Email address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="button" className="forgot-link">
          Forgot password?
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Login"}
        </button>
        <SocialButtons
          onGoogleSuccess={handleGoogleSuccess}
          onGoogleError={setError}
        />
        <p className="auth-switch">
          Don’t have an account?{" "}
          <button type="button" onClick={onSignup}>
            Sign up
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
