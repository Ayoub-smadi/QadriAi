import { PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryLabels, plantKnowledge, type PlantCategory, type PlantKnowledgeEntry } from "@/data/plantKnowledge";
import { itemFromPlant, saveDraft } from "@/data/quoteStore";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Droplets, Leaf, Minus, Plus, Search, ShoppingBag, Sparkles, Sun, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type Selection = { quantity: string; size: string };
type ModalView = "catalog" | "product" | "info";
type Fulfillment = "pickup" | "delivery";

const sizeOptions = [
  { value: "small", ar: "شتلة صغيرة", en: "Small" },
  { value: "medium", ar: "حجم وسط", en: "Medium" },
  { value: "large", ar: "حجم كبير", en: "Large" },
  { value: "custom", ar: "حجم مخصص", en: "Custom" },
];

export default function Quotes() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ModalView>("catalog");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<PlantCategory | "all">("all");
  const [activePlant, setActivePlant] = useState<PlantKnowledgeEntry | null>(null);
  const [selected, setSelected] = useState<Record<string, Selection>>({});
  const [productQuantity, setProductQuantity] = useState("1");
  const [productSize, setProductSize] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [requestMethod] = useState<Fulfillment>("pickup");

  const selectedItems = useMemo(() => Object.entries(selected).map(([plantId, values]) => {
    const plant = plantKnowledge.find(item => item.id === plantId);
    return plant ? itemFromPlant(plant, Number(values.quantity), values.size) : null;
  }).filter((item): item is ReturnType<typeof itemFromPlant> => Boolean(item)), [selected]);
  const selectedTotal = selectedItems.reduce((total, item) => total + item.quantity, 0);

  const filteredPlants = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return plantKnowledge.filter(plant => {
      const categoryMatch = activeCategory === "all" || plant.categoryTags.includes(activeCategory);
      const textMatch = !term || [plant.nameAr, plant.nameEn, plant.scientificName, ...plant.categoryTags].join(" ").toLocaleLowerCase().includes(term);
      return categoryMatch && textMatch;
    });
  }, [activeCategory, search]);

  useEffect(() => {
    if (!activePlant) return;
    const saved = selected[activePlant.id];
    const savedSize = saved?.size || "";
    setProductQuantity(saved?.quantity || "1");
    setProductSize(["small", "medium", "large", "custom"].includes(savedSize) ? savedSize : savedSize ? "custom" : "");
    setCustomSize(["small", "medium", "large", "custom"].includes(savedSize) ? "" : savedSize);
  }, [activePlant, selected]);

  const openCatalog = () => { setView("catalog"); setOpen(true); };
  const openInfo = (plant: PlantKnowledgeEntry) => { setActivePlant(plant); setView("info"); setOpen(true); };
  const openProduct = (plant: PlantKnowledgeEntry) => { setActivePlant(plant); setView("product"); setOpen(true); };
  const addProduct = () => {
    if (!activePlant || !productSize) return;
    const size = productSize === "custom" ? customSize.trim() : productSize;
    if (!size) return;
    setSelected(current => ({ ...current, [activePlant.id]: { quantity: String(Math.max(1, Number(productQuantity) || 1)), size } }));
    setView("catalog");
  };
  const continueRequest = () => {
    if (!selectedItems.length || selectedItems.some(item => !item.size.trim())) return;
    saveDraft({ items: selectedItems, fulfillment: requestMethod });
    setOpen(false);
    setLocation("/quotes/request");
  };
  const categoryName = (category: PlantCategory | "all") => category === "all" ? (isArabic ? "كل النباتات" : "All plants") : isArabic ? categoryLabels[category].ar : categoryLabels[category].en;
  const sizeLabel = (value: string) => {
    const option = sizeOptions.find(item => item.value === value);
    return option ? (isArabic ? option.ar : option.en) : value;
  };

  return (
    <PlatformShell title={isArabic ? "نباتاتك تبدأ من هنا" : "Your plants start here"} eyebrow={isArabic ? "اختيار واضح، عرض سعر أدق" : "A clear selection for a precise quote"}>
      <main className="min-h-[calc(100vh-10rem)] bg-[#f7faf6] pb-20" dir={isArabic ? "rtl" : "ltr"}>
        <div className="container py-8 sm:py-12">
          <section className="relative overflow-hidden rounded-[2rem] bg-[#093f32] px-6 py-9 text-white shadow-[0_24px_60px_rgba(9,63,50,.16)] sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -end-20 -top-28 size-80 rounded-full border-[42px] border-[#b5dec9]/10" />
            <div className="pointer-events-none absolute -bottom-24 start-1/3 size-64 rounded-full bg-[#b5dec9]/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#b5dec9]/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-[#d8eee4]"><Sparkles className="size-3.5" />{isArabic ? "مشتل القادري · اختيارات بعناية" : "Al-Qadri nursery · curated choices"}</span>
              <h2 className="mt-5 max-w-xl text-3xl font-black leading-[1.12] tracking-tight sm:text-5xl">{isArabic ? "اختر نباتك، ودعنا نجهّز لك العرض المناسب" : "Choose your plants, and we’ll prepare the right quote"}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#c9e3d7] sm:text-base">{isArabic ? "تصفّح النباتات بالاسم والصورة والوصف فقط. اضغط على أي نبات لتعرف كل ما يخصه، أو ابدأ طلب عرض سعر لتحديد الكمية والحجم." : "Browse plants by image, name, and description. Open any plant to learn more, or start a quote to set quantity and size."}</p>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-col gap-4 border-b border-[#dfe9df] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-black tracking-[.22em] text-[#729d87]">{isArabic ? "المجموعة النباتية" : "THE PLANT COLLECTION"}</p><h2 className="mt-2 text-2xl font-black text-[#143d31] sm:text-3xl">{isArabic ? "تعرّف على نباتاتنا" : "Meet our plants"}</h2><p className="mt-2 text-sm text-[#70877c]">{isArabic ? "اضغط على الصورة أو البطاقة لفتح الملف الكامل للنبات." : "Click any image or card to open the plant profile."}</p></div>
              <Button onClick={openCatalog} className="h-12 shrink-0 rounded-xl bg-[#c38b4b] px-6 font-black text-white shadow-[0_10px_24px_rgba(195,139,75,.22)] hover:bg-[#aa7135]"><ShoppingBag className="me-2 size-5" />{isArabic ? "طلب عرض سعر" : "Request a quote"}<ArrowLeft className="ms-2 size-4 rtl:rotate-180" /></Button>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plantKnowledge.map((plant, index) => <article key={plant.id} onClick={() => openInfo(plant)} className="group cursor-pointer overflow-hidden rounded-[1.35rem] border border-[#dce8df] bg-white shadow-[0_8px_24px_rgba(26,73,54,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(26,73,54,.12)]" style={{ animationDelay: `${index * 45}ms` }}>
                <div className="relative aspect-[1.12] overflow-hidden bg-[#e7f0e9]"><img src={plant.imagePath} alt={isArabic ? plant.nameAr : plant.nameEn} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a3e31]/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" /><span className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-[#0a5440] opacity-0 shadow-sm transition group-hover:opacity-100"><ArrowLeft className="size-4 rtl:rotate-180" /></span></div>
                <div className="p-5"><h3 className="text-xl font-black text-[#153d31]">{isArabic ? plant.nameAr : plant.nameEn}</h3><p className="mt-1 text-xs italic text-[#91a49a]">{plant.scientificName}</p><p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#70877c]">{isArabic ? plant.description.ar : plant.description.en}</p></div>
              </article>)}
            </div>
          </section>
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={view === "catalog" ? "max-h-[92vh] max-w-3xl overflow-y-auto rounded-[1.6rem] border-[#cce0d6] bg-[#fbfdfb] p-5 sm:p-7" : view === "info" ? "max-h-[92vh] max-w-2xl overflow-y-auto rounded-[1.6rem] border-[#cce0d6] bg-[#fbfdfb] p-0" : "max-w-[420px] rounded-[1.6rem] border-[#cce0d6] bg-[#fbfdfb] p-5 sm:p-7"}>
          {view === "catalog" ? <>
            <DialogHeader><DialogTitle className="text-2xl font-black text-[#143d31]">{isArabic ? "كوّن طلب عرض السعر" : "Build your quote request"}</DialogTitle><DialogDescription className="text-sm leading-6 text-[#70877c]">{isArabic ? "اختر أي نبات من جميع الأقسام، ثم حدّد الكمية والحجم." : "Choose plants from every category, then set quantity and size."}</DialogDescription></DialogHeader>
            <div className="relative mt-5"><Input value={search} onChange={event => setSearch(event.target.value)} placeholder={isArabic ? "ابحث باسم النبات..." : "Search by plant name..."} className="h-11 rounded-xl border-[#d8e5df] bg-white pe-10" /><Search className="pointer-events-none absolute end-3 top-3 size-5 text-[#82998f]" />{search && <button type="button" onClick={() => setSearch("")} className="absolute start-3 top-3 text-[#82998f]" aria-label={isArabic ? "مسح البحث" : "Clear search"}><X className="size-4" /></button>}</div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{(["all", ...Object.keys(categoryLabels)] as (PlantCategory | "all")[]).map(category => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-black transition ${activeCategory === category ? "border-[#0a4b39] bg-[#0a4b39] text-white" : "border-[#d8e5df] bg-white text-[#668178] hover:border-[#83b49f]"}`}>{categoryName(category)}</button>)}</div>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">{filteredPlants.map(plant => <button key={plant.id} type="button" onClick={() => openProduct(plant)} className="group overflow-hidden rounded-xl border border-[#dfe9e4] bg-white text-start transition hover:-translate-y-0.5 hover:border-[#8ebba8] hover:shadow-md"><div className="aspect-square overflow-hidden bg-[#edf6f0]"><img src={plant.imagePath} alt="" className="size-full object-cover transition duration-300 group-hover:scale-105" /></div><div className="p-2.5"><span className="block truncate text-xs font-black text-[#344f45]">{isArabic ? plant.nameAr : plant.nameEn}</span><span className="mt-1 block truncate text-[10px] text-[#8a9d95]">{selected[plant.id] ? (isArabic ? "تمت الإضافة" : "Added") : (isArabic ? "اختر الكمية والحجم" : "Choose quantity & size")}</span></div></button>)}</div>
            <div className="mt-5 flex flex-col-reverse justify-between gap-3 border-t border-[#e0ebe5] pt-4 sm:flex-row sm:items-center"><p className="text-xs font-black text-[#668178]">{selectedItems.length} {isArabic ? `أصناف · ${selectedTotal} قطعة` : `varieties · ${selectedTotal} items`}</p><Button onClick={continueRequest} disabled={!selectedItems.length || selectedItems.some(item => !item.size.trim())} className="h-11 rounded-xl bg-[#0a4b39] px-6 font-black text-white hover:bg-[#063b2d]">{isArabic ? "متابعة لبيانات العميل" : "Continue to customer details"}<ChevronRight className="ms-2 size-4" /></Button></div>
          </> : view === "info" && activePlant ? <>
            <div className="relative aspect-[2.1/1] overflow-hidden bg-[#dcece2]"><img src={activePlant.imagePath} alt={isArabic ? activePlant.nameAr : activePlant.nameEn} className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#063f33]/90 via-transparent to-transparent" /><div className="absolute inset-x-5 bottom-5 text-white"><p className="text-xs font-black tracking-[.16em] text-[#cbe5da]">{isArabic ? "ملف النبات" : "PLANT PROFILE"}</p><h2 className="mt-1 text-3xl font-black">{isArabic ? activePlant.nameAr : activePlant.nameEn}</h2><p className="mt-1 text-sm italic text-white/75">{activePlant.scientificName}</p></div></div>
            <div className="p-5 sm:p-7"><DialogHeader><DialogTitle className="text-xl font-black text-[#17342d]">{isArabic ? "كل ما يهمك عن النبات" : "Everything you need to know"}</DialogTitle><DialogDescription className="mt-2 text-sm leading-7 text-[#668178]">{isArabic ? activePlant.description.ar : activePlant.description.en}</DialogDescription></DialogHeader><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#eaf4ee] p-4"><div className="flex items-center gap-2 text-xs font-black text-[#17624d]"><Sun className="size-4" />{isArabic ? "الإضاءة" : "Light"}</div><p className="mt-2 text-sm leading-6 text-[#668178]">{isArabic ? activePlant.light.ar : activePlant.light.en}</p></div><div className="rounded-xl bg-[#eaf4ee] p-4"><div className="flex items-center gap-2 text-xs font-black text-[#17624d]"><Droplets className="size-4" />{isArabic ? "الري" : "Water"}</div><p className="mt-2 text-sm leading-6 text-[#668178]">{isArabic ? activePlant.water.ar : activePlant.water.en}</p></div></div><div className="mt-3 rounded-xl border border-[#dfe9e4] bg-white p-4"><p className="text-xs font-black text-[#17624d]">{isArabic ? "إرشادات الزراعة" : "Planting guidance"}</p><p className="mt-2 text-sm leading-6 text-[#668178]">{isArabic ? activePlant.plantingGuidance.ar : activePlant.plantingGuidance.en}</p></div><div className="mt-3 rounded-xl border border-[#dfe9e4] bg-white p-4"><p className="text-xs font-black text-[#17624d]">{isArabic ? "العناية" : "Care"}</p><p className="mt-2 text-sm leading-6 text-[#668178]">{isArabic ? activePlant.careGuidance.ar : activePlant.careGuidance.en}</p></div><div className="mt-6 flex flex-col gap-2 sm:flex-row"><Button type="button" onClick={() => setView("product")} className="h-11 flex-1 rounded-xl bg-[#0a4b39] font-black text-white hover:bg-[#063b2d]"><ShoppingBag className="me-2 size-4" />{isArabic ? "أضف إلى طلب عرض السعر" : "Add to quote request"}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl border-[#0a4b39] bg-white font-black text-[#0a4b39]">{isArabic ? "إغلاق" : "Close"}</Button></div></div>
          </> : activePlant ? <>
            <div className="flex items-start gap-3 border-b border-[#e0ebe5] pb-4"><button type="button" onClick={() => setView("catalog")} className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#edf5f1] text-[#55756a]" aria-label={isArabic ? "العودة للنباتات" : "Back to plants"}><ChevronRight className="size-4 rtl:rotate-180" /></button><div className="min-w-0 flex-1"><DialogTitle className="text-xl font-black text-[#17342d]">{isArabic ? activePlant.nameAr : activePlant.nameEn}</DialogTitle><DialogDescription className="mt-1 text-xs text-[#82998f]">{isArabic ? "أكمل التفاصيل لإضافته للطلب" : "Complete the details to add it"}</DialogDescription></div><img src={activePlant.imagePath} alt="" className="size-12 rounded-xl object-cover" /></div>
            <div className="mt-5"><Label className="text-sm font-black text-[#344f45]">{isArabic ? "الكمية المطلوبة" : "Requested quantity"}</Label><div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => setProductQuantity(String(Math.max(1, Number(productQuantity) - 1)))} className="grid size-11 place-items-center rounded-xl bg-[#edf5f1] text-[#55756a]" aria-label={isArabic ? "تقليل الكمية" : "Decrease quantity"}><Minus className="size-4" /></button><Input type="number" min="1" value={productQuantity} onChange={event => setProductQuantity(event.target.value)} className="h-11 rounded-xl border-[#d8e5df] bg-white text-center font-black" dir="ltr" /><button type="button" onClick={() => setProductQuantity(String(Math.max(1, Number(productQuantity) || 1) + 1))} className="grid size-11 place-items-center rounded-xl bg-[#edf5f1] text-[#55756a]" aria-label={isArabic ? "زيادة الكمية" : "Increase quantity"}><Plus className="size-4" /></button></div></div>
            <div className="mt-5"><div className="flex items-center justify-between"><Label className="text-sm font-black text-[#344f45]">{isArabic ? "الحجم" : "Size"}</Label><span className="text-xs font-black text-[#57927c]">{isArabic ? "مطلوب" : "Required"}</span></div><div className="mt-2 grid grid-cols-2 gap-2">{sizeOptions.map(option => <button key={option.value} type="button" onClick={() => setProductSize(option.value)} className={`rounded-xl border px-2 py-3 text-xs font-black transition ${productSize === option.value ? "border-[#57927c] bg-[#e7f3ed] text-[#17624d]" : "border-[#d8e5df] bg-white text-[#668178]"}`}>{isArabic ? option.ar : option.en}</button>)}</div>{productSize === "custom" && <Input value={customSize} onChange={event => setCustomSize(event.target.value)} placeholder={isArabic ? "اكتب الحجم أو الارتفاع" : "Enter size or height"} className="mt-2 h-11 rounded-xl border-[#d8e5df] bg-white" autoFocus />}</div>
            <div className="mt-6 flex gap-2"><Button type="button" onClick={addProduct} disabled={!productSize || (productSize === "custom" && !customSize.trim())} className="h-11 flex-1 rounded-xl bg-[#0a4b39] font-black text-white hover:bg-[#063b2d]"><Plus className="me-2 size-4" />{isArabic ? "إضافة للطلب" : "Add to request"}</Button><Button type="button" variant="outline" onClick={() => setView("catalog")} className="h-11 flex-1 rounded-xl border-[#0a4b39] bg-white font-black text-[#0a4b39]">{isArabic ? "إلغاء" : "Cancel"}</Button></div><p className="mt-3 text-center text-[11px] text-[#82998f]">{isArabic ? `الحجم المختار: ${productSize ? sizeLabel(productSize === "custom" ? customSize : productSize) : "لم يتم الاختيار بعد"}` : `Selected size: ${productSize ? sizeLabel(productSize === "custom" ? customSize : productSize) : "not selected yet"}`}</p>
          </> : null}
        </DialogContent>
      </Dialog>
    </PlatformShell>
  );
}
