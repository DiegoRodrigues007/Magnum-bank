/** @jest-environment node */

import "./setup";
import { jget, jpost } from "./http";
import { tokens, resetTokens } from "./http";

describe("Auth handlers (JWT)", () => {
  test("register cria usuário, gera tokens e já autentica", async () => {
    const { res, data } = await jpost(
      "/auth/register",
      { name: "Novo", email: "novo@teste.com", password: "123456" },
      { noAuth: true }
    );
    expect(res.status).toBe(201);
    expect(typeof data.accessToken).toBe("string");
    expect(typeof data.refreshToken).toBe("string");
    expect(data.user).toMatchObject({ name: "Novo", email: "novo@teste.com" });

    const meAcc = await jget("/account/me");
    expect(meAcc.res.status).toBe(200);
    expect(meAcc.data).toHaveProperty("userId", data.user.id);
  });

  test("register com email existente retorna 409", async () => {
    await jpost(
      "/auth/register",
      { name: "A", email: "dup@teste.com", password: "123" },
      { noAuth: true }
    );
    const { res, data } = await jpost(
      "/auth/register",
      { name: "B", email: "dup@teste.com", password: "456" },
      { noAuth: true }
    );
    expect(res.status).toBe(409);
    expect(data).toMatchObject({ message: "Email já cadastrado" });
  });

  test("login sucesso retorna tokens e permite acessar /account/me", async () => {
    const { res, data } = await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "123456" },
      { noAuth: true }
    );
    expect(res.status).toBe(200);
    expect(typeof data.accessToken).toBe("string");
    expect(data.user.email).toBe("diego@teste.com");

    const me = await jget("/account/me");
    expect(me.res.status).toBe(200);
    expect(me.data).toHaveProperty("userId", data.user.id);
    expect(typeof me.data.balance).toBe("number");
  });

  test("login falha 401 com credenciais inválidas", async () => {
    const { res, data } = await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "errada" },
      { noAuth: true }
    );
    expect(res.status).toBe(401);
    expect(data).toMatchObject({ message: "Credenciais inválidas" });
  });

  test("auth/me retorna 200 quando há Bearer", async () => {
    await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "123456" },
      { noAuth: true }
    );
    const { res, data } = await jget("/auth/me");
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("email", "diego@teste.com");
  });

  test("auth/me sem token retorna 401", async () => {
    resetTokens();
    const { res } = await jget("/auth/me", { noAuth: true });
    expect(res.status).toBe(401);
  });

  test("logout é stateless (server); após logout e limpar tokens, /auth/me deve 401", async () => {
    await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "123456" },
      { noAuth: true }
    );
    const out = await jpost("/auth/logout", {});
    expect(out.res.status).toBe(200);
    expect(out.data).toMatchObject({ ok: true });

    resetTokens();
    const me = await jget("/auth/me", { noAuth: true });
    expect(me.res.status).toBe(401);
  });

  test("auth/refresh devolve novo accessToken a partir do refreshToken", async () => {
    await jpost(
      "/auth/login",
      { email: "diego@teste.com", password: "123456" },
      { noAuth: true }
    );
    const { refreshToken } = tokens();
    expect(typeof refreshToken).toBe("string");

    const { res, data } = await jpost(
      "/auth/refresh",
      { refreshToken },
      { noAuth: true }
    );
    expect(res.status).toBe(200);
    expect(typeof data.accessToken).toBe("string");
  });
});
