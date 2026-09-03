import { PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryLabels, plantKnowledge } from "@/data/plantKnowledge";
import { itemFromPlant, saveDraft } from "@/data/quoteStore";
import { useLanguage } from "@/lib/i18n";
import { DollarSign, Leaf, ListChecks, ShieldCheck, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function Quotes() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, { quantity: string; size: string }>>({});
  const selectedCount = Object.keys(selected).length;
  const selectedItems = useMemo(() => Object.entries(selected).map(([plantId, values]) => itemFromPlant(plantKnowledge.find(plant => plant.id === plantId)!, Number(values.quantity), values.size)), [selected]);

  const togglePlant = (plantId: string) => {
    setSelected(current => {
      if (current[plantId]) {
        const next = { ...current };
        delete next[plantId];
        return next;
      }
      return { ...current, [plantId]: { quantity: "1", size: "" } };
    });
  };

  const updateSelection = (plantId: string, field: "quantity" | "size", value: string) => {
    setSelected(current => ({ ...current, [plantId]: { ...current[plantId], [field]: value } }));
  };

  const continueRequest = () => {
    if (!selectedItems.length || selectedItems.some(item => !item.quantity || item.quantity < 1 || !item.size.trim())) return;
    saveDraft({ items: selectedItems });
    setOpen(false);
    setLocation("/quotes/request");
  };

  return (
    <PlatformShell title={isArabic ? "عروض أسعار النباتات" : "Plant quotations"} eyebrow={isArabic ? "اختر نباتاتك وأرسل طلبك بسهولة" : "Choose your plants and send your request easily"}>
      <main className="container py-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#003f31] p-6 text-white shadow-[0_18px_50px_rgba(0,63,49,.18)] sm:p-9">
          <div className="pointer-events-none absolute -end-10 -top-20 size-60 rounded-full bg-[#9dd7bd]/15 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[.18em] text-[#b9dfcf]">{isArabic ? "مشتل القادري" : "AL-QADRI NURSERY"}</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{isArabic ? "اطلب عرض سعر يناسب حديقتك" : "Request a quote for your garden"}</h1>
              <p className="mt-4 text-sm leading-7 text-[#d5eee3]">{isArabic ? "تصفح النباتات، حدد الحجم والكمية، ثم أرسل بيانات الاستلام أو التوصيل ليجهز فريقنا عرضك." : "Browse plants, choose size and quantity, then send pickup or delivery details for our team to prepare your quote."}</p>
            </div>
            <Button onClick={() => setOpen(true)} className="h-12 rounded-xl bg-[#b9dfcf] px-5 font-extrabold text-[#003f31] hover:bg-white"><DollarSign className="me-2 size-5" />{isArabic ? "طلب عرض سعر" : "Request a quote"}</Button>
          </div>
          <div className="relative mt-8 grid gap-3 text-xs font-bold text-[#d5eee3] sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3"><ListChecks className="size-4 text-[#9dd7bd]" />{isArabic ? "اختيار واضح للنباتات" : "Clear plant selection"}</div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3"><ShieldCheck className="size-4 text-[#9dd7bd]" />{isArabic ? "تسعير من فريق القادري" : "Priced by Al-Qadri team"}</div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3"><ShoppingBag className="size-4 text-[#9dd7bd]" />{isArabic ? "استلام أو توصيل" : "Pickup or delivery"}</div>
          </div>
        </section>

        <section className="mt-9">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold tracking-[.14em] text-[#759244]">{isArabic ? "كتالوج المشتل" : "NURSERY CATALOG"}</p><h2 className="mt-2 text-2xl font-bold text-[#314617]">{isArabic ? "اختر من نباتاتنا" : "Choose from our plants"}</h2></div>
            <span className="hidden text-sm text-[#68775a] sm:block">{isArabic ? `${plantKnowledge.length} نباتات متاحة` : `${plantKnowledge.length} plants available`}</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {plantKnowledge.map(plant => (
              <article key={plant.id} className="group overflow-hidden rounded-[1.5rem] border border-[#35530e]/10 bg-white shadow-[0_10px_25px_rgba(48,67,22,.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(48,67,22,.1)]">
                <div className="h-40 overflow-hidden bg-[#e9f1df]"><img src={plant.imagePath} alt={isArabic ? plant.nameAr : plant.nameEn} className="size-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" /></div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2"><h3 className="font-bold text-[#314617]">{isArabic ? plant.nameAr : plant.nameEn}</h3><Leaf className="size-4 shrink-0 text-[#719449]" /></div>
                  <p className="mt-1 text-xs italic text-[#7a8969]">{plant.scientificName}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#69785b]">{isArabic ? plant.description.ar : plant.description.en}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">{plant.categoryTags.slice(0, 2).map(category => <span key={category} className="rounded-full bg-[#edf4e5] px-2 py-1 text-[10px] font-bold text-[#5d7837]">{isArabic ? categoryLabels[category].ar : categoryLabels[category].en}</span>)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto rounded-[1.5rem] border-[#35530e]/10 bg-[#fbfcf8] p-5 sm:p-7">
          <DialogHeader><DialogTitle className="text-right text-2xl font-bold text-[#314617]">{isArabic ? "اختر النباتات للعرض" : "Choose plants for your quote"}</DialogTitle><DialogDescription className="text-right text-[#68775a]">{isArabic ? "اختر بطاقة أو أكثر، ثم حدد الكمية والحجم لكل نبات." : "Select one or more cards, then set quantity and size for each plant."}</DialogDescription></DialogHeader>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {plantKnowledge.map(plant => {
              const values = selected[plant.id];
              return <div key={plant.id} className={`rounded-2xl border p-3 transition ${values ? "border-[#5c8c3e] bg-[#f0f6e8] shadow-sm" : "border-[#dce6d2] bg-white"}`}>
                <button type="button" onClick={() => togglePlant(plant.id)} className="flex w-full items-center gap-3 text-right">
                  <span className={`grid size-5 shrink-0 place-items-center rounded-md border text-xs ${values ? "border-[#5c8c3e] bg-[#5c8c3e] text-white" : "border-[#b9c9aa] text-transparent"}`}>✓</span>
                  <img src={plant.imagePath} alt="" className="size-12 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[#314617]">{isArabic ? plant.nameAr : plant.nameEn}</strong><span className="mt-0.5 block truncate text-xs text-[#78866a]">{isArabic ? plant.description.ar : plant.description.en}</span></span>
                </button>
                {values && <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#dce6d2] pt-3"><div><Label className="text-xs text-[#58713b]">{isArabic ? "الكمية" : "Quantity"}</Label><Input type="number" min="1" value={values.quantity} onChange={event => updateSelection(plant.id, "quantity", event.target.value)} className="mt-1 h-9 rounded-lg bg-white" /></div><div><Label className="text-xs text-[#58713b]">{isArabic ? "الحجم" : "Size"}</Label><Input required value={values.size} onChange={event => updateSelection(plant.id, "size", event.target.value)} placeholder={isArabic ? "مثال: 30 سم" : "e.g. 30 cm"} className="mt-1 h-9 rounded-lg bg-white" /></div></div>}
              </div>;
            })}
          </div>
          <div className="mt-5 flex flex-col-reverse justify-between gap-3 border-t border-[#dce6d2] pt-5 sm:flex-row sm:items-center"><p className="text-xs font-bold text-[#718062]">{isArabic ? `تم اختيار ${selectedCount} نبات` : `${selectedCount} plants selected`}</p><Button onClick={continueRequest} disabled={!selectedCount || selectedItems.some(item => !item.quantity || item.quantity < 1 || !item.size.trim())} className="h-11 rounded-xl bg-[#35530e] px-6 text-white hover:bg-[#294108]">{isArabic ? "التالي: بيانات العميل" : "Next: customer details"}</Button></div>
        </DialogContent>
      </Dialog>
    </PlatformShell>
  );
}