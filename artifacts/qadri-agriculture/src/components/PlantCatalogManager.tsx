import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addCatalogPlant, getCatalog, removeCatalogPlant, updateCatalogPlant, type EditablePlant } from "@/data/plantCatalog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";

export default function PlantCatalogManager() {
  const { language } = useLanguage();
  const [plants, setPlants] = useState<EditablePlant[]>(() => getCatalog());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "", imagePath: "" });
  const refresh = () => setPlants(getCatalog());
  const startEdit = (plant: EditablePlant) => { setEditing(plant.id); setDraft({ nameAr: plant.nameAr, nameEn: plant.nameEn, descriptionAr: plant.description.ar, descriptionEn: plant.description.en, imagePath: plant.imagePath }); };
  const reset = () => { setEditing(null); setDraft({ nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "", imagePath: "" }); };
  const save = () => {
    if (!draft.nameAr.trim() || !draft.nameEn.trim()) return;
    const patch = { nameAr: draft.nameAr.trim(), nameEn: draft.nameEn.trim(), description: { ar: draft.descriptionAr.trim(), en: draft.descriptionEn.trim() }, imagePath: draft.imagePath.trim() || "/assets/olive.jpg" };
    if (editing) updateCatalogPlant(editing, patch); else addCatalogPlant(patch);
    reset(); refresh(); toast.success(language === "ar" ? "تم حفظ النبات" : "Plant saved");
  };
  return <section className="mt-6 rounded-[1.6rem] border border-[#35530e]/10 bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{language === "ar" ? "كتالوج عروض الأسعار" : "QUOTE CATALOG"}</p><h2 className="mt-1 text-xl font-bold text-[#314617]">{language === "ar" ? "إضافة وتعديل وحذف النباتات" : "Add, edit, and remove plants"}</h2><p className="mt-2 text-sm text-[#718062]">{language === "ar" ? "أي تعديل هنا يظهر مباشرة في صفحة عروض الأسعار واختيار النبات داخل العرض." : "Changes appear in the quote page and plant selector immediately."}</p></div><Button type="button" onClick={() => setDraft({ nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "", imagePath: "" })} className="rounded-xl bg-[#35530e] text-white hover:bg-[#294108]"><Plus className="me-2 size-4" />{language === "ar" ? "إضافة نبات" : "Add plant"}</Button></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{plants.map(plant => <article key={plant.id} className="flex gap-3 rounded-2xl bg-[#f7f9f3] p-3"><img src={plant.imagePath} alt="" className="size-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><h3 className="font-bold text-[#314617]">{language === "ar" ? plant.nameAr : plant.nameEn}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#718062]">{language === "ar" ? plant.description.ar : plant.description.en}</p><div className="mt-2 flex gap-2"><Button type="button" onClick={() => startEdit(plant)} variant="outline" className="h-8 rounded-lg px-3 text-xs">{language === "ar" ? "تعديل" : "Edit"}</Button><Button type="button" onClick={() => { if (window.confirm(language === "ar" ? "حذف النبات؟" : "Delete plant?")) { removeCatalogPlant(plant.id); refresh(); } }} variant="outline" className="h-8 rounded-lg border-[#e2bdb1] px-3 text-xs text-[#914f42]">{language === "ar" ? "حذف" : "Delete"}</Button></div></div></article>)}</div><div className="mt-5 grid gap-3 rounded-2xl border border-[#dce6d2] bg-[#fbfcf9] p-4 sm:grid-cols-2"><Input value={draft.nameAr} onChange={event => setDraft({ ...draft, nameAr: event.target.value })} placeholder="اسم النبات بالعربية" className="h-10 rounded-xl" /><Input value={draft.nameEn} onChange={event => setDraft({ ...draft, nameEn: event.target.value })} placeholder="Plant name in English" className="h-10 rounded-xl" /><Textarea value={draft.descriptionAr} onChange={event => setDraft({ ...draft, descriptionAr: event.target.value })} placeholder="الوصف بالعربية" className="min-h-24 rounded-xl" /><Textarea value={draft.descriptionEn} onChange={event => setDraft({ ...draft, descriptionEn: event.target.value })} placeholder="Description in English" className="min-h-24 rounded-xl" /><Input value={draft.imagePath} onChange={event => setDraft({ ...draft, imagePath: event.target.value })} placeholder="رابط الصورة أو مسارها" className="h-10 rounded-xl sm:col-span-2" /><Button type="button" onClick={save} className="h-10 rounded-xl bg-[#35530e] text-white sm:col-span-2">{editing ? (language === "ar" ? "حفظ التعديل" : "Save changes") : (language === "ar" ? "حفظ وإضافة" : "Save and add")}</Button></div></section>;
}
