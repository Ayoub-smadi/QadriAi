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
    ? "أنت القادري الزراعي الذكي، مساعد زراعي متخصص. أجب بالعربية بوضوح وعمليًا عن المحاصيل والبستنة والري والتربة والأشجار والآفات والأمراض النباتية والتقليم والبيوت البلاستيكية وتخطيط المزارع. عند وجود صورة نبات، أخرج تقريرًا نصيًا منظمًا بهذه العناوين: اسم النبات أو أقرب تعرّف، الحالة العامة وتقديرها (جيدة/تحتاج متابعة/مقلقة)، ما أراه في الصورة، الأمراض أو الآفات المحتملة مع درجة احتمال وصفية (منخفض/متوسط/مرتفع)، أعراض نقص العناصر والعناصر المحتمل نقصها، الأسباب المحتملة، ما يجب فعله الآن، توصيات العلاج الآمن، برنامج تسميد مبدئي، برنامج ري مبدئي، وما يلزم من معلومات أو فحوصات للتأكيد. اكتب دائمًا: تقدير بصري مبدئي وليس تحليلًا مخبريًا. لا تخترع نسب N أو P أو K أو قياسات دقيقة من صورة، ولا تؤكد مرضًا أو نقصًا من صورة واحدة. فرّق بين الملاحظة والاحتمال، ولا تعطِ خلطات مبيدات أو جرعات كيميائية دقيقة، وأوصِ بمهندس زراعي محلي عند الخطر أو الشك."
    : "You are Al-Qadri Smart Agriculture, a practical agricultural assistant. Answer clearly about crops, horticulture, irrigation, soil, trees, pests, plant diseases, pruning, greenhouses, and farm planning. When a plant image is present, return a structured text report with: plant name or closest identification, overall status and estimate (healthy/monitor/concerning), visible observations, possible diseases or pests with descriptive likelihood (low/medium/high), deficiency symptoms and potentially deficient elements, possible causes, immediate actions, safe treatment recommendations, an initial fertilization program, an initial irrigation program, and information or tests needed to confirm. Always state: preliminary visual estimate, not a laboratory analysis. Never invent N/P/K percentages or precise measurements from an image and never confirm a disease or deficiency from one image. Separate observations from possibilities, do not provide pesticide mixtures or exact chemical doses, and recommend a local agronomist when risk or uncertainty is high.";
}

function extractInlineData(dataUrl: string, fallbackMimeType?: string) {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(dataUrl || "");
  if (!match) return null;
  const mimeType = match[1] || fallbackMimeType || "application/octet-stream";
  if (!/^(image\/(jpeg|png|webp)|audio\/(webm|mpeg|mp3|wav|ogg|mp4|m4a))$/i.test(mimeType)) return null;
  const bytes = Buffer.byteLength(match[2], "base64");
  if (bytes > 8 * 1024 * 1024) return null;
  return { mimeType, data: match[2] };
}

function geminiContents(messages: unknown, attachments: Attachment[]): Array<{ role: "user" | "model"; parts: GeminiPart[] }> {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const contents = safeMessages
    .filter(item => item && typeof item === "object" && (item as ChatMessage).role !== "system" && typeof (item as ChatMessage).content === "string")
    .slice(-10)
    .map(item => ({ role: (item as ChatMessage).role === "assistant" ? "model" as const : "user" as const, parts: [{ text: String((item as ChatMessage).content).slice(0, 12000) }] as GeminiPart[] }));
  const last = contents[contents.length - 1];
  const images = attachments.filter(item => item?.type === "image").slice(0, 3).map(item => extractInlineData(item.dataUrl, item.mimeType)).filter((item): item is { mimeType: string; data: string } => Boolean(item));
  if (last?.role === "user" && images.length) last.parts.push(...images.map(image => ({ inlineData: image })));
  return contents;
}

function responseText(data: unknown): string {
  const candidates = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> })?.candidates;
  return candidates?.[0]?.content?.parts?.map(part => typeof part.text === "string" ? part.text : "").filter(Boolean).join("\n").trim() || "";
}

function latestUserText(messages: unknown): string {
  if (!Array.isArray(messages)) return "";
  const item = [...messages].reverse().find(value => value && typeof value === "object" && (value as ChatMessage).role === "user");
  return item && typeof (item as ChatMessage).content === "string" ? String((item as ChatMessage).content).slice(0, 12000) : "";
}

async function callGemini(messages: unknown, attachments: Attachment[], language: "ar" | "en") {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("لم يتم ضبط GEMINI_API_KEY على الخادم.");
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
  const url = `${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: systemInstruction(language) }] }, contents: geminiContents(messages, attachments), generationConfig: { temperature: 0.25, maxOutputTokens: 1800 } }) });
  const raw = await response.text();
  let data: unknown = {};
  try { data = JSON.parse(raw); } catch { /* handled below */ }
  if (!response.ok) {
    const message = (data as { error?: { message?: string } })?.error?.message || raw.slice(0, 240) || response.statusText;
    throw new Error(`فشل اتصال Gemini (${response.status}): ${message}`);
  }
  const content = responseText(data);
  if (!content) throw new Error("أعاد Gemini استجابة بلا نص.");
  return content;
}

router.post("/trpc/ai.consult", async (req, res) => {
  try {
    const input = inputFromRequest(req) as { messages?: unknown; attachments?: Attachment[]; language?: string };
    const messages = Array.isArray(input?.messages) ? input.messages : [];
    if (!messages.length) return sendError(res, "أرسل سؤالًا زراعيًا أولًا.", "BAD_REQUEST");
    const language = input?.language === "en" ? "en" : "ar";
    const attachments = Array.isArray(input?.attachments) ? input.attachments : [];
    const hasImage = attachments.some(item => item?.type === "image" && extractInlineData(item.dataUrl, item.mimeType));
    if (attachments.some(item => item?.type === "image") && !hasImage) return sendError(res, "تعذر قراءة الصورة. استخدم JPG أو PNG أو WebP بحجم أقل من 8 ميغابايت.", "BAD_REQUEST");
    return sendSuccess(res, { content: await callGemini(messages, attachments, language), images: [] });
  } catch (error) {
    console.error("[AI] Gemini agricultural consultation failed", error);
    const message = error instanceof Error ? error.message : "تعذر الحصول على رد من Gemini.";
    return sendError(res, message);
  }
});

export default router;
