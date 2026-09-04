import { PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clearDraft, createRequest, defaultVisibleColumns, quoteColumnLabels, readDraft, type QuoteFulfillment, type QuoteItem } from "@/data/quoteStore";
import { useLanguage } from "@/lib/i18n";
import { ArrowRight, CheckCircle2, Loader2, MapPin, Phone, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function QuoteRequest() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [, setLocation] = useLocation();
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<QuoteFulfillment>("pickup");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft?.items?.length) {
      setItems(draft.items);
      if (draft.fulfillment) setFulfillment(draft.fulfillment);
    }
    else setLocation("/quotes");
  }, [setLocation]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!items.length) return;
    const request = createRequest({ customerName: name.trim(), phone: phone.trim(), fulfillment, deliveryRegion: region.trim(), deliveryAddress: address.trim(), notes: notes.trim(), title: "طلب عرض سعر", footerText: "", shippingFee: 0, items, visibleColumns: { ...defaultVisibleColumns }, columnLabels: { ...quoteColumnLabels } });
    clearDraft();
    setSent(true);
    toast.success(isArabic ? "تم إرسال طلب عرض السعر إلى الإدارة." : "Your quote request was sent to the admin.");
    window.setTimeout(() => setLocation(`/quotes?request=${request.id}`), 900);
  };

  if (sent) return <PlatformShell compact><main className="container grid min-h-[55vh] place-items-center py-12"><section className="max-w-lg rounded-[2rem] border border-[#cfe0bd] bg-white p-8 text-center shadow-[0_18px_50px_rgba(48,67,22,.08)]"><CheckCircle2 className="mx-auto size-14 text-[#5d8d3e]" /><h1 className="mt-5 text-2xl font-bold text-[#314617]">{isArabic ? "تم إرسال طلبك" : "Your request was sent"}</h1><p className="mt-3 leading-7 text-[#68775a]">{isArabic ? "سيقوم فريق القادري بتسعير النباتات والتواصل معك حسب البيانات التي أرسلتها." : "The Al-Qadri team will price the plants and contact you using the details you provided."}</p></section></main></PlatformShell>;

  return <PlatformShell title={isArabic ? "بيانات طلب عرض السعر" : "Quote request details"} eyebrow={isArabic ? "الخطوة الأخيرة قبل إرسال الطلب" : "The final step before sending your request"}>
    <main className="container grid gap-6 py-8 lg:grid-cols-[.8fr_1.2fr]">
      <section className="order-2 rounded-[1.6rem] border border-[#35530e]/10 bg-[#f4f8ee] p-5 lg:order-1">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white text-[#52731f]"><CheckCircle2 className="size-5" /></span><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "ملخص الاختيار" : "SELECTION SUMMARY"}</p><h2 className="mt-1 text-xl font-bold text-[#314617]">{isArabic ? `${items.length} نباتات في الطلب` : `${items.length} plants in request`}</h2></div></div>
        <div className="mt-5 space-y-3">{items.map(item => <div key={item.id} className="flex gap-3 rounded-xl bg-white p-3"><img src={item.imagePath} alt="" className="size-14 rounded-xl object-cover" /><div className="min-w-0"><strong className="block text-sm text-[#314617]">{isArabic ? item.nameAr : item.nameEn}</strong><span className="mt-1 block text-xs text-[#718062]">{isArabic ? `الكمية: ${item.quantity} · الحجم: ${item.size}` : `Qty: ${item.quantity} · Size: ${item.size}`}</span></div></div>)}</div>
        <Link href="/quotes" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#52731f] no-underline hover:underline"><ArrowRight className="size-4" />{isArabic ? "تعديل الاختيار" : "Edit selection"}</Link>
      </section>
      <section className="order-1 rounded-[1.6rem] border border-[#35530e]/10 bg-white p-5 shadow-[0_12px_30px_rgba(48,67,22,.05)] sm:p-7 lg:order-2">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#edf4e5] text-[#35530e]"><UserRound className="size-5" /></span><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "بيانات العميل" : "CUSTOMER DETAILS"}</p><h2 className="mt-1 text-xl font-bold text-[#314617]">{isArabic ? "أين نرسل عرضك؟" : "Where should we send your quote?"}</h2></div></div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label>{isArabic ? "الاسم الكامل" : "Full name"} *</Label><Input required value={name} onChange={event => setName(event.target.value)} className="mt-1.5 h-12 rounded-xl" placeholder={isArabic ? "اكتب اسمك الكامل" : "Enter your full name"} /></div>
          <div><Label>{isArabic ? "رقم الهاتف" : "Phone number"} *</Label><div className="relative mt-1.5"><Input required type="tel" value={phone} onChange={event => setPhone(event.target.value)} className="h-12 rounded-xl pe-11" dir="ltr" placeholder="0777772211" /><Phone className="pointer-events-none absolute end-3 top-3.5 size-5 text-[#90a17e]" /></div></div>
          <fieldset><legend className="text-sm font-bold text-[#405525]">{isArabic ? "طريقة الطلب" : "Fulfillment method"} *</legend><div className="mt-2 grid grid-cols-2 gap-3"><label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-bold ${fulfillment === "pickup" ? "border-[#5d8d3e] bg-[#f0f6e8] text-[#35530e]" : "border-[#dce6d2] text-[#718062]"}`}><input type="radio" name="fulfillment" value="pickup" checked={fulfillment === "pickup"} onChange={() => setFulfillment("pickup")} />{isArabic ? "استلام من المشتل" : "Nursery pickup"}</label><label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-bold ${fulfillment === "delivery" ? "border-[#5d8d3e] bg-[#f0f6e8] text-[#35530e]" : "border-[#dce6d2] text-[#718062]"}`}><input type="radio" name="fulfillment" value="delivery" checked={fulfillment === "delivery"} onChange={() => setFulfillment("delivery")} />{isArabic ? "توصيل" : "Delivery"}</label></div></fieldset>
          {fulfillment === "delivery" && <div className="grid gap-4 sm:grid-cols-2"><div><Label>{isArabic ? "منطقة التوصيل" : "Delivery region"} *</Label><div className="relative mt-1.5"><Input required value={region} onChange={event => setRegion(event.target.value)} className="h-12 rounded-xl pe-11" placeholder={isArabic ? "مثال: جرش" : "e.g. Jerash"} /><MapPin className="pointer-events-none absolute end-3 top-3.5 size-5 text-[#90a17e]" /></div></div><div><Label>{isArabic ? "عنوان التوصيل" : "Delivery address"} *</Label><Input required value={address} onChange={event => setAddress(event.target.value)} className="mt-1.5 h-12 rounded-xl" placeholder={isArabic ? "الحي، الشارع، رقم المنزل" : "Area, street, house number"} /></div></div>}
          <div><Label>{isArabic ? "ملاحظات إضافية (اختياري)" : "Additional notes (optional)"}</Label><Textarea value={notes} onChange={event => setNotes(event.target.value)} className="mt-1.5 min-h-24 rounded-xl" placeholder={isArabic ? "أي تفاصيل تساعدنا في تجهيز الطلب…" : "Anything that helps us prepare your request…"} /></div>
          <Button type="submit" disabled={!items.length} className="h-12 w-full rounded-xl bg-[#35530e] text-white hover:bg-[#294108]"><Loader2 className="me-2 hidden size-4" />{isArabic ? "إرسال الطلب" : "Send request"}</Button>
        </form>
      </section>
    </main>
  </PlatformShell>;
}