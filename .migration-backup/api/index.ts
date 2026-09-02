import express from "express";
import type { NextFunction, Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// Keep unexpected handler errors in the JSON contract expected by the tRPC
// client. Without this boundary, a serverless platform can replace the
// response with a plain-text "server error", which then causes the browser's
// misleading "Unexpected token" JSON parse error.
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[API] Unhandled request error", error);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
