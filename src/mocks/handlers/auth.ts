import { http, HttpResponse } from "msw";
import { db } from "../handlers/db";
import {
  normalizeEmail,
  readBearer,
  signAccess,
  signRefresh,
  verifyAccess,
  verifyRefresh,
} from "../security/jwt";

type RegisterBody = { name: string; email: string; password: string };
type LoginBody = { email: string; password: string };

function hasRefreshToken(v: unknown): v is { refreshToken?: unknown } {
  return typeof v === "object" && v !== null && "refreshToken" in (v as any);
}

export const authHandlers = [
  http.post("*/auth/register", async ({ request }) => {
    try {
      const { name, email, password } = (await request.json()) as RegisterBody;
      if (!name || !email || !password) {
        return HttpResponse.json(
          { message: "Dados inválidos" },
          { status: 400 }
        );
      }

      const users = await db.getUsers();
      if (
        users.some((u) => normalizeEmail(u.email) === normalizeEmail(email))
      ) {
        return HttpResponse.json(
          { message: "Email já cadastrado" },
          { status: 409 }
        );
      }

      const user = await db.upsertUser({
        name,
        email: normalizeEmail(email),
        password,
      });

      await db.ensureAccountForUser(user.id);

      const accessToken = await signAccess(user.email);
      const refreshToken = await signRefresh(user.email);

      return HttpResponse.json(
        {
          accessToken,
          refreshToken,
          user: { id: user.id, name: user.name, email: user.email },
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("[MSW] /auth/register error", err);
      return HttpResponse.json({ message: "Bad Request" }, { status: 400 });
    }
  }),

  http.post("*/auth/login", async ({ request }) => {
    try {
      const { email, password } = (await request.json()) as LoginBody;
      const users = await db.getUsers();

      const user = users.find(
        (u) =>
          normalizeEmail(u.email) === normalizeEmail(email) &&
          u.password === password
      );

      if (!user) {
        return HttpResponse.json(
          { message: "Credenciais inválidas" },
          { status: 401 }
        );
      }

      const accessToken = await signAccess(user.email);
      const refreshToken = await signRefresh(user.email);

      return HttpResponse.json(
        {
          accessToken,
          refreshToken,
          user: { id: user.id, name: user.name, email: user.email },
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("[MSW] /auth/login error", err);
      return HttpResponse.json({ message: "Bad Request" }, { status: 400 });
    }
  }),

  http.get("*/auth/me", async ({ request }) => {
    try {
      const token = readBearer(request);
      if (!token)
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });

      const payload = await verifyAccess(token);
      const email = String(payload.sub || "");

      const users = await db.getUsers();
      const user = users.find(
        (u) => normalizeEmail(u.email) === normalizeEmail(email)
      );
      if (!user)
        return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });

      return HttpResponse.json(
        { id: user.id, name: user.name, email: user.email },
        { status: 200 }
      );
    } catch {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }),

  http.post("*/auth/logout", async () => {
    return HttpResponse.json({ ok: true }, { status: 200 });
  }),

  http.post("*/auth/refresh", async ({ request }) => {
    try {
      const fromHeader = request.headers.get("x-refresh-token");

      let fromBody: string | null = null;
      try {
        const raw = (await request.json()) as unknown;
        if (hasRefreshToken(raw)) {
          const v = (raw as any).refreshToken;
          if (typeof v === "string") fromBody = v;
        }
      } catch {}

      const token = fromHeader || fromBody;
      if (!token) {
        return HttpResponse.json(
          { message: "Invalid refresh" },
          { status: 401 }
        );
      }

      const payload = await verifyRefresh(token);
      const email = String(payload.sub || "");
      const newAccess = await signAccess(email);

      return HttpResponse.json({ accessToken: newAccess }, { status: 200 });
    } catch {
      return HttpResponse.json({ message: "Invalid refresh" }, { status: 401 });
    }
  }),
];
