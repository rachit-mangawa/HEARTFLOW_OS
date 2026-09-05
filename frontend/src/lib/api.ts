import { API_BASE } from "@/config";

export interface ApiFetchOptions extends RequestInit {
  onSlow?: (isSlow: boolean) => void;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const { onSlow, ...fetchOptions } = options;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  let isSlow = false;
  const slowTimer = setTimeout(() => {
    isSlow = true;
    onSlow?.(true);
  }, 5000);

  try {
    const res = await fetch(url, fetchOptions);
    clearTimeout(slowTimer);
    if (isSlow) onSlow?.(false);

    if (!res.ok) {
      let detail = "";
      try {
        const errJson = await res.json();
        detail = errJson.detail || errJson.error || errJson.message || "";
        if (typeof detail === "object") detail = JSON.stringify(detail);
      } catch {
        // non-json response
      }
      return {
        data: null,
        error: `Server error (HTTP ${res.status}): ${detail || res.statusText || "Request failed"}`,
        status: res.status,
      };
    }

    const data = (await res.json()) as T;
    return { data, error: null, status: res.status };
  } catch (err: unknown) {
    clearTimeout(slowTimer);
    if (isSlow) onSlow?.(false);
    const msg = err instanceof Error ? err.message : String(err);
    const isCorsOrNet =
      msg.toLowerCase().includes("failed to fetch") ||
      msg.toLowerCase().includes("networkerror") ||
      msg.toLowerCase().includes("load failed");
    return {
      data: null,
      error: isCorsOrNet
        ? "Network or CORS error connecting to server"
        : `Network error: ${msg}`,
      status: 0,
    };
  }
}
