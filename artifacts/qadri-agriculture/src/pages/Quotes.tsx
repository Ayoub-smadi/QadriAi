import { PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryLabels, plantKnowledge, type PlantKnowledgeEntry } from "@/data/plantKnowledge";
import { itemFromPlant, saveDraft } from "@/data/quoteStore";
import { useLanguage } from "@/lib/i18n";
import { ArrowRight, ChevronRight, Leaf, Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type Selection = { quantity: string; size: string };
type ModalView = "catalog" | "product";

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
  const [activePlant, setActivePlant] = useState<PlantKnowledgeEntry | null>(null);
  const [selected, setSelected] = useState<Record<string, Selection>>({});
  const [productQuantity, setProductQuantity] = useState("1");
  const [productSize, setProductSize] = useState("");
  const [customSize, setCustomSize] = useState("");

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
    if (!term) return plantKnowledge;
    return plantKnowledge.filter(plant =>
      [plant.nameAr, plant.nameEn, plant.scientificName, ...plant.categoryTags]
        .join(" ")
        .toLocaleLowerCase()
        .includes(term),
    );
  }, [search]);

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
    saveDraft({ items: selectedItems });
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
            <div className="flex flex-col items-center justify-between gap-5 border-b border-[#d8ddd8] pb-7 sm:flex-row">
              <div className="text-center sm:text-right">
                <p className="text-xs font-bold tracking-[.2em] text-[#8b9a8c]">{isArabic ? "مشتل القادري" : "AL-QADRI NURSERY"}</p>
                <h1 className="mt-2 text-2xl font-extrabold text-[#26342c] sm:text-3xl">{isArabic ? "أشجار وشجيرات وسياجات الزينة" : "Ornamental trees, shrubs & hedges"}</h1>
                <p className="mt-2 text-sm text-[#78847c]">{isArabic ? "اختر النبات المناسب لحديقتك واحصل على عرض سعر مخصص." : "Choose the right plant for your garden and get a tailored quote."}</p>
              </div>
              <Button onClick={openCatalog} className="h-12 rounded-xl bg-[#004132] px-6 font-extrabold text-white shadow-[0_8px_18px_rgba(0,65,50,.2)] hover:bg-[#003326]">
                <ShoppingBag className="me-2 size-5" />
                {isArabic ? "طلب عرض سعر" : "Request a quote"}
              </Button>
            </div>

            {selectedCount > 0 && (
              <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-[#dce5d7] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[#eaf2e5] text-[#52733d]"><ShoppingBag className="size-5" /></span>
                  <div>
                    <p className="text-sm font-extrabold text-[#314617]">{isArabic ? `تم اختيار ${selectedCount} نبات` : `${selectedCount} plants selected`}</p>
                    <p className="text-xs text-[#78847c]">{isArabic ? "يمكنك تعديل الاختيارات من زر طلب عرض سعر." : "You can edit your selection from the request button."}</p>
                  </div>
                </div>
                <Button onClick={continueRequest} className="h-10 rounded-lg bg-[#004132] px-5 text-white hover:bg-[#003326]">{isArabic ? "متابعة الطلب" : "Continue request"}<ArrowRight className="ms-2 size-4" /></Button>
              </div>
            )}

            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[.18em] text-[#8b9a8c]">{isArabic ? "كتالوج النباتات" : "PLANT CATALOG"}</p>
                <h2 className="mt-1 text-xl font-bold text-[#26342c]">{isArabic ? "اختر من تشكيلتنا" : "Choose from our collection"}</h2>
              </div>
              <span className="text-xs font-semibold text-[#8b9a8c]">{plantKnowledge.length} {isArabic ? "أصناف" : "varieties"}</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {plantKnowledge.map(plant => (
                <button
                  key={plant.id}
                  type="button"
                  onClick={() => openProduct(plant)}
                  className="group relative aspect-[1.05] overflow-hidden rounded-[1.1rem] bg-[#dce9d4] text-right shadow-[0_8px_22px_rgba(44,60,36,.1)] outline-none transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(44,60,36,.18)] focus-visible:ring-2 focus-visible:ring-[#5d8d3e] focus-visible:ring-offset-2"
                >
                  <img src={plant.imagePath} alt={isArabic ? plant.nameAr : plant.nameEn} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                    <span className="block text-base font-extrabold drop-shadow sm:text-xl">{isArabic ? plant.nameAr : plant.nameEn}</span>
                    <span className="mt-0.5 block truncate text-[10px] italic text-white/75 sm:text-xs">{plant.scientificName}</span>
                    <span className="mt-2 block line-clamp-1 text-[10px] text-white/80">{isArabic ? plant.description.ar : plant.description.en}</span>
                  </span>
                  {selected[plant.id] && <span className="absolute start-3 top-3 rounded-full bg-[#5d8d3e] px-2.5 py-1 text-[10px] font-extrabold text-white">{isArabic ? "تمت الإضافة" : "Added"}</span>}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={view === "catalog" ? "max-h-[90vh] max-w-3xl overflow-y-auto rounded-[1.4rem] border-[#dce3dc] bg-[#fbfbfa] p-5 sm:p-7" : "max-w-[390px] rounded-[1.4rem] border-[#dce3dc] bg-[#fbfbfa] p-5 sm:p-7"} dir={isArabic ? "rtl" : "ltr"}>
          {view === "catalog" ? (
            <>
              <DialogHeader className="border-b border-[#e1e5e0] pb-4">
                <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-[#26342c]"><ShoppingBag className="size-5 text-[#004132]" />{isArabic ? "طلب عرض سعر" : "Request a quote"}</DialogTitle>
                <DialogDescription className="text-sm text-[#78847c]">{isArabic ? "اختر النباتات التي ترغب بها لإضافتها إلى طلبك." : "Choose the plants you would like to add to your request."}</DialogDescription>
              </DialogHeader>
              <div className="relative mt-1">
                <Input value={search} onChange={event => setSearch(event.target.value)} placeholder={isArabic ? "ابحث عن نبات..." : "Search for a plant..."} className="h-11 rounded-xl border-[#dce1dc] bg-white pe-10 text-sm" />
                <Search className="pointer-events-none absolute end-3 top-3 size-5 text-[#8b9a8c]" />
                {search && <button type="button" onClick={() => setSearch("")} className="absolute start-3 top-3 text-[#8b9a8c]" aria-label={isArabic ? "مسح البحث" : "Clear search"}><X className="size-4" /></button>}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#4c5d51]">{isArabic ? "أشجار وشجيرات وسياجات الزينة" : "Ornamental trees, shrubs & hedges"}</h3>
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
                <p className="text-xs font-bold text-[#78847c]">{isArabic ? `تم اختيار ${selectedCount} نبات` : `${selectedCount} plants selected`}</p>
                <Button onClick={continueRequest} disabled={!selectedCount || selectedItems.some(item => !item.size.trim())} className="h-11 rounded-xl bg-[#004132] px-6 font-bold text-white hover:bg-[#003326]">{isArabic ? "متابعة لبيانات العميل" : "Continue to customer details"}<ChevronRight className="ms-2 size-4" /></Button>
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