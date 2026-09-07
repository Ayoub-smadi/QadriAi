import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
type Attachment = { type: "image" | "audio"; dataUrl: string; mimeType?: string; name?: string };

const errorCodes: Record<string, number> = {
  BAD_REQUEST: -32600,
  INTERNAL_SERVER_ERROR: -32603,
};

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

function openAiBase() {
  const configured = (process.env.OPENAI_API_BASE?.trim() || process.env.BUILT_IN_FORGE_API_URL?.trim() || "https://api.openai.com/v1").replace(/\/+$/, "");
  return configured.endsWith("/v1") ? configured : `${configured}/v1`;
}

function openAiKey() {
  return process.env.OPENAI_API_KEY?.trim() || process.env.BUILT_IN_FORGE_API_KEY?.trim() || "";
}

function modelName() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
}

function extractText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content.map(part => {
    if (typeof part === "string") return part;
    if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
    return "";
  }).filter(Boolean).join("\n").trim();
}

function buildSystemPrompt(language: string) {
  return language === "en"
    ? "You are Al-Qadri Smart Agriculture, a practical agricultural advisor. Answer in English unless the user clearly writes Arabic. Give useful, context-aware guidance about crops, irrigation, soil, trees, pruning, pests, and farm planning. Distinguish observations from possibilities, state missing information, and never claim certainty from a single image. Do not prescribe pesticide brands, exact chemical doses, or unsafe mixtures. For critical cases recommend a licensed local agricultural professional. Keep answers clear and actionable."
    : "أنت مستشار القادري الزراعي الذكي. أجب بالعربية ما لم يكتب المستخدم بالإنجليزية بوضوح. قدّم إرشادًا عمليًا ومناسبًا للسياق حول المحاصيل والري والتربة والأشجار والتقليم والآفات وتخطيط المزارع. ميّز بين الملاحظة والاحتمال، واذكر المعلومات الناقصة، ولا تدّعِ اليقين من صورة واحدة. لا تصف مبيدات تجارية أو جرعات كيميائية دقيقة أو خلطات غير آمنة. في الحالات الحرجة أو التي قد تسبب خسارة كبيرة أو خطرًا على الإنسان والحيوان، أوصِ بمهندس زراعي محلي مرخّص. اجعل الإجابة واضحة وقابلة للتطبيق.";
}

function normalizeMessages(messages: unknown, attachments: Attachment[], language: string): ChatMessage[] {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const normalized: ChatMessage[] = safeMessages
    .filter(item => item && typeof item === "object" && (item as { role?: unknown }).role && typeof (item as { content?: unknown }).content === "string")
    .slice(-8)
    .map(item => ({
      role: (item as { role: "user" | "assistant" | "system" }).role,
      content: String((item as { content: string }).content).slice(0, 12000),
    }));
  const last = normalized[normalized.length - 1];
  const imageParts = attachments.filter(item => item.type === "image" && /^data:image\/(jpeg|png|webp);base64,/i.test(item.dataUrl)).slice(0, 3);
  if (imageParts.length && last?.role === "user") {
    const text = last.content || (language === "en" ? "Analyze the attached agricultural image." : "حلّل الصورة الزراعية المرفقة.");
    normalized[normalized.length - 1] = {
      role: "user",
      content: JSON.stringify([
        { type: "text", text },
        ...imageParts.map(image => ({ type: "image_url", image_url: { url: image.dataUrl, detail: "high" } })),
      ]),
    };
  }
  return normalized;
}

async function callOpenAI(messages: ChatMessage[], language: string) {
  const key = openAiKey();
  if (!key) throw new Error("لم يتم ضبط OPENAI_API_KEY على الخادم.");
  const url = `${openAiBase()}/chat/completions`;
  const model = modelName();
  const payload = {
    model,
    messages: [
      { role: "system", content: buildSystemPrompt(language) },
      ...messages.map(message => {
        if (message.role !== "user" || !message.content.startsWith("[")) return message;
        try { return { role: "user", content: JSON.parse(message.content) }; } catch { return message; }
      }),
    ],
    ...(model.startsWith("gpt-5") ? { max_completion_tokens: 1800 } : { temperature: 0.2, max_tokens: 1800 }),
  };
  let response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok && response.status === 400) {
    const firstError = await response.clone().text().catch(() => "");
    if (/max_tokens|max_completion_tokens|temperature|unsupported/i.test(firstError)) {
      const fallback = { ...payload } as Record<string, unknown>;
      delete fallback.temperature;
      delete fallback.max_tokens;
      fallback.max_completion_tokens = 1800;
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify(fallback),
      });
    }
  }
  const raw = await response.text();
  let data: { choices?: Array<{ message?: { content?: unknown } }>; error?: { message?: string } } = {};
  try { data = JSON.parse(raw) as typeof data; } catch { /* handled below */ }
  if (!response.ok) {
    const upstream = data.error?.message || raw.slice(0, 240) || response.statusText;
    throw new Error(`فشل مزود الذكاء الاصطناعي (${response.status}): ${upstream}`);
  }
  const content = extractText(data.choices?.[0]?.message?.content);
  if (!content) throw new Error("أعاد مزود الذكاء الاصطناعي استجابة بلا نص.");
  return content;
}

router.post("/trpc/ai.consult", async (req, res) => {
  try {
    const input = inputFromRequest(req) as { messages?: unknown; attachments?: Attachment[]; language?: string };
    const messages = Array.isArray(input?.messages) ? input.messages : [];
    if (!messages.length) return sendError(res, "أرسل سؤالًا زراعيًا أولًا.", "BAD_REQUEST");
    const language = input?.language === "en" ? "en" : "ar";
    const content = await callOpenAI(normalizeMessages(messages, Array.isArray(input?.attachments) ? input.attachments : [], language), language);
    return sendSuccess(res, { content });
  } catch (error) {
    console.error("[AI] consultation failed", error);
    const message = error instanceof Error ? error.message : "تعذر الحصول على رد من خدمة الذكاء الاصطناعي.";
    return sendError(res, message);
  }
});

export default router;
