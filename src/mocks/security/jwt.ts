import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";

const SECRET = new TextEncoder().encode("magnum-msw-dev-secret-change-me");

const ISS = "magnum-msw";
const AUD = "web";

export type JwtClaims = JWTPayload & {
  sub: string;
  typ: "access" | "refresh";
};

export async function signAccess(email: string, ttl = "60m") {
  return new SignJWT({ typ: "access" } as JwtClaims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(email)
    .setIssuer(ISS)
    .setAudience(AUD)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(SECRET);
}

export async function signRefresh(email: string, ttl = "7d") {
  return new SignJWT({ typ: "refresh" } as JwtClaims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(email)
    .setIssuer(ISS)
    .setAudience(AUD)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(SECRET);
}

export async function verifyAccess(token: string) {
  const { payload } = await jwtVerify<JwtClaims>(token, SECRET, {
    issuer: ISS,
    audience: AUD,
  });
  if (payload.typ !== "access") throw new Error("Not an access token");
  return payload;
}

export async function verifyRefresh(token: string) {
  const { payload } = await jwtVerify<JwtClaims>(token, SECRET, {
    issuer: ISS,
    audience: AUD,
  });
  if (payload.typ !== "refresh") throw new Error("Not a refresh token");
  return payload;
}

export function readBearer(req: Request): string | null {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export function normalizeEmail(e: string) {
  return e.trim().toLowerCase();
}
