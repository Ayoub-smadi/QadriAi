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

const heroPlants = [plantKnowledge[0], plantKnowledge[3], plantKnowledge[6]];

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
  const [requestMethod, setRequestMethod] = useState<Fulfillment>("pickup");

  const selectedCount = Object.keys(selected).length;
  const selectedTotal = Object.values(selected).reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const selectedItems = useMemo(
    () =>
      Object.entries(selected)
        .map(([plantId, values]) => {
          const plant = plantKnowledge.find(item => item.id === plantId);
          return plant ? itemFromPlant(plant, Number(values.quantity), values.size) : null;
        })
        .filter((item): item is ReturnType<typeof itemFromPlant> => Boolean(item)),
    [selected],
  );

  const filteredPlants = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return plantKnowledge.filter(plant => {
      const matchesCategory = activeCategory === "all" || plant.categoryTags.includes(activeCategory);
      const matchesSearch = !term || [plant.nameAr, plant.nameEn, plant.scientificName, ...plant.categoryTags].join(" ").toLocaleLowerCase().includes(term);
      return matchesCategory && matchesSearch;
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

  const openCatalog = () => {
    setView("catalog");
    setOpen(true);
  };

  const openProduct = (plant: PlantKnowledgeEntry) => {
    setActivePlant(plant);
    setView("product");
    setOpen(true);
  };

  const openInfo = (plant: PlantKnowledgeEntry) => {
    setActivePlant(plant);
    setView("info");
    setOpen(true);
  };

  const addProduct = () => {
    if (!activePlant) return;
    const quantity = String(Math.max(1, Number(productQuantity) || 1));
    const size = productSize === "custom" ? customSize.trim() : productSize;
    if (!size) return;
    setSelected(current => ({ ...current, [activePlant.id]: { quantity, size } }));
    setView("catalog");
  };

  const continueRequest = () => {
    if (!selectedItems.length || selectedItems.some(item => !item.quantity || item.quantity < 1 || !item.size.trim())) return;
    saveDraft({ items: selectedItems, fulfillment: requestMethod });
    setOpen(false);
    setLocation("/quotes/request");
  };

  const categoryName = (category: PlantCategory | "all") =>
    category === "all" ? (isArabic ? "كل النباتات" : "All plants") : isArabic ? categoryLabels[category].ar : categoryLabels[category].en;

  const sizeLabel = (value: string) => {
    const option = sizeOptions.find(item => item.value === value);
    return option ? (isArabic ? option.ar : option.en) : value;
  };

  return (
    <PlatformShell title={isArabic ? "طلب عرض سعر" : "Request a quote"} eyebrow={isArabic ? "اختيار نباتاتك صار أسهل" : "Choosing your plants, made easier"}>
      <main className="min-h-[calc(100vh-10rem)] bg-[#f5faf7] pb-16">
        <div className="container pt-7 sm:pt-10">
          <section className="relative isolate overflow-hidden rounded-[2rem] border border-[#b8d9cb] bg-[#e3f1eb] px-6 py-8 sm:px-10 sm:py-11">
            <div className="pointer-events-none absolute -end-16 -top-20 -z-10 size-72 rounded-full border-[32px] border-[#c8e4d8]/80" />
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#9bc8b8] bg-white/65 px-3 py-1.5 text-xs font-extrabold text-[#17624d]"><Sparkles className="size-3.5" />{isArabic ? "مساعد الاختيار الذكي" : "Smart selection assistant"}</div>
                <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-[#063f33] sm:text-5xl">{isArabic ? "النبات المناسب يبدأ بسؤال ذكي" : "The right plant starts with a smart question"}</h1>
                <p className="mt-4 max-w-lg text-sm leading-7 text-[#426b5e] sm:text-base">{isArabic ? "تعرّف على النبات من صورته، ثم اطلب تسعيرًا يناسب الكمية والحجم وطريقة الاستلام التي تريدها." : "Discover each plant from its image, then request pricing for the quantity, size, and fulfillment method you need."}</p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={openCatalog} className="h-12 rounded-xl bg-[#004132] px-6 font-extrabold text-white shadow-[0_8px_18px_rgba(0,65,50,.18)] hover:bg-[#003326]"><ShoppingBag className="me-2 size-5" />{isArabic ? "ابدأ طلب عرض السعر" : "Start a quote request"}</Button>
                  <p className="flex items-center gap-2 text-xs font-bold text-[#4d7568]"><Check className="size-4 text-[#287459]" />{isArabic ? "بدون أسعار مخفية" : "No hidden pricing"}</p>
                </div>
              </div>
              <div className="relative mx-auto h-64 w-full max-w-[430px] sm:h-72">
                {heroPlants.map((plant, index) => (
                  <button key={plant.id} type="button" onClick={() => openInfo(plant)} className={`absolute overflow-hidden rounded-[1.4rem] border-4 border-[#f5faf7] shadow-[0_18px_35px_rgba(6,63,51,.18)] outline-none transition duration-300 hover:-translate-y-2 focus-visible:ring-2 focus-visible:ring-[#004132] ${index === 0 ? "inset-y-2 start-[24%] z-20 w-[47%] rotate-2" : index === 1 ? "inset-y-9 start-0 z-10 w-[43%] -rotate-6" : "inset-y-10 end-0 z-10 w-[39%] rotate-6"}`} aria-label={isArabic ? `عرض معلومات ${plant.nameAr}` : `View information about ${plant.nameEn}`}><img src={plant.imagePath} alt={isArabic ? plant.nameAr : plant.nameEn} className="size-full object-cover" /><span className="absolute inset-x-2 bottom-2 rounded-lg bg-[#063f33]/85 px-2 py-1.5 text-[10px] font-bold text-white">{isArabic ? plant.nameAr : plant.nameEn}</span></button>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="min-w-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold tracking-[.2em] text-[#57927c]">{isArabic ? "تشكيلتنا الزراعية" : "OUR PLANT COLLECTION"}</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#17342d] sm:text-3xl">{isArabic ? "تصفّح، تعرّف، ثم قرّر" : "Browse, learn, then decide"}</h2>
                </div>
                <span className="text-xs font-bold text-[#6d877e]">{plantKnowledge.length} {isArabic ? "نباتات مختارة" : "curated plants"}</span>
              </div>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {(["all", ...Object.keys(categoryLabels)] as (PlantCategory | "all")[]).map(category => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition ${activeCategory === category ? "border-[#004132] bg-[#004132] text-white shadow-sm" : "border-[#c8ddd3] bg-white text-[#55756a] hover:border-[#73a995] hover:text-[#004132]"}`}>{categoryName(category)}</button>)}
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPlants.map(plant => (
                  <article key={plant.id} className="overflow-hidden rounded-[1.35rem] border border-[#d4e5dd] bg-white shadow-[0_8px_22px_rgba(20,75,57,.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(20,75,57,.1)]">
                    <button type="button" onClick={() => openInfo(plant)} className="group relative block aspect-[1.2] w-full overflow-hidden text-start outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#004132]" aria-label={isArabic ? `عرض تفاصيل ${plant.nameAr}` : `View details for ${plant.nameEn}`}>
                      <img src={plant.imagePath} alt={isArabic ? plant.nameAr : plant.nameEn} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#063f33]/75 via-transparent to-transparent" />
                      <span className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-lg bg-white/90 px-3 py-2 text-[11px] font-extrabold text-[#063f33]"><span>{isArabic ? "اضغط لمعرفة التفاصيل" : "Click for details"}</span><ArrowLeft className="size-3.5 rtl:rotate-180" /></span>
                      {selected[plant.id] && <span className="absolute start-3 top-3 rounded-full bg-[#9dd7bd] px-2.5 py-1 text-[10px] font-extrabold text-[#063f33]">{isArabic ? "في الطلب" : "In request"}</span>}
                    </button>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><h3 className="truncate text-lg font-extrabold text-[#17342d]">{isArabic ? plant.nameAr : plant.nameEn}</h3><p className="mt-0.5 truncate text-xs italic text-[#82998f]">{plant.scientificName}</p></div>
                        <Leaf className="mt-1 size-5 shrink-0 text-[#57927c]" />
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#668178]">{isArabic ? plant.description.ar : plant.description.en}</p>
                      <Button type="button" onClick={() => openProduct(plant)} className="mt-4 h-11 w-full rounded-xl bg-[#004132] font-extrabold text-white hover:bg-[#003326]"><ShoppingBag className="me-2 size-4" />{isArabic ? "طلب عرض سعر" : "Request a quote"}</Button>
                    </div>
                  </article>
                ))}
              </div>
              {!filteredPlants.length && <div className="mt-5 rounded-2xl border border-dashed border-[#acd0c0] bg-white p-10 text-center text-sm text-[#668178]">{isArabic ? "لا توجد نباتات مطابقة." : "No matching plants found."}</div>}
            </section>

            <aside className="h-fit rounded-[1.5rem] bg-[#004132] p-5 text-white shadow-[0_16px_32px_rgba(0,65,50,.16)] lg:sticky lg:top-28">
              <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#9dd7bd] text-[#004132]"><ShoppingBag className="size-5" /></span><div><p className="text-xs font-bold tracking-[.16em] text-[#9dd7bd]">{isArabic ? "طلبك الحالي" : "YOUR REQUEST"}</p><h2 className="mt-1 text-lg font-extrabold">{isArabic ? "سلة عرض السعر" : "Quote basket"}</h2></div></div>
              {selectedCount ? <><div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-4"><p className="text-3xl font-extrabold">{selectedCount}</p><p className="mt-1 text-xs text-[#cbe5da]">{isArabic ? `أصناف · ${selectedTotal} قطعة` : `varieties · ${selectedTotal} items`}</p></div><div className="mt-4 space-y-2">{selectedItems.slice(0, 3).map(item => <div key={item.id} className="flex items-center gap-2 rounded-lg bg-white/10 p-2"><img src={item.imagePath} alt="" className="size-9 rounded-md object-cover" /><span className="min-w-0 truncate text-xs font-bold">{isArabic ? item.nameAr : item.nameEn}</span></div>)}{selectedCount > 3 && <p className="text-center text-[11px] text-[#b9d8cb]">+{selectedCount - 3} {isArabic ? "أصناف أخرى" : "more varieties"}</p>}</div><Button onClick={openCatalog} className="mt-5 h-11 w-full rounded-xl bg-[#9dd7bd] font-extrabold text-[#004132] hover:bg-[#b9e7d0]">{isArabic ? "مراجعة وإكمال الطلب" : "Review and continue"}<ArrowRight className="ms-2 size-4" /></Button></> : <div className="mt-6 border-t border-white/15 pt-5"><p className="text-sm leading-6 text-[#cbe5da]">{isArabic ? "لم تختر نباتًا بعد. اضغط على زر طلب عرض سعر داخل أي بطاقة للبدء." : "No plants selected yet. Use the request button on any card to begin."}</p><Button onClick={openCatalog} className="mt-5 h-11 w-full rounded-xl bg-white font-extrabold text-[#004132] hover:bg-[#e8f5ef]">{isArabic ? "ابدأ من الكتالوج" : "Start from catalog"}</Button></div>}
              <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-[11px] text-[#b9d8cb]"><Check className="size-3.5" />{isArabic ? "يُحفظ اختيارك على هذا الجهاز" : "Your selection stays on this device"}</div>
            </aside>
          </div>
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={view === "catalog" ? "max-h-[92vh] max-w-3xl overflow-y-auto rounded-[1.6rem] border-[#cce0d6] bg-[#fbfdfb] p-5 sm:p-7" : view === "info" ? "max-h-[92vh] max-w-2xl overflow-y-auto rounded-[1.6rem] border-[#cce0d6] bg-[#fbfdfb] p-0" : "max-w-[420px] rounded-[1.6rem] border-[#cce0d6] bg-[#fbfdfb] p-5 sm:p-7"} dir={isArabic ? "rtl" : "ltr"}>
          {view === "catalog" ? (
            <>
              <div className="relative mt-5"><Input value={search} onChange={event => setSearch(event.target.value)} placeholder={isArabic ? "ابحث باسم النبات..." : "Search by plant name..."} className="h-11 rounded-xl border-[#d8e5df] bg-white pe-10" /><Search className="pointer-events-none absolute end-3 top-3 size-5 text-[#82998f]" />{search && <button type="button" onClick={() => setSearch("")} className="absolute start-3 top-3 text-[#82998f]" aria-label={isArabic ? "مسح البحث" : "Clear search"}><X className="size-4" /></button>}</div>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">{filteredPlants.map(plant => <button key={plant.id} type="button" onClick={() => openProduct(plant)} className="group overflow-hidden rounded-xl border border-[#dfe9e4] bg-white text-start transition hover:-translate-y-0.5 hover:border-[#8ebba8] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004132]"><div className="aspect-square overflow-hidden bg-[#edf6f0]"><img src={plant.imagePath} alt="" className="size-full object-cover transition duration-300 group-hover:scale-105" /></div><div className="p-2.5"><span className="block truncate text-xs font-extrabold text-[#344f45]">{isArabic ? plant.nameAr : plant.nameEn}</span><span className="mt-1 block truncate text-[10px] text-[#8a9d95]">{selected[plant.id] ? (isArabic ? "تمت الإضافة" : "Added") : (isArabic ? "اختر الكمية والحجم" : "Choose quantity & size")}</span></div></button>)}</div>
              <div className="mt-5 flex flex-col-reverse justify-between gap-3 border-t border-[#e0ebe5] pt-4 sm:flex-row sm:items-center"><p className="text-xs font-bold text-[#668178]">{isArabic ? `${selectedCount} أصناف · ${selectedTotal} قطعة` : `${selectedCount} varieties · ${selectedTotal} items`}</p><Button onClick={continueRequest} disabled={!selectedCount || selectedItems.some(item => !item.size.trim())} className="h-11 rounded-xl bg-[#004132] px-6 font-extrabold text-white hover:bg-[#003326]">{isArabic ? "متابعة لبيانات العميل" : "Continue to customer details"}<ChevronRight className="ms-2 size-4" /></Button></div>
            </>
          ) : view === "info" && activePlant ? (
            <>
              <div className="relative aspect-[2.1/1] overflow-hidden bg-[#dcece2]"><img src={activePlant.imagePath} alt={isArabic ? activePlant.nameAr : activePlant.nameEn} className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#063f33]/85 via-transparent to-transparent" /><div className="absolute inset-x-5 bottom-5 text-white"><p className="text-xs font-extrabold tracking-[.16em] text-[#cbe5da]">{isArabic ? "معلومات النبات" : "PLANT PROFILE"}</p><h2 className="mt-1 text-3xl font-extrabold">{isArabic ? activePlant.nameAr : activePlant.nameEn}</h2><p className="mt-1 text-sm italic text-white/75">{activePlant.scientificName}</p></div></div>
              <div className="p-5 sm:p-7"><DialogHeader><DialogTitle className="text-xl font-extrabold text-[#17342d]">{isArabic ? "اعرف نباتك قبل أن تطلبه" : "Know your plant before you request it"}</DialogTitle><DialogDescription className="mt-2 text-sm leading-7 text-[#668178]">{isArabic ? activePlant.description.ar : activePlant.description.en}</DialogDescription></DialogHeader><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#eaf4ee] p-4"><div className="flex items-center gap-2 text-xs font-extrabold text-[#17624d]"><Sun className="size-4" />{isArabic ? "الإضاءة" : "Light"}</div><p className="mt-2 text-sm leading-6 text-[#668178]">{isArabic ? activePlant.light.ar : activePlant.light.en}</p></div><div className="rounded-xl bg-[#eaf4ee] p-4"><div className="flex items-center gap-2 text-xs font-extrabold text-[#17624d]"><Droplets className="size-4" />{isArabic ? "الري" : "Water"}</div><p className="mt-2 text-sm leading-6 text-[#668178]">{isArabic ? activePlant.water.ar : activePlant.water.en}</p></div></div><div className="mt-3 rounded-xl border border-[#dfe9e4] bg-white p-4"><p className="text-xs font-extrabold text-[#17624d]">{isArabic ? "إرشادات الزراعة" : "Planting guidance"}</p><p className="mt-2 text-sm leading-6 text-[#668178]">{isArabic ? activePlant.plantingGuidance.ar : activePlant.plantingGuidance.en}</p></div><div className="mt-3 rounded-xl border border-[#dfe9e4] bg-white p-4"><p className="text-xs font-extrabold text-[#17624d]">{isArabic ? "العناية" : "Care"}</p><p className="mt-2 text-sm leading-6 text-[#668178]">{isArabic ? activePlant.careGuidance.ar : activePlant.careGuidance.en}</p></div><div className="mt-6 flex flex-col gap-2 sm:flex-row"><Button type="button" onClick={() => setView("product")} className="h-11 flex-1 rounded-xl bg-[#004132] font-extrabold text-white hover:bg-[#003326]"><ShoppingBag className="me-2 size-4" />{isArabic ? "أضف إلى طلب عرض السعر" : "Add to quote request"}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl border-[#004132] bg-white font-bold text-[#004132]">{isArabic ? "إغلاق" : "Close"}</Button></div></div>
            </>
          ) : activePlant ? (
            <>
              <div className="flex items-start gap-3 border-b border-[#e0ebe5] pb-4"><button type="button" onClick={() => setView("catalog")} className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#edf5f1] text-[#55756a] hover:bg-[#dfede6]" aria-label={isArabic ? "العودة للنباتات" : "Back to plants"}><ChevronRight className="size-4 rtl:rotate-180" /></button><div className="min-w-0 flex-1"><DialogTitle className="text-xl font-extrabold text-[#17342d]">{isArabic ? activePlant.nameAr : activePlant.nameEn}</DialogTitle><DialogDescription className="mt-1 text-xs text-[#82998f]">{isArabic ? "أكمل تفاصيل هذا النبات لإضافته للطلب" : "Complete the details for this plant"}</DialogDescription></div><img src={activePlant.imagePath} alt="" className="size-12 rounded-xl object-cover" /></div>
              <div className="mt-5"><Label className="text-sm font-extrabold text-[#344f45]">{isArabic ? "الكمية المطلوبة" : "Requested quantity"}</Label><div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => setProductQuantity(String(Math.max(1, Number(productQuantity) - 1)))} className="grid size-11 place-items-center rounded-xl bg-[#edf5f1] text-[#55756a] hover:bg-[#dfede6]" aria-label={isArabic ? "تقليل الكمية" : "Decrease quantity"}><Minus className="size-4" /></button><Input type="number" min="1" value={productQuantity} onChange={event => setProductQuantity(event.target.value)} className="h-11 rounded-xl border-[#d8e5df] bg-white text-center font-extrabold" dir="ltr" /><button type="button" onClick={() => setProductQuantity(String(Math.max(1, Number(productQuantity) || 1) + 1))} className="grid size-11 place-items-center rounded-xl bg-[#edf5f1] text-[#55756a] hover:bg-[#dfede6]" aria-label={isArabic ? "زيادة الكمية" : "Increase quantity"}><Plus className="size-4" /></button></div></div>
              <div className="mt-5"><div className="flex items-center justify-between"><Label className="text-sm font-extrabold text-[#344f45]">{isArabic ? "الحجم" : "Size"}</Label><span className="text-xs font-bold text-[#57927c]">{isArabic ? "مطلوب" : "Required"}</span></div><div className="mt-2 grid grid-cols-2 gap-2">{sizeOptions.map(option => <button key={option.value} type="button" onClick={() => setProductSize(option.value)} className={`rounded-xl border px-2 py-3 text-xs font-extrabold transition ${productSize === option.value ? "border-[#57927c] bg-[#e7f3ed] text-[#17624d]" : "border-[#d8e5df] bg-white text-[#668178] hover:border-[#94bfad]"}`}>{isArabic ? option.ar : option.en}</button>)}</div>{productSize === "custom" && <Input value={customSize} onChange={event => setCustomSize(event.target.value)} placeholder={isArabic ? "اكتب الحجم أو الارتفاع" : "Enter size or height"} className="mt-2 h-11 rounded-xl border-[#d8e5df] bg-white" autoFocus />}</div>
              <div className="mt-6 flex gap-2"><Button type="button" onClick={addProduct} disabled={!productSize || (productSize === "custom" && !customSize.trim())} className="h-11 flex-1 rounded-xl bg-[#004132] font-extrabold text-white hover:bg-[#003326]"><Plus className="me-2 size-4" />{isArabic ? "إضافة للطلب" : "Add to request"}</Button><Button type="button" variant="outline" onClick={() => setView("catalog")} className="h-11 flex-1 rounded-xl border-[#004132] bg-white font-bold text-[#004132]">{isArabic ? "إلغاء" : "Cancel"}</Button></div>
              <p className="mt-3 text-center text-[11px] text-[#82998f]">{isArabic ? `الحجم المختار: ${productSize ? sizeLabel(productSize === "custom" ? customSize : productSize) : "لم يتم الاختيار بعد"}` : `Selected size: ${productSize ? sizeLabel(productSize === "custom" ? customSize : productSize) : "not selected yet"}`}</p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PlatformShell>
  );
}