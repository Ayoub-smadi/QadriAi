import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { User } from "../drizzle/schema";
import * as db from "./db";
import { ADMIN_PASSWORD, ADMIN_USERNAME, normalizePhone, normalizeUsername, verifyPassword } from "./credentialAuth";
import { sdk } from "./_core/sdk";
import type { TrpcContext } from "./_core/context";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { aiRouter } from "./routers/ai";
import { commerceRouter } from "./routers/commerce";
import { controlRouter, dashboardRouter, knowledgeRouter, plannerRouter, settingsRouter, workspaceRouter } from "./routers/platform";
import { profileRouter } from "./routers/profile";

function publicUser(user: User | null | undefined) {
  if (!user) return null;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

async function issueCredentialSession(ctx: Pick<TrpcContext, "req" | "res">, user: User) {
  const sessionToken = await sdk.signSession({ openId: user.openId, appId: process.env.VITE_APP_ID || "al-qadri-local", name: user.name || user.username || "User" }, { expiresInMs: ONE_YEAR_MS });
  ctx.res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
  return publicUser(user);
}

function assertCredentialAuthConfiguration() {
  if (!ENV.cookieSecret) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "إعدادات تسجيل الدخول غير مكتملة. أضف JWT_SECRET أو SESSION_SECRET في Vercel.",
    });
  }

  if (ENV.isProduction && !ENV.databaseUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "قاعدة بيانات الإنتاج غير مهيأة. أضف DATABASE_URL في Vercel.",
    });
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => publicUser(opts.ctx.user)),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(32), password: z.string().min(6).max(128) })).mutation(async ({ input, ctx }) => {
      assertCredentialAuthConfiguration();
      const phone = normalizePhone(input.phone);
      if (await db.findCredentialUser(phone)) throw new TRPCError({ code: "CONFLICT", message: "هذا الرقم مسجل مسبقًا." });
      const user = await db.createCredentialUser({ name: input.name, phone, password: input.password });
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إنشاء الحساب." });
      return issueCredentialSession(ctx, user);
    }),
    login: publicProcedure.input(z.object({ identifier: z.string().trim().min(1).max(120), password: z.string().min(1).max(128), admin: z.boolean().default(false) })).mutation(async ({ input, ctx }) => {
      assertCredentialAuthConfiguration();
      let user = await db.findCredentialUser(input.identifier);
      if (input.admin) {
        if (normalizeUsername(input.identifier) !== normalizeUsername(ADMIN_USERNAME) || input.password !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED", message: "بيانات دخول الأدمن غير صحيحة." });
        if (!user) user = await db.createCredentialUser({ name: "Ayoub", username: ADMIN_USERNAME, phone: process.env.ADMIN_PHONE || "0000000000", password: ADMIN_PASSWORD, role: "admin" });
        if (!user || user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "هذا الحساب ليس أدمن." });
      } else {
        if (!user || !verifyPassword(input.password, user.passwordHash)) throw new TRPCError({ code: "UNAUTHORIZED", message: "رقم الهاتف أو كلمة المرور غير صحيحة." });
        if (user.role === "admin") throw new TRPCError({ code: "FORBIDDEN", message: "استخدم دخول الأدمن لهذا الحساب." });
      }
      const updated = await db.touchCredentialUser(user);
      if (!updated) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر إنشاء الجلسة." });
      return issueCredentialSession(ctx, updated);
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: profileRouter,
  dashboard: dashboardRouter,
  knowledge: knowledgeRouter,
  planner: plannerRouter,
  workspace: workspaceRouter,
  control: controlRouter,
  settings: settingsRouter,
  ai: aiRouter,
  commerce: commerceRouter,
});

export type AppRouter = typeof appRouter;
