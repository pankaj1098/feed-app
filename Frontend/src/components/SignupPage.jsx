import { useState } from "react";
import AuthLayout from "./AuthLayout";
import { AuthInput, SocialButtons } from "./AuthFields";
import { CameraLogo } from "./Icons";
import { registerUser, googleLogin } from "../services/authApi";

export default function SignupPage({ onLogin, onSignup }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await registerUser({
        userName: form.name,
        email: form.email,
        password: form.password,
      });
      onSignup();
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
      onSignup();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <AuthLayout signup>
      <form className="auth-form signup-form" onSubmit={submit}>
        <h1>
          Create your account <span>👋</span>
        </h1>
        <p className="auth-subtitle">
          Join Feedly and start sharing your moments
        </p>
        <AuthInput
          label="Full Name"
          placeholder="Enter your full name"
          value={form.name}
          onChange={set("name")}
        />
        <AuthInput
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={form.email}
          onChange={set("email")}
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="Create a password"
          helper="Password must be at least 8 characters long"
          value={form.password}
          onChange={set("password")}
        />
        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={form.confirm}
          onChange={set("confirm")}
        />
        {/* <div className="avatar-upload">
          <CameraLogo />
          <button type="button">Click to upload</button>
          <span>JPG, PNG or WebP (Max 2MB)</span>
        </div> */}
        <label className="terms">
          <input type="checkbox" required />{" "}
          <span>
            I agree to the <a href="#terms">Terms of Service</a> and{" "}
            <a href="#privacy">Privacy Policy</a>
          </span>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Sign Up"}
        </button>
        <SocialButtons
          onGoogleSuccess={handleGoogleSuccess}
          onGoogleError={setError}
        />
        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" onClick={onLogin}>
            Login
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
