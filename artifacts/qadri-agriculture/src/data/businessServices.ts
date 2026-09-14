export type BusinessServiceImage = { id: string; src: string; ar: string; en: string };

export const defaultBusinessServices: BusinessServiceImage[] = [
  { id: "service-supply", src: "/assets/gallery-10-olive-nursery.jpeg", ar: "توريد المنتجات الزراعية", en: "Agricultural Supply" },
  { id: "service-projects", src: "/assets/gallery-16-garden-tree.jpeg", ar: "تأسيس المشاريع الزراعية", en: "Agricultural Projects" },
  { id: "service-trade", src: "/assets/qadri-traditional-rural.jpg", ar: "الاستيراد والتصدير", en: "Import & Export" },
  { id: "service-gardens", src: "/assets/qadri-garden-team.png", ar: "تنسيق الحدائق وصيانتها", en: "Garden Landscaping & Maintenance" },
];
const KEY = "al-qadri-business-services-v1";
const EVENT = "al-qadri-business-services-change";

function cache(items: BusinessServiceImage[]) { localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new CustomEvent(EVENT)); }
export function getBusinessServices() { try { const value = JSON.parse(localStorage.getItem(KEY) || "null"); return Array.isArray(value) && value.length === 4 ? value : defaultBusinessServices; } catch { return defaultBusinessServices; } }
async function request(input: Record<string, unknown> = {}) {
  const response = await fetch("/api/gallery?format=rest&operation=gallery", { method: "POST", credentials: "include", cache: "no-store", headers: { "content-type": "application/json", "cache-control": "no-cache" }, body: JSON.stringify({ ...input, collection: "services" }) });
  const data = await response.json().catch(() => null); if (!response.ok || data?.error || data?.[0]?.error) throw new Error(data?.error || "تعذر حفظ صور الخدمات"); return data?.user ?? data?.[0]?.result?.data?.json ?? data;
}
export async function getBusinessServicesRemote() { const result = await request({ action: "list", collection: "services" }); const items = Array.isArray(result) && result.length === 4 ? result as BusinessServiceImage[] : defaultBusinessServices; cache(items); return items; }
export async function saveBusinessServices(items: BusinessServiceImage[]) { const saved = await request({ action: "replace", collection: "services", images: items }); const result = Array.isArray(saved) ? saved as BusinessServiceImage[] : items; cache(result); return result; }
export function subscribeToBusinessServices(listener: () => void) { const handler = () => listener(); window.addEventListener("storage", handler); window.addEventListener(EVENT, handler); return () => { window.removeEventListener("storage", handler); window.removeEventListener(EVENT, handler); }; }
