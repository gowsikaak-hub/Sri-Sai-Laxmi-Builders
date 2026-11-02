const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}
export function mediaUrl(url) {
  if (!url || !url.startsWith("/")) return url;
  return `${new URL(API).origin}${url}`;
}
