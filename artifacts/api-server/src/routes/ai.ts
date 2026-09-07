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
    ? "أنت القادري الزراعي الذكي، مساعد زراعي متخصص مثل ChatGPT لكن في مجال الزراعة فقط. أجب بالعربية غالبًا وبأسلوب واضح وعملي. ساعد في المحاصيل، البستنة، الري، التربة، الأشجار، الآفات، الأمراض النباتية، التقليم، البيوت البلاستيكية وتخطيط المزارع. إذا كان السؤال خارج الزراعة فاعتذر بلطف واطلب سؤالًا زراعيًا. عند تحليل صورة، فرّق بين الملاحظة والاحتمال ولا تجزم بمرض من صورة واحدة. لا تعطِ خلطات مبيدات أو جرعات كيميائية دقيقة، واذكر الرجوع إلى مهندس زراعي محلي عند الخطر أو الشك. اسأل عن المعلومات الناقصة، وقدّم خطوات آمنة قابلة للتطبيق."
    : "You are Al-Qadri Smart Agriculture, a ChatGPT-like assistant specialized only in agriculture. Answer mostly in English when the user writes English, clearly and practically. Help with crops, horticulture, irrigation, soil, trees, pests, plant diseases, pruning, greenhouses, and farm planning. If the request is outside agriculture, politely refuse and invite an agricultural question. For images, separate observations from possibilities and never claim a confirmed disease from one image. Do not provide pesticide mixtures or exact chemical doses; recommend a licensed local agronomist when risk or uncertainty is high. Ask for missing context and give safe actionable steps.";
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
      generationConfig: { temperature: 0.25, maxOutputTokens: 1400 },
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
  return content;
}

router.post("/trpc/ai.consult", async (req, res) => {
  try {
    const input = inputFromRequest(req) as { messages?: unknown; attachments?: Attachment[]; language?: string };
    const messages = Array.isArray(input?.messages) ? input.messages : [];
    if (!messages.length) return sendError(res, "أرسل سؤالًا زراعيًا أولًا.", "BAD_REQUEST");
    const language = input?.language === "en" ? "en" : "ar";
    const attachments = Array.isArray(input?.attachments) ? input.attachments : [];
    const content = await callGemini(messages, attachments, language);
    return sendSuccess(res, { content });
  } catch (error) {
    console.error("[AI] Gemini agricultural consultation failed", error);
    const message = error instanceof Error ? error.message : "تعذر الحصول على رد من Gemini.";
    return sendError(res, message);
  }
});

export default router;
