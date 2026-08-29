import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  findCredentialUser: vi.fn().mockResolvedValue(null),
  createCredentialUser: vi.fn().mockResolvedValue({
    id: 9,
    openId: "local_registration_test",
    name: "Test User",
    username: null,
    phone: "0790000000",
    email: null,
    passwordHash: "salt:hash",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: null,
  }),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  return {
    user: null,
    req: { protocol: "http", headers: {} } as TrpcContext["req"],
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("auth registration session", () => {
  beforeEach(() => vi.clearAllMocks());

  it("issues a signed session when JWT_SECRET is empty in development", async () => {
    const ctx = context();
    const result = await appRouter.createCaller(ctx).auth.register({
      name: "Test User",
      phone: "0790000000",
      password: "secure-pass",
    });

    const cookie = vi.mocked(ctx.res.cookie);
    expect(cookie).toHaveBeenCalled();
    const sessionToken = cookie.mock.calls[0]?.[1];
    expect(typeof sessionToken).toBe("string");
    expect(sessionToken).toMatch(/^[^\.]+\.[^\.]+\.[^\.]+$/);
    expect(result).toMatchObject({ id: 9, openId: "local_registration_test", name: "Test User" });
    expect(result).not.toHaveProperty("passwordHash");
  });
});
