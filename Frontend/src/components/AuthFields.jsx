import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Icon } from "./Icons";

export function AuthInput({
  label,
  type = "text",
  placeholder,
  helper,
  value,
  onChange,
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="auth-input">
        <Icon
          name={
            isPassword ? "lock" : label === "Full Name" ? "profile" : "mail"
          }
        />
        <input
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((show) => !show)}
            aria-label="Show password"
          >
            <Icon name="eye" />
          </button>
        )}
      </div>
      {helper && <small>{helper}</small>}
    </label>
  );
}

export function SocialButtons({ onGoogleSuccess, onGoogleError }) {
  // Without a client ID the Google button cannot load (e.g. the env var is
  // missing in a deployment), so hide it instead of showing a broken button.
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    if (import.meta.env.DEV) console.warn("VITE_GOOGLE_CLIENT_ID is not set");
    return null;
  }

  return (
    <>
      <div className="auth-divider">
        <span />
        or
        <span />
      </div>
      <FullWidthGoogleLogin
        onSuccess={(credentialResponse) =>
          onGoogleSuccess?.(credentialResponse.credential)
        }
        onError={() => onGoogleError?.("Google sign-in failed")}
      />
    </>
  );
}

// Google's button only accepts a pixel width (max 400), so measure the
// container and pass that in to make it span the full form width.
function FullWidthGoogleLogin(props) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.floor(el.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {width > 0 && (
        <GoogleLogin
          {...props}
          width={Math.min(width, 400)}
          key={Math.min(width, 400)}
        />
      )}
    </div>
  );
}
