import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "Ayoub").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SESSION_COOKIE = "qadri_session";
const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 365;
const sessions = new Map<string, number>();

type PublicUser = Omit<typeof usersTable.$inferSelect, "passwordHash">;

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/[\s().-]/g, "").trim();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = scryptSync(password, salt, 64);
  const storedKey = Buffer.from(key, "hex");
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

function publicUser(user: typeof usersTable.$inferSelect): PublicUser {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function parseInput(req: Request) {
  if (req.method === "GET") {
    const raw = typeof req.query.input === "string" ? req.query.input : "";
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.["0"]?.json ?? parsed?.json ?? parsed;
    } catch {
      return null;
    }
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  return body?.["0"]?.json ?? body?.json ?? body;
}

function sendSuccess(res: Response, data: unknown) {
  return res.json([{ result: { data: { json: data } } }]);
}

function sendError(res: Response, message: string, code = "BAD_REQUEST") {
  return res.status(200).json([{ error: { json: { message, data: { code } } } }]);
}

function getSessionUserId(req: Request) {
  const cookieHeader = req.headers.cookie || "";
  const token = cookieHeader.split(";").map(cookie => cookie.trim()).find(cookie => cookie.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  return token ? sessions.get(token) : undefined;
}

function issueSession(res: Response, userId: number) {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, userId);
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE / 1000}`);
}

function clearSession(req: Request, res: Response) {
  const cookieHeader = req.headers.cookie || "";
  const token = cookieHeader.split(";").map(cookie => cookie.trim()).find(cookie => cookie.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (token) sessions.delete(token);
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

async function findUser(identifier: string) {
  const username = normalizeUsername(identifier);
  const phone = normalizePhone(identifier);
  const result = await db.select().from(usersTable).where(or(eq(usersTable.username, username), eq(usersTable.phone, phone))).limit(1);
  return result[0];
}

async function ensureAdminAccount() {
  if (!ADMIN_PASSWORD) {
    console.warn("[Auth] ADMIN_PASSWORD is not configured; admin login is disabled.");
    return;
  }

  const existing = await findUser(ADMIN_USERNAME);
  const passwordHash = existing && verifyPassword(ADMIN_PASSWORD, existing.passwordHash) ? existing.passwordHash : hashPassword(ADMIN_PASSWORD);

  if (!existing) {
    await db.insert(usersTable).values({
      openId: `local_${randomBytes(18).toString("hex")}`,
      username: ADMIN_USERNAME,
      phone: "0000000000",
      passwordHash,
      name: "Ayoub",
      loginMethod: "credentials",
      role: "admin",
      lastSignedIn: new Date(),
    });
    return;
  }

  if (existing.role !== "admin" || existing.passwordHash !== passwordHash || existing.name !== "Ayoub" || existing.loginMethod !== "credentials") {
    await db.update(usersTable).set({
      passwordHash,
      name: "Ayoub",
      loginMethod: "credentials",
      role: "admin",
      updatedAt: new Date(),
    }).where(eq(usersTable.id, existing.id));
  }
}

async function handleMe(req: Request, res: Response) {
  const userId = getSessionUserId(req);
  if (!userId) return sendSuccess(res, null);
  const result = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return sendSuccess(res, result[0] ? publicUser(result[0]) : null);
}

async function handleRegister(req: Request, res: Response) {
  const input = parseInput(req) as { name?: string; phone?: string; password?: string } | null;
  const name = input?.name?.trim() || "";
  const phone = normalizePhone(input?.phone || "");
  const password = input?.password || "";
  if (name.length < 2 || phone.length < 7 || password.length < 6) return sendError(res, "يرجى تعبئة بيانات التسجيل بشكل صحيح.", "BAD_REQUEST");

  if (await findUser(phone)) return sendError(res, "هذا الرقم مسجل مسبقًا.", "CONFLICT");
  const openId = `local_${randomBytes(18).toString("hex")}`;
  const result = await db.insert(usersTable).values({
    openId,
    phone,
    passwordHash: hashPassword(password),
    name,
    loginMethod: "credentials",
    role: "user",
    lastSignedIn: new Date(),
  }).returning();
  const user = result[0];
  if (!user) return sendError(res, "تعذر إنشاء الحساب.", "INTERNAL_SERVER_ERROR");
  issueSession(res, user.id);
  return sendSuccess(res, publicUser(user));
}

async function handleLogin(req: Request, res: Response) {
  const input = parseInput(req) as { identifier?: string; password?: string; admin?: boolean } | null;
  const identifier = input?.identifier?.trim() || "";
  const password = input?.password || "";
  const isAdmin = Boolean(input?.admin);

  if (isAdmin) {
    if (!ADMIN_PASSWORD || normalizeUsername(identifier) !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return sendError(res, "بيانات دخول الأدمن غير صحيحة.", "UNAUTHORIZED");
    await ensureAdminAccount();
  }

  const user = await findUser(identifier);
  if (!user) return sendError(res, isAdmin ? "حساب الأدمن غير موجود." : "رقم الهاتف أو كلمة المرور غير صحيحة.", "UNAUTHORIZED");
  if (isAdmin) {
    if (user.role !== "admin") return sendError(res, "هذا الحساب ليس أدمن.", "FORBIDDEN");
  } else {
    if (user.role === "admin") return sendError(res, "استخدم دخول الأدمن لهذا الحساب.", "FORBIDDEN");
    if (!verifyPassword(password, user.passwordHash)) return sendError(res, "رقم الهاتف أو كلمة المرور غير صحيحة.", "UNAUTHORIZED");
  }

  await db.update(usersTable).set({ lastSignedIn: new Date() }).where(eq(usersTable.id, user.id));
  issueSession(res, user.id);
  return sendSuccess(res, publicUser({ ...user, lastSignedIn: new Date() }));
}

router.get("/trpc/auth.me", (req, res) => {
  void handleMe(req, res).catch(error => {
    console.error("[Auth] me failed", error);
    sendError(res, "تعذر التحقق من جلسة الدخول.", "INTERNAL_SERVER_ERROR");
  });
});

router.post("/trpc/auth.register", (req, res) => {
  void handleRegister(req, res).catch(error => {
    console.error("[Auth] register failed", error);
    sendError(res, "تعذر إنشاء الحساب حاليًا.", "INTERNAL_SERVER_ERROR");
  });
});

router.post("/trpc/auth.login", (req, res) => {
  void handleLogin(req, res).catch(error => {
    console.error("[Auth] login failed", error);
    sendError(res, "تعذر تسجيل الدخول حاليًا.", "INTERNAL_SERVER_ERROR");
  });
});

router.post("/trpc/auth.logout", (req, res) => {
  clearSession(req, res);
  return sendSuccess(res, { success: true });
});

void ensureAdminAccount().catch(error => {
  console.error("[Auth] admin seed failed", error);
});

export default router;