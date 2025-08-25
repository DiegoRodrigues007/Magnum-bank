/** @jest-environment node */

import "./setup";
import { jget, jpost } from "./http";

describe("Auth handlers", () => {
  test("register cria usuário, conta e autentica", async () => {
    const { res, data } = await jpost("/auth/register", {
      name: "Novo",
      email: "novo@teste.com",
      password: "123456",
    });
    expect(res.status).toBe(201);
    expect(data).toHaveProperty("accessToken");
    expect(data).toHaveProperty("refreshToken");
    expect(data.user).toMatchObject({ name: "Novo", email: "novo@teste.com" });

    expect(localStorage.getItem("mock_session_email")).toContain("novo@teste.com");

    const contas = JSON.parse(localStorage.getItem("mock_accounts") || "[]");
    expect(Array.isArray(contas)).toBe(true);
    expect(contas.some((a: any) => a.userId === data.user.id)).toBe(true);
  });

  test("register com email existente retorna 409", async () => {
    await jpost("/auth/register", { name: "A", email: "dup@teste.com", password: "123" });
    const { res, data } = await jpost("/auth/register", { name: "B", email: "dup@teste.com", password: "456" });
    expect(res.status).toBe(409);
    expect(data).toMatchObject({ message: "Email já cadastrado" });
  });

  test("login sucesso define sessão e garante conta com saldo", async () => {
    const { res, data } = await jpost("/auth/login", { email: "diego@teste.com", password: "123456" });
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("accessToken");
    expect(data.user.email).toBe("diego@teste.com");
    expect(localStorage.getItem("mock_session_email")).toContain("diego@teste.com");

    const me = await jget("/account/me");
    expect(me.res.status).toBe(200);
    expect(me.data).toHaveProperty("userId", data.user.id);
    expect(me.data.balance).toBeGreaterThan(0);
  });

  test("login falha 401 com credenciais inválidas", async () => {
    const { res, data } = await jpost("/auth/login", { email: "diego@teste.com", password: "errada" });
    expect(res.status).toBe(401);
    expect(data).toMatchObject({ message: "Credenciais inválidas" });
  });

  test("auth/me indica autenticado quando há sessão", async () => {
    await jpost("/auth/login", { email: "diego@teste.com", password: "123456" });
    const { res, data } = await jget("/auth/me");
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("email", "diego@teste.com");
  });

  test("auth/me authenticated:false sem sessão", async () => {
    await jpost("/auth/logout", {});
    const { res, data } = await jget("/auth/me");
    expect(res.status).toBe(200);
    expect(data).toMatchObject({ authenticated: false });
  });

  test("logout limpa sessão", async () => {
    await jpost("/auth/login", { email: "diego@teste.com", password: "123456" });
    const out = await jpost("/auth/logout", {});
    expect(out.res.status).toBe(200);
    expect(out.data).toMatchObject({ ok: true });
    expect(localStorage.getItem("mock_session_email")).toBe("null");
  });

  test("auth/refresh devolve novo accessToken", async () => {
    const { res, data } = await jpost("/auth/refresh", {});
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("accessToken");
    expect(typeof data.accessToken).toBe("string");
  });
});
