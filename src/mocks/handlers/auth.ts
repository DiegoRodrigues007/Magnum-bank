import { http, HttpResponse } from "msw";
import { db } from "./db";

type RegisterBody = { name: string; email: string; password: string };
type LoginBody = { email: string; password: string };

const normalizeEmail = (e: string) => e.trim().toLowerCase();

export const authHandlers = [
  http.post("*/auth/register", async ({ request }) => {
    try {
      const { name, email, password } = (await request.json()) as RegisterBody;

      if (!name || !email || !password) {
        return HttpResponse.json({ message: "Dados inválidos" }, { status: 400 });
      }

      const users = db.getUsers();
      if (users.some(u => normalizeEmail(u.email) === normalizeEmail(email))) {
        return HttpResponse.json({ message: "Email já cadastrado" }, { status: 409 });
      }

      const user = db.upsertUser({
        name,
        email: normalizeEmail(email),
        password,
      });

      db.ensureAccountForUser(user.id);
      db.setSessionEmail(user.email);

      return HttpResponse.json({
        accessToken: "mock_access_" + Date.now(),
        refreshToken: "mock_refresh_" + Date.now(),
        user: { id: user.id, name: user.name, email: user.email },
      }, { status: 201 });
    } catch {
      return HttpResponse.json({ message: "Bad Request" }, { status: 400 });
    }
  }),

  http.post("*/auth/login", async ({ request }) => {
    try {
      const { email, password } = (await request.json()) as LoginBody;

      const user = db.getUsers().find(
        u => normalizeEmail(u.email) === normalizeEmail(email) && u.password === password
      );

      if (!user) {
        return HttpResponse.json({ message: "Credenciais inválidas" }, { status: 401 });
      }

      db.setSessionEmail(user.email);
      db.ensureAccountForUser(user.id);

      return HttpResponse.json({
        accessToken: "mock_access_" + Date.now(),
        refreshToken: "mock_refresh_" + Date.now(),
        user: { id: user.id, name: user.name, email: user.email },
      }, { status: 200 });
    } catch {
      return HttpResponse.json({ message: "Bad Request" }, { status: 400 });
    }
  }),

  http.get("*/auth/me", async () => {
    const email = db.getSessionEmail();
    if (!email) return HttpResponse.json({ authenticated: false }, { status: 200 });

    const user = db.getUsers().find(u => normalizeEmail(u.email) === normalizeEmail(email));
    if (!user) return HttpResponse.json({ authenticated: false }, { status: 200 });

    return HttpResponse.json({
      authenticated: true,
      user: { id: user.id, name: user.name, email: user.email },
    }, { status: 200 });
  }),

  http.post("*/auth/logout", async () => {
    db.setSessionEmail(null);
    return HttpResponse.json({ ok: true }, { status: 200 });
  }),

  http.post("*/auth/refresh", async () => {
    return HttpResponse.json({ accessToken: "mock_access_" + Date.now() }, { status: 200 });
  }),
];
