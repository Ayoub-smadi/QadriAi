import { randomUUID } from "node:crypto";

const forgeUrl = (process.env.BUILT_IN_FORGE_API_URL?.trim() || "").replace(/\/v1\/?$/, "").replace(/\/+$/, "");
const forgeKey = process.env.BUILT_IN_FORGE_API_KEY?.trim() || "";

function requireForgeConfig() {
  if (!forgeUrl || !forgeKey) {
    throw new Error("خدمة توليد الصور غير مهيأة على الخادم.");
  }
  return { forgeUrl, forgeKey };
}

async function storagePut(relKey: string, data: Buffer, contentType: string) {
  const { forgeUrl, forgeKey } = requireForgeConfig();
  const key = `${relKey.replace(/^\/+/, "")}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
  const presignUrl = new URL("v1/storage/presign/put", `${forgeUrl}/`);
  presignUrl.searchParams.set("path", key);
  const presignResponse = await fetch(presignUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!presignResponse.ok) throw new Error(`تعذر تجهيز تخزين الصورة (${presignResponse.status}).`);
  const { url } = (await presignResponse.json()) as { url?: string };
  if (!url) throw new Error("لم تُرجع خدمة التخزين رابطًا للصورة.");
  const uploadResponse = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: data });
  if (!uploadResponse.ok) throw new Error(`تعذر رفع الصورة الناتجة (${uploadResponse.status}).`);
  return { key };
}

export type OriginalImage = { b64Json: string; mimeType: string };

export async function getStoredImageUrl(key: string) {
  const { forgeUrl, forgeKey } = requireForgeConfig();
  const getUrl = new URL("v1/storage/presign/get", `${forgeUrl}/`);
  getUrl.searchParams.set("path", key.replace(/^\/+/, ""));
  const response = await fetch(getUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!response.ok) throw new Error(`تعذر فتح الصورة الناتجة (${response.status}).`);
  const payload = (await response.json()) as { url?: string };
  if (!payload.url) throw new Error("لم تُرجع خدمة التخزين رابط قراءة للصورة.");
  return payload.url;
}

export async function generateAgriculturalImage(prompt: string, originalImages: OriginalImage[]) {
  const { forgeUrl, forgeKey } = requireForgeConfig();
  const response = await fetch(new URL("images.v1.ImageService/GenerateImage", `${forgeUrl}/`), {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${forgeKey}`,
    },
    body: JSON.stringify({
      prompt,
      original_images: originalImages,
      model: "MODEL_GPT_IMAGE_2",
      quality: "medium",
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`فشل توليد التصميم (${response.status})${detail ? `: ${detail.slice(0, 240)}` : ""}`);
  }
  const result = (await response.json()) as { image?: { b64Json?: string; mimeType?: string } };
  const image = result.image;
  if (!image?.b64Json || !image.mimeType) throw new Error("خدمة الصور لم تُرجع صورة صالحة.");
  const buffer = Buffer.from(image.b64Json, "base64");
  const stored = await storagePut("generated/agricultural-design.png", buffer, image.mimeType);
  return { imageUrl: `/api/design/image?key=${encodeURIComponent(stored.key)}` };
}
