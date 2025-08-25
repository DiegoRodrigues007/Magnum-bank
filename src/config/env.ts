const usingMocks = process.env.VITE_USE_MOCKS === "true";
const isProd = process.env.NODE_ENV === "production";
const raw = process.env.VITE_API_URL?.trim();

function isValidBase(u?: string) {
  return !!u && (/^https?:\/\/[^/]+/i.test(u) || u === "/");
}

const fallback = isProd ? "/" : "http://localhost:3000";

export const API_URL: string =
  usingMocks ? "/" : (isValidBase(raw) ? (raw as string) : fallback);
