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

async function downloadFallbackPdf(record: QuoteRecord, isArabic: boolean) {
  const root = document.createElement("div");
  root.dir = isArabic ? "rtl" : "ltr";
  root.style.cssText = "position:fixed;left:-10000px;top:0;width:1120px;min-height:790px;padding:56px;background:#fff;color:#172319;font-family:Arial,Tahoma,sans-serif;font-size:22px;line-height:1.65;";
  const add = (text: string, className = "") => { const node = document.createElement("div"); node.textContent = text; node.className = className; root.appendChild(node); };
  add(record.companyNameAr || record.companyNameEn || "مؤسسة القادري الزراعية", "company");
  add(`${isArabic ? "رقم العرض" : "Quote number"}: ${record.quoteNumber}`);
  add(`${isArabic ? "العميل" : "Customer"}: ${record.customerName || "—"}`);
  add(`${isArabic ? "الهاتف" : "Phone"}: ${record.phone || "—"}`);
  add(`${isArabic ? "طريقة الاستلام" : "Fulfillment method"}: ${record.fulfillmentLabel || (record.fulfillment === "delivery" ? (isArabic ? "توصيل" : "Delivery") : (isArabic ? "استلام من المشتل" : "Pickup") )}`);
  add(" ");
  record.items.forEach((item, index) => add(`${index + 1}. ${isArabic ? item.nameAr : item.nameEn || item.nameAr} — ${isArabic ? "الكمية" : "Qty"}: ${item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)} JOD`));
  const totals = getTotals(record);
  add(" ");
  add(`${isArabic ? "المجموع الفرعي" : "Subtotal"}: ${totals.subtotal.toFixed(2)} JOD`);
  add(`${isArabic ? "رسوم الشحن" : "Shipping"}: ${totals.shipping.toFixed(2)} JOD`);
  add(`${isArabic ? "المجموع الكلي" : "Total"}: ${totals.total.toFixed(2)} JOD`, "total");
  document.body.appendChild(root);
  try {
    await document.fonts?.ready;
    const canvas = await html2canvas(root, { scale: 1, backgroundColor: "#ffffff", logging: false });
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const margin = 8;
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    const imageHeight = canvas.height * pageWidth / canvas.width;
    const imageData = canvas.toDataURL("image/jpeg", 0.92);
    const pages = Math.max(1, Math.ceil(imageHeight / pageHeight));
    for (let page = 0; page < pages; page += 1) {
      if (page) pdf.addPage();
      pdf.addImage(imageData, "JPEG", margin, margin - page * pageHeight, pageWidth, imageHeight);
    }
    pdf.save(downloadName(record));
  } finally {
    root.remove();
  }
}

async function captureQuoteSheet(source: HTMLDivElement) {
  const exportRoot = document.createElement("div");
  exportRoot.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#fff;overflow:visible;padding:0;margin:0;";
  const clone = source.cloneNode(true) as HTMLDivElement;
  clone.style.width = "794px";
  clone.style.minWidth = "794px";
  clone.style.minHeight = "1122px";
  clone.style.height = "auto";
  clone.style.background = "#fff";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.querySelectorAll("[data-quote-controls]").forEach(node => node.remove());
  clone.querySelectorAll("input, textarea, select").forEach(node => {
    const field = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (field.type === "file") { node.remove(); return; }
    const text = field instanceof HTMLSelectElement ? field.options[field.selectedIndex]?.text || "" : field.value;
    const replacement = document.createElement("span");
    replacement.textContent = text || "—";
    replacement.style.cssText = "display:inline-block;white-space:pre-wrap;";
    node.replaceWith(replacement);
  });
  clone.querySelectorAll("button").forEach(node => node.remove());
  exportRoot.appendChild(clone);
  document.body.appendChild(exportRoot);
  try {
    await document.fonts?.ready;
    return await html2canvas(exportRoot, { scale: 1, backgroundColor: "#ffffff", useCORS: true, allowTaint: false, imageTimeout: 15000, logging: false, scrollX: 0, scrollY: 0 });
  } finally {
    exportRoot.remove();
  }
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
      const pageNodes = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(".quote-page"));
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      for (let page = 0; page < pageNodes.length; page += 1) {
        const canvas = await captureQuoteSheet(pageNodes[page]);
        if (page) pdf.addPage();
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
        const imageHeight = canvas.height * pageWidth / canvas.width;
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, pageWidth, Math.min(pageHeight, imageHeight));
      }
      pdf.save(downloadName(editor));
      toast.success(isArabic ? "تم تنزيل ملف PDF." : "PDF downloaded.");
    } catch (error) {
      console.error("[Quote PDF] visual export failed, using fallback", error);
      try {
        await downloadFallbackPdf(editor, isArabic);
        toast.success(isArabic ? "تم تنزيل PDF نصي احتياطي." : "Fallback PDF downloaded.");
      } catch (fallbackError) {
        console.error("[Quote PDF] fallback export failed", fallbackError);
        toast.error(isArabic ? "تعذر إنشاء ملف PDF. حاول تحديث الصفحة." : "Could not create the PDF. Please refresh and try again.");
      }
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

  return <main className="quote-editor container py-8 [&_input]:text-center [&_textarea]:text-center">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><button onClick={onClose} className="inline-flex items-center gap-2 text-sm font-bold text-[#52731f] hover:underline"><ArrowRight className="size-4" />{isArabic ? "العودة للسجل" : "Back to register"}</button><div className="flex flex-wrap gap-2"><Button onClick={() => setSmartOpen(true)} className="h-10 rounded-xl bg-[#f2a007] font-black text-white hover:bg-[#d88900]"><Sparkles className="me-2 size-4" />{isArabic ? "تحليل ذكي" : "Smart analysis"}</Button><Button onClick={onSave} className="h-10 rounded-xl bg-[#35530e] text-white hover:bg-[#294108]"><Save className="me-2 size-4" />{isArabic ? "حفظ العرض" : "Save quote"}</Button><Button onClick={onDownload} disabled={downloading} variant="outline" className="h-10 rounded-xl border-[#9dbb82] text-[#35530e]"><Download className="me-2 size-4" />{downloading ? (isArabic ? "جاري التجهيز" : "Preparing") : (isArabic ? "تنزيل PDF" : "Download PDF")}</Button></div></div>
    <div className="rounded-[1.5rem] border border-[#35530e]/10 bg-[#e9eee2] p-3 shadow-[0_14px_35px_rgba(48,67,22,.08)]"><div className="mb-3 px-2 text-sm font-bold text-[#405525]">{isArabic ? "عدّل البيانات مباشرة داخل صفحة العرض" : "Edit the quote directly on the page"}</div><div ref={sheetRef} className="quote-pages overflow-auto rounded-xl bg-[#dfe7d8] p-4"><div className="grid justify-center gap-5">{Array.from({ length: Math.max(1, Math.ceil(record.items.length / 5)) }, (_, pageIndex) => { const pageItems = record.items.slice(pageIndex * 5, pageIndex * 5 + 5); const pageRecord = { ...record, items: pageItems }; return <QuoteDocument key={pageIndex} className="quote-page min-h-[297mm] w-[210mm] bg-white p-[12mm] shadow-[0_8px_24px_rgba(30,60,35,.12)]" record={pageRecord} showFooter={pageIndex === Math.ceil(record.items.length / 5) - 1} editable onChange={patch => setRecord({ ...record, ...patch })} onItemChange={(itemId, patch) => update("items", record.items.map(item => item.id === itemId ? { ...item, ...patch } : item))} onImageChange={(itemId, dataUrl) => update("items", record.items.map(item => item.id === itemId ? { ...item, imagePath: dataUrl } : item))} onAddItem={addItem} onRemoveItem={removeItem} onLogoChange={dataUrl => update("logoPath", dataUrl)} onStampChange={dataUrl => update("stampPath", dataUrl)} />; })}</div></div></div>
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
