import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { aiRouter } from "./routers/ai";
import { commerceRouter } from "./routers/commerce";
import { controlRouter, dashboardRouter, knowledgeRouter, plannerRouter, settingsRouter, workspaceRouter } from "./routers/platform";
import { profileRouter } from "./routers/profile";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
