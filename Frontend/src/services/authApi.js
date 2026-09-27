const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export async function registerUser({ userName, email, password }) {
  const { token, user } = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, email, password }),
  });
  localStorage.setItem("token", token);
  return user;
}

export async function loginUser({ email, password }) {
  const { token, user } = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", token);
  return user;
}

export async function requestPasswordReset(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword({ token, password }) {
  const { token: authToken, user } = await request("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  localStorage.setItem("token", authToken);
  return user;
}

export async function googleLogin(credential) {
  const { token, user } = await request("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  localStorage.setItem("token", token);
  return user;
}

export async function logoutUser() {
  try {
    await request("/api/auth/logout", { method: "POST" });
  } finally {
    localStorage.removeItem("token");
  }
}
