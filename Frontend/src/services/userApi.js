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

export async function getProfile() {
  const { user } = await request("/api/users/me");
  return user;
}

export async function updateProfile(fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value);
  });
  const { user } = await request("/api/users/me", {
    method: "PATCH",
    body: formData,
  });
  return user;
}
