/** @jest-environment node */

import "./setup";
import { jget, jpost } from "./http";
import { resetTokens } from "./http";

describe("Transaction handlers (JWT)", () => {
  test("GET filtra, ordena e POST cria; POST sem token deve falhar", async () => {
    const login = await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "123456" },
      { noAuth: true }
    );
    const userId = login.data.user.id as number;

    const tx = (over: Partial<any>) => ({
      userId,
      type: "PIX",
      beneficiary: "X",
      document: "000",
      amount: 0,
      date: "2025-08-20",
      ...over,
    });

    await jpost(
      "/transactions",
      tx({ type: "PIX", amount: 10, date: "2025-08-20" })
    );
    await jpost(
      "/transactions",
      tx({ type: "PIX", amount: -5, date: "2025-08-22" })
    );
    await jpost(
      "/transactions",
      tx({ type: "TED", amount: 2, date: "2025-08-21" })
    );

    const list1 = await jget(`/transactions?userId=${userId}`);
    expect(list1.res.status).toBe(200);
    expect(list1.data.length).toBeGreaterThanOrEqual(3);
    const top3Dates = list1.data.slice(0, 3).map((t: any) => t.date);
    expect(top3Dates).toEqual(["2025-08-22", "2025-08-21", "2025-08-20"]);

    const listPix = await jget(`/transactions?userId=${userId}&type=PIX`);
    expect(listPix.res.status).toBe(200);
    expect(listPix.data.every((t: any) => t.type === "PIX")).toBe(true);

    const listGte = await jget(
      `/transactions?userId=${userId}&date_gte=2025-08-21`
    );
    expect(listGte.res.status).toBe(200);
    expect(
      listGte.data.every((t: any) => new Date(t.date) >= new Date("2025-08-21"))
    ).toBe(true);

    const listAsc = await jget(`/transactions?userId=${userId}&_order=asc`);
    expect(listAsc.res.status).toBe(200);
    const ascDates = listAsc.data.map((t: any) => t.date);
    const i20 = ascDates.indexOf("2025-08-20");
    const i21 = ascDates.indexOf("2025-08-21");
    const i22 = ascDates.indexOf("2025-08-22");
    expect(i20).toBeLessThan(i21);
    expect(i21).toBeLessThan(i22);

    await jpost("/auth/logout", {});
    resetTokens();
    const r1 = await jpost(
      "/transactions",
      tx({ amount: 1, date: "2025-08-24" }),
      { noAuth: true }
    );
    expect(r1.res.status).toBe(401);
  });
});
