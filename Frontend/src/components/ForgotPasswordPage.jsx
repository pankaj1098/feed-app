import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { AuthInput } from "./AuthFields";
import { requestPasswordReset } from "../services/authApi";

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Reset your password</h1>
        <p className="auth-subtitle">
          Enter your email and we’ll send you a reset link.
        </p>
        <AuthInput
          label="Email address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-success" role="status">{message}</p>}
        <button className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
        <p className="auth-switch">
          Remembered your password?{" "}
          <button type="button" onClick={onBackToLogin}>Login</button>
        </p>
      </form>
    </AuthLayout>
  );
}
