import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, getProjectForUser: vi.fn(), getAgriculturalProfile: vi.fn() };
});

import { appRouter } from "./routers";
import { getAgriculturalProfile, getProjectForUser } from "./db";
import type { TrpcContext } from "./_core/context";

function userContext(): TrpcContext {
  return {
    user: { id: 21, openId: "project-gate-user", name: "Project Gate User", email: "project@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("AI project-draft safety gate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not invoke AI plan generation when no agricultural profile is saved", async () => {
    vi.mocked(getProjectForUser).mockResolvedValue({ id: 7, userId: 21, projectType: "irrigation", title: "Small garden irrigation", siteData: { note: "home garden" }, aiDraft: null, status: "draft", createdAt: new Date(), updatedAt: new Date() });
    vi.mocked(getAgriculturalProfile).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(userContext());

    await expect(caller.workspace.project.generateDraft({ projectId: 7 })).rejects.toThrow("Complete your agricultural profile");
  });

  it("requires known soil, water, area, location and goal fields before a draft", async () => {
    vi.mocked(getProjectForUser).mockResolvedValue({ id: 8, userId: 21, projectType: "farmPlan", title: "Farm plan", siteData: {}, aiDraft: null, status: "draft", createdAt: new Date(), updatedAt: new Date() });
    vi.mocked(getAgriculturalProfile).mockResolvedValue({ id: 1, userId: 21, country: "Jordan", city: null, region: null, userType: null, hasFarm: "yes", hasGarden: "no", landArea: null, landType: null, soilType: null, waterSource: null, waterQuality: null, irrigationSystem: null, currentPlants: null, currentCrops: null, landGoal: null, budgetRange: null, extraNotes: null, profileComplete: "draft", updatedAt: new Date() });
    const caller = appRouter.createCaller(userContext());

    await expect(caller.workspace.project.generateDraft({ projectId: 8 })).rejects.toThrow("Missing: land area, soil type, water source, goal");
  });
});

describe("explainable selection output", () => {
  it("includes quantity, cost, and irrigation context rather than only a plant name", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
    const result = await caller.planner.evaluate({ country: "Jordan", area: "120 m²", soilType: "loam", waterSource: "tank", goal: "home harvest", season: "spring" });
    expect(result.entries[0]).toMatchObject({ tier: "recommended", quantities: expect.any(String), costs: expect.any(String), irrigation: expect.any(String) });
  });
});
