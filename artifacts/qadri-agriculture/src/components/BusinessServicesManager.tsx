import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getBusinessServices, getBusinessServicesRemote, saveBusinessServices, type BusinessServiceImage } from "@/data/businessServices";
import { ImagePlus, Save, Upload } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";

function readImage(file: File, onLoad: (src: string) => void) {
  const url = URL.createObjectURL(file); const image = new Image();
  image.onload = () => { const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight)); const canvas = document.createElement("canvas"); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale); canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url); onLoad(canvas.toDataURL("image/jpeg", .78)); };
  image.onerror = () => { URL.revokeObjectURL(url); toast.error("تعذر قراءة الصورة"); }; image.src = url;
}

export default function BusinessServicesManager() {
  const { user } = useAuth(); const { language } = useLanguage(); const [items, setItems] = useState<BusinessServiceImage[]>(() => getBusinessServices()); const [dirty, setDirty] = useState(false); const [saving, setSaving] = useState(false);
  useEffect(() => { void getBusinessServicesRemote().then(setItems).catch(() => undefined); }, []);
  if (user?.role !== "admin") return null;
  const selectImage = (index: number) => (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file || !file.type.startsWith("image/")) return toast.error(language === "ar" ? "اختَر صورة صحيحة" : "Choose a valid image"); readImage(file, src => { setItems(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, src } : item)); setDirty(true); }); };
  const save = async () => { if (!dirty || saving) return; setSaving(true); try { const result = await saveBusinessServices(items); setItems(result); setDirty(false); toast.success(language === "ar" ? "تم حفظ صور الخدمات" : "Service images saved"); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر الحفظ"); } finally { setSaving(false); } };
  return <section className="mt-6 rounded-[1.6rem] border border-[#35530e]/10 bg-white p-5 sm:p-6" dir={language === "ar" ? "rtl" : "ltr"}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{language === "ar" ? "خدمات القادري" : "AL-QADRI SERVICES"}</p><h2 className="mt-1 text-xl font-bold text-[#314617]">{language === "ar" ? "تغيير صور الخدمات" : "Change service images"}</h2><p className="mt-2 text-sm text-[#718062]">{language === "ar" ? "الأدمن فقط يستطيع تغيير الصور الظاهرة في الصفحة الرئيسية." : "Only admins can change the images shown on the homepage."}</p></div><Button type="button" onClick={save} disabled={!dirty || saving} className="h-10 rounded-xl bg-[#35530e] text-white hover:bg-[#294108]"><Save className="me-2 size-4" />{saving ? (language === "ar" ? "جارٍ الحفظ" : "Saving") : (language === "ar" ? "حفظ الصور" : "Save images")}</Button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{items.map((item, index) => <article key={item.id} className="overflow-hidden rounded-2xl border border-[#dbe7d5] bg-[#f8fbf6]"><img src={item.src} alt={language === "ar" ? item.ar : item.en} className="h-40 w-full object-cover" /><div className="flex items-center justify-between gap-2 p-3"><span className="text-sm font-bold text-[#405525]">{language === "ar" ? item.ar : item.en}</span><label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#b9d0a7] bg-white px-2.5 py-2 text-xs font-bold text-[#35530e]"><Upload className="size-3.5" />{language === "ar" ? "تغيير" : "Change"}<input type="file" accept="image/*" onChange={selectImage(index)} className="hidden" /></label></div></article>)}</div><p className="mt-4 flex items-center gap-2 text-xs text-[#718062]"><ImagePlus className="size-3.5" />{language === "ar" ? "التغييرات لا تظهر للزوار قبل الضغط على حفظ الصور." : "Changes are not public until you click Save images."}</p></section>;
}
