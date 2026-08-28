import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getAgriculturalProfile: vi.fn().mockResolvedValue(undefined),
  listPublishedKnowledge: vi.fn().mockResolvedValue([]),
  savePlantAnalysis: vi.fn(),
}));
vi.mock("./_core/llm", () => ({
  listLLMModels: vi.fn().mockResolvedValue({ data: [{ id: "gpt-5-mini" }] }),
  invokeLLM: vi.fn().mockResolvedValue({ choices: [{ message: { content: [{ type: "text", text: "ابدأ بفحص الرطوبة والصرف." }, { type: "text", text: "تنبيه: استشر مختصًا عند الحالة الحرجة." }] } }] }),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(): TrpcContext {
  return {
    user: { id: 1, openId: "ai-test-user", name: "AI Test", email: "ai@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("ai.consult response normalization", () => {
  it("returns text when the gateway sends multipart text content", async () => {
    const result = await appRouter.createCaller(context()).ai.consult({ messages: [{ role: "user", content: "كيف أبدأ؟" }] });
    expect(result.content).toContain("ابدأ بفحص الرطوبة والصرف");
    expect(result.content).toContain("استشر مختصًا");
    expect(result.content).toContain("تنبيه: الإرشاد الذكي مساعد ولا يغني عن فحص مهندس زراعي محلي");
  });
});
