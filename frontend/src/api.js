const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API = configuredApiUrl?.replace(/\/+$/, "") || "";

export async function request(path, options = {}) {
  if (!API) {
    throw new Error("VITE_API_URL is not configured. Set it to the deployed backend URL ending in /api.");
  }
  const isFormData = options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      credentials: "include",
      headers: { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) }
    });
  } catch {
    throw new Error("Unable to reach the backend. Check VITE_API_URL and that the backend is running.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
export function mediaUrl(url) {
  if (!url || !url.startsWith("/")) return url;
  return `${new URL(API || window.location.origin, window.location.origin).origin}${url}`;
}
