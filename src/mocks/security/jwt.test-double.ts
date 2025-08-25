export function normalizeEmail(e: string) {
  return e.trim().toLowerCase();
}

export function readBearer(req: Request): string | null {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function b64(s: string) { return Buffer.from(s, "utf8").toString("base64url"); }
function unb64(s: string) { return Buffer.from(s, "base64url").toString("utf8"); }

type Claims = { sub: string; typ: "access" | "refresh"; exp: number; iat: number };

function makeToken(email: string, typ: "access" | "refresh", ttlMs: number) {
  const iat = Date.now();
  const exp = iat + ttlMs;
  const header = b64(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = b64(JSON.stringify({ sub: email, typ, iat, exp } as Claims));
  const sig = "testsig";
  return `${header}.${payload}.${sig}`;
}

export async function signAccess(email: string, ttl = "15m") {
  const minutes = Number(ttl.endsWith("m") ? ttl.slice(0, -1) : 15);
  return makeToken(email, "access", minutes * 60 * 1000);
}
export async function signRefresh(email: string, ttl = "7d") {
  const days = Number(ttl.endsWith("d") ? ttl.slice(0, -1) : 7);
  return makeToken(email, "refresh", days * 24 * 60 * 60 * 1000);
}

function parse(token: string): Claims {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("bad token");
  const payload = JSON.parse(unb64(parts[1])) as Claims;
  if (!payload?.sub || !payload?.typ || !payload?.exp) throw new Error("bad payload");
  if (Date.now() >= payload.exp) throw new Error("expired");
  return payload;
}

export async function verifyAccess(token: string) {
  const c = parse(token);
  if (c.typ !== "access") throw new Error("not access");
  return c;
}
export async function verifyRefresh(token: string) {
  const c = parse(token);
  if (c.typ !== "refresh") throw new Error("not refresh");
  return c;
}
