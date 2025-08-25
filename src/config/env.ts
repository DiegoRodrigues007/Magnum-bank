export const API_URL: string =
  (globalThis as any).__API_URL__ ??
  process.env.VITE_API_URL ??
  "http://localhost:3000";
