import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "user" | "expert" | "admin" | null): TrpcContext {
  return {
    user: role ? { id: 42, openId: "test-user", name: "Test User", email: "test@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("agricultural planner", () => {
  it("returns explainable suitability tiers and named missing data", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    const result = await caller.planner.evaluate({ country: "Jordan", area: "250 m²", soilType: "loam", waterSource: "tank", goal: "home production", season: "spring" });

    expect(result.completeness).toBe(86);
    expect(result.entries).toHaveLength(3);
    expect(result.entries.map(item => item.tier)).toEqual(["recommended", "good", "caution"]);
    expect(result.missing).toContain("أبعاد الموقع الدقيقة");
  });
});

describe("control-center permissions", () => {
  it("does not permit a standard user to retrieve administrator metrics", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.control.summary()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not permit a standard user to retrieve the expert review queue", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.control.expertQueue()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
