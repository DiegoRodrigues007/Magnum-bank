/** @jest-environment node */

import "./setup";
import { jget, jpost, jpatch } from "./http";

describe("Account handlers", () => {
  test("/account/me requer sessão e retorna conta", async () => {
    await jpost("/auth/login", { email: "diego@teste.com", password: "123456" });
    const me = await jget("/account/me");
    expect(me.res.status).toBe(200);
    expect(me.data).toHaveProperty("userId");
    expect(me.data.balance).toBeGreaterThan(0);
  });

  test("/accounts?userId= retorna contas do usuário", async () => {
    const login = await jpost("/auth/login", { email: "diego@teste.com", password: "123456" });
    const userId = login.data.user.id;

    const r = await jget(`/accounts?userId=${userId}`);
    expect(r.res.status).toBe(200);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data[0]).toMatchObject({
      userId,
      agency: expect.any(String),
      number: expect.any(String),
    });
  });

  test("GET /accounts sem userId dá 400", async () => {
    const { res, data } = await jget("/accounts");
    expect(res.status).toBe(400);
    expect(data).toMatchObject({ message: "userId obrigatório" });
  });

  test("PATCH /accounts/:id atualiza parcialmente e 404 para id inexistente", async () => {
    await jpost("/auth/login", { email: "diego@teste.com", password: "123456" });
    const accs = await jget("/accounts?userId=1"); // seed
    const accId = accs.data[0].id;

    const ok = await jpatch(`/accounts/${accId}`, { agency: "0002" });
    expect(ok.res.status).toBe(200);
    expect(ok.data).toHaveProperty("id", accId);
    expect(ok.data).toHaveProperty("agency", "0002");

    const nf = await jpatch(`/accounts/999999`, { agency: "9999" });
    expect(nf.res.status).toBe(404);
    expect(nf.data).toMatchObject({ message: "Conta não encontrada" });
  });
});
