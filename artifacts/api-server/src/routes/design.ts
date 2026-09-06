import { Router, type IRouter } from "express";
import { generateAgriculturalImage, getStoredImageUrl, type OriginalImage } from "../lib/image-generation";

const router: IRouter = Router();
const IMAGE_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i;

function buildPrompt(description: string, mode: string, style: string) {
  const modeLabel = mode === "irrigation" ? "irrigation network and farm infrastructure" : mode === "farm" ? "productive agricultural land" : "farm courtyard and agricultural landscape";
  const styleLabel = style === "modern" ? "modern, highly organized agricultural planning" : style === "arabic" ? "authentic Arabic/Mediterranean rural character" : style === "natural" ? "regenerative natural farming and biodiversity" : style === "traditional" ? "traditional rural farming character" : style === "productive" ? "high-yield productive crop garden" : "simple practical farm layout";
  return `Edit the provided site photograph into a photorealistic agricultural design visualization. Preserve the exact original land boundaries, camera viewpoint, horizon, terrain, buildings, roads, and overall proportions. Do not replace the land with a generic stock scene and do not change the geology or architecture.

Agricultural design type: ${modeLabel}.
Visual direction: ${styleLabel}.
User request, which must be implemented visibly and accurately: ${description}

For irrigation requests, show a believable irrigation system integrated into the field: mainline and branching drip lines following planting rows, subtle valves or filtration/pump equipment only when the request supports it, correct scale, and no exaggerated glowing lines. For crop requests, add healthy plants in realistic rows and spacing appropriate to the requested crop. Keep existing empty areas where they are useful for access paths and service movement. Use realistic Mediterranean/Jordanian light, natural soil, physically plausible shadows, and professional agricultural visualization quality. No text, labels, watermarks, logos, diagrams, or UI elements in the image. This is a concept visualization, not a construction-ready engineering plan.`;
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
    const imageDataUrl = typeof req.body?.imageDataUrl === "string" ? req.body.imageDataUrl : "";
    if (description.length < 8 || description.length > 1200) {
      return res.status(400).json({ message: "اكتب وصفًا واضحًا للتصميم بين 8 و1200 حرفًا." });
    }
    if (imageDataUrl.length > 18_000_000) {
      return res.status(413).json({ message: "حجم صورة الموقع كبير جدًا. استخدم صورة أصغر من 13 ميغابايت تقريبًا." });
    }
    const originalImages: OriginalImage[] = [];
    if (imageDataUrl) {
      const match = imageDataUrl.match(IMAGE_PATTERN);
      if (!match) return res.status(400).json({ message: "استخدم صورة JPG أو PNG أو WebP صالحة." });
      originalImages.push({ mimeType: match[1].toLowerCase(), b64Json: match[2] });
    }
    const result = await generateAgriculturalImage(buildPrompt(description, mode, style), originalImages);
    return res.json({ imageUrl: result.imageUrl });
  } catch (error) {
    console.error("[Design] image generation failed", error);
    const message = error instanceof Error ? error.message : "تعذر إنشاء التصميم الآن.";
    return res.status(502).json({ message });
  }
});

export default router;
