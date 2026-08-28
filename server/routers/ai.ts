import { z } from "zod";
import { getAgriculturalProfile, savePlantAnalysis } from "../db";
import { invokeLLM, listLLMModels } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

const messageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2500) });

const SAFETY_INSTRUCTIONS = `You are Al-Qadri Smart Agriculture's cautious agricultural assistant. Answer primarily in Arabic unless the user writes in English. You may use the user's agricultural profile as context, but state uncertainty when key site data is missing. Give practical, explainable guidance: observations, likely factors, safe next steps, and what data is needed. Do not claim a certain plant disease from text alone. Do not prescribe pesticide brands, exact pesticide doses, or unsafe chemical combinations. For potentially urgent crop loss, severe pest pressure, unknown toxicity, contaminated water, or any risk to people, animals, food, or groundwater, explicitly advise contacting a licensed local agricultural expert. Always end with this concise disclaimer in the user's language: "تنبيه: الإرشاد الذكي مساعد ولا يغني عن فحص مهندس زراعي محلي عند الحالات الحساسة أو الحرجة."`;

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content.map(part => {
    if (typeof part === "string") return part;
    if (part && typeof part === "object" && "type" in part && part.type === "text" && "text" in part && typeof part.text === "string") return part.text;
    return "";
  }).filter(Boolean).join("\n").trim();
}

export const aiRouter = router({
  consult: protectedProcedure.input(z.object({ messages: z.array(messageSchema).min(1).max(8) })).mutation(async ({ ctx, input }) => {
    const profile = await getAgriculturalProfile(ctx.user.id);
    const profileContext = profile ? JSON.stringify({ country: profile.country, city: profile.city, region: profile.region, landArea: profile.landArea, landType: profile.landType, soilType: profile.soilType, waterSource: profile.waterSource, waterQuality: profile.waterQuality, irrigationSystem: profile.irrigationSystem, currentPlants: profile.currentPlants, currentCrops: profile.currentCrops, landGoal: profile.landGoal, budgetRange: profile.budgetRange }) : "No saved agricultural profile yet.";
    const models = await listLLMModels();
    const available = new Set(models.data.map(model => model.id));
    const candidates = ["claude-sonnet-4-6", "gpt-5", "gemini-3-flash-preview", "gpt-5-mini"].filter(model => available.has(model));
    if (!candidates.length && models.data[0]?.id) candidates.push(models.data[0].id);
    if (!candidates.length) throw new Error("No AI model is currently available.");
    const consultationMessages = [
      { role: "system" as const, content: `${SAFETY_INSTRUCTIONS}\nYou can answer any question about farming, plants, trees, crops, soil, irrigation, pests, diseases, propagation, pruning, landscaping, and agricultural planning. If a question is outside agriculture, briefly explain that this assistant is specialized in agriculture and invite an agricultural question.\nUser agricultural profile: ${profileContext}` },
      ...input.messages,
    ];
    let content = "";
    for (const model of candidates) {
      try {
        const response = await invokeLLM({ model, maxTokens: 1200, messages: consultationMessages });
        content = extractTextContent(response.choices[0]?.message?.content);
        if (content) break;
      } catch (error) {
        console.warn(`[AI] consultation model ${model} failed; trying fallback`, error);
      }
    }
    if (!content) throw new Error("The AI service returned an empty answer. Please try again or use a more specific agricultural question.");
    return { content };
  }),
  diagnose: protectedProcedure.input(z.object({ imageDataUrl: z.string().min(30).max(5_500_000), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]), note: z.string().max(1200).optional() })).mutation(async ({ ctx, input }) => {
    const matches = input.imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!matches) throw new Error("Please upload a valid JPG, PNG, or WebP image.");
    const bytes = Buffer.from(matches[2], "base64");
    if (!bytes.length || bytes.length > 4_000_000) throw new Error("The image must be smaller than 4 MB.");
    const extension = input.mimeType === "image/png" ? "png" : input.mimeType === "image/webp" ? "webp" : "jpg";
    const stored = await storagePut(`plant-analyses/${ctx.user.id}/diagnosis.${extension}`, bytes, input.mimeType);
    const models = await listLLMModels();
    const model = models.data.find(item => item.id === "gemini-3-flash-preview")?.id ?? models.data.find(item => item.id === "gpt-5-mini")?.id ?? models.data[0]?.id;
    if (!model) throw new Error("No AI model is currently available.");
    const schema = {
      type: "object", properties: {
        likelyPlant: { type: "string" }, confidence: { type: "integer", minimum: 0, maximum: 100 }, urgency: { type: "string", enum: ["routine", "monitor", "critical"] },
        observations: { type: "array", items: { type: "string" } }, possibleCauses: { type: "array", items: { type: "string" } },
        safeNextSteps: { type: "array", items: { type: "string" } }, prevention: { type: "array", items: { type: "string" } },
        escalationNotice: { type: "string" }, limitations: { type: "string" },
      }, required: ["likelyPlant", "confidence", "urgency", "observations", "possibleCauses", "safeNextSteps", "prevention", "escalationNotice", "limitations"], additionalProperties: false,
    };
    const response = await invokeLLM({
      model,
      maxTokens: 1300,
      messages: [
        { role: "system", content: "You are a cautious agricultural image triage assistant. Respond in Arabic unless the note is English. Do not diagnose with certainty; distinguish observations from possible causes. Do not recommend pesticide brands, doses, or mixes. For severe wilting, rapidly spreading symptoms, food-safety risk, unknown toxicity, or likely crop-loss risk, set urgency to critical and clearly recommend a licensed local agricultural expert. Give only low-risk first actions such as isolation, observation, irrigation checks, photography, and local expert consultation. The image analysis is an assistant, not a field inspection." },
        { role: "user", content: [{ type: "text", text: `Analyze this plant image cautiously. User note: ${input.note ?? "No additional notes."}` }, { type: "image_url", image_url: { url: input.imageDataUrl, detail: "high" } }] },
      ],
      response_format: { type: "json_schema", json_schema: { name: "plant_triage", strict: true, schema } },
    });
    const raw = extractTextContent(response.choices[0]?.message?.content);
    if (!raw) throw new Error("The image analysis returned an empty result. Please try again.");
    const result = JSON.parse(raw) as { confidence: number; urgency: "routine" | "monitor" | "critical" } & Record<string, unknown>;
    await savePlantAnalysis(ctx.user.id, { imageKey: stored.key, imageUrl: stored.url, result, confidence: result.confidence, escalation: result.urgency });
    return { imageUrl: stored.url, ...result };
  }),
});
