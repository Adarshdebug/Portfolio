const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001/api";
export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || "http://127.0.0.1:5001";

export const assetUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${UPLOAD_URL}${url}`;
};

export const request = async (path, options = {}) => {
  const token = localStorage.getItem("portfolio_token");
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};
