const isDev = process.env.NODE_ENV === "development";
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (isDev ? "http://127.0.0.1:8000" : "https://idkhowtocodefr-hf-backend.hf.space");
