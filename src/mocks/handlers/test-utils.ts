// src/mocks/handlers/test-utils.ts
import { http, HttpResponse } from "msw";
import { db } from "./db";

export const testUtilsHandlers = [
  http.post("*/__test/reset", async () => {
    try { localStorage.clear(); } catch {}

    const user = db.upsertUser({
      name: "Diego",
      email: "diego@teste.com",
      password: "123456",
    });
    db.ensureAccountForUser((await user).id);

    return HttpResponse.json({ ok: true }, { status: 200 });
  }),
];
