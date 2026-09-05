import { pool } from "@workspace/db";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "Ayoub").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Ayoub@123";
const SESSION_COOKIE = "qadri_session";
const sessions = new Map<string, number>();

type UserRow = {
  id: number;
  openId: string;
  username: string | null;
  phone: string | null;
  passwordHash: string | null;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

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

function publicUser(user: UserRow) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function readInput(req: any) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const value = Array.isArray(body) ? body[0] : body;
  return value?.json ?? value?.["0"]?.json ?? value ?? {};
}

function sendSuccess(res: any, data: unknown) {
  return res.status(200).json([{ result: { data: { json: data } } }]);
}

function sendError(res: any, message: string, code = "BAD_REQUEST") {
  const codes: Record<string, number> = {
    BAD_REQUEST: -32600,
    UNAUTHORIZED: -32001,
    FORBIDDEN: -32003,
    CONFLICT: -32009,
    INTERNAL_SERVER_ERROR: -32603,
  };
  return res.status(200).json([{
    error: {
      json: {
        message,
        code: codes[code] ?? codes.BAD_REQUEST,
        data: { code },
      },
    },
  }]);
}

function getCookie(req: any) {
  const header = String(req.headers?.cookie || "");
  const token = header.split(";").map((part: string) => part.trim()).find((part: string) => part.startsWith(`${SESSION_COOKIE}=`));
  return token?.slice(SESSION_COOKIE.length + 1);
}

function issueSession(res: any, userId: number) {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, userId);
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
}

async function findUser(identifier: string) {
  const username = normalizeUsername(identifier);
  const phone = normalizePhone(identifier);
  const result = await pool.query<UserRow>(
    'SELECT * FROM "users" WHERE "username" = $1 OR "phone" = $2 LIMIT 1',
    [username, phone],
  );
  return result.rows[0];
}

async function ensureAdmin() {
  let user = await findUser(ADMIN_USERNAME);
  if (!user) {
    const result = await pool.query<UserRow>(
      'INSERT INTO "users" ("openId", "username", "phone", "passwordHash", "name", "loginMethod", "role") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [`local_${randomBytes(18).toString("hex")}`, ADMIN_USERNAME, "0000000000", hashPassword(ADMIN_PASSWORD), "Ayoub", "credentials", "admin"],
    );
    user = result.rows[0];
  } else if (user.role !== "admin" || !verifyPassword(ADMIN_PASSWORD, user.passwordHash)) {
    const result = await pool.query<UserRow>(
      'UPDATE "users" SET "passwordHash" = $1, "name" = $2, "loginMethod" = $3, "role" = $4, "updatedAt" = NOW() WHERE "id" = $5 RETURNING *',
      [hashPassword(ADMIN_PASSWORD), "Ayoub", "credentials", "admin", user.id],
    );
    user = result.rows[0];
  }
  return user;
}

async function handle(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  const path = String(req.url || "");
  const operation = path.match(/(?:^|\/)(me|logout|login|register)(?:[/?]|$)/)?.[1] || String(req.query?.operation || "");
  try {
    if (operation === "me") {
      const userId = sessions.get(getCookie(req) || "");
      if (!userId) return sendSuccess(res, null);
      const result = await pool.query<UserRow>('SELECT * FROM "users" WHERE "id" = $1 LIMIT 1', [userId]);
      return sendSuccess(res, result.rows[0] ? publicUser(result.rows[0]) : null);
    }

    if (operation === "logout") {
      const token = getCookie(req);
      if (token) sessions.delete(token);
      res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      return sendSuccess(res, { success: true });
    }

    const input = readInput(req);
    if (operation === "register") {
      const name = String(input.name || "").trim();
      const phone = normalizePhone(String(input.phone || ""));
      const password = String(input.password || "");
      if (name.length < 2 || phone.length < 7 || password.length < 6) return sendError(res, "يرجى تعبئة بيانات التسجيل بشكل صحيح.");
      if (await findUser(phone)) return sendError(res, "هذا الرقم مسجل مسبقًا.", "CONFLICT");
      const result = await pool.query<UserRow>(
        'INSERT INTO "users" ("openId", "phone", "passwordHash", "name", "loginMethod", "role") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [`local_${randomBytes(18).toString("hex")}`, phone, hashPassword(password), name, "credentials", "user"],
      );
      const user = result.rows[0];
      issueSession(res, user.id);
      return sendSuccess(res, publicUser(user));
    }

    if (operation === "login") {
      const identifier = String(input.identifier || "").trim();
      const password = String(input.password || "");
      const isAdmin = Boolean(input.admin);
      let user: UserRow | undefined;
      if (isAdmin) {
        if (normalizeUsername(identifier) !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return sendError(res, "بيانات دخول الأدمن غير صحيحة.", "UNAUTHORIZED");
        user = await ensureAdmin();
      } else {
        user = await findUser(identifier);
      }
      if (!user) return sendError(res, "رقم الهاتف أو كلمة المرور غير صحيحة.", "UNAUTHORIZED");
      if (isAdmin && user.role !== "admin") return sendError(res, "هذا الحساب ليس أدمن.", "FORBIDDEN");
      if (!isAdmin && (user.role === "admin" || !verifyPassword(password, user.passwordHash))) return sendError(res, "رقم الهاتف أو كلمة المرور غير صحيحة.", "UNAUTHORIZED");
      await pool.query('UPDATE "users" SET "lastSignedIn" = NOW() WHERE "id" = $1', [user.id]);
      issueSession(res, user.id);
      return sendSuccess(res, publicUser({ ...user, lastSignedIn: new Date() }));
    }

    return sendError(res, "مسار المصادقة غير معروف.", "BAD_REQUEST");
  } catch (error: any) {
    console.error("[Auth API] request failed", error);
    return sendError(res, "تعذر تنفيذ طلب الحساب حاليًا.", "INTERNAL_SERVER_ERROR");
  }
}

export default handle;
