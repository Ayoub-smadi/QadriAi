import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
type Attachment = { type: "image" | "audio"; dataUrl: string; mimeType?: string; name?: string };
type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };

const errorCodes: Record<string, number> = { BAD_REQUEST: -32600, INTERNAL_SERVER_ERROR: -32603 };
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function inputFromRequest(req: Request) {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  return body?.["0"]?.json ?? body?.json ?? body;
}

function sendSuccess(res: Response, data: unknown) {
  return res.status(200).json([{ result: { data: { json: data } } }]);
}

function sendError(res: Response, message: string, code = "INTERNAL_SERVER_ERROR") {
  return res.status(200).json([{ error: { json: { message, code: errorCodes[code] ?? -32603, data: { code } } } }]);
}

function systemInstruction(language: "ar" | "en") {
  return language === "ar"
    ? "أنت القادري الزراعي الذكي، مساعد زراعي متخصص. أجب بلهجة أردنية عامية بسيطة ومفهومة، وباختصار شديد في صلب السؤال فقط: سطران كحد أقصى أو نقطتان قصيرتان، وبحد أقصى 35 كلمة. لا مقدمات ولا فلسفة ولا تكرار ولا مواضيع جانبية. لا تستخدم جداول أو مخططات أو مربعات كود. أعطِ الإجراء الأهم فقط، ولا تعطِ خلطات مبيدات أو جرعات كيميائية دقيقة."
    : "You are Al-Qadri Smart Agriculture, a ChatGPT-like assistant specialized only in agriculture. Answer mostly in English when the user writes English, clearly and practically. Help with crops, horticulture, irrigation, soil, trees, pests, plant diseases, pruning, greenhouses, and farm planning. For a plant image, structure the report with: 1) overall status (healthy / monitor / concerning) and a short reason, 2) visible observations, 3) ranked possible causes or diseases with approximate confidence, 4) possible nutrient deficiencies with evidence and a warning that an image cannot confirm them, 5) what to do in the next 48 hours, 6) a safe care and treatment plan, and 7) extra information or photos needed. If the request is outside agriculture, politely refuse and invite an agricultural question. Separate observations from possibilities and never claim a confirmed disease from one image. Do not provide pesticide mixtures or exact chemical doses; recommend a licensed local agronomist when risk or uncertainty is high. Ask for missing context and give safe actionable steps.";
}

function extractInlineData(dataUrl: string, fallbackMimeType?: string) {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(dataUrl || "");
  if (!match) return null;
  const mimeType = match[1] || fallbackMimeType || "application/octet-stream";
  if (!/^(image\/(jpeg|png|webp)|audio\/(webm|mpeg|mp3|wav|ogg|mp4|m4a))$/i.test(mimeType)) return null;
  return { mimeType, data: match[2] };
}

function geminiContents(messages: unknown, attachments: Attachment[]): Array<{ role: "user" | "model"; parts: GeminiPart[] }> {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const contents = safeMessages
    .filter(item => item && typeof item === "object" && (item as { role?: unknown }).role !== "system" && typeof (item as { content?: unknown }).content === "string")
    .slice(-10)
    .map(item => ({
      role: (item as { role: "user" | "assistant" }).role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: String((item as { content: string }).content).slice(0, 12000) }] as GeminiPart[],
    }));

  const last = contents[contents.length - 1];
  const images = attachments
    .filter(item => item?.type === "image")
    .slice(0, 3)
    .map(item => extractInlineData(item.dataUrl, item.mimeType))
    .filter((item): item is { mimeType: string; data: string } => Boolean(item));
  if (last?.role === "user" && images.length) {
    last.parts.push(...images.map(image => ({ inlineData: image })));
  }
  return contents;
}

function responseText(data: unknown): string {
  const candidates = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> })?.candidates;
  return candidates?.[0]?.content?.parts?.map(part => typeof part.text === "string" ? part.text : "").filter(Boolean).join("\n").trim() || "";
}

function compactAnswer(content: string, language: "ar" | "en") {
  if (language !== "ar") return content.trim();
  const cleaned = content.replace(/```[\s\S]*?```/g, "").replace(/^\s*(?:مرحبًا|أهلًا|أهلاً|بالتأكيد|طبعًا|يسعدني|إليك|بصفتي)[^.!؟\n]*[.!؟:]?\s*/i, "").trim();
  const lines = cleaned.split(/\n+/).map(line => line.replace(/^\s*[-*•#\d.)]+\s*/, "").trim()).filter(Boolean);
  const answer = lines.length > 1 ? lines.slice(0, 2).join("\n") : cleaned.split(/(?<=[.!؟])\s+/).filter(Boolean).slice(0, 2).join(" ");
  return answer.slice(0, 360).trim();
}

function latestUserText(messages: unknown): string {
  if (!Array.isArray(messages)) return "";
  const item = [...messages].reverse().find(value => value && typeof value === "object" && (value as { role?: unknown }).role === "user");
  return item && typeof (item as { content?: unknown }).content === "string" ? String((item as { content: string }).content).slice(0, 12000) : "";
}

function isImageRequest(messages: unknown, attachments: Attachment[]): boolean {
  // An attached plant photo is an analysis request, even when the prompt says
  // "image/photo". Only image-generation requests without an uploaded image
  // should use the image model.
  if (attachments.some(item => item?.type === "image")) return false;
  const text = latestUserText(messages).toLocaleLowerCase();
  return ["أعطني صورة", "اعطني صورة", "اعطيني صورة", "أعطيني صورة", "صمّم", "صمم", "أنشئ صورة", "انشئ صورة", "اعمل لي صورة", "ارسم", "generate an image", "generate a picture", "create an image", "create a picture", "design an image", "draw an image"].some(term => text.includes(term));
}

async function generateGeminiImage(prompt: string, language: "ar" | "en") {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("لم يتم ضبط GEMINI_API_KEY على الخادم.");
  const model = process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-3.1-flash-image";
  const url = `${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({
    contents: [{ role: "user", parts: [{ text: `${language === "ar" ? "أنشئ صورة زراعية واقعية بناءً على الطلب التالي. لا تضف نصوصًا أو شعارات:" : "Generate a realistic agricultural image from this request. Do not add text or logos:"} ${prompt}` }] }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: "1:1" } },
  }) });
  const raw = await response.text();
  let data: any = {};
  try { data = JSON.parse(raw); } catch { /* handled below */ }
  if (!response.ok) throw new Error(`فشل توليد الصورة (${response.status}): ${data?.error?.message || raw.slice(0, 240)}`);
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const images = parts.map((part: any) => part?.inlineData?.data && part?.inlineData?.mimeType ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "").filter(Boolean).slice(0, 2);
  const content = parts.map((part: any) => typeof part?.text === "string" ? part.text : "").filter(Boolean).join("\n").trim();
  if (!images.length) throw new Error("لم يُرجع Gemini صورة. جرّب وصفًا زراعيًا أكثر تحديدًا.");
  return { content: content || (language === "ar" ? "هذه صورة زراعية مولدة بناءً على طلبك." : "Here is an agricultural image generated from your request."), images };
}

async function callGemini(messages: unknown, attachments: Attachment[], language: "ar" | "en") {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("لم يتم ضبط GEMINI_API_KEY على الخادم.");
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
  const url = `${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction(language) }] },
      contents: geminiContents(messages, attachments),
      generationConfig: { temperature: 0.2, maxOutputTokens: 220 },
    }),
  });
  const raw = await response.text();
  let data: unknown = {};
  try { data = JSON.parse(raw); } catch { /* handled below */ }
  if (!response.ok) {
    const message = (data as { error?: { message?: string } })?.error?.message || raw.slice(0, 240) || response.statusText;
    throw new Error(`فشل اتصال Gemini (${response.status}): ${message}`);
  }
  const content = responseText(data);
  if (!content) throw new Error("أعاد Gemini استجابة بلا نص.");
  return compactAnswer(content, language);
}

router.post("/trpc/ai.consult", async (req, res) => {
  try {
    const input = inputFromRequest(req) as { messages?: unknown; attachments?: Attachment[]; language?: string };
    const messages = Array.isArray(input?.messages) ? input.messages : [];
    if (!messages.length) return sendError(res, "أرسل سؤالًا زراعيًا أولًا.", "BAD_REQUEST");
    const language = input?.language === "en" ? "en" : "ar";
    const attachments = Array.isArray(input?.attachments) ? input.attachments : [];
    const result = isImageRequest(messages, attachments)
      ? await generateGeminiImage(latestUserText(messages), language)
      : { content: await callGemini(messages, attachments, language), images: [] };
    return sendSuccess(res, result);
  } catch (error) {
    console.error("[AI] Gemini agricultural consultation failed", error);
    const message = error instanceof Error ? error.message : "تعذر الحصول على رد من Gemini.";
    return sendError(res, message);
  }
});

export default router;
