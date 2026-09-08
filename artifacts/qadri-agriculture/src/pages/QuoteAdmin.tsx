import { AccessGate, PlatformShell } from "@/components/PlatformShell";
import { QuoteDocument } from "@/components/QuoteDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categoryLabels } from "@/data/plantKnowledge";
import { getCatalog } from "@/data/plantCatalog";
import { createEmptyQuote, findPlant, getRecords, getTotals, removeRecord, saveRecord, subscribeToRecords, type QuoteColumnKey, type QuoteItem, type QuoteRecord } from "@/data/quoteStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { deleteRemoteQuote, fetchRemoteQuotes, updateRemoteQuote } from "@/lib/quoteApi";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ArrowRight, Download, FilePlus2, ImagePlus, Minus, Pencil, Plus, ReceiptText, Save, Sparkles, Trash2, X } from "lucide-react";
import { ChangeEvent, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const columnKeys: QuoteColumnKey[] = ["number", "name", "description", "category", "quantity", "price", "total", "image"];

function downloadName(record: QuoteRecord) {
  return `${record.quoteNumber || "quote"}.pdf`;
}

export default function QuoteAdmin() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [records, setRecords] = useState<QuoteRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<QuoteRecord | null>(null);
  const [downloading, setDownloading] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetchRemoteQuotes("admin").then(remote => { if (active) setRecords(remote); }).catch(error => toast.error(error instanceof Error ? error.message : "تعذر تحميل الطلبات."));
    return () => { active = false; };
  }, []);
  const requests = records.filter(record => record.kind === "request");
  const savedQuotes = records.filter(record => record.kind === "quote");
  const openEditor = (record: QuoteRecord) => { setSelectedId(record.id); setEditor({ ...record, items: record.items.map(item => ({ ...item })), visibleColumns: { ...record.visibleColumns }, columnLabels: { ...record.columnLabels } }); };
  const newQuote = () => openEditor(createEmptyQuote());
  const closeEditor = () => { setEditor(null); setSelectedId(null); };

  const persist = () => {
    if (!editor) return;
    if (!editor.customerName.trim() || !editor.phone.trim() || (editor.fulfillment === "delivery" && (!editor.deliveryRegion.trim() || !editor.deliveryAddress.trim()))) {
      toast.error(isArabic ? "أكمل اسم العميل ورقم الهاتف وبيانات التوصيل المطلوبة." : "Complete the customer name, phone, and required delivery details.");
      return;
    }
    if (!editor.items.length || editor.items.some(item => !item.nameAr.trim() || !item.size.trim() || item.quantity < 1)) {
      toast.error(isArabic ? "أضف صفًا صحيحًا واحدًا على الأقل." : "Add at least one valid line item.");
      return;
    }
    const priced = editor.items.some(item => item.price > 0);
    const next: QuoteRecord = { ...editor, kind: editor.kind === "request" && priced ? "quote" : editor.kind, status: priced ? "priced" : "pending" };
    updateRemoteQuote(next).then(saved => {
      setRecords(previous => previous.map(record => record.id === saved.id ? saved : record));
      setEditor(saved);
      toast.success(isArabic ? "تم حفظ عرض السعر." : "Quote saved.");
    }).catch(error => toast.error(error instanceof Error ? error.message : "تعذر حفظ العرض."));
  };

  const downloadPdf = async () => {
    if (!editor || !sheetRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(sheetRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const margin = 8;
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
      const imageHeight = canvas.height * pageWidth / canvas.width;
      const imageData = canvas.toDataURL("image/png");
      const pages = Math.max(1, Math.ceil(imageHeight / pageHeight));
      for (let page = 0; page < pages; page += 1) {
        if (page) pdf.addPage();
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "F");
        const imageY = margin - page * pageHeight;
        pdf.addImage(imageData, "PNG", margin, imageY, pageWidth, imageHeight, undefined, "FAST");
      }
      pdf.save(downloadName(editor));
      toast.success(isArabic ? "تم تنزيل ملف PDF." : "PDF downloaded.");
    } catch {
      toast.error(isArabic ? "تعذر إنشاء ملف PDF." : "Could not create the PDF.");
    } finally {
      setDownloading(false);
    }
  };

  if (user && user.role !== "admin") return <PlatformShell title={isArabic ? "طلبات عروض" : "Quote requests"}><main className="container py-12"><section className="mx-auto max-w-lg rounded-[1.6rem] border border-[#ead1a6] bg-[#fffaf0] p-8 text-center"><ReceiptText className="mx-auto size-10 text-[#9b7430]" /><h2 className="mt-4 text-xl font-bold text-[#6f5223]">{isArabic ? "هذه المساحة للإدارة فقط" : "This space is for administrators only"}</h2><p className="mt-3 text-sm leading-6 text-[#886e42]">{isArabic ? "سجل الدخول بحساب الأدمن لمراجعة الطلبات وتسعيرها." : "Sign in with the admin account to review and price requests."}</p><Link href="/auth" className="mt-5 inline-flex rounded-xl bg-[#35530e] px-5 py-3 text-sm font-bold text-white no-underline">{isArabic ? "تسجيل الدخول" : "Sign in"}</Link></section></main></PlatformShell>;

  return <PlatformShell title={isArabic ? "طلبات عروض" : "Quote requests"} eyebrow={isArabic ? "استقبال الطلبات وتسعيرها وحفظها" : "Receive, price, and save customer quotes"}><AccessGate>{editor ? <Editor record={editor} setRecord={setEditor} onSave={persist} onDownload={downloadPdf} downloading={downloading} sheetRef={sheetRef} onClose={closeEditor} language={language} /> : <main className="container py-8">
    <section className="flex flex-col justify-between gap-5 rounded-[1.6rem] bg-[#003f31] p-6 text-white sm:flex-row sm:items-center sm:p-8"><div><p className="text-xs font-bold tracking-[.16em] text-[#b9dfcf]">{isArabic ? "مكتب الإدارة" : "ADMIN DESK"}</p><h1 className="mt-2 text-2xl font-extrabold">{isArabic ? "طلبات عروض الأسعار" : "Quote requests"}</h1><p className="mt-2 text-sm text-[#d5eee3]">{isArabic ? "افتح أي طلب، ضع الأسعار، أضف الشحن، ثم احفظه أو نزّله PDF." : "Open a request, add pricing and shipping, then save or download it as a PDF."}</p></div><Button onClick={newQuote} className="h-11 rounded-xl bg-[#b9dfcf] font-extrabold text-[#003f31] hover:bg-white"><FilePlus2 className="me-2 size-5" />{isArabic ? "إنشاء عرض سعر" : "Create quote"}</Button></section>
    <RecordList title={isArabic ? "طلبات العملاء الجديدة" : "New customer requests"} empty={isArabic ? "لا توجد طلبات عروض جديدة." : "No new quote requests."} records={requests} onOpen={openEditor} onDelete={id => { if (window.confirm(isArabic ? "حذف هذا الطلب نهائيًا؟" : "Delete this request permanently?")) { deleteRemoteQuote(id).then(() => setRecords(previous => previous.filter(record => record.id !== id))).catch(error => toast.error(error instanceof Error ? error.message : "تعذر حذف الطلب.")); } }} language={language} />
    <RecordList title={isArabic ? "سجل عروض الأسعار" : "Saved quotes"} empty={isArabic ? "لم يتم حفظ عروض أسعار بعد." : "No saved quotes yet."} records={savedQuotes} onOpen={openEditor} onDelete={id => { if (window.confirm(isArabic ? "حذف هذا العرض نهائيًا؟" : "Delete this quote permanently?")) { deleteRemoteQuote(id).then(() => setRecords(previous => previous.filter(record => record.id !== id))).catch(error => toast.error(error instanceof Error ? error.message : "تعذر حذف العرض.")); } }} language={language} />
  </main>}</AccessGate></PlatformShell>;
}

function RecordList({ title, empty, records, onOpen, onDelete, language }: { title: string; empty: string; records: QuoteRecord[]; onOpen: (record: QuoteRecord) => void; onDelete: (id: string) => void; language: "ar" | "en" }) {
  return <section className="mt-7"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-[#314617]">{title}</h2><span className="rounded-full bg-[#edf4e5] px-3 py-1 text-xs font-bold text-[#5d7837]">{records.length}</span></div>{records.length ? <div className="mt-4 grid gap-3 lg:grid-cols-2">{records.map(record => { const totals = getTotals(record); return <article key={record.id} className="rounded-[1.4rem] border border-[#35530e]/10 bg-white p-5 shadow-[0_10px_24px_rgba(48,67,22,.04)]"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[.12em] text-[#78924a]">{record.quoteNumber}</p><h3 className="mt-1 text-lg font-bold text-[#314617]">{record.customerName || (language === "ar" ? "عميل بدون اسم" : "Unnamed customer")}</h3><p className="mt-1 text-xs text-[#718062]" dir="ltr">{record.phone || "—"} · {new Date(record.createdAt).toLocaleDateString(language === "ar" ? "ar-JO" : "en-US")}</p></div><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${record.status === "priced" ? "bg-[#e3f1e5] text-[#39734b]" : "bg-[#fff3d9] text-[#946d25]"}`}>{record.status === "priced" ? (language === "ar" ? "تم التسعير" : "Priced") : (language === "ar" ? "بانتظار التسعير" : "Pending pricing")}</span></div><div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#68775a]"><span className="rounded-lg bg-[#f5f8f1] px-3 py-2">{record.items.length} {language === "ar" ? "أصناف" : "items"}</span><span className="rounded-lg bg-[#f5f8f1] px-3 py-2">{language === "ar" ? "المجموع" : "Total"}: {totals.total.toFixed(2)} د.أ</span><span className="rounded-lg bg-[#f5f8f1] px-3 py-2">{record.fulfillment === "delivery" ? (language === "ar" ? "توصيل" : "Delivery") : (language === "ar" ? "استلام" : "Pickup")}</span></div><div className="mt-4 flex gap-2"><Button onClick={() => onOpen(record)} className="h-10 flex-1 rounded-xl bg-[#35530e] text-white hover:bg-[#294108]"><Pencil className="me-2 size-4" />{language === "ar" ? "فتح وتعديل" : "Open & edit"}</Button><Button onClick={() => onDelete(record.id)} variant="outline" className="h-10 rounded-xl border-[#e2bdb1] text-[#914f42] hover:bg-[#fff5f2]"><Trash2 className="size-4" /></Button></div></article>; })}</div> : <div className="mt-4 rounded-2xl border border-dashed border-[#c3d4ae] bg-white p-8 text-center text-sm text-[#718062]">{empty}</div>}</section>;
}

function Editor({ record, setRecord, onSave, onDownload, downloading, sheetRef, onClose, language }: { record: QuoteRecord; setRecord: (record: QuoteRecord) => void; onSave: () => void; onDownload: () => void; downloading: boolean; sheetRef: RefObject<HTMLDivElement | null>; onClose: () => void; language: "ar" | "en" }) {
  const isArabic = language === "ar";
  const [smartOpen, setSmartOpen] = useState(false);
  const totals = useMemo(() => getTotals(record), [record]);
  const update = <K extends keyof QuoteRecord>(key: K, value: QuoteRecord[K]) => setRecord({ ...record, [key]: value });
  const updateItem = (itemId: string, patch: Partial<QuoteItem>) => update("items", record.items.map(item => item.id === itemId ? { ...item, ...patch } : item));
  const addItem = () => update("items", [...record.items, { ...record.items[0], id: `item-${Date.now()}`, nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "", categoryAr: "", categoryEn: "", quantity: 1, size: "", price: 0, imagePath: "" }]);
  const removeItem = (itemId: string) => update("items", record.items.filter(item => item.id !== itemId));
  const choosePlant = (itemId: string, plantId: string) => { const plant = getCatalog().find(item => item.id === plantId); if (!plant) return; const base = record.items.find(item => item.id === itemId); if (!base) return; const categoriesAr = plant.categoryTags.map(category => categoryLabels[category].ar).join("، "); const categoriesEn = plant.categoryTags.map(category => categoryLabels[category].en).join(", "); updateItem(itemId, { plantId, nameAr: plant.nameAr, nameEn: plant.nameEn, descriptionAr: plant.description.ar, descriptionEn: plant.description.en, categoryAr: categoriesAr, categoryEn: categoriesEn, imagePath: plant.imagePath }); };
  const uploadImage = (itemId: string, event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => updateItem(itemId, { imagePath: String(reader.result) }); reader.readAsDataURL(file); };
  const uploadBrandAsset = (key: "logoPath" | "stampPath", event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => update(key, String(reader.result)); reader.readAsDataURL(file); };
  const toggleColumn = (key: QuoteColumnKey) => update("visibleColumns", { ...record.visibleColumns, [key]: !record.visibleColumns[key] });
  const updateLabel = (key: QuoteColumnKey, value: string) => update("columnLabels", { ...record.columnLabels, [key]: value });
  const catalog = getCatalog();

  return <main className="container py-8">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><button onClick={onClose} className="inline-flex items-center gap-2 text-sm font-bold text-[#52731f] hover:underline"><ArrowRight className="size-4" />{isArabic ? "العودة للسجل" : "Back to register"}</button><div className="flex flex-wrap gap-2"><Button onClick={() => setSmartOpen(true)} className="h-10 rounded-xl bg-[#f2a007] font-black text-white hover:bg-[#d88900]"><Sparkles className="me-2 size-4" />{isArabic ? "تحليل ذكي" : "Smart analysis"}</Button><Button onClick={onSave} className="h-10 rounded-xl bg-[#35530e] text-white hover:bg-[#294108]"><Save className="me-2 size-4" />{isArabic ? "حفظ العرض" : "Save quote"}</Button><Button onClick={onDownload} disabled={downloading} variant="outline" className="h-10 rounded-xl border-[#9dbb82] text-[#35530e]"><Download className="me-2 size-4" />{downloading ? (isArabic ? "جاري التجهيز" : "Preparing") : (isArabic ? "تنزيل PDF" : "Download PDF")}</Button></div></div>
    <div className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
      <section className="space-y-5">
        <article className="rounded-[1.5rem] border border-[#35530e]/10 bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[#edf4e5] text-[#52731f]"><ReceiptText className="size-5" /></span><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "بيانات المؤسسة" : "COMPANY DETAILS"}</p><h2 className="mt-1 text-xl font-bold text-[#314617]">{isArabic ? "تظهر مباشرة في المعاينة" : "Shown live in the preview"}</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div><Label>{isArabic ? "اسم المؤسسة بالعربية" : "Company name (Arabic)"}</Label><Input value={record.companyNameAr || ""} onChange={event => update("companyNameAr", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div><div><Label>{isArabic ? "اسم المؤسسة بالإنجليزية" : "Company name (English)"}</Label><Input value={record.companyNameEn || ""} onChange={event => update("companyNameEn", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div><div><Label>{isArabic ? "هاتف المؤسسة" : "Company phone"}</Label><Input dir="ltr" value={record.companyPhone || ""} onChange={event => update("companyPhone", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div><div><Label>{isArabic ? "البريد الإلكتروني" : "Company email"}</Label><Input dir="ltr" value={record.companyEmail || ""} onChange={event => update("companyEmail", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div><div className="sm:col-span-2"><Label>{isArabic ? "الموقع الإلكتروني" : "Website"}</Label><Input dir="ltr" value={record.companyWebsite || ""} onChange={event => update("companyWebsite", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div></div></article>
        <article className="rounded-[1.5rem] border border-[#35530e]/10 bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{record.kind === "request" ? (isArabic ? "طلب وارد" : "INCOMING REQUEST") : (isArabic ? "عرض يدوي" : "MANUAL QUOTE")}</p><h2 className="mt-1 text-xl font-bold text-[#314617]">{record.quoteNumber}</h2></div><button onClick={onClose} className="grid size-9 place-items-center rounded-lg text-[#718062] hover:bg-[#f2f6ec]"><X className="size-5" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div><Label>{isArabic ? "عنوان العرض" : "Quote title"}</Label><Input value={record.title} onChange={event => update("title", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div><div><Label>{isArabic ? "اسم العميل" : "Customer name"} *</Label><Input required value={record.customerName} onChange={event => update("customerName", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div><div><Label>{isArabic ? "رقم الهاتف" : "Phone"} *</Label><Input required dir="ltr" value={record.phone} onChange={event => update("phone", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div><div><Label>{isArabic ? "طريقة الطلب" : "Method"}</Label><select value={record.fulfillment} onChange={event => update("fulfillment", event.target.value as QuoteRecord["fulfillment"])} className="mt-1.5 h-10 w-full rounded-xl border border-[#dce6d2] bg-white px-3 text-sm"><option value="pickup">{isArabic ? "استلام من المشتل" : "Nursery pickup"}</option><option value="delivery">{isArabic ? "توصيل" : "Delivery"}</option></select></div>{record.fulfillment === "delivery" && <><div><Label>{isArabic ? "منطقة التوصيل" : "Delivery region"} *</Label><Input required value={record.deliveryRegion} onChange={event => update("deliveryRegion", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div><div><Label>{isArabic ? "العنوان" : "Address"} *</Label><Input required value={record.deliveryAddress} onChange={event => update("deliveryAddress", event.target.value)} className="mt-1.5 h-10 rounded-xl" /></div></>}<div className="sm:col-span-2"><Label>{isArabic ? "ملاحظات العميل" : "Customer notes"}</Label><Textarea value={record.notes} onChange={event => update("notes", event.target.value)} className="mt-1.5 min-h-20 rounded-xl" /></div></div></article>

        <article className="rounded-[1.5rem] border border-[#35530e]/10 bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[#edf4e5] text-[#52731f]"><ReceiptText className="size-5" /></span><div><p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "تخصيص المستند" : "DOCUMENT CUSTOMIZATION"}</p><h2 className="mt-1 text-xl font-bold text-[#314617]">{isArabic ? "الأعمدة والنصوص" : "Columns & copy"}</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{columnKeys.map(key => <div key={key} className="flex items-center gap-2"><input type="checkbox" checked={record.visibleColumns[key]} onChange={() => toggleColumn(key)} /><Input value={record.columnLabels[key]} onChange={event => updateLabel(key, event.target.value)} disabled={!record.visibleColumns[key]} className="h-9 rounded-lg" /></div>)}<div><Label>{isArabic ? "نص أسفل العرض" : "Footer copy"}</Label><Input value={record.footerText} onChange={event => update("footerText", event.target.value)} className="mt-1 h-9 rounded-lg" /></div><div><Label>{isArabic ? "عبارة الختام" : "Closing line"}</Label><Input value={record.closingText || ""} onChange={event => update("closingText", event.target.value)} className="mt-1 h-9 rounded-lg" /></div><div><Label>{isArabic ? "الشعار" : "Logo"}</Label><label className="mt-1 flex h-9 cursor-pointer items-center rounded-lg border border-[#c4d7ac] bg-white px-3 text-xs font-bold text-[#52731f]">{isArabic ? "رفع شعار جديد" : "Upload logo"}<input type="file" accept="image/*" onChange={event => uploadBrandAsset("logoPath", event)} className="hidden" /></label></div><div><Label>{isArabic ? "الختم" : "Stamp"}</Label><label className="mt-1 flex h-9 cursor-pointer items-center rounded-lg border border-[#c4d7ac] bg-white px-3 text-xs font-bold text-[#52731f]">{isArabic ? "رفع ختم جديد" : "Upload stamp"}<input type="file" accept="image/*" onChange={event => uploadBrandAsset("stampPath", event)} className="hidden" /></label></div></div></article>
      </section>
      <section><div className="sticky top-4 overflow-hidden rounded-[1.5rem] border border-[#35530e]/10 bg-[#e9eee2] p-3 shadow-[0_14px_35px_rgba(48,67,22,.08)]"><div className="mb-3 flex items-center justify-between gap-2 px-2"><h2 className="text-sm font-bold text-[#405525]">{isArabic ? "معاينة العرض" : "Quote preview"}</h2><div className="flex items-center gap-2 text-xs font-bold text-[#648534]"><span>{isArabic ? "المجموع الفرعي" : "Subtotal"}: {totals.subtotal.toFixed(2)}</span>{record.fulfillment === "delivery" && <><span className="flex items-center gap-1"><Minus className="size-3" />{isArabic ? "شحن" : "Shipping"}</span><Input type="number" min="0" step="0.01" value={record.shippingFee} onChange={event => update("shippingFee", Math.max(0, Number(event.target.value) || 0))} className="h-8 w-20 rounded-lg bg-white text-xs" /></>}</div></div><div className="max-h-[calc(100vh-170px)] overflow-auto rounded-xl shadow-sm"><QuoteDocument ref={sheetRef} className="min-h-[210mm] w-[297mm]" record={record} /></div></div></section>
    </div>
    {smartOpen && <SmartAnalysis language={language} onClose={() => setSmartOpen(false)} onApply={items => { setRecord({ ...record, items: [...record.items, ...items] }); setSmartOpen(false); toast.success(isArabic ? "تمت إضافة الأصناف إلى الجدول." : "Items added to the table."); }} />}
  </main>;
}

function SmartAnalysis({ language, onClose, onApply }: { language: "ar" | "en"; onClose: () => void; onApply: (items: QuoteItem[]) => void }) {
  const isArabic = language === "ar";
  const [raw, setRaw] = useState("");
  const parse = () => {
    const items = raw.split(/\n+/).map(line => line.trim()).filter(Boolean).map((line, index): QuoteItem | null => {
      const parts = line.split(/[|/،]+/).map(part => part.trim()).filter(Boolean);
      if (parts.length < 2) return null;
      const quantityMatch = parts[0].match(/\d+(?:\.\d+)?/);
      const quantity = Math.max(1, Number(quantityMatch?.[0] || 1));
      const priceIndex = parts.findIndex((part, partIndex) => partIndex > 0 && /^\d+(?:\.\d+)?$/.test(part));
      const price = priceIndex >= 0 ? Number(parts[priceIndex]) : 0;
      const name = parts[1] || `نبات ${index + 1}`;
      const plant = getCatalog().find(item => item.nameAr === name || item.nameEn.toLowerCase() === name.toLowerCase() || item.nameAr.includes(name) || name.includes(item.nameAr));
      const description = parts[2] || (plant ? plant.description.ar : "");
      const category = parts[3] || (plant ? plant.categoryTags.map(tag => categoryLabels[tag].ar).join("، ") : "");
      const size = parts.find((part, partIndex) => partIndex > 1 && !/^\d+(?:\.\d+)?$/.test(part) && part !== description && part !== category) || "small";
      return { id: `smart-${Date.now()}-${index}`, plantId: plant?.id || "", nameAr: plant?.nameAr || name, nameEn: plant?.nameEn || name, descriptionAr: plant?.description.ar || description, descriptionEn: plant?.description.en || description, categoryAr: plant ? plant.categoryTags.map(tag => categoryLabels[tag].ar).join("، ") : category, categoryEn: plant ? plant.categoryTags.map(tag => categoryLabels[tag].en).join(", ") : category, quantity, size, price, imagePath: plant?.imagePath || "" };
    }).filter((item): item is QuoteItem => Boolean(item));
    if (!items.length) { toast.error(isArabic ? "اكتب كل صنف في سطر منفصل باستخدام / بين البيانات." : "Write each item on a separate line using / between fields."); return; }
    onApply(items);
  };
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-[#17352d]/45 p-4 backdrop-blur-sm"><section dir={isArabic ? "rtl" : "ltr"} className="w-full max-w-md rounded-2xl border border-[#e5c24d] bg-[#fffdf0] p-4 shadow-2xl"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-black text-[#734d08]"><Sparkles className="size-5" />{isArabic ? "تحليل ذكي" : "Smart analysis"}</h2><button type="button" onClick={onClose} className="text-[#734d08]" aria-label={isArabic ? "إغلاق" : "Close"}>×</button></div><p className="mt-2 text-xs leading-5 text-[#8b7440]">{isArabic ? "اكتب كل صنف بسطر: الكمية / الاسم / الوصف / القسم / الحجم / السعر" : "One item per line: quantity / name / description / category / size / price"}</p><textarea value={raw} onChange={event => setRaw(event.target.value)} className="mt-3 min-h-40 w-full resize-y rounded-xl border border-[#e5c24d] bg-white p-3 text-sm leading-7 outline-none focus:ring-2 focus:ring-[#f2a007]" placeholder={isArabic ? "3 / نخيل تمري / وصف النبات / أشجار / small / 150\n5 / زيتون / وصف النبات / أشجار / medium / 80" : "3 / Date palm / description / Trees / small / 150"} /><Button type="button" onClick={parse} className="mt-3 h-11 w-full rounded-xl bg-[#f2a007] font-black text-white hover:bg-[#d88900]"><Sparkles className="me-2 size-4" />{isArabic ? "تحليل وتعبئة الجدول" : "Analyze and fill table"}</Button></section></div>;
}
