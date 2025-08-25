import { http, HttpResponse } from "msw";
import { db } from "./db";
import type { Transaction } from "./db";

const byDateAsc = (a: Transaction, b: Transaction) =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : 0;

const byDateDesc = (a: Transaction, b: Transaction) => -byDateAsc(a, b);

export const transactionHandlers = [
  http.get("*/transactions", async ({ request }) => {
    const url = new URL(request.url);
    const userIdStr = url.searchParams.get("userId");
    if (!userIdStr) {
      return HttpResponse.json({ message: "userId obrigatório" }, { status: 400 });
    }
    const userId = Number(userIdStr);
    const type = url.searchParams.get("type");
    const gte = url.searchParams.get("date_gte") ?? "";
    const order = (url.searchParams.get("_order") ?? "desc").toLowerCase();

    let list = db.getTxs().filter(t => t.userId === userId);
    if (type) list = list.filter(t => t.type === type);
    if (gte) list = list.filter(t => t.date >= gte);

    list.sort(order === "asc" ? byDateAsc : byDateDesc);
    return HttpResponse.json(list, { status: 200 });
  }),

  http.post("*/transactions", async ({ request }) => {
    const tx = (await request.json()) as Omit<Transaction, "id">;
    const created = db.createTx(tx);
    return HttpResponse.json(created, { status: 201 });
  }),
];
