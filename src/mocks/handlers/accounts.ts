import { http, HttpResponse } from "msw";
import { db } from "./db";

export const accountHandlers = [
  http.get("*/account/me", async () => {
    const email = db.getSessionEmail();
    if (!email) {
      return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
    }
    const user = db.getUsers().find(u => u.email === email);
    if (!user) {
      return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
    }
    const acc = db.ensureAccountForUser(user.id);
    return HttpResponse.json(acc, { status: 200 });
  }),

  http.get("*/accounts", async ({ request }) => {
    const url = new URL(request.url);
    const userIdStr = url.searchParams.get("userId");
    if (!userIdStr) {
      return HttpResponse.json({ message: "userId obrigatório" }, { status: 400 });
    }
    const userId = Number(userIdStr);
    const list = db.getAccounts().filter(a => a.userId === userId);
    return HttpResponse.json(list, { status: 200 });
  }),

  http.patch("*/accounts/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const patch = await request.json() as Partial<{ agency: string; number: string; balance: number }>;

    const list = db.getAccounts();
    const idx = list.findIndex(a => a.id === id);
    if (idx < 0) {
      return HttpResponse.json({ message: "Conta não encontrada" }, { status: 404 });
    }
    const updated = { ...list[idx], ...patch };
    list[idx] = updated;
    db.saveAccounts(list);
    return HttpResponse.json(updated, { status: 200 });
  }),
];
