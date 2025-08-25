import { http, HttpResponse } from "msw";
import { db } from "./db";
import type { Transaction } from "./db";
import { readBearer, verifyAccess } from "../security/jwt";

const normalize = (e: string) => e.trim().toLowerCase();
const toTs = (iso: string) => new Date(iso).getTime();
const byDateAsc = (a: Transaction, b: Transaction) =>
  toTs(a.date) - toTs(b.date);
const byDateDesc = (a: Transaction, b: Transaction) =>
  toTs(b.date) - toTs(a.date);

export const transactionHandlers = [
  http.get("*/transactions", async ({ request }) => {
    try {
      const token = readBearer(request);
      if (!token)
        return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
      const payload = await verifyAccess(token);
      const email = String(payload.sub || "");

      const url = new URL(request.url);
      const userIdStr = url.searchParams.get("userId");
      if (!userIdStr) {
        return HttpResponse.json(
          { message: "userId obrigatório" },
          { status: 400 }
        );
      }

      const userId = Number(userIdStr);
      if (!Number.isFinite(userId)) {
        return HttpResponse.json(
          { message: "userId inválido" },
          { status: 400 }
        );
      }

      const users = await db.getUsers();
      const me = users.find((u) => normalize(u.email) === normalize(email));
      if (!me)
        return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
      if (me.id !== userId)
        return HttpResponse.json({ message: "forbidden" }, { status: 403 });

      const type = url.searchParams.get("type");
      const gte = url.searchParams.get("date_gte") ?? "";
      const order = (url.searchParams.get("_order") ?? "desc").toLowerCase();

      let list = (await db.getTxs()).filter((t) => t.userId === userId);
      if (type) list = list.filter((t) => t.type === type);
      if (gte) list = list.filter((t) => toTs(t.date) >= toTs(gte));

      list.sort(order === "asc" ? byDateAsc : byDateDesc);
      return HttpResponse.json(list, { status: 200 });
    } catch (err) {
      console.error("[MSW] GET /transactions error", err);
      return HttpResponse.json({ message: "server error" }, { status: 500 });
    }
  }),

  http.post("*/transactions", async ({ request }) => {
    try {
      const token = readBearer(request);
      if (!token)
        return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
      const payload = await verifyAccess(token);
      const email = String(payload.sub || "");

      const tx = (await request.json()) as Omit<
        Transaction,
        "id" | "balanceAfter"
      >;
      if (typeof tx.userId !== "number" || !Number.isFinite(tx.userId)) {
        return HttpResponse.json(
          { message: "userId inválido" },
          { status: 400 }
        );
      }
      if (!Number.isFinite(Number(tx.amount))) {
        return HttpResponse.json(
          { message: "amount inválido" },
          { status: 400 }
        );
      }

      const users = await db.getUsers();
      const me = users.find((u) => normalize(u.email) === normalize(email));
      if (!me)
        return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
      if (me.id !== tx.userId)
        return HttpResponse.json({ message: "forbidden" }, { status: 403 });

      let accounts = await db.getAccounts();
      let idx = accounts.findIndex((a) => a.userId === me.id);
      if (idx < 0) {
        const ensured = await db.ensureAccountForUser(me.id);
        accounts = await db.getAccounts();
        idx = accounts.findIndex((a) => a.id === ensured.id);
      }

      const amount = Number(tx.amount);
      const updatedAcc = {
        ...accounts[idx],
        balance: accounts[idx].balance + amount,
      };
      accounts[idx] = updatedAcc;
      await db.saveAccounts(accounts);

      const created = await db.createTx({
        ...tx,
        userId: me.id,
        date: tx.date ?? new Date().toISOString(),
        balanceAfter: updatedAcc.balance,
      });

      return HttpResponse.json(created, { status: 201 });
    } catch (err) {
      console.error("[MSW] POST /transactions error", err);
      return HttpResponse.json({ message: "Bad Request" }, { status: 400 });
    }
  }),
];
