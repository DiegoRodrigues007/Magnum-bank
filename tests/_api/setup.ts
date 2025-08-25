if (typeof (globalThis as any).Response === "undefined") {
  const { fetch, Headers, Request, Response, FormData, File } = require("undici");
  Object.assign(globalThis, { fetch, Headers, Request, Response, FormData, File });
}

function makeStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear() {
      m.clear();
    },
    getItem(key: string) {
      return m.has(key) ? m.get(key)! : null;
    },
    key(index: number) {
      return Array.from(m.keys())[index] ?? null;
    },
    removeItem(key: string) {
      m.delete(key);
    },
    setItem(key: string, value: string) {
      m.set(key, String(value));
    },
  } as unknown as Storage;
}

if (typeof (globalThis as any).localStorage === "undefined") {
  (globalThis as any).localStorage = makeStorage();
}
if (typeof (globalThis as any).sessionStorage === "undefined") {
  (globalThis as any).sessionStorage = makeStorage();
}

import { setupServer } from "msw/node";

const handlersModule = require("../../src/mocks/handlers");
const handlers =
  handlersModule.handlers ??
  (handlersModule.default && handlersModule.default.handlers) ??
  handlersModule.default ??
  [];

if (!Array.isArray(handlers) || handlers.length === 0) {
  console.error(
    "[tests/_api/setup] Nenhum handler carregado de src/mocks/handlers. " +
      "Verifique o export do arquivo index.ts (export const handlers = [...])."
  );
}

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" }); 
});

function reseedDb() {
  try {
    const dbMod = require("../../src/mocks/handlers/db");
    if (dbMod && typeof dbMod.ensureSeed === "function") {
      dbMod.ensureSeed();
    }
  } catch (e) {
    console.error("[tests/_api/setup] Falha ao reseedar o DB:", e);
  }
}

afterEach(() => {
  server.resetHandlers(); 
  localStorage.clear();
  sessionStorage.clear();
  reseedDb();             
});

afterAll(() => {
  server.close();
});
