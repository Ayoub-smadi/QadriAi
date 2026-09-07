type ChatRole = "user" | "assistant";

type ConsultMessage = {
  role: ChatRole;
  content: string;
};

type ConsultAttachment = {
  type: "image" | "audio";
  dataUrl: string;
  mimeType?: string;
  name?: string;
};

const OPENAI_API_URL = "https://api.openai.com/v1";
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const AUDIO_MIME_TYPES = new Set([
  "audio/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/ogg",
  "audio/mp4",
  "audio/m4a",
]);

const SAFETY_INSTRUCTIONS = `You are Al-Qadri's careful agricultural assistant. Answer directly in Arabic by default and in English when the user writes in English. Help with crops, trees, houseplants, soil, irrigation, pruning, propagation, planting, pests, diseases, harvest, landscaping, and farm planning. Do not invent facts, local regulations, product labels, weather, or treatment results.

Answer the user's actual question first, then give practical steps. Distinguish observed facts, likely causes, and hypotheses. If the answer depends on plant species, growth stage, season, climate, soil, water quality, or symptoms, say what is missing and ask no more than three focused follow-up questions while still giving safe first steps. For watering advice, explain how to check root-zone moisture instead of prescribing a blind schedule.

Do not claim a certain disease from text or a single image. Do not recommend pesticide brands, exact doses, unsafe combinations, or off-label uses. Recommend reading the local product label and consulting a licensed local agricultural expert before chemical intervention. Escalate for rapid spread, severe wilting, unknown toxicity, contaminated water or soil, food-safety risk, or danger to people, animals, pollinators, or groundwater.`;

const LOCAL_KNOWLEDGE_CONTEXT = `Useful grounding:
- Olive trees tolerate drought after establishment, but cultivar, water salinity, drainage, pruning, and pests affect production.
- Tomatoes need good light, drainage, and consistent watering without prolonged saturation.
- Drip irrigation needs filtration, pressure control, sectoring, and emitter checks.
- Powdery mildew and aphids can resemble environmental or irrigation stress; inspect before treatment.
- In hot, dry areas, water, salinity, heat, and wind interact, so collect site measurements before a crop or irrigation plan.`;

function fail(message: string): never {
  throw new Error(message);
}

function decodeDataUrl(dataUrl: string, kind: "image" | "audio") {
  const match = dataUrl.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) fail(kind === "image" ? "الصورة المرفقة غير صالحة." : "التسجيل الصوتي المرفق غير صالح.");
  const mimeType = match[1].toLowerCase();
  const allowed = kind === "image" ? IMAGE_MIME_TYPES : AUDIO_MIME_TYPES;
  if (!allowed.has(mimeType)) {
    fail(kind === "image" ? "استخدم صورة JPG أو PNG أو WebP." : "استخدم تسجيلًا صوتيًا بصيغة WebM أو MP3 أو WAV أو M4A.");
  }
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length) fail(kind === "image" ? "تعذر قراءة الصورة المرفقة." : "تعذر قراءة التسجيل الصوتي.");
  return { mimeType, bytes };
}

function extractText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map(part => part && typeof part === "object" && "text" in part && typeof part.text === "string" ? part.text : "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function openAiRequest(path: string, init: RequestInit) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) fail("خدمة المهندس الذكي غير مهيأة حاليًا. أضف مفتاح OpenAI في إعدادات الخادم.");

  const response = await fetch(`${OPENAI_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("[AI] OpenAI request failed", response.status, payload?.error?.code || payload?.error?.type || "unknown");
    throw new Error("تعذر الحصول على رد من خدمة المهندس الذكي الآن. حاول مرة أخرى بعد قليل.");
  }
  return payload;
}

async function transcribeAudio(attachment: ConsultAttachment, language?: string) {
  const { mimeType, bytes } = decodeDataUrl(attachment.dataUrl, "audio");
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mimeType }), attachment.name || "question.webm");
  form.append("model", "gpt-4o-mini-transcribe");
  if (language === "ar" || language === "en") form.append("language", language);
  const payload = await openAiRequest("/audio/transcriptions", { method: "POST", body: form });
  const text = typeof payload?.text === "string" ? payload.text.trim() : "";
  if (!text) fail("تعذر تحويل التسجيل الصوتي إلى نص.");
  return text;
}

function addDisclaimer(content: string, question: string, language: string) {
  const isAgricultural = /(زراع|نبات|شجر|محصول|تربة|ري|مبيد|آفة|مرض|تقلي|غرس|بذور|سماد|زرع|plant|tree|crop|soil|irrigat|pesticide|prun|seed|fertil|farm|agricultur)/i.test(question);
  if (!isAgricultural) return content.trim();
  const disclaimer = language === "en"
    ? "Note: AI guidance is an aid and does not replace an assessment by a local agricultural professional for sensitive or critical cases."
    : "تنبيه: الإرشاد الذكي مساعد ولا يغني عن فحص مهندس زراعي محلي عند الحالات الحساسة أو الحرجة.";
  return content.includes(disclaimer) ? content.trim() : `${content.trim()}\n\n${disclaimer}`;
}

export async function consultAgricultural(input: any) {
  const messages = Array.isArray(input?.messages) ? input.messages : [];
  if (messages.length < 1 || messages.length > 8) fail("أرسل سؤالًا واحدًا أو تابع المحادثة بسجل أقصر.");

  const safeMessages: ConsultMessage[] = messages.map((message: any) => {
    if (!["user", "assistant"].includes(message?.role) || typeof message?.content !== "string") {
      fail("صيغة رسالة المهندس الذكي غير صالحة.");
    }
    const content = message.content.trim();
    if (!content || content.length > 2500) fail("السؤال يجب أن يكون بين حرف واحد و2500 حرف.");
    return { role: message.role, content };
  });

  const language = input?.language === "en" ? "en" : "ar";
  const attachments: ConsultAttachment[] = Array.isArray(input?.attachments) ? input.attachments.slice(0, 3) : [];
  const latestQuestion = safeMessages.at(-1)?.content || "";
  const attachmentText: string[] = [];
  const imageParts: Array<{ type: "image_url"; image_url: { url: string; detail: "high" } }> = [];

  for (const attachment of attachments) {
    if (!attachment || !["image", "audio"].includes(attachment.type) || typeof attachment.dataUrl !== "string") {
      fail("المرفق المرسل غير صالح.");
    }
    if (attachment.type === "image") {
      const { bytes } = decodeDataUrl(attachment.dataUrl, "image");
      if (bytes.length > 4 * 1024 * 1024) fail("حجم الصورة يجب أن يكون أقل من 4 ميغابايت.");
      imageParts.push({ type: "image_url", image_url: { url: attachment.dataUrl, detail: "high" } });
      attachmentText.push("حلّل الصورة المرفقة مع السؤال، واذكر ما تلاحظه وما لا يمكن تأكيده منها.");
    } else {
      attachmentText.push(`نص التسجيل الصوتي: ${await transcribeAudio(attachment, language)}`);
    }
  }

  const questionText = [latestQuestion, ...attachmentText].filter(Boolean).join("\n\n") || "أجب عن المرفقات المرسلة واطلب توضيحًا إذا لم يكن السؤال واضحًا.";
  const conversation = [
    { role: "system", content: `${SAFETY_INSTRUCTIONS}\n${LOCAL_KNOWLEDGE_CONTEXT}` },
    ...safeMessages.slice(0, -1),
    { role: "user", content: [{ type: "text", text: questionText }, ...imageParts] },
  ];

  const payload = await openAiRequest("/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-5-mini",
      max_completion_tokens: 2200,
      messages: conversation,
    }),
  });
  const content = extractText(payload?.choices?.[0]?.message?.content);
  if (!content) fail("وصل رد فارغ من خدمة المهندس الذكي. حاول صياغة السؤال بطريقة أخرى.");
  return { content: addDisclaimer(content, questionText, language) };
}