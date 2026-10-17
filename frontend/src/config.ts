export const IS_DEV = process.env.NODE_ENV === "development";
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (IS_DEV ? "http://127.0.0.1:8000" : "https://idkhowtocodefr-hf-backend.hf.space");
export const WS_BASE =
  process.env.NEXT_PUBLIC_WS_BASE || API_BASE.replace(/^http/, "ws");
