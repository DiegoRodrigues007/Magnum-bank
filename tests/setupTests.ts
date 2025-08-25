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

if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }

  if (!window.scrollTo) {
    window.scrollTo = () => {};
  }
}

declare global {
  var __API_URL__: string | undefined;
}
(globalThis as any).__API_URL__ =
  (globalThis as any).__API_URL__ || "http://test.local";
