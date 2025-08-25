const usingMocks = process.env.VITE_USE_MOCKS === "true";
const isProd = process.env.NODE_ENV === "production";

const fallback = isProd ? "/" : "http://localhost:3000";

export const API_URL: string = usingMocks
  ? "/"
  : ((globalThis as any).__API_URL__ ?? process.env.VITE_API_URL ?? fallback);
