// @ts-nocheck
// Vercel type-checks api files with the root frontend tsconfig. Keep this
// handler independent from that config and keeps its database dependency lazy.
export const config = { runtime: "nodejs" };
// Vercel may bundle this function as CommonJS while the workspace DB package is
// ESM. Keep the database import lazy so the CJS wrapper never calls require() on
// the ESM pool module during cold start.
let poolPromise: Promise<any> | undefined;
function normalizeDatabaseUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "postgres:" || url.protocol === "postgresql:") {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    // Keep the original value; pg will report a useful connection error.
  }
  return value;
}

function getPool() {
  if (!poolPromise) {
    poolPromise = import("pg").then(pgModule => {
      const pg = (pgModule as any).default || pgModule;
      const databaseUrl = (
        process.env.DATABASE_URL
        || process.env.NEON_DATABASE_URL
        || process.env.POSTGRES_URL
        || process.env.POSTGRES_PRISMA_URL
      )?.trim();
      if (!databaseUrl) throw new Error("DATABASE_URL is not configured");
      return new pg.Pool({
        connectionString: normalizeDatabaseUrl(databaseUrl),
        max: 5,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
      });
    });
  }
  return poolPromise;
}

const pool = {
  query: (...args: any[]) => getPool().then(database => database.query(...args)),
};

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "Ayoub").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Ayoub@123";
const SESSION_COOKIE = "qadri_session";
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || "qadri-session-secret-change-me";

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
  if (res.locals?.galleryRest) return res.status(200).json(data);
  if (res.locals?.authRest) return res.status(200).json({ user: data });
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
  if (res.locals?.authRest) return res.status(200).json({ error: message, code });
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

function geminiInput(req: any) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const value = Array.isArray(body) ? body[0] : body;
  return value?.json ?? value?.["0"]?.json ?? value ?? {};
}

function geminiSystem(language: string) {
  return language === "en"
    ? "You are Al-Qadri Smart Agriculture. For an attached plant image, provide a structured report: plant identification, overall status, visible observations, possible diseases/pests, possible nutrient deficiencies, causes, immediate actions, safe treatment, initial fertilization and irrigation programs, and tests needed. Always say it is a preliminary visual estimate, not a laboratory analysis. Never invent N/P/K percentages or confirm a disease from one image."
    : "أنت القادري الزراعي الذكي. عند إرفاق صورة نبات، أخرج تقريرًا منظمًا: اسم النبات، الحالة العامة، ما تراه، الأمراض أو الآفات المحتملة، نقص العناصر المحتمل، الأسباب، ما يجب فعله الآن، العلاج الآمن، برنامج تسميد وري مبدئي، والفحوصات اللازمة. اكتب دائمًا: تقدير بصري مبدئي وليس تحليلًا مخبريًا. لا تخترع نسب N أو P أو K ولا تؤكد مرضًا من صورة واحدة.";
}

function latestUserText(messages: any[]) {
  const item = [...messages].reverse().find(value => value && value.role === "user" && typeof value.content === "string");
  return item ? String(item.content).slice(0, 12000) : "";
}

function isImageRequest(messages: any[]) {
  const text = latestUserText(messages).toLocaleLowerCase();
  return ["أعطني صورة", "اعطني صورة", "اعطيني صورة", "أعطيني صورة", "صورة", "صور", "صمّم", "صمم", "أنشئ", "اعمل لي", "ارسم", "image", "images", "generate", "create", "design", "draw"].some(term => text.includes(term));
}

async function generateGeminiImage(prompt: string, language: string) {
  const key = String(process.env.GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("لم يتم ضبط GEMINI_API_KEY على الخادم.");
  const model = String(process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image").trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
    contents: [{ role: "user", parts: [{ text: `${language === "en" ? "Generate a realistic agricultural image from this request. Do not add text or logos:" : "أنشئ صورة زراعية واقعية بناءً على الطلب التالي. لا تضف نصوصًا أو شعارات:"} ${prompt}` }] }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: "1:1" } },
  }) });
  const raw = await response.text();
  let data: any = {};
  try { data = JSON.parse(raw); } catch { /* handled below */ }
  if (!response.ok) throw new Error(`فشل توليد الصورة (${response.status}): ${data?.error?.message || raw.slice(0, 240)}`);
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const images = parts.map((part: any) => part?.inlineData?.data && part?.inlineData?.mimeType ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "").filter(Boolean).slice(0, 2);
  const content = parts.map((part: any) => typeof part?.text === "string" ? part.text : "").filter(Boolean).join("\n").trim();
  if (!images.length) throw new Error("لم يُرجع Gemini صورة. جرّب وصفًا زراعيًا أكثر تحديدًا.");
  return { content: content || (language === "en" ? "Here is an agricultural image generated from your request." : "هذه صورة زراعية مولدة بناءً على طلبك."), images };
}

async function generateGeminiDesign(input: any) {
  const key = String(process.env.GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("لم يتم ضبط GEMINI_API_KEY على الخادم.");
  const description = String(input.description || "").trim();
  const imageDataUrl = String(input.imageDataUrl || "");
  const language = input.language === "en" ? "en" : "ar";
  if (description.length < 8 || description.length > 1200) throw new Error("اكتب وصفًا واضحًا للتصميم بين 8 و1200 حرفًا.");
  if (!imageDataUrl) throw new Error("ارفع صورة الموقع أولًا حتى يتم تحليلها وإنشاء تصميم مبني عليها.");
  if (imageDataUrl.length > 18_000_000) throw new Error("حجم صورة الموقع كبير جدًا. استخدم صورة أصغر من 13 ميغابايت تقريبًا.");
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(imageDataUrl);
  if (!match) throw new Error("استخدم صورة JPG أو PNG أو WebP صالحة.");
  const model = String(process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image").trim();
  const prompt = language === "ar"
    ? `حلل صورة الموقع ثم أنشئ صورة تصميم جديدة مبنية عليها، ولا تُرجع الصورة الأصلية كما هي. حافظ على حدود الأرض والمنظور والمباني والطرق والتضاريس، وأضف بوضوح ما يلي: ${description}. أظهر توزيع الأشجار والنباتات والأحواض والعشب والممرات والجلسات وعناصر اللاندسكيب وشبكة الري ومناطق الري ونقاط التنقيط أو الرشاشات عند الحاجة. اجعل النتيجة تصورًا زراعيًا واقعيًا بلا نصوص أو شعارات أو مخططات أو واجهة مستخدم.`
    : `Analyze the site photo and create a NEW landscape design image based on it; do not return the original unchanged. Preserve land boundaries, viewpoint, buildings, roads, and terrain, and visibly implement: ${description}. Show trees, plants, beds, grass, paths, seating, landscape elements, irrigation zones, and drip or sprinkler points where appropriate. Make it a realistic agricultural visualization with no text, logos, diagrams, or UI.`;
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      model,
      input: [
        { type: "text", text: prompt },
        { type: "image", mime_type: match[1], data: match[2] },
      ],
      response_format: { type: "image", aspect_ratio: "4:3" },
    }),
  });
  const raw = await response.text();
  let data: any = {};
  try { data = JSON.parse(raw); } catch { /* handled below */ }
  if (!response.ok) throw new Error(`فشل إنشاء التصميم (${response.status}): ${data?.error?.message || data?.message || raw.slice(0, 240)}`);
  const outputImage = data?.output_image || data?.steps?.flatMap((step: any) => step?.content || []).find((item: any) => item?.type === "image");
  if (!outputImage?.data) throw new Error("لم يُرجع نموذج الصور تصميمًا جديدًا. تأكد من تفعيل نموذج Gemini Image.");
  return { imageUrl: `data:${outputImage.mime_type || "image/png"};base64,${outputImage.data}` };
}

function geminiParts(messages: any[], attachments: any[]) {
  const contents = messages.filter(item => item && typeof item.content === "string" && item.role !== "system").slice(-10).map(item => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: String(item.content).slice(0, 12000) }] as any[],
  }));
  const last = contents[contents.length - 1];
  const images = attachments.filter(item => item?.type === "image" || item?.type === "audio").slice(0, 3).map(item => {
    const match = /^data:((?:image\/(?:jpeg|png|webp)|audio\/(?:webm|mpeg|mp3|wav|ogg|mp4|m4a)));base64,(.+)$/s.exec(String(item.dataUrl || ""));
    return match ? { mimeType: match[1], data: match[2] } : null;
  }).filter(Boolean);
  if (last?.role === "user") last.parts.push(...images.map(image => ({ inlineData: image })));
  return contents;
}

async function handleGemini(req: any, res: any) {
  const input = geminiInput(req);
  const messages = Array.isArray(input.messages) ? input.messages : [];
  if (!messages.length) return sendError(res, "أرسل سؤالًا زراعيًا أولًا.");
  const key = String(process.env.GEMINI_API_KEY || "").trim();
  if (!key) return sendError(res, "لم يتم ضبط GEMINI_API_KEY على الخادم.", "INTERNAL_SERVER_ERROR");
  const language = input.language === "en" ? "en" : "ar";
  const attachments = Array.isArray(input.attachments) ? input.attachments : [];
  if (isImageRequest(messages) && !attachments.some((item: any) => item?.type === "image")) return sendSuccess(res, await generateGeminiImage(latestUserText(messages), language));
  const model = String(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite").trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: geminiSystem(language) }] },
      contents: geminiParts(messages, attachments),
      generationConfig: { temperature: 0.25, maxOutputTokens: 1800 },
    }),
  });
  const raw = await response.text();
  let data: any = {};
  try { data = JSON.parse(raw); } catch { /* handled below */ }
  if (!response.ok) throw new Error(`فشل اتصال Gemini (${response.status}): ${data?.error?.message || raw.slice(0, 240)}`);
  const content = data?.candidates?.[0]?.content?.parts?.map((part: any) => typeof part.text === "string" ? part.text : "").filter(Boolean).join("\n").trim();
  if (!content) throw new Error("أعاد Gemini استجابة بلا نص.");
  return sendSuccess(res, { content });
}

function getCookie(req: any) {
  const header = String(req.headers?.cookie || "");
  const token = header.split(";").map((part: string) => part.trim()).find((part: string) => part.startsWith(`${SESSION_COOKIE}=`));
  if (token) return token.slice(SESSION_COOKIE.length + 1);
  const authorization = String(req.headers?.authorization || "");
  if (authorization.startsWith("Bearer ")) return authorization.slice(7).trim();
  return undefined;
}

function sessionSignature(userId: number) {
  return createHmac("sha256", SESSION_SECRET).update(String(userId)).digest("hex");
}

function getSessionUserId(req: any) {
  const token = getCookie(req) || "";
  const [userIdText, signature] = token.split(".");
  const userId = Number(userIdText);
  if (!Number.isInteger(userId) || !signature || signature !== sessionSignature(userId)) return undefined;
  return userId;
}

function issueSession(res: any, userId: number) {
  const token = `${userId}.${sessionSignature(userId)}`;
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

let usersSchemaReady: Promise<void> | undefined;

async function ensureUsersSchema() {
  if (!usersSchemaReady) {
    usersSchemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "openId" VARCHAR(64) NOT NULL UNIQUE,
        "username" VARCHAR(80) UNIQUE,
        "phone" VARCHAR(32) UNIQUE,
        "passwordHash" VARCHAR(255),
        "name" TEXT,
        "email" VARCHAR(320),
        "loginMethod" VARCHAR(64),
        "role" TEXT NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `).then(() => undefined).catch(error => {
      usersSchemaReady = undefined;
      throw error;
    });
  }
  await usersSchemaReady;
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

async function ensureQuoteSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "quote_requests" (
      "id" BIGSERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "quoteNumber" VARCHAR(40) NOT NULL UNIQUE,
      "status" VARCHAR(24) NOT NULL DEFAULT 'pending',
      "payload" JSONB NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

let nurseryGallerySchemaReady: Promise<void> | undefined;
const initialNurseryGallery = [
  { id: "nursery-01", src: "/assets/nursery-01.jpeg", ar: "مشاتل القادري الزراعية", en: "Al-Qadri Agricultural Nurseries" },
  { id: "nursery-02", src: "/assets/nursery-02.jpeg", ar: "أشجار مزهرة للحدائق", en: "Flowering trees for gardens" },
  { id: "nursery-03", src: "/assets/nursery-03.jpeg", ar: "نباتات وتنسيقات موسمية", en: "Seasonal plants and arrangements" },
  { id: "nursery-04", src: "/assets/nursery-04.jpeg", ar: "نخيل وتنسيقات خارجية", en: "Palms and outdoor landscaping" },
  { id: "nursery-05", src: "/assets/nursery-05.jpeg", ar: "أشجار الزينة والخضرة", en: "Ornamental trees and greenery" },
  { id: "nursery-06", src: "/assets/nursery-06.jpeg", ar: "ألوان من مشتلنا", en: "Color from our nursery" },
  { id: "nursery-07", src: "/assets/nursery-07.jpeg", ar: "حدائق تنبض بالحياة", en: "Gardens full of life" },
  { id: "nursery-08", src: "/assets/nursery-08.jpeg", ar: "خبرة تنمو معك", en: "Experience that grows with you" },
  { id: "gallery-09", src: "/assets/gallery-09-sculpted-planters.jpeg", ar: "أحواض وأعمال حجرية فنية", en: "Sculpted planters and stonework" },
  { id: "gallery-10", src: "/assets/gallery-10-olive-nursery.jpeg", ar: "شتلات الزيتون في مشتلنا", en: "Olive seedlings in our nursery" },
  { id: "gallery-11", src: "/assets/gallery-11-greenhouse-seedlings.jpeg", ar: "شتلات خضراء داخل البيوت المحمية", en: "Green seedlings in the greenhouse" },
  { id: "gallery-12", src: "/assets/gallery-12-old-olive-trees.jpeg", ar: "أشجار زيتون معمّرة", en: "Mature olive trees" },
  { id: "gallery-13", src: "/assets/gallery-13-ficus-nursery.jpeg", ar: "فيكس وتنسيقات داخلية", en: "Ficus trees and indoor arrangements" },
  { id: "gallery-14", src: "/assets/gallery-14-ornamental-plants.jpeg", ar: "نباتات زينة مختارة", en: "Selected ornamental plants" },
  { id: "gallery-15", src: "/assets/gallery-15-grafted-olive-trees.jpeg", ar: "زيتون مطعّم بعناية", en: "Carefully grafted olive trees" },
  { id: "gallery-16", src: "/assets/gallery-16-garden-tree.jpeg", ar: "أشجار للحدائق والمساحات الخارجية", en: "Trees for gardens and outdoor spaces" },
  { id: "gallery-17", src: "/assets/gallery-17-nursery-greenery.jpeg", ar: "خضرة تنمو بخبرة القادري", en: "Greenery grown with Al-Qadri expertise" },
  { id: "nursery-09", src: "/assets/nursery-09-black-planter.jpeg", ar: "أحواض زراعية بتنسيق القادري", en: "Planters styled by Al-Qadri" },
];
async function ensureNurseryGallerySchema() {
  if (!nurseryGallerySchemaReady) {
    nurseryGallerySchemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS "nursery_gallery" (
        "id" INTEGER PRIMARY KEY DEFAULT 1,
        "images" JSONB NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `).then(() => undefined).catch(error => { nurseryGallerySchemaReady = undefined; throw error; });
  }
  await nurseryGallerySchemaReady;
}

async function handleNurseryGallery(req: any, res: any, input: any) {
  res.locals.galleryRest = true;
  await ensureNurseryGallerySchema();
  await pool.query('INSERT INTO "nursery_gallery" ("id", "images") VALUES (1, $1::jsonb) ON CONFLICT ("id") DO NOTHING', [JSON.stringify(initialNurseryGallery)]);
  const action = String(input?.action || "list");
  if (action === "list") {
    const result = await pool.query('SELECT "images" FROM "nursery_gallery" WHERE "id" = 1');
    return sendSuccess(res, result.rows[0]?.images || []);
  }
  const userId = requireSessionUser(req);
  const userResult = await pool.query<UserRow>('SELECT * FROM "users" WHERE "id" = $1 LIMIT 1', [userId]);
  if (userResult.rows[0]?.role !== "admin") throw Object.assign(new Error("غير مصرح بهذا الطلب."), { code: "FORBIDDEN" });
  const currentResult = await pool.query('SELECT "images" FROM "nursery_gallery" WHERE "id" = 1');
  const current = Array.isArray(currentResult.rows[0]?.images) ? currentResult.rows[0].images : [];
  if (action === "add") {
    const image = input?.image && typeof input.image === "object" ? input.image : {};
    const next = { id: `gallery-custom-${Date.now()}-${randomBytes(4).toString("hex")}`, src: String(image.src || ""), ar: String(image.ar || "من مشاتل القادري"), en: String(image.en || "From Al-Qadri Nurseries") };
    if (!next.src) throw Object.assign(new Error("الصورة مطلوبة."), { code: "BAD_REQUEST" });
    const images = [...current, next];
    await pool.query('UPDATE "nursery_gallery" SET "images" = $1::jsonb, "updatedAt" = NOW() WHERE "id" = 1', [JSON.stringify(images)]);
    return sendSuccess(res, next);
  }
  if (action === "remove") {
    const images = current.filter((image: any) => image?.id !== String(input?.id || ""));
    await pool.query('UPDATE "nursery_gallery" SET "images" = $1::jsonb, "updatedAt" = NOW() WHERE "id" = 1', [JSON.stringify(images)]);
    return sendSuccess(res, { success: true });
  }
  throw Object.assign(new Error("عملية معرض غير معروفة."), { code: "BAD_REQUEST" });
}

function requireSessionUser(req: any) {
  const userId = getSessionUserId(req);
  if (!userId) throw Object.assign(new Error("يرجى تسجيل الدخول أولًا."), { code: "UNAUTHORIZED" });
  return userId;
}

async function handleQuoteOperation(req: any, res: any, input: any) {
  const userId = requireSessionUser(req);
  await ensureQuoteSchema();
  const userResult = await pool.query<UserRow>('SELECT * FROM "users" WHERE "id" = $1 LIMIT 1', [userId]);
  const user = userResult.rows[0];
  const isAdmin = user?.role === "admin";
  const action = String(input?.action || "list");
  if (action === "create") {
    if (isAdmin) throw Object.assign(new Error("لا يمكن لحساب الأدمن إنشاء طلب مستخدم."), { code: "FORBIDDEN" });
    const payload = input?.payload && typeof input.payload === "object" ? input.payload : {};
    const quoteNumber = `R-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const result = await pool.query(
      'INSERT INTO "quote_requests" ("userId", "quoteNumber", "status", "payload") VALUES ($1, $2, $3, $4::jsonb) RETURNING *',
      [userId, quoteNumber, "pending", JSON.stringify(payload)],
    );
    return sendSuccess(res, result.rows[0]);
  }
  if (!isAdmin && action !== "mine") throw Object.assign(new Error("غير مصرح بهذا الطلب."), { code: "FORBIDDEN" });
  if (action === "mine") {
    const result = await pool.query('SELECT * FROM "quote_requests" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [userId]);
    return sendSuccess(res, result.rows);
  }
  if (action === "update" && input?.id) {
    const payload = input?.payload && typeof input.payload === "object" ? input.payload : {};
    const status = String(input.status || payload.status || "pending");
    const result = await pool.query('UPDATE "quote_requests" SET "status" = $1, "payload" = $2::jsonb, "updatedAt" = NOW() WHERE "id" = $3 RETURNING *', [status, JSON.stringify(payload), Number(input.id)]);
    return sendSuccess(res, result.rows[0] || null);
  }
  if (action === "delete" && input?.id) {
    await pool.query('DELETE FROM "quote_requests" WHERE "id" = $1', [Number(input.id)]);
    return sendSuccess(res, { success: true });
  }
  const result = await pool.query('SELECT qr.*, u."name" AS "userName", u."phone" AS "userPhone" FROM "quote_requests" qr JOIN "users" u ON u."id" = qr."userId" ORDER BY qr."createdAt" DESC');
  return sendSuccess(res, result.rows);
}

async function handle(req: any, res: any) {
  res.locals = res.locals || {};
  res.locals.authRest = String(req.query?.format || "") === "rest";
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  const path = String(req.url || "");
  const pathOperation = path.match(/(?:^|\/)(?:auth\.)?(me|logout|login|register)(?:[.?/&]|$)/)?.[1];
  const queryOperation = String(req.query?.operation || "").split(".").pop();
  const operation = pathOperation || queryOperation || "";
  try {
    if (path.includes("ai.consult") || queryOperation === "ai.consult") return await handleGemini(req, res);
    if (path.includes("design/generate") || String(req.query?.operation || "") === "design.generate" || queryOperation === "generate") return res.status(200).json(await generateGeminiDesign(readInput(req)));
    if (path.includes("/api/gallery") || queryOperation === "gallery") return await handleNurseryGallery(req, res, readInput(req));
    await ensureUsersSchema();

    if (operation === "quotes") return await handleQuoteOperation(req, res, readInput(req));

    if (operation === "me") {
      const userId = getSessionUserId(req);
      if (!userId) return sendSuccess(res, null);
      const result = await pool.query<UserRow>('SELECT * FROM "users" WHERE "id" = $1 LIMIT 1', [userId]);
      return sendSuccess(res, result.rows[0] ? publicUser(result.rows[0]) : null);
    }

    if (operation === "logout") {
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

    return sendError(res, "مسار الطلب غير معروف.", "BAD_REQUEST");
  } catch (error: any) {
    console.error("[API] request failed", error);
    const code = error?.code || "INTERNAL_SERVER_ERROR";
    if (path.includes("design/generate") || String(req.query?.operation || "") === "design.generate" || queryOperation === "generate") {
      return res.status(502).json({ message: error instanceof Error ? error.message : "تعذر إنشاء التصميم الآن." });
    }
    return sendError(res, error instanceof Error ? error.message : "تعذر تنفيذ الطلب حاليًا.", code);
  }
}

export default handle;
