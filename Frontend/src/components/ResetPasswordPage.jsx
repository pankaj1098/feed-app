import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { AuthInput } from "./AuthFields";
import { resetPassword } from "../services/authApi";

export default function ResetPasswordPage({ onReset }) {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = searchParams.get("token");

  async function submit(event) {
    event.preventDefault();
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await resetPassword({ token, password });
      onReset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Create a new password</h1>
        <p className="auth-subtitle">Choose a password with at least 8 characters.</p>
        <AuthInput
          label="New password"
          type="password"
          placeholder="Enter a new password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <AuthInput
          label="Confirm new password"
          type="password"
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthLayout>
  );
}
