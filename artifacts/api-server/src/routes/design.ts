import { Router, type IRouter } from "express";
import { generateAgriculturalImage, getStoredImageUrl, type OriginalImage } from "../lib/image-generation";

const router: IRouter = Router();
const IMAGE_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function buildPrompt(description: string, mode: string, style: string, siteAnalysis: string) {
  const modeLabel = mode === "irrigation" ? "irrigation network and farm infrastructure" : mode === "farm" ? "productive agricultural land" : "farm courtyard and agricultural landscape";
  const styleLabel = style === "modern" ? "modern, highly organized agricultural planning" : style === "arabic" ? "authentic Arabic/Mediterranean rural character" : style === "natural" ? "regenerative natural farming and biodiversity" : style === "traditional" ? "traditional rural farming character" : style === "productive" ? "high-yield productive crop garden" : "simple practical farm layout";
  return `Edit the provided site photograph into a NEW photorealistic agricultural design visualization. Preserve the exact original land boundaries, camera viewpoint, horizon, terrain, buildings, roads, and overall proportions, but visibly add the requested landscape elements. Do not return the original photo unchanged and do not replace the land with a generic stock scene.

Agricultural design type: ${modeLabel}.
Visual direction: ${styleLabel}.
User request, which must be implemented visibly and accurately: ${description}
Gemini Vision site analysis to guide the design: ${siteAnalysis}

For irrigation requests, show a believable irrigation system integrated into the field: mainline and branching drip lines following planting rows, subtle valves or filtration/pump equipment only when the request supports it, correct scale, and no exaggerated glowing lines. For crop requests, add healthy plants in realistic rows and spacing appropriate to the requested crop. Include trees, planting beds, grass, paths, seating, landscape features, irrigation zones, and sprinkler/drip points when requested or appropriate to the analysis. Keep existing empty areas where they are useful for access paths and service movement. Use realistic Mediterranean/Jordanian light, natural soil, physically plausible shadows, and professional agricultural visualization quality. No text, labels, watermarks, logos, diagrams, or UI elements. This is a concept visualization, not a construction-ready engineering plan.`;
}

async function analyzeSiteWithGemini(image: OriginalImage, description: string, language: "ar" | "en") {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("لم يتم ضبط GEMINI_API_KEY على الخادم.");
  const model = process.env.GEMINI_VISION_MODEL?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
  const prompt = language === "ar"
    ? `حلل صورة الموقع هذه قبل إنشاء تصميم لاندسكيب وري جديد. استخرج حدود الأرض والمنظور والعناصر القائمة والمناطق المفتوحة والطرق ومصادر الظل وأي قيود واضحة. اربط التحليل بطلب المستخدم التالي: ${description}. أعد خطة تصميم عملية مختصرة بلا نسب هندسية مخترعة.`
    : `Analyze this site photo before creating a new landscape and irrigation design. Extract land boundaries, viewpoint, existing elements, open areas, roads, shade, and visible constraints. Tie the analysis to this user request: ${description}. Return a concise practical design plan without inventing engineering measurements.`;
  const url = `${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: image.mimeType, data: image.b64Json } }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 900 } }) });
  const raw = await response.text();
  let data: any = {};
  try { data = JSON.parse(raw); } catch { /* handled below */ }
  if (!response.ok) throw new Error(`فشل تحليل صورة الموقع (${response.status}): ${data?.error?.message || raw.slice(0, 240)}`);
  const text = data?.candidates?.[0]?.content?.parts?.map((part: any) => typeof part?.text === "string" ? part.text : "").filter(Boolean).join("\n").trim();
  if (!text) throw new Error("لم يُرجع Gemini تحليلًا لصورة الموقع.");
  return text;
}

router.get("/design/image", async (req, res) => {
  try {
    const key = typeof req.query.key === "string" ? req.query.key : "";
    if (!key || key.length > 400) return res.status(400).json({ message: "رابط الصورة غير صالح." });
    const url = await getStoredImageUrl(key);
    return res.redirect(302, url);
  } catch (error) {
    console.error("[Design] image read failed", error);
    return res.status(404).json({ message: "تعذر فتح الصورة الناتجة." });
  }
});

router.post("/design/generate", async (req, res) => {
  try {
    const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";
    const mode = typeof req.body?.mode === "string" ? req.body.mode : "courtyard";
    const style = typeof req.body?.style === "string" ? req.body.style : "simple";
    const language = req.body?.language === "en" ? "en" : "ar";
    const imageDataUrl = typeof req.body?.imageDataUrl === "string" ? req.body.imageDataUrl : "";
    if (description.length < 8 || description.length > 1200) return res.status(400).json({ message: "اكتب وصفًا واضحًا للتصميم بين 8 و1200 حرفًا." });
    if (!imageDataUrl) return res.status(400).json({ message: "ارفع صورة الموقع أولًا حتى يتم تحليلها وإنشاء تصميم مبني عليها." });
    if (imageDataUrl.length > 18_000_000) return res.status(413).json({ message: "حجم صورة الموقع كبير جدًا. استخدم صورة أصغر من 13 ميغابايت تقريبًا." });
    const match = imageDataUrl.match(IMAGE_PATTERN);
    if (!match) return res.status(400).json({ message: "استخدم صورة JPG أو PNG أو WebP صالحة." });
    const originalImage: OriginalImage = { mimeType: match[1].toLowerCase(), b64Json: match[2] };
    const siteAnalysis = await analyzeSiteWithGemini(originalImage, description, language);
    const result = await generateAgriculturalImage(buildPrompt(description, mode, style, siteAnalysis), [originalImage]);
    return res.json({ imageUrl: result.imageUrl, siteAnalysis });
  } catch (error) {
    console.error("[Design] image generation failed", error);
    const message = error instanceof Error ? error.message : "تعذر إنشاء التصميم الآن.";
    return res.status(502).json({ message });
  }
});

export default router;
