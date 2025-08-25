import { http, HttpResponse } from "msw";
import { db } from "./db";
import { readBearer, verifyAccess } from "../security/jwt"; 

const normalize = (e: string) => e.trim().toLowerCase();

export const accountHandlers = [
  http.get("*/account/me", async ({ request }) => {
    try {
      const token = readBearer(request);
      if (!token) return HttpResponse.json({ message: "unauthorized" }, { status: 401 });

      const payload = await verifyAccess(token);
      const email = String(payload.sub || "");

      const users = await db.getUsers();
      const user = users.find((u) => normalize(u.email) === normalize(email));
      if (!user) return HttpResponse.json({ message: "unauthorized" }, { status: 401 });

      const acc = await db.ensureAccountForUser(user.id);
      return HttpResponse.json(acc, { status: 200 });
    } catch (err) {
      console.error("[MSW] GET /account/me error", err);
      return HttpResponse.json({ message: "server error" }, { status: 500 });
    }
  }),

  http.get("*/accounts", async ({ request }) => {
    try {
      const token = readBearer(request);
      if (!token) return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
      const payload = await verifyAccess(token);
      const email = String(payload.sub || "");

      const url = new URL(request.url);
      const userIdStr = url.searchParams.get("userId");
      if (!userIdStr) return HttpResponse.json({ message: "userId obrigatório" }, { status: 400 });
      const userId = Number(userIdStr);
      if (!Number.isFinite(userId)) return HttpResponse.json({ message: "userId inválido" }, { status: 400 });

      const users = await db.getUsers();
      const me = users.find((u) => normalize(u.email) === normalize(email));
      if (!me) return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
      if (me.id !== userId) return HttpResponse.json({ message: "forbidden" }, { status: 403 });

      const list = (await db.getAccounts()).filter((a) => a.userId === userId);
      return HttpResponse.json(list, { status: 200 });
    } catch (err) {
      console.error("[MSW] GET /accounts error", err);
      return HttpResponse.json({ message: "server error" }, { status: 500 });
    }
  }),

  http.patch("*/accounts/:id", async ({ params, request }) => {
    try {
      const token = readBearer(request);
      if (!token) return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
      const payload = await verifyAccess(token);
      const email = String(payload.sub || "");

      const id = Number(params.id);
      if (!Number.isFinite(id)) return HttpResponse.json({ message: "id inválido" }, { status: 400 });

      const patch = (await request.json()) as Partial<{ agency: string; number: string; balance: number }>;

      const users = await db.getUsers();
      const me = users.find((u) => normalize(u.email) === normalize(email));
      if (!me) return HttpResponse.json({ message: "unauthorized" }, { status: 401 });

      const list = await db.getAccounts();
      const idx = list.findIndex((a) => a.id === id);
      if (idx < 0) return HttpResponse.json({ message: "Conta não encontrada" }, { status: 404 });

      if (list[idx].userId !== me.id) return HttpResponse.json({ message: "forbidden" }, { status: 403 });

      const updated = {
        ...list[idx],
        ...(patch.agency !== undefined ? { agency: String(patch.agency) } : {}),
        ...(patch.number !== undefined ? { number: String(patch.number) } : {}),
        ...(Number.isFinite(patch.balance) ? { balance: Number(patch.balance) } : {}),
      };
      list[idx] = updated;
      await db.saveAccounts(list);

      return HttpResponse.json(updated, { status: 200 });
    } catch (err) {
      console.error("[MSW] PATCH /accounts/:id error", err);
      return HttpResponse.json({ message: "server error" }, { status: 500 });
    }
  }),
];
