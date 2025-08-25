/** @jest-environment node */

import "./setup";
import { jget, jpost, jpatch } from "./http";

describe("Account handlers (JWT)", () => {
  test("/account/me requer login e retorna conta", async () => {
    await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "123456" },
      { noAuth: true }
    );

    const me = await jget("/account/me");
    expect(me.res.status).toBe(200);
    expect(me.data).toHaveProperty("userId");
    expect(typeof me.data.balance).toBe("number");
    expect(me.data.balance).toBeGreaterThan(0);
  });

  test("/accounts?userId= retorna contas do usuário", async () => {
    const login = await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "123456" },
      { noAuth: true }
    );
    const userId = login.data.user.id as number;

    const r = await jget(`/accounts?userId=${userId}`);
    expect(r.res.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data[0]).toMatchObject({
      userId,
      agency: expect.any(String),
      number: expect.any(String),
    });
  });

  test("GET /accounts sem userId dá 400 (com token)", async () => {
    await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "123456" },
      { noAuth: true }
    );

    const { res, data } = await jget("/accounts");
    expect(res.status).toBe(400);
    expect(data).toMatchObject({ message: "userId obrigatório" });
  });

  test("PATCH /accounts/:id atualiza parcialmente e 404 para id inexistente", async () => {
    const login = await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "123456" },
      { noAuth: true }
    );
    const userId = login.data.user.id as number;

    const meAcc = await jget("/account/me");
    expect(meAcc.res.status).toBe(200);

    const accs = await jget(`/accounts?userId=${userId}`);
    expect(accs.res.status).toBe(200);
    const accId = accs.data[0].id as number;

    const ok = await jpatch(`/accounts/${accId}`, { agency: "0002" });
    expect(ok.res.status).toBe(200);
    expect(ok.data).toHaveProperty("id", accId);
    expect(ok.data).toHaveProperty("agency", "0002");

    const nf = await jpatch(`/accounts/999999`, { agency: "9999" });
    expect(nf.res.status).toBe(404);
    expect(nf.data).toMatchObject({ message: "Conta não encontrada" });
  });
});
