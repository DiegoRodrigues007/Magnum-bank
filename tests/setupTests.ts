try {
  if (typeof window !== "undefined") {
    require("@testing-library/jest-dom");
  }
} catch {}

process.env.TZ = process.env.TZ || "UTC";

import { TextEncoder, TextDecoder as NodeTextDecoder } from "util";

if (typeof (globalThis as any).TextEncoder === "undefined") {
  (globalThis as any).TextEncoder = TextEncoder;
}
if (typeof (globalThis as any).TextDecoder === "undefined") {
  (globalThis as any).TextDecoder =
    NodeTextDecoder as unknown as typeof globalThis.TextDecoder;
}

try {
  if (!(globalThis as any).crypto) {
    (globalThis as any).crypto = require("crypto").webcrypto;
  }
} catch {}

if (typeof (globalThis as any).atob === "undefined") {
  (globalThis as any).atob = (str: string) =>
    Buffer.from(str, "base64").toString("binary");
}
if (typeof (globalThis as any).btoa === "undefined") {
  (globalThis as any).btoa = (str: string) =>
    Buffer.from(str, "binary").toString("base64");
}

if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }
  if (!window.scrollTo) {
    window.scrollTo = () => {};
  }
}

declare global {
  var __API_URL__: string | undefined;
}

const TEST_BASE = "http://test.local";
(globalThis as any).__API_URL__ = (globalThis as any).__API_URL__ || TEST_BASE;
process.env.VITE_API_URL = process.env.VITE_API_URL || TEST_BASE;
process.env.API_URL = process.env.API_URL || TEST_BASE;

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {}
  jest.clearAllMocks();
});
