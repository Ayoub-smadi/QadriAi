import { z } from "zod";
import { getAgriculturalProfile, listPublishedKnowledge, savePlantAnalysis } from "../db";
import { invokeLLM, listLLMModels } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

const messageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2500) });

const SAFETY_INSTRUCTIONS = `You are Al-Qadri's helpful, careful assistant. Answer the user's question directly, in Arabic by default and in English when the user writes in English. You can answer general questions as well as questions about crops, trees, houseplants, soil, irrigation, pruning, propagation, planting, pests, diseases, harvest, landscaping, farm planning, and agricultural economics. Do not reject a question merely because it is outside agriculture; answer it normally when safe, and briefly state uncertainty when the topic needs specialist context.

Accuracy protocol: answer the user's actual question first, then give practical steps. Use the supplied agricultural profile and the retrieved knowledge context as primary grounding. Distinguish clearly between observed facts, likely causes, and hypotheses. Do not invent a species-specific fact, local regulation, product label, weather condition, or treatment result. When the answer depends on plant species, cultivar, growth stage, season, climate, soil, water quality, or symptoms, say what is missing and ask no more than three focused follow-up questions while still giving safe first steps. Use units and ranges only when well-supported, and explain that local conditions can change them. For pruning or planting advice, state the timing and the reason. For watering advice, explain how to check soil/root-zone moisture instead of prescribing a blind schedule.

Safety protocol: do not claim a certain disease from text or a single image; present differential possibilities and what evidence would separate them. Do not prescribe pesticide brands, exact pesticide doses, unsafe chemical combinations, or off-label uses. Recommend reading the local product label and consulting a licensed local agricultural expert before any chemical intervention. Escalate clearly for rapid spread, severe wilting, unknown toxicity, contaminated water or soil, food-safety risk, protected or regulated species, or risk to people, animals, pollinators, or groundwater. For simple low-risk questions, answer directly without unnecessary alarm. For non-agricultural questions, remain helpful and concise. For medical, legal, financial, or other high-stakes personal decisions, provide general information and recommend a qualified professional rather than pretending to diagnose or decide for the user. When the question involves plants, crops, trees, soil, irrigation, chemicals, food safety, or agricultural risk, end in the user's language with a concise disclaimer: Arabic: "تنبيه: الإرشاد الذكي مساعد ولا يغني عن فحص مهندس زراعي محلي عند الحالات الحساسة أو الحرجة." English: "Note: AI guidance is an aid and does not replace an assessment by a local agricultural professional for sensitive or critical cases." Do not add an agricultural disclaimer to ordinary general questions.`;

const LOCAL_KNOWLEDGE_CONTEXT = `
- الزيتون: يتحمل الجفاف نسبيًا بعد التأسيس، لكن اختيار الصنف والإنتاج يتأثران بملوحة المياه والصرف والتقليم والآفات. افحص الملوحة والصرف قبل زيادة الري أو التسميد.
- نخيل التمر: ملائم للحرارة، لكن جودة المياه والملوحة والصرف والتلقيح والإدارة الموسمية تؤثر في الإنتاج. لا تُعمّم جدول ري دون معرفة التربة والمناخ وعمر النخلة.
- البندورة: تحتاج ضوءًا جيدًا وصرفًا مناسبًا وريًا منتظمًا دون تشبع مستمر. راقب أسفل الأوراق، النمو الحديث، والانتشار قبل ترجيح سبب المرض.
- الري بالتنقيط: يحسّن توصيل الماء لمنطقة الجذور، لكنه يحتاج ترشيحًا وضبط ضغط وتقسيم قطاعات وفحص انسداد النقاطات.
- البياض الدقيقي والمنّ: قد تتشابه أعراضهما مع إجهاد بيئي أو مشاكل ري؛ اعزل النبات المصاب إن أمكن، حسّن التهوية، وثبّت التشخيص قبل أي مبيد.
- في المناطق الحارة والجافة: الماء والملوحة والحرارة والرياح عوامل مترابطة؛ اجمع قياسات الموقع قبل اعتماد خطة زراعة أو ري.`;

const PREFERRED_MODELS = ["gpt-5", "gemini-3.1-pro-preview", "gemini-3-flash-preview", "gpt-5-mini", "gpt-5-nano"];

async function chooseConsultationModels() {
  try {
    const models = await listLLMModels();
    const available = new Set(models.data.map(model => model.id));
    const candidates = PREFERRED_MODELS.filter(model => available.has(model));
    if (candidates.length) return candidates;
    if (models.data[0]?.id) return [models.data[0].id];
  } catch (error) {
    console.warn("[AI] Model catalog unavailable; trying known models and default fallback", error);
  }
  return PREFERRED_MODELS;
}

async function buildKnowledgeContext() {
  try {
    const published = await listPublishedKnowledge();
    if (published.length) {
      return JSON.stringify(published.slice(0, 12).map(item => ({ nameAr: item.nameAr, nameEn: item.nameEn, scientificName: item.scientificName, summaryAr: item.summaryAr, summaryEn: item.summaryEn, growingData: item.growingData })));
    }
  } catch (error) {
    console.warn("[AI] Knowledge context unavailable; using local safety notes", error);
  }
  return LOCAL_KNOWLEDGE_CONTEXT;
}

function addLanguageDisclaimer(content: string, userQuestion: string) {
  const isArabic = /[\u0600-\u06FF]/.test(userQuestion);
  const agriculturalTopic = /(زراع|نبات|شجر|محصول|تربة|ري|مبيد|آفة|مرض|تقلي|غرس|بذور|سماد|زرع|plant|tree|crop|soil|irrigat|pesticide|prun|seed|fertil|farm|agricultur)/i.test(userQuestion);
  if (!agriculturalTopic) return content.trim();
  const disclaimer = isArabic ? "تنبيه: الإرشاد الذكي مساعد ولا يغني عن فحص مهندس زراعي محلي عند الحالات الحساسة أو الحرجة." : "Note: AI guidance is an aid and does not replace an assessment by a local agricultural professional for sensitive or critical cases.";
  return content.includes(disclaimer) ? content : `${content.trim()}\n\n${disclaimer}`;
}

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
    let profile;
    try {
      profile = await getAgriculturalProfile(ctx.user.id);
    } catch (error) {
      console.warn("[AI] Agricultural profile unavailable; continuing without it", error);
    }
    const profileContext = profile ? JSON.stringify({ country: profile.country, city: profile.city, region: profile.region, landArea: profile.landArea, landType: profile.landType, soilType: profile.soilType, waterSource: profile.waterSource, waterQuality: profile.waterQuality, irrigationSystem: profile.irrigationSystem, currentPlants: profile.currentPlants, currentCrops: profile.currentCrops, landGoal: profile.landGoal, budgetRange: profile.budgetRange }) : "No saved agricultural profile yet.";
    const knowledgeContext = await buildKnowledgeContext();
    const latestQuestion = input.messages.at(-1)?.content ?? "";
    const candidates = await chooseConsultationModels();
    const consultationMessages = [
      { role: "system" as const, content: `${SAFETY_INSTRUCTIONS}\nRetrieved agricultural knowledge context (use it as grounding, not as permission to invent missing details): ${knowledgeContext}\nUser agricultural profile: ${profileContext}` },
      ...input.messages,
    ];
    let content = "";
    for (const model of candidates) {
      try {
        const response = await invokeLLM({ model, ...(model.startsWith("gpt-5") ? { maxCompletionTokens: 2200, reasoning: { effort: "low" } } : { maxTokens: 2200 }), messages: consultationMessages });
        content = extractTextContent(response.choices[0]?.message?.content);
        if (content) break;
      } catch (error) {
        console.warn(`[AI] consultation model ${model} failed; trying fallback`, error);
      }
    }
    if (!content) {
      try {
        const response = await invokeLLM({ maxTokens: 2200, messages: consultationMessages });
        content = extractTextContent(response.choices[0]?.message?.content);
      } catch (error) {
        console.warn("[AI] Default model fallback failed", error);
      }
    }
    if (!content) throw new Error("The AI service is temporarily unavailable. Please try again shortly.");
    return { content: addLanguageDisclaimer(content, latestQuestion) };
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
