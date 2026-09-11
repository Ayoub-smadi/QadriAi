import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addCatalogPlant, getCatalog, removeCatalogPlant, updateCatalogPlant, type EditablePlant } from "@/data/plantCatalog";
import { ImagePlus, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";

const blank = { nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "", imagePath: "" };

export default function PlantCatalogManager() {
  const { language } = useLanguage();
  const [plants, setPlants] = useState<EditablePlant[]>(() => getCatalog());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState(blank);
  const [open, setOpen] = useState(false);
  const refresh = () => setPlants(getCatalog());
  const startAdd = () => { setEditing(null); setDraft(blank); setOpen(true); };
  const startEdit = (plant: EditablePlant) => { setEditing(plant.id); setDraft({ nameAr: plant.nameAr, nameEn: plant.nameEn, descriptionAr: plant.description.ar, descriptionEn: plant.description.en, imagePath: plant.imagePath }); setOpen(true); };
  const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error(language === "ar" ? "اختَر ملف صورة فقط" : "Choose an image file"); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error(language === "ar" ? "حجم الصورة يجب ألا يتجاوز 8 ميغابايت" : "Image must be under 8 MB"); return; }
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSide = 1200;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      setDraft(current => ({ ...current, imagePath: canvas.toDataURL("image/jpeg", 0.82) }));
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); toast.error(language === "ar" ? "تعذر قراءة الصورة" : "Could not read image"); };
    image.src = objectUrl;
  };
  const save = () => {
    if (!draft.nameAr.trim() || !draft.nameEn.trim()) { toast.error(language === "ar" ? "اكتب اسم النبات بالعربي والإنجليزي" : "Enter Arabic and English names"); return; }
    const patch = { nameAr: draft.nameAr.trim(), nameEn: draft.nameEn.trim(), description: { ar: draft.descriptionAr.trim(), en: draft.descriptionEn.trim() }, imagePath: draft.imagePath.trim() || "/assets/olive.jpg" };
    if (editing) updateCatalogPlant(editing, patch); else addCatalogPlant(patch);
    refresh(); setOpen(false); setEditing(null); setDraft(blank);
    toast.success(language === "ar" ? (editing ? "تم تعديل النبات" : "تمت إضافة النبات") : (editing ? "Plant updated" : "Plant added"));
  };
  const remove = (plant: EditablePlant) => {
    if (!window.confirm(language === "ar" ? `هل تريد حذف ${plant.nameAr} نهائيًا من عروض الأسعار؟` : `Delete ${plant.nameEn} permanently from quotes?`)) return;
    removeCatalogPlant(plant.id); refresh(); toast.success(language === "ar" ? "تم حذف النبات من عروض الأسعار" : "Plant removed from quotes");
  };
  return <section className="mt-6 rounded-[1.6rem] border border-[#35530e]/10 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{language === "ar" ? "كتالوج عروض الأسعار" : "QUOTE CATALOG"}</p><h2 className="mt-1 text-xl font-bold text-[#314617]">{language === "ar" ? "إضافة وتعديل وحذف النباتات" : "Add, edit, and remove plants"}</h2><p className="mt-2 text-sm text-[#718062]">{language === "ar" ? "اضغط تعديل لفتح نافذة البيانات ورفع صورة من جهازك." : "Click edit to open the data and image upload window."}</p></div><Button type="button" onClick={startAdd} className="rounded-xl bg-[#35530e] text-white hover:bg-[#294108]"><Plus className="me-2 size-4" />{language === "ar" ? "إضافة نبات" : "Add plant"}</Button></div>
    <div className="mt-5 grid gap-3 lg:grid-cols-2">{plants.map(plant => <article key={plant.id} className="flex gap-3 rounded-2xl bg-[#f7f9f3] p-3"><img src={plant.imagePath} alt="" className="size-16 shrink-0 rounded-xl object-cover" /><div className="min-w-0 flex-1"><h3 className="font-bold text-[#314617]">{language === "ar" ? plant.nameAr : plant.nameEn}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#718062]">{language === "ar" ? plant.description.ar : plant.description.en}</p><div className="mt-2 flex gap-2"><Button type="button" onClick={() => startEdit(plant)} variant="outline" className="h-8 rounded-lg px-3 text-xs"><Pencil className="me-1 size-3.5" />{language === "ar" ? "تعديل" : "Edit"}</Button><Button type="button" onClick={() => remove(plant)} variant="outline" className="h-8 rounded-lg border-[#e2bdb1] px-3 text-xs text-[#914f42]"><Trash2 className="me-1 size-3.5" />{language === "ar" ? "حذف" : "Delete"}</Button></div></div></article>)}</div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto rounded-[1.5rem] border-[#cfe0c5] bg-[#fbfcf9] p-5 sm:p-7"><DialogHeader><DialogTitle className="text-2xl font-black text-[#314617]">{editing ? (language === "ar" ? "تعديل بيانات النبات" : "Edit plant") : (language === "ar" ? "إضافة نبات جديد" : "Add new plant")}</DialogTitle><DialogDescription>{language === "ar" ? "عدّل البيانات أو ارفع صورة النبات من جهازك ثم اضغط حفظ." : "Edit the details or upload a plant image, then save."}</DialogDescription></DialogHeader><div className="mt-4 grid gap-3 sm:grid-cols-2"><Input value={draft.nameAr} onChange={event => setDraft({ ...draft, nameAr: event.target.value })} placeholder="اسم النبات بالعربية" className="h-10 rounded-xl" /><Input value={draft.nameEn} onChange={event => setDraft({ ...draft, nameEn: event.target.value })} placeholder="Plant name in English" className="h-10 rounded-xl" /><Textarea value={draft.descriptionAr} onChange={event => setDraft({ ...draft, descriptionAr: event.target.value })} placeholder="الوصف بالعربية" className="min-h-24 rounded-xl" /><Textarea value={draft.descriptionEn} onChange={event => setDraft({ ...draft, descriptionEn: event.target.value })} placeholder="Description in English" className="min-h-24 rounded-xl" /><div className="sm:col-span-2"><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#b9d0bb] bg-white px-4 py-4 text-sm font-bold text-[#35530e] hover:bg-[#f0f7ef]"><Upload className="size-5" />{language === "ar" ? "رفع صورة النبات من الجهاز" : "Upload plant image"}<input type="file" accept="image/*" onChange={selectImage} className="hidden" /></label><p className="mt-1 text-xs text-[#718062]">{language === "ar" ? "الحد الأقصى 8 ميغابايت" : "Maximum 8 MB"}</p></div>{draft.imagePath && <div className="relative overflow-hidden rounded-2xl border bg-white sm:col-span-2"><img src={draft.imagePath} alt="preview" className="h-48 w-full object-cover" /><span className="absolute start-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#35530e]"><ImagePlus className="me-1 inline size-3.5" />{language === "ar" ? "معاينة الصورة" : "Image preview"}</span></div>}<Button type="button" onClick={save} className="h-11 rounded-xl bg-[#35530e] text-white hover:bg-[#294108] sm:col-span-2">{editing ? (language === "ar" ? "حفظ التعديل" : "Save changes") : (language === "ar" ? "حفظ وإضافة" : "Save and add")}</Button></div></DialogContent></Dialog>
  </section>;
}
