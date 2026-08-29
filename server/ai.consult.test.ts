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
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import { appRouter } from "./routers";
import { savePlantAnalysis } from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
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
    const result = await appRouter.createCaller(context()).ai.consult({ messages: [{ role: "user", content: "كيف أبدأ زراعة الزيتون؟" }] });
    expect(result.content).toContain("ابدأ بفحص الرطوبة والصرف");
    expect(result.content).toContain("استشر مختصًا");
    expect(result.content).toContain("تنبيه: الإرشاد الذكي مساعد ولا يغني عن فحص مهندس زراعي محلي");
  });

  it("answers general questions without an agricultural refusal or forced disclaimer", async () => {
    const result = await appRouter.createCaller(context()).ai.consult({ messages: [{ role: "user", content: "ما هي عاصمة الأردن؟" }] });
    expect(result.content).not.toContain("تنبيه: الإرشاد الذكي مساعد ولا يغني عن فحص مهندس زراعي محلي");
  });
});

describe("ai.generateDesign natural-language layout", () => {
  it("preserves requested counts and spacing from an Arabic farm brief", async () => {
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({
        title: "مزرعة البيوت البلاستيكية والبركة",
        mode: "landscape",
        elements: [
          { id: "greenhouse-1", kind: "greenhouse", x: 150, y: 150, quantity: 1, rotation: 0 },
          { id: "greenhouse-2", kind: "greenhouse", x: 270, y: 150, quantity: 1, rotation: 0 },
          { id: "greenhouse-3", kind: "greenhouse", x: 150, y: 250, quantity: 1, rotation: 0 },
          { id: "greenhouse-4", kind: "greenhouse", x: 270, y: 250, quantity: 1, rotation: 0 },
          { id: "pond-1", kind: "pond", x: 450, y: 200, quantity: 1, rotation: 0 },
        ],
        measurements: [{ id: "spacing-1", start: { x: 198, y: 150 }, end: { x: 198, y: 170 }, distance: 1 }],
        summaryAr: "أربع بيوت بلاستيكية مستقلة مع مسافة متر بينها وبركة ماء بجانبها.",
        summaryEn: "Four separate greenhouses with one meter spacing and a water pond beside them.",
      }) } }],
    } as any);

    const result = await appRouter.createCaller(context()).ai.generateDesign({
      description: "بدي مزرعة فيها أربع بيوت بلاستيك بينهم متر مسافة وجنبهم بركة ماء",
      language: "ar",
      siteWidth: 30,
      siteLength: 20,
    });

    expect(result.mode).toBe("landscape");
    expect(result.elements.filter(element => element.kind === "greenhouse")).toHaveLength(4);
    expect(result.elements.find(element => element.kind === "pond")).toBeTruthy();
    expect(result.measurements[0]?.distance).toBe(1);
    expect(result.summaryAr).toContain("أربع بيوت");
  });
});

describe("ai.diagnose storage fallback", () => {
  it("continues with inline image analysis when storage presigning fails", async () => {
    vi.mocked(storagePut).mockRejectedValueOnce(new Error("Storage presign failed (404): 404 page not found"));
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({
        likelyPlant: "Tomato",
        confidence: 72,
        urgency: "monitor",
        observations: ["Leaf discoloration"],
        possibleCauses: ["Water stress"],
        safeNextSteps: ["Check root-zone moisture"],
        prevention: ["Improve monitoring"],
        escalationNotice: "Consult a local agricultural expert if symptoms spread.",
        limitations: "A photo cannot confirm the cause.",
      }) } }],
    } as any);

    const result = await appRouter.createCaller(context()).ai.diagnose({
      imageDataUrl: `data:image/png;base64,${"a".repeat(40)}`,
      mimeType: "image/png",
      note: "The leaves look pale.",
    });

    expect(result.imageUrl).toBeNull();
    expect(result.likelyPlant).toBe("Tomato");
    expect(savePlantAnalysis).toHaveBeenCalledWith(1, expect.objectContaining({ imageKey: null, imageUrl: null }));
  });
});
