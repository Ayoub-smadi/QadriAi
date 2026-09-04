import { PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryLabels, plantKnowledge, type PlantCategory, type PlantKnowledgeEntry } from "@/data/plantKnowledge";
import { itemFromPlant, saveDraft } from "@/data/quoteStore";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Droplets, Leaf, Minus, Plus, Search, ShoppingBag, Store, Sun, Truck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type Selection = { quantity: string; size: string };
type ModalView = "catalog" | "product" | "info";

const sizeOptions = [
  { value: "small", ar: "صغير", en: "Small" },
  { value: "medium", ar: "وسط", en: "Medium" },
  { value: "large", ar: "كبير", en: "Large" },
  { value: "custom", ar: "مخصص", en: "Custom" },
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
  const [requestMethod, setRequestMethod] = useState<"pickup" | "delivery">("pickup");

  const selectedCount = Object.keys(selected).length;
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
    return plantKnowledge.filter(plant =>
      (activeCategory === "all" || plant.categoryTags.includes(activeCategory)) &&
      (!term || [plant.nameAr, plant.nameEn, plant.scientificName, ...plant.categoryTags].join(" ").toLocaleLowerCase().includes(term)),
    );
  }, [activeCategory, search]);

  useEffect(() => {
    if (!activePlant) return;
    const saved = selected[activePlant.id];
    setProductQuantity(saved?.quantity || "1");
    setProductSize(saved?.size && !["small", "medium", "large", "custom"].includes(saved.size) ? "custom" : saved?.size || "");
    setCustomSize(saved?.size && !["small", "medium", "large", "custom"].includes(saved.size) ? saved.size : "");
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
    const normalizedQuantity = String(Math.max(1, Number(productQuantity) || 1));
    const normalizedSize = productSize === "custom" ? customSize.trim() : productSize;
    if (!normalizedSize) return;
    setSelected(current => ({ ...current, [activePlant.id]: { quantity: normalizedQuantity, size: normalizedSize } }));
    setView("catalog");
  };

  const continueRequest = () => {
    if (!selectedItems.length || selectedItems.some(item => !item.quantity || item.quantity < 1 || !item.size.trim())) return;
    saveDraft({ items: selectedItems, fulfillment: requestMethod });
    setOpen(false);
    setLocation("/quotes/request");
  };

  const sizeLabel = (value: string) => {
    const option = sizeOptions.find(item => item.value === value);
    return option ? (isArabic ? option.ar : option.en) : value;
  };

  return (
    <PlatformShell title={isArabic ? "طلب عرض سعر" : "Request a quote"} eyebrow={isArabic ? "اختر نباتاتك وأرسل طلبك بسهولة" : "Choose plants and send your request easily"}>
      <main className="min-h-[calc(100vh-10rem)] bg-[#f7f7f5] py-8 sm:py-10">
        <div className="container">
          <section className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-[2rem] bg-[#063f33] text-white shadow-[0_20px_50px_rgba(6,63,51,.18)]">
              <div className="grid gap-7 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold tracking-[.24em] text-[#b9d8b0]">{isArabic ? "مشتل القادري · كتالوج حي" : "AL-QADRI NURSERY · LIVING CATALOG"}</p>
                  <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">{isArabic ? "اختيارك يبدأ من ورقة" : "Your choice starts with a leaf"}</h1>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#d8e8d9] sm:text-base">{isArabic ? "تصفّح النباتات بصريًا، افتح الصورة لمعرفة تفاصيلها، ثم ابنِ طلب عرض سعر يناسب مساحتك." : "Browse visually, open an image for plant details, then build a quote request that fits your space."}</p>
                </div>
                <Button onClick={openCatalog} className="h-13 rounded-2xl bg-[#d9a55b] px-6 font-extrabold text-[#17342d] shadow-[0_10px_20px_rgba(0,0,0,.12)] hover:bg-[#e8bb79]">
                  <ShoppingBag className="me-2 size-5" />
                  {isArabic ? "ابدأ طلب عرض سعر" : "Start a quote request"}
                </Button>
              </div>
              <div className="grid border-t border-white/15 sm:grid-cols-3">
                {[isArabic ? "01  تصفّح النباتات" : "01  Browse plants", isArabic ? "02  اعرف ما يناسبك" : "02  Learn what fits", isArabic ? "03  اطلب تسعيرًا واضحًا" : "03  Get clear pricing"].map((item, index) => (
                  <div key={item} className={`px-6 py-4 text-xs font-bold text-[#d8e8d9] ${index < 2 ? "border-b border-white/15 sm:border-b-0 sm:border-e" : ""}`}>{item}</div>
                ))}
              </div>
            </div>

            {selectedCount > 0 && (
              <div className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-[#cbd9c2] bg-[#fbfaf6] p-4 shadow-sm sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[#e4efdc] text-[#3f6540]"><Check className="size-5" /></span>
                  <div>
                    <p className="text-sm font-extrabold text-[#17342d]">{isArabic ? `تم اختيار ${selectedCount} نبات · ${selectedItems.reduce((sum, item) => sum + item.quantity, 0)} قطعة` : `${selectedCount} plants · ${selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items`}</p>
                    <p className="text-xs text-[#78847c]">{isArabic ? "اختياراتك محفوظة حتى تكمل بيانات الطلب." : "Your selection is kept until you complete the request."}</p>
                  </div>
                </div>
                <Button onClick={openCatalog} className="h-11 rounded-xl bg-[#063f33] px-5 font-bold text-white hover:bg-[#042f27]">{isArabic ? "متابعة الطلب" : "Continue request"}<ArrowRight className="ms-2 size-4" /></Button>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-5 border-b border-[#d8d1c4] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[.18em] text-[#6d8b62]">{isArabic ? "كتالوج النباتات" : "PLANT CATALOG"}</p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#17342d]">{isArabic ? "تعرّف على تشكيلتنا" : "Meet the collection"}</h2>
                <p className="mt-1 text-sm text-[#687a72]">{isArabic ? "الصورة للمعلومات، والزر للطلب — تجربة أوضح من البداية." : "Images are for discovery; buttons are for requesting — clear from the start."}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-[#6d8b62]">{filteredPlants.length} / {plantKnowledge.length} {isArabic ? "أصناف" : "varieties"}</span>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {(["all", ...Object.keys(categoryLabels)] as (PlantCategory | "all")[]).map(category => (
                <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${activeCategory === category ? "border-[#063f33] bg-[#063f33] text-white" : "border-[#d2d8cd] bg-[#fbfaf6] text-[#687a72] hover:border-[#6d8b62] hover:text-[#17342d]"}`}>
                  {category === "all" ? (isArabic ? "الكل" : "All") : isArabic ? categoryLabels[category].ar : categoryLabels[category].en}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlants.map(plant => (
                <article key={plant.id} className="group overflow-hidden rounded-[1.5rem] border border-[#d8ddd2] bg-[#fbfaf6] shadow-[0_10px_25px_rgba(42,55,42,.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(42,55,42,.12)]">
                  <button type="button" onClick={() => openInfo(plant)} className="relative block aspect-[1.35] w-full overflow-hidden bg-[#dce9d4] text-start outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d9a55b]" aria-label={isArabic ? `عرض معلومات ${plant.nameAr}` : `View information about ${plant.nameEn}`}>
                    <img src={plant.imagePath} alt={isArabic ? plant.nameAr : plant.nameEn} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                    <span className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl bg-[#17342d]/85 px-3 py-2 text-[11px] font-bold text-white backdrop-blur-sm"><span>{isArabic ? "عرض الوصف والتفاصيل" : "View description & details"}</span><ArrowLeft className="size-3.5 rtl:rotate-180" /></span>
                    {selected[plant.id] && <span className="absolute start-3 top-3 rounded-full bg-[#d9a55b] px-2.5 py-1 text-[10px] font-extrabold text-[#17342d]">{isArabic ? "ضمن الطلب" : "In request"}</span>}
                  </button>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-extrabold text-[#17342d]">{isArabic ? plant.nameAr : plant.nameEn}</h3>
                        <p className="mt-0.5 truncate text-xs italic text-[#819088]">{plant.scientificName}</p>
                      </div>
                      <Leaf className="mt-1 size-5 shrink-0 text-[#6d8b62]" />
                    </div>
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#687a72]">{isArabic ? plant.description.ar : plant.description.en}</p>
                    <Button type="button" onClick={() => openProduct(plant)} className="mt-4 h-11 w-full rounded-xl bg-[#063f33] font-extrabold text-white hover:bg-[#042f27]"><ShoppingBag className="me-2 size-4" />{isArabic ? "طلب عرض سعر لهذا النبات" : "Request a quote for this plant"}</Button>
                  </div>
                </article>
              ))}
            </div>
            {!filteredPlants.length && <div className="mt-5 rounded-2xl border border-dashed border-[#b9cbb0] bg-[#fbfaf6] p-10 text-center text-sm text-[#687a72]">{isArabic ? "لا توجد نباتات ضمن هذا التصنيف." : "No plants in this category."}</div>}
          </section>
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={view === "catalog" ? "max-h-[92vh] max-w-3xl overflow-y-auto rounded-[1.6rem] border-[#d8ddd2] bg-[#fbfaf6] p-5 sm:p-7" : view === "info" ? "max-h-[92vh] max-w-2xl overflow-y-auto rounded-[1.6rem] border-[#d8ddd2] bg-[#fbfaf6] p-0" : "max-w-[410px] rounded-[1.6rem] border-[#d8ddd2] bg-[#fbfaf6] p-5 sm:p-7"} dir={isArabic ? "rtl" : "ltr"}>
          {view === "catalog" ? (
            <>
              <DialogHeader className="border-b border-[#e1e5e0] pb-4">
                <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-[#17342d]"><ShoppingBag className="size-5 text-[#063f33]" />{isArabic ? "ابنِ طلب عرض السعر" : "Build your quote request"}</DialogTitle>
                <DialogDescription className="text-sm text-[#687a72]">{isArabic ? "اختر طريقة الاستلام أولًا، ثم أضف النباتات والكمية والحجم." : "Choose a fulfillment method first, then add plants, quantity, and size."}</DialogDescription>
              </DialogHeader>
              <fieldset className="mt-5">
                <legend className="text-sm font-extrabold text-[#17342d]">{isArabic ? "طريقة الاستلام" : "Fulfillment method"}</legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {([["pickup", isArabic ? "استلام من المشتل" : "Nursery pickup", Store], ["delivery", isArabic ? "توصيل إلى موقعك" : "Delivery to your site", Truck]] as const).map(([value, label, Icon]) => (
                    <button key={value} type="button" onClick={() => setRequestMethod(value)} className={`flex items-center gap-2 rounded-xl border p-3 text-start text-xs font-bold transition ${requestMethod === value ? "border-[#6d8b62] bg-[#eaf2e5] text-[#17342d]" : "border-[#d8ddd2] bg-white text-[#687a72] hover:border-[#b4c9aa]"}`} aria-pressed={requestMethod === value}><span className="grid size-8 place-items-center rounded-lg bg-white"><Icon className="size-4 text-[#6d8b62]" /></span>{label}{requestMethod === value && <Check className="ms-auto size-4 text-[#4c7620]" />}</button>
                  ))}
                </div>
              </fieldset>
              <div className="relative mt-1">
                <Input value={search} onChange={event => setSearch(event.target.value)} placeholder={isArabic ? "ابحث عن نبات..." : "Search for a plant..."} className="h-11 rounded-xl border-[#dce1dc] bg-white pe-10 text-sm" />
                <Search className="pointer-events-none absolute end-3 top-3 size-5 text-[#8b9a8c]" />
                {search && <button type="button" onClick={() => setSearch("")} className="absolute start-3 top-3 text-[#8b9a8c]" aria-label={isArabic ? "مسح البحث" : "Clear search"}><X className="size-4" /></button>}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#4c5d51]">{isArabic ? "النباتات المتاحة" : "Available plants"}</h3>
                <span className="text-xs text-[#95a097]">{filteredPlants.length} {isArabic ? "نتيجة" : "results"}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                {filteredPlants.map(plant => (
                  <button key={plant.id} type="button" onClick={() => openProduct(plant)} className="group overflow-hidden rounded-xl border border-[#e0e5df] bg-white text-right transition hover:-translate-y-0.5 hover:border-[#a8c18f] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d8d3e]">
                    <div className="aspect-[1.12] overflow-hidden bg-[#edf3e9]"><img src={plant.imagePath} alt="" className="size-full object-cover transition duration-300 group-hover:scale-105" /></div>
                    <div className="p-2.5">
                      <span className="block truncate text-xs font-extrabold text-[#344637]">{isArabic ? plant.nameAr : plant.nameEn}</span>
                      <span className="mt-1 block truncate text-[10px] text-[#8a968b]">{plant.scientificName}</span>
                      {selected[plant.id] && <span className="mt-1.5 block text-[10px] font-bold text-[#5d8d3e]">{isArabic ? "تمت الإضافة" : "Added"}</span>}
                    </div>
                  </button>
                ))}
              </div>
              {!filteredPlants.length && <p className="py-8 text-center text-sm text-[#78847c]">{isArabic ? "لا توجد نباتات مطابقة للبحث." : "No plants match your search."}</p>}
              <div className="flex flex-col-reverse justify-between gap-3 border-t border-[#e1e5e0] pt-4 sm:flex-row sm:items-center">
                <p className="text-xs font-bold text-[#78847c]">{isArabic ? `تم اختيار ${selectedCount} نبات · ${requestMethod === "pickup" ? "استلام من المشتل" : "توصيل"}` : `${selectedCount} plants · ${requestMethod === "pickup" ? "Nursery pickup" : "Delivery"}`}</p>
                <Button onClick={continueRequest} disabled={!selectedCount || selectedItems.some(item => !item.size.trim())} className="h-11 rounded-xl bg-[#004132] px-6 font-bold text-white hover:bg-[#003326]">{isArabic ? "متابعة لبيانات العميل" : "Continue to customer details"}<ChevronRight className="ms-2 size-4" /></Button>
              </div>
            </>
          ) : view === "info" && activePlant ? (
            <>
              <div className="relative aspect-[2/1] overflow-hidden bg-[#dce9d4]">
                <img src={activePlant.imagePath} alt={isArabic ? activePlant.nameAr : activePlant.nameEn} className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17342d]/85 via-transparent to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-white">
                  <p className="text-xs font-bold tracking-[.16em] text-[#d9e8cf]">{isArabic ? "بطاقة النبات" : "PLANT PROFILE"}</p>
                  <h2 className="mt-1 text-3xl font-extrabold">{isArabic ? activePlant.nameAr : activePlant.nameEn}</h2>
                  <p className="mt-1 text-sm italic text-white/75">{activePlant.scientificName}</p>
                </div>
              </div>
              <div className="p-5 sm:p-7">
                <DialogHeader>
                  <DialogTitle className="text-xl font-extrabold text-[#17342d]">{isArabic ? "عن هذا النبات" : "About this plant"}</DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-7 text-[#687a72]">{isArabic ? activePlant.description.ar : activePlant.description.en}</DialogDescription>
                </DialogHeader>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#eef4e9] p-4"><div className="flex items-center gap-2 text-xs font-extrabold text-[#406340]"><Sun className="size-4" />{isArabic ? "الإضاءة" : "Light"}</div><p className="mt-2 text-sm leading-6 text-[#687a72]">{isArabic ? activePlant.light.ar : activePlant.light.en}</p></div>
                  <div className="rounded-xl bg-[#eef4e9] p-4"><div className="flex items-center gap-2 text-xs font-extrabold text-[#406340]"><Droplets className="size-4" />{isArabic ? "الري" : "Water"}</div><p className="mt-2 text-sm leading-6 text-[#687a72]">{isArabic ? activePlant.water.ar : activePlant.water.en}</p></div>
                </div>
                <div className="mt-3 rounded-xl border border-[#e0e5df] bg-white p-4"><p className="text-xs font-extrabold text-[#406340]">{isArabic ? "إرشادات الزراعة" : "Planting guidance"}</p><p className="mt-2 text-sm leading-6 text-[#687a72]">{isArabic ? activePlant.plantingGuidance.ar : activePlant.plantingGuidance.en}</p></div>
                <div className="mt-3 rounded-xl border border-[#e0e5df] bg-white p-4"><p className="text-xs font-extrabold text-[#406340]">{isArabic ? "العناية" : "Care"}</p><p className="mt-2 text-sm leading-6 text-[#687a72]">{isArabic ? activePlant.careGuidance.ar : activePlant.careGuidance.en}</p></div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button type="button" onClick={() => setView("product")} className="h-11 flex-1 rounded-xl bg-[#063f33] font-extrabold text-white hover:bg-[#042f27]"><ShoppingBag className="me-2 size-4" />{isArabic ? "أضف إلى طلب عرض السعر" : "Add to quote request"}</Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11 rounded-xl border-[#17342d] bg-white font-bold text-[#17342d]">{isArabic ? "إغلاق" : "Close"}</Button>
                </div>
              </div>
            </>
          ) : activePlant ? (
            <>
              <div className="flex items-start gap-3 border-b border-[#e1e5e0] pb-4">
                <button type="button" onClick={() => setView("catalog")} className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#f0f2ef] text-[#66746a] hover:bg-[#e5ebe1]" aria-label={isArabic ? "العودة للنباتات" : "Back to plants"}><ChevronRight className="size-4 rtl:rotate-180" /></button>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl font-extrabold text-[#26342c]">{isArabic ? activePlant.nameAr : activePlant.nameEn}</DialogTitle>
                  <DialogDescription className="mt-1 text-xs text-[#879289]">{isArabic ? activePlant.categoryTags.map(category => categoryLabels[category].ar).join("، ") : activePlant.categoryTags.map(category => categoryLabels[category].en).join(", ")}</DialogDescription>
                </div>
                <img src={activePlant.imagePath} alt="" className="size-12 rounded-xl object-cover" />
              </div>
              <div className="mt-4">
                <Label className="text-sm font-bold text-[#4c5d51]">{isArabic ? "الكمية" : "Quantity"}</Label>
                <div className="mt-2 flex items-center gap-2">
                  <button type="button" onClick={() => setProductQuantity(String(Math.max(1, Number(productQuantity) - 1)))} className="grid size-10 place-items-center rounded-xl bg-[#f0f2ef] text-[#526055] hover:bg-[#e2e9df]" aria-label={isArabic ? "تقليل الكمية" : "Decrease quantity"}><Minus className="size-4" /></button>
                  <Input type="number" min="1" value={productQuantity} onChange={event => setProductQuantity(event.target.value)} className="h-10 rounded-xl border-[#dce1dc] bg-white text-center font-extrabold" dir="ltr" />
                  <button type="button" onClick={() => setProductQuantity(String(Math.max(1, Number(productQuantity) || 1) + 1))} className="grid size-10 place-items-center rounded-xl bg-[#f0f2ef] text-[#526055] hover:bg-[#e2e9df]" aria-label={isArabic ? "زيادة الكمية" : "Increase quantity"}><Plus className="size-4" /></button>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between"><Label className="text-sm font-bold text-[#4c5d51]">{isArabic ? "الحجم" : "Size"}</Label><span className="text-xs font-bold text-[#5d8d3e]">{isArabic ? "(إلزامي)" : "(Required)"}</span></div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {sizeOptions.map(option => <button key={option.value} type="button" onClick={() => setProductSize(option.value)} className={`rounded-full border px-2 py-2 text-xs font-bold transition ${productSize === option.value ? "border-[#5d8d3e] bg-[#edf4e5] text-[#35530e]" : "border-[#dfe4df] bg-white text-[#78847c] hover:border-[#c3d4bb]"}`}>{isArabic ? option.ar : option.en}</button>)}
                </div>
                {productSize === "custom" && <Input value={customSize} onChange={event => setCustomSize(event.target.value)} placeholder={isArabic ? "اكتب الحجم أو الارتفاع" : "Enter size or height"} className="mt-2 h-10 rounded-xl bg-white" autoFocus />}
              </div>
              <div className="mt-5 flex gap-2">
                <Button type="button" onClick={addProduct} disabled={!productSize || (productSize === "custom" && !customSize.trim())} className="h-11 flex-1 rounded-xl bg-[#004132] font-extrabold text-white hover:bg-[#003326]"><Plus className="me-2 size-4" />{isArabic ? "إضافة" : "Add"}</Button>
                <Button type="button" variant="outline" onClick={() => setView("catalog")} className="h-11 flex-1 rounded-xl border-[#27342c] bg-white font-bold text-[#344637] hover:bg-[#f4f6f3]">{isArabic ? "إلغاء" : "Cancel"}</Button>
              </div>
              <p className="mt-3 text-center text-[11px] text-[#95a097]">{isArabic ? `المقاس المختار: ${productSize ? sizeLabel(productSize === "custom" ? customSize : productSize) : "لم يتم الاختيار بعد"}` : `Selected size: ${productSize ? sizeLabel(productSize === "custom" ? customSize : productSize) : "not selected yet"}`}</p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </PlatformShell>
  );
}