import { AccessGate, AdminGate, PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { documentTypeLabel, emptyDocument, getDocuments, removeDocument, saveDocument, subscribeToDocuments, type DocumentType, type FinancialDocument, type InvoiceRow, type PaymentMethod } from "@/data/financialDocuments";
import { FileDown, ImagePlus, Plus, Printer, ReceiptText, Save, ShoppingCart, Trash2 } from "lucide-react";
import { getNeonValue, setNeonValue } from "@/data/neonStorage";
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const tabs: DocumentType[] = ["exportInvoice", "salesInvoice", "purchaseInvoice", "purchaseOrder", "receipt", "disbursement"];
const paymentLabels: Record<PaymentMethod, string> = { cash: "نقداً", check: "شيك", transfer: "تحويل", online: "أونلاين" };
const updateRow = (rows: InvoiceRow[], index: number, key: keyof InvoiceRow, value: string) => rows.map((row, i) => i === index ? { ...row, [key]: value } : row);

export default function FinancialDocuments() {
  const [type, setType] = useState<DocumentType>("exportInvoice");
  const [documents, setDocuments] = useState<FinancialDocument[]>(() => getDocuments());
  const [doc, setDoc] = useState<FinancialDocument>(() => emptyDocument("exportInvoice"));
  const [query, setQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  useEffect(() => subscribeToDocuments(() => setDocuments(getDocuments())), []);
  useEffect(() => {
    const handleCommand = (event: Event) => {
      const content = (event as CustomEvent<{ content?: string }>).detail?.content?.trim() || "";
      if (!content) return;
      const lower = content.toLocaleLowerCase();
      const nextType: DocumentType = /فاتورة\s*بيع/.test(lower) ? "salesInvoice" : /فاتورة\s*شراء/.test(lower) ? "purchaseInvoice" : /طلب\s*شراء|شراء/.test(lower) ? "purchaseOrder" : /سند\s*قبض|وصل\s*قبض/.test(lower) ? "receipt" : /سند\s*صرف|وصل\s*صرف/.test(lower) ? "disbursement" : /فاتورة|تصدير/.test(lower) ? "exportInvoice" : type;
      setType(nextType);
      setDoc(current => ({ ...current, type: nextType }));
    };
    window.addEventListener("financial-ai-command", handleCommand);
    return () => window.removeEventListener("financial-ai-command", handleCommand);
  }, [type]);
  const filtered = useMemo(() => documents.filter(item => item.type === type && `${item.number} ${item.personName} ${item.destination} ${item.sourceName} ${item.supplier} ${item.requestedFrom}`.includes(query)), [documents, type, query]);
  const changeType = (next: DocumentType) => { setType(next); setDoc(emptyDocument(next)); };
  const patch = (changes: Partial<FinancialDocument>) => setDoc(current => ({ ...current, ...changes }));
  const addRow = () => patch({ rows: [...doc.rows, { item: "", weight: "", quantity: "", origin: "", notes: "", dinar: "0", fils: "000", unit: "", unitPrice: "", lineTotal: "" }] });
  const save = () => { saveDocument(doc); setDocuments(getDocuments()); };
  return <AccessGate><AdminGate><PlatformShell title="الفواتير والسندات" eyebrow="إدارة المستندات المالية"><main className="container py-8" dir="rtl">
    <style>{`@media print { body * { visibility: hidden !important; } #financial-document, #financial-document * { visibility: visible !important; } #financial-document { position: absolute; inset: 0; width: 100%; } .no-print { display: none !important; } }`}</style>
    <section className="no-print relative overflow-hidden rounded-[1.6rem] bg-[#064b3a] p-6 text-white shadow-[0_18px_45px_rgba(6,75,58,.18)]"><div className="absolute -left-10 -top-16 size-48 rounded-full bg-[#c8a75a]/20 blur-2xl" /><p className="relative text-xs font-bold tracking-[.16em] text-[#bde1c9]">QADRI AGRICULTURE · ADMIN</p><h1 className="relative mt-2 text-3xl font-black">الفواتير والسندات</h1><p className="relative mt-2 text-sm text-[#d5eee3]">أنشئ واحفظ واطبع مستندات المؤسسة بتنسيق رسمي موحّد.</p></section>
    <div className="no-print mt-6 flex flex-wrap gap-2">{tabs.map(item => <button key={item} type="button" onClick={() => changeType(item)} className={`rounded-xl px-4 py-3 text-sm font-bold transition ${type === item ? "bg-[#0a4b39] text-white shadow-md" : "border border-[#cfe0d6] bg-white text-[#49665b] hover:border-[#8ab8a3]"}`}>{item === "purchaseOrder" && <ShoppingCart className="me-2 inline size-4" />}{documentTypeLabel(item)}</button>)}</div><Button type="button" onClick={() => setCatalogOpen(true)} className="rounded-xl bg-[#c8a75a] px-4 py-3 font-black text-[#3f3012] hover:bg-[#b49348]"><ReceiptText className="me-2 inline size-4" />كتالوج</Button>
    {catalogOpen ? <CatalogEditor onClose={() => setCatalogOpen(false)} /> : <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
      <section className="no-print rounded-2xl border border-[#d8e7dd] bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#7a9a8a]">ARCHIVE</p><h2 className="text-lg font-black text-[#17342d]">المحفوظات</h2></div><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="بحث..." className="h-9 w-36 rounded-lg" /></div><div className="mt-4 space-y-2">{filtered.map(item => <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#f4f8f4] p-3"><button type="button" className="min-w-0 flex-1 text-start" onClick={() => setDoc(item)}><b className="block truncate text-sm">{item.number}</b><span className="text-xs text-[#6c8177]">{item.date} · {item.personName || item.destination || item.supplier || item.sourceName || "بدون اسم"}</span></button><button type="button" onClick={() => { removeDocument(item.id); setDocuments(getDocuments()); }} className="rounded-lg p-2 text-red-700" aria-label="حذف"><Trash2 className="size-4" /></button></div>)}{!filtered.length && <p className="rounded-xl border border-dashed p-4 text-center text-sm text-[#71877c]">لا توجد مستندات محفوظة.</p>}</div></section>
      <section id="financial-document" className={`rounded-2xl border-2 bg-white p-5 shadow-[0_18px_50px_rgba(20,69,48,.10)] sm:p-8 ${type === "purchaseOrder" ? "border-[#c8a75a]" : "border-[#174d3b]"}`}>
        <DocumentHeader doc={doc} type={type} />
        {type === "exportInvoice" ? <ExportForm doc={doc} patch={patch} addRow={addRow} /> : type === "purchaseOrder" ? <PurchaseOrderForm doc={doc} patch={patch} addRow={addRow} /> : type === "salesInvoice" || type === "purchaseInvoice" ? <SimpleInvoiceForm type={type} doc={doc} patch={patch} addRow={addRow} /> : <VoucherForm type={type} doc={doc} patch={patch} />}
        <div className="no-print mt-6 flex flex-wrap gap-2 border-t pt-5"><Button onClick={save} className="bg-[#0a4b39] text-white"><Save className="me-2 size-4" />حفظ المستند</Button><Button onClick={() => setDoc(emptyDocument(type))} variant="outline"><Plus className="me-2 size-4" />مستند جديد</Button><Button onClick={() => window.print()} variant="outline"><Printer className="me-2 size-4" />طباعة / PDF</Button><Button onClick={() => window.print()} variant="outline"><FileDown className="me-2 size-4" />PDF صفحة واحدة</Button></div>
        <div className="mt-8 flex justify-start border-t-2 border-[#c8a75a] pt-5"><img src="/assets/qadri-stamp.png" alt="ختم مؤسسة القادري الزراعية" className="h-24 w-52 object-contain" /></div>
      </section>
    </div>}
  </main></PlatformShell></AdminGate></AccessGate>;
}

type CatalogItem = { id: string; number: number; name: string; images: string[] };
const catalogId = () => `catalog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const CATALOG_STORAGE_KEY = "qadri-financial-catalog";
const CATALOG_HISTORY_KEY = "qadri-financial-catalog-history";
const compactCatalogImage = (source: string, maxSize = 1100): Promise<string> => new Promise(resolve => { if (!source.startsWith("data:image")) return resolve(source); const image = new Image(); image.onload = () => { const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight)); const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio)); canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", 0.78)); }; image.onerror = () => resolve(source); image.src = source; });

function CatalogEditor({ onClose }: { onClose: () => void }) {
  const [subtitle, setSubtitle] = useState("كتالوج المنتجات الزراعية");
  const [items, setItems] = useState<CatalogItem[]>([{ id: catalogId(), number: 1, name: "", images: [] }]);
  const [logo, setLogo] = useState("/assets/qadri-logo.png");
  const [downloading, setDownloading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [catalogView, setCatalogView] = useState<"editor" | "history">("editor");
  const [catalogHistory, setCatalogHistory] = useState<Array<{ id: string; title: string; savedAt: string; subtitle: string; logo: string; items: CatalogItem[] }>>([]);
  const catalogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    Promise.all([
      getNeonValue<{ subtitle?: string; logo?: string; items?: CatalogItem[] }>(CATALOG_STORAGE_KEY),
      getNeonValue<Array<{ id: string; title: string; savedAt: string; subtitle: string; logo: string; items: CatalogItem[] }>>(CATALOG_HISTORY_KEY),
    ]).then(([saved, history]) => {
      if (!active) return;
      if (Array.isArray(history)) setCatalogHistory(history);
      if (saved) {
        if (saved.subtitle !== undefined) setSubtitle(saved.subtitle);
        if (saved.logo) setLogo(saved.logo);
        if (Array.isArray(saved.items) && saved.items.length) setItems(saved.items.map((item, index) => ({ ...item, number: index + 1, images: Array.isArray(item.images) ? item.images.slice(0, 2) : [] })));
      }
    }).catch(error => { console.warn("Could not restore catalog from Neon", error); if (active) setSavedMessage("تعذر تحميل الكتالوج من قاعدة البيانات"); });
    return () => { active = false; };
  }, []);
  const addItem = () => setItems(current => [...current, { id: catalogId(), number: current.length + 1, name: "", images: [] }]);
  const removeItem = (id: string) => setItems(current => current.length > 1 ? current.filter(item => item.id !== id).map((item, index) => ({ ...item, number: index + 1 })) : current);
  const updateItem = (id: string, patch: Partial<CatalogItem>) => setItems(current => current.map(item => item.id === id ? { ...item, ...patch } : item));
  const uploadImages = (id: string, event: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files || []).slice(0, 2); if (!files.length) return; Promise.all(files.map(file => new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file); }))).then(images => updateItem(id, { images: images.slice(0, 2) })); event.target.value = ""; };
  const removeImage = (id: string, index: number) => { const item = items.find(value => value.id === id); if (!item) return; updateItem(id, { images: item.images.filter((_, imageIndex) => imageIndex !== index) }); };
  const uploadLogo = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setLogo(String(reader.result)); reader.readAsDataURL(file); };
  const saveCatalog = async () => { if (saving) return; setSaving(true); setSavedMessage(""); try { const compactLogo = await compactCatalogImage(logo, 900); const compactItems = await Promise.all(items.map(async item => ({ ...item, images: await Promise.all(item.images.slice(0, 2).map(image => compactCatalogImage(image))) }))); const entry = { id: catalogId(), title: subtitle || "كتالوج المنتجات الزراعية", savedAt: new Date().toLocaleString("ar-JO"), subtitle, logo: compactLogo, items: compactItems }; const previous = (await getNeonValue<typeof catalogHistory>(CATALOG_HISTORY_KEY)) || []; const next = [entry, ...previous].slice(0, 20); await setNeonValue(CATALOG_STORAGE_KEY, { subtitle, logo: compactLogo, items: compactItems }); await setNeonValue(CATALOG_HISTORY_KEY, next); setLogo(compactLogo); setItems(compactItems); setCatalogHistory(next); setCatalogView("history"); } catch (error) { console.warn("Could not save catalog to Neon", error); const message = error instanceof Error ? error.message : "تعذر الاتصال بقاعدة البيانات"; setSavedMessage(message.includes("تسجيل") || message.includes("جلسة") || message.includes("401") ? "انتهت الجلسة، أعد تسجيل الدخول ثم حاول مرة أخرى" : "تعذر حفظ الكتالوج في قاعدة البيانات، حاول مرة أخرى"); } finally { setSaving(false); } };
  const startNewCatalog = () => { setSubtitle("كتالوج المنتجات الزراعية"); setLogo("/assets/qadri-logo.png"); setItems([{ id: catalogId(), number: 1, name: "", images: [] }]); setCatalogView("editor"); };
  const openSavedCatalog = (entry: typeof catalogHistory[number]) => { setSubtitle(entry.subtitle); setLogo(entry.logo); setItems(entry.items); setCatalogView("editor"); };
  const downloadPdf = async () => {
    if (!catalogRef.current) return;
    setDownloading(true);
    const exportRoot = document.createElement("div");
    exportRoot.style.cssText = "position:fixed;left:-10000px;top:0;width:900px;background:#fff;padding:0;margin:0;z-index:-1;";
    const clone = catalogRef.current.cloneNode(true) as HTMLDivElement;
    clone.style.width = "900px";
    clone.style.maxWidth = "900px";
    clone.style.margin = "0";
    clone.style.boxShadow = "none";
    clone.querySelectorAll("button, [data-catalog-image-controls]").forEach(node => node.remove());
    clone.querySelectorAll("label.no-print").forEach(label => {
      if (label.querySelector("img")) { label.querySelectorAll("input").forEach(input => input.remove()); label.classList.remove("no-print"); }
      else label.remove();
    });
    clone.querySelectorAll("input").forEach(node => {
      const field = node as HTMLInputElement;
      const replacement = document.createElement("span");
      replacement.textContent = field.value || "";
      replacement.style.cssText = "display:block;width:100%;min-height:28px;padding:6px;text-align:center;font-weight:700;";
      field.replaceWith(replacement);
    });
    exportRoot.appendChild(clone);
    document.body.appendChild(exportRoot);
    try {
      await document.fonts?.ready;
      await Promise.all(Array.from(exportRoot.querySelectorAll("img")).map(image => (image as HTMLImageElement).decode?.().catch(() => undefined)));
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const rows = Array.from(clone.querySelectorAll("tbody tr"));
      const sourcePageHeight = 900 * pageHeight / pageWidth;
      const headerHeight = clone.querySelector("header")?.getBoundingClientRect().height || 150;
      const tableHeadHeight = clone.querySelector("thead")?.getBoundingClientRect().height || 50;
      const footerHeight = clone.querySelector("footer")?.getBoundingClientRect().height || 120;
      const rowHeights = rows.map(row => row.getBoundingClientRect().height || 430);
      const usableHeight = sourcePageHeight - headerHeight - tableHeadHeight - footerHeight - 45;
      const pageGroups: Element[][] = [];
      let currentGroup: Element[] = [];
      let currentHeight = 0;
      rows.forEach((row, index) => {
        const rowHeight = rowHeights[index] || 430;
        if (currentGroup.length && currentHeight + rowHeight > usableHeight) { pageGroups.push(currentGroup); currentGroup = []; currentHeight = 0; }
        currentGroup.push(row); currentHeight += rowHeight;
      });
      if (currentGroup.length) pageGroups.push(currentGroup);
      if (!pageGroups.length) pageGroups.push([]);
      for (let page = 0; page < pageGroups.length; page += 1) {
        const pageClone = clone.cloneNode(true) as HTMLDivElement;
        const pageBody = pageClone.querySelector("tbody");
        if (pageBody) pageBody.replaceChildren(...pageGroups[page].map(row => row.cloneNode(true)));
        if (page < pageGroups.length - 1) pageClone.querySelector("footer")?.remove();
        exportRoot.replaceChildren(pageClone);
        await Promise.all(Array.from(exportRoot.querySelectorAll("img")).map(image => (image as HTMLImageElement).decode?.().catch(() => undefined)));
        const canvas = await html2canvas(exportRoot, { scale: 2, backgroundColor: "#ffffff", useCORS: true, allowTaint: false, imageTimeout: 20000, logging: false, scrollX: 0, scrollY: 0 });
        const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
        const imageWidth = canvas.width * scale;
        const imageHeight = canvas.height * scale;
        const image = canvas.toDataURL("image/jpeg", 0.95);
        if (page) pdf.addPage();
        pdf.addImage(image, "JPEG", (pageWidth - imageWidth) / 2, (pageHeight - imageHeight) / 2, imageWidth, imageHeight);
      }
      pdf.save("كتالوج_مؤسسة_القادري.pdf");
    } catch (error) {
      console.error("Catalog visual PDF failed", error);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      pdf.setFontSize(16); pdf.text("Qadri Agricultural Catalog", 105, 20, { align: "center" });
      pdf.setFontSize(11); items.forEach((item, index) => pdf.text(`${index + 1}. ${item.name || "Catalog item"}`, 190, 35 + index * 8, { align: "right" }));
      pdf.save("catalog-qadri.pdf");
    } finally { exportRoot.remove(); setDownloading(false); }
  };

  if (catalogView === "history") return <section className="mt-6 rounded-2xl border-2 bg-[#eef5f0] p-5" style={{ borderColor: "#000000" }} dir="rtl"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black text-[#174d3b]">سجل الكتالوجات</h2><p className="mt-1 text-sm text-[#60766b]">الكتالوجات المحفوظة</p></div><div className="flex gap-2"><Button type="button" onClick={startNewCatalog} className="bg-[#174d3b] text-white"><Plus className="me-2 size-4" />كتالوج جديد</Button><Button type="button" onClick={onClose} variant="outline">العودة للفواتير</Button></div></div>{catalogHistory.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{catalogHistory.map(entry => <button key={entry.id} type="button" onClick={() => openSavedCatalog(entry)} className="rounded-xl border border-[#cfe0d6] bg-white p-4 text-end shadow-sm hover:border-[#174d3b]"><div className="flex items-center gap-3"><img src={entry.logo || "/assets/qadri-logo.png"} alt="" className="size-14 rounded-lg object-contain" /><div><h3 className="font-black text-[#174d3b]">{entry.title}</h3><p className="mt-1 text-xs text-[#71877c]">{entry.savedAt}</p><p className="mt-1 text-xs text-[#71877c]">{entry.items.length} بند</p></div></div></button>)}</div> : <div className="rounded-xl border border-dashed border-[#b7cfc1] bg-white p-10 text-center text-[#71877c]">لا يوجد كتالوجات محفوظة بعد</div>}</section>;
  return <section className="mt-6 rounded-2xl border-2 bg-[#eef5f0] p-4 shadow-[0_18px_50px_rgba(20,69,48,.1)]" style={{ borderColor: "#000000" }}><div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Button type="button" onClick={() => setCatalogView("history")} variant="outline">سجل الكتالوجات</Button><Button type="button" onClick={saveCatalog} disabled={saving} className="bg-[#174d3b] text-white"><Save className="me-2 size-4" />{saving ? "جاري الحفظ" : "حفظ الكتالوج"}</Button>{savedMessage && <span className="text-sm font-bold text-[#216248]">{savedMessage}</span>}</div><div className="flex gap-2"><Button type="button" onClick={addItem} className="bg-[#0a4b39] text-white"><Plus className="me-2 size-4" />إضافة بند</Button><Button type="button" onClick={downloadPdf} disabled={downloading} className="bg-[#c8a75a] text-[#3f3012] hover:bg-[#b49348]"><FileDown className="me-2 size-4" />{downloading ? "جاري تجهيز PDF" : "تنزيل PDF"}</Button></div></div><div ref={catalogRef} className="mx-auto max-w-[900px] bg-white p-7 shadow-[0_12px_35px_rgba(25,65,47,.14)] sm:p-12" dir="rtl"><header className="border-b-2 pb-6 text-center" style={{ borderColor: "#000000" }}><label className="no-print block cursor-pointer"><img src={logo} alt="شعار مؤسسة القادري الزراعية" className="mx-auto h-24 w-auto object-contain" /><input type="file" accept="image/*" className="hidden" onChange={uploadLogo} /></label><h1 className="mt-3 text-3xl font-black text-[#174d3b]">مؤسسة القادري الزراعية</h1><input value={subtitle} onChange={event => setSubtitle(event.target.value)} className="no-print mt-4 w-full rounded-lg border border-[#d8e7dd] bg-[#f8fbf8] p-2 text-center text-lg font-bold text-[#476259] outline-none" placeholder="العنوان الفرعي" /><h2 className="hidden print:block mt-4 text-lg font-bold text-[#476259]">{subtitle}</h2></header><div className="mt-8 overflow-x-auto"><table className="w-full min-w-[580px] border-collapse text-center"><thead><tr className="bg-[#0a4b39] text-white"><th className="w-20 border border-[#0a4b39] p-3">الرقم</th><th className="border border-[#0a4b39] p-3">الاسم</th><th className="w-[48%] border border-[#0a4b39] p-3">الصورة</th></tr></thead><tbody>{items.map(item => <tr key={item.id} className="align-middle even:bg-[#f7faf6]"><td className="border border-[#cfe0d6] p-3 text-lg font-black text-[#7d6125]">{item.number}<button type="button" onClick={() => removeItem(item.id)} className="no-print mt-2 block w-full text-xs font-normal text-red-700">حذف</button></td><td className="border border-[#cfe0d6] p-3"><Input value={item.name} onChange={event => updateItem(item.id, { name: event.target.value })} placeholder="اسم البند" className="no-print text-center font-bold" /><span className="hidden print:block font-bold">{item.name || "—"}</span></td><td className="border border-[#cfe0d6] p-3"><div data-catalog-image-controls="true" className="no-print mb-3"><label className="inline-flex cursor-pointer items-center rounded-lg bg-[#edf5ee] px-3 py-2 text-xs font-bold text-[#174d3b]"><ImagePlus className="me-2 size-4" />إضافة صورتين للبند<input type="file" accept="image/*" multiple className="hidden" onChange={event => uploadImages(item.id, event)} /></label></div>{item.images.length ? <div className="grid w-full grid-cols-2 gap-2">{item.images.slice(0, 2).map((image, index) => <div key={`${item.id}-${index}`} className="relative aspect-square min-w-0 overflow-hidden"><img src={image} alt={item.name || `صورة ${item.number}`} className="size-full rounded-lg object-cover ring-1 ring-[#d8e7dd]" /><button type="button" onClick={() => removeImage(item.id, index)} className="no-print absolute end-2 top-2 rounded-full bg-red-700 px-3 py-1 text-sm text-white">×</button></div>)}</div> : <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[#b7cfc1] text-sm text-[#71877c]">أضف صورتين للبند</div>}</td></tr>)}</tbody></table></div><footer className="mt-10 border-t-2 pt-6 text-center text-sm font-bold leading-8 text-[#174d3b]" style={{ borderColor: "#000000" }}><p>مؤسسة القادري الزراعية</p><p>📞 00962777772211</p><p>✉️ tamerqadri@gmail.com</p><p dir="ltr">🌐 https://www.alqadrioffers.online</p></footer></div></section>;
}

function DocumentHeader({ doc, type }: { doc: FinancialDocument; type: DocumentType }) { return <div className={`flex items-start justify-between gap-4 border-b-2 pb-5 ${type === "purchaseOrder" ? "border-[#c8a75a]" : "border-[#c8a75a]"}`}><div className="flex items-center gap-3"><img src="/assets/qadri-logo.png" alt="شعار مؤسسة القادري الزراعية" className="size-16 object-contain" /><div><h2 className="text-2xl font-black text-[#174d3b]">مؤسسة القادري الزراعية</h2><p className="mt-1 text-sm font-semibold text-[#60766b]">{doc.address || "جرش - طريق عمان"}</p><p className="mt-1 text-[10px] font-bold tracking-[.14em] text-[#c19b42]">QADRI AGRICULTURE EST.</p></div></div><div className="text-end"><p className="mb-2 inline-block rounded-full bg-[#f6edcf] px-3 py-1 text-[10px] font-black tracking-[.12em] text-[#7d6125]">OFFICIAL DOCUMENT</p><h1 className="text-2xl font-black text-[#174d3b]">{documentTypeLabel(type)}</h1><p className="mt-2 text-sm">رقم: <b>{doc.number}</b> · التاريخ: <b>{doc.date}</b></p></div></div>; }
function Field({ label, value, onChange, multiline = false, placeholder }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; placeholder?: string }) { return <label className="block"><span className="mb-1 block text-xs font-bold text-[#48635a]">{label}</span>{multiline ? <Textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="min-h-20 rounded-lg" /> : <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-10 rounded-lg" />}</label>; }
function ItemTable({ doc, patch, addRow, purchase = false }: { doc: FinancialDocument; patch: (changes: Partial<FinancialDocument>) => void; addRow: () => void; purchase?: boolean }) { const headers = purchase ? ["#", "وصف الصنف / الخدمة", "الوحدة", "الكمية", "سعر الوحدة", "الإجمالي", "المنشأ", "ملاحظات"] : ["الصنف", "الوزن", "الكمية", "المنشأ", "ملاحظات", "دينار", "فلس"]; const keys = purchase ? (["item", "unit", "quantity", "unitPrice", "lineTotal", "origin", "notes"] as (keyof InvoiceRow)[]) : (["item", "weight", "quantity", "origin", "notes", "dinar", "fils"] as (keyof InvoiceRow)[]); return <><div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-sm"><thead><tr className="bg-[#edf5ee]"><th className="w-10 border border-[#cfe0d6] p-2 text-[#224b3d]">#</th>{headers.slice(purchase ? 1 : 0).map(h => <th key={h} className="border border-[#cfe0d6] p-2 text-[#224b3d]">{h}</th>)}</tr></thead><tbody>{doc.rows.map((row, i) => <tr key={i}>{purchase && <td className="border border-[#d8e7dd] p-2 text-center font-bold text-[#7d6125]">{i + 1}</td>}{keys.map(key => <td key={key} className="border border-[#d8e7dd] p-1"><Input value={row[key] || ""} onChange={e => patch({ rows: updateRow(doc.rows, i, key, e.target.value) })} className="h-9 min-w-20 rounded-md border-0 bg-transparent" /></td>)}</tr>)}</tbody></table></div><Button type="button" onClick={addRow} variant="outline" className="no-print mt-3"><Plus className="me-2 size-4" />إضافة صنف</Button></>; }
function ExportForm({ doc, patch, addRow }: { doc: FinancialDocument; patch: (changes: Partial<FinancialDocument>) => void; addRow: () => void }) { return <div className="mt-6 space-y-5"><div className="grid gap-3 sm:grid-cols-2"><Field label="اسم المصدر / المنشأة" value={doc.sourceName} onChange={sourceName => patch({ sourceName })} /><Field label="رقم المنشأة" value={doc.facilityNumber} onChange={facilityNumber => patch({ facilityNumber })} /><Field label="الجهة المصدر إليها" value={doc.destination} onChange={destination => patch({ destination })} /><Field label="العنوان" value={doc.address} onChange={address => patch({ address })} /></div><ItemTable doc={doc} patch={patch} addRow={addRow} /><div className="grid gap-3 sm:grid-cols-2"><Field label="المجموع بالدينار" value={doc.totalDinar} onChange={totalDinar => patch({ totalDinar })} /><Field label="المجموع بالفلس" value={doc.totalFils} onChange={totalFils => patch({ totalFils })} /><Field label="المجموع كتابةً" value={doc.totalInWords} onChange={totalInWords => patch({ totalInWords })} placeholder="اكتب المجموع بالحروف" /><Field label="نص الشهادة" value={doc.certificateText} onChange={certificateText => patch({ certificateText })} multiline /><Field label="عبارة السماح بالتصدير" value={doc.exportPermissionText} onChange={exportPermissionText => patch({ exportPermissionText })} multiline /></div></div>; }
function PurchaseOrderForm({ doc, patch, addRow }: { doc: FinancialDocument; patch: (changes: Partial<FinancialDocument>) => void; addRow: () => void }) { return <div className="mt-6 space-y-6"><div className="rounded-xl bg-[#fbf6e5] p-4 text-sm text-[#6f5624]"><b>بيانات الطلب</b><p className="mt-1">يرجى اعتماد وتوفير الأصناف والخدمات الموضحة أدناه.</p></div><div className="grid gap-3 border-b border-[#d8e7dd] pb-5 sm:grid-cols-3"><Field label="رقم طلب الشراء" value={doc.number} onChange={number => patch({ number })} /><Field label="تاريخ الطلب" value={doc.date} onChange={date => patch({ date })} /><Field label="تاريخ التوريد المطلوب" value={doc.expectedDate} onChange={expectedDate => patch({ expectedDate })} placeholder="mm/dd/yyyy" /><Field label="العملة" value={doc.currency} onChange={currency => patch({ currency })} /><Field label="المشتري" value={doc.requester} onChange={requester => patch({ requester })} /><Field label="القسم / الوظيفة" value={doc.department} onChange={department => patch({ department })} /></div><div className="grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-[#d8e7dd] p-4"><h3 className="mb-3 font-black text-[#174d3b]">المشتري</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="اسم المؤسسة" value={doc.buyerOrg} onChange={buyerOrg => patch({ buyerOrg })} /><Field label="اسم المسؤول" value={doc.buyerName} onChange={buyerName => patch({ buyerName })} /><Field label="الوظيفة" value={doc.buyerTitle} onChange={buyerTitle => patch({ buyerTitle })} /><Field label="الهاتف" value={doc.buyerPhone} onChange={buyerPhone => patch({ buyerPhone })} /><Field label="البريد الإلكتروني" value={doc.buyerEmail} onChange={buyerEmail => patch({ buyerEmail })} /><Field label="العنوان" value={doc.buyerAddress} onChange={buyerAddress => patch({ buyerAddress })} /></div></section><section className="rounded-xl border border-[#d8e7dd] p-4"><h3 className="mb-3 font-black text-[#174d3b]">المورد</h3><div className="grid gap-3 sm:grid-cols-2"><Field label="اسم المورد" value={doc.supplierName} onChange={supplierName => patch({ supplierName })} /><Field label="اسم الشخص المسؤول" value={doc.supplierContact} onChange={supplierContact => patch({ supplierContact })} /><Field label="رقم الهاتف" value={doc.supplierPhone} onChange={supplierPhone => patch({ supplierPhone })} /><Field label="البريد الإلكتروني" value={doc.supplierEmail} onChange={supplierEmail => patch({ supplierEmail })} /><Field label="العنوان" value={doc.supplierAddress} onChange={supplierAddress => patch({ supplierAddress })} /></div></section></div><section><div className="mb-3 flex items-center justify-between"><h3 className="font-black text-[#174d3b]">الأصناف والخدمات</h3><span className="rounded-full bg-[#f6edcf] px-3 py-1 text-xs font-bold text-[#7d6125]">{doc.currency}</span></div><ItemTable doc={doc} patch={patch} addRow={addRow} purchase /></section><div className="grid gap-3 sm:ms-auto sm:max-w-md"><Field label="المجموع الفرعي" value={doc.totalDinar} onChange={totalDinar => patch({ totalDinar })} /><Field label="الضريبة" value={doc.tax} onChange={tax => patch({ tax })} /><Field label="رسوم التوصيل" value={doc.deliveryFee} onChange={deliveryFee => patch({ deliveryFee })} /><Field label="الإجمالي النهائي" value={doc.finalTotal} onChange={finalTotal => patch({ finalTotal })} /></div><Field label="ملاحظات" value={doc.notes} onChange={notes => patch({ notes })} multiline /><div className="grid gap-4 border-t-2 border-[#c8a75a] pt-5 lg:grid-cols-2"><ApprovalCard title="اعتماد المشتري" name={doc.buyerName} titleText={doc.buyerTitle} date={doc.buyerApprovalDate} onDate={buyerApprovalDate => patch({ buyerApprovalDate })} /><ApprovalCard title="اعتماد المورد" name={doc.supplierContact} titleText="" date={doc.supplierApprovalDate} onDate={supplierApprovalDate => patch({ supplierApprovalDate })} /></div></div>; }
function ApprovalCard({ title, name, titleText, date, onDate }: { title: string; name: string; titleText: string; date: string; onDate: (value: string) => void }) { return <section className="rounded-xl bg-[#f4f8f4] p-4"><h3 className="mb-3 font-black text-[#174d3b]">{title}</h3><div className="space-y-2 text-sm"><p><b>الاسم:</b> {name || "................"}</p><p><b>الوظيفة:</b> {titleText || "................"}</p><label className="flex items-center gap-2"><b>التاريخ:</b><Input value={date} onChange={e => onDate(e.target.value)} placeholder="mm/dd/yyyy" className="h-8 max-w-36 bg-white" /></label><p className="pt-3"><b>التوقيع:</b> توقيع المسؤول</p><p><b>الختم:</b> ختم المؤسسة</p></div></section>; }
function VoucherForm({ type, doc, patch }: { type: "receipt" | "disbursement"; doc: FinancialDocument; patch: (changes: Partial<FinancialDocument>) => void }) { const isReceipt = type === "receipt"; return <div className="mt-6 space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="التاريخ" value={doc.date} onChange={date => patch({ date })} /><Field label="الرقم" value={doc.number} onChange={number => patch({ number })} /><Field label={isReceipt ? "اسم الدافع" : "اسم المستلم"} value={doc.personName} onChange={personName => patch({ personName })} /><Field label="المبلغ بالدينار" value={doc.amount} onChange={amount => patch({ amount })} /><Field label="المبلغ كتابةً" value={doc.amountText} onChange={amountText => patch({ amountText })} /><Field label="وذلك عن / سبب الدفع" value={doc.description} onChange={description => patch({ description })} /><label className="block"><span className="mb-1 block text-xs font-bold text-[#48635a]">طريقة الدفع</span><select value={doc.paymentMethod} onChange={e => patch({ paymentMethod: e.target.value as PaymentMethod })} className="h-10 w-full rounded-lg border px-3">{Object.entries(paymentLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><Field label="ملاحظات" value={doc.notes} onChange={notes => patch({ notes })} multiline /></div><div className="rounded-xl bg-[#f4f8f4] p-5 text-lg font-bold">{isReceipt ? "استلمنا من" : "صرفنا لـ"}: {doc.personName || "................"}<br /><span className="text-sm font-normal">المبلغ: {doc.amount || "0"} دينار · {paymentLabels[doc.paymentMethod]}</span></div></div>; }

function SimpleInvoiceForm({ type, doc, patch, addRow }: { type: "salesInvoice" | "purchaseInvoice"; doc: FinancialDocument; patch: (changes: Partial<FinancialDocument>) => void; addRow: () => void }) {
  const isSale = type === "salesInvoice";
  const statusLabels = { credit: "⏳ ذمم", paid: "✅ مدفوع", online: "🌐 أونلاين" };
  const invoiceKeys = ["item", "unit", "quantity", "unitPrice", "lineTotal"] as (keyof InvoiceRow)[];
  return <div className="mt-6 space-y-5">
    <div className="rounded-xl bg-[#f4f8f4] p-4 text-sm text-[#48635a]"><b>{isSale ? "فاتورة بيع" : "فاتورة شراء"}</b><p className="mt-1">أدخل بيانات الفاتورة والأصناف ثم احفظها أو اطبعها.</p></div>
    <div className="grid gap-3 sm:grid-cols-2"><Field label="المطلوب منه *" value={doc.requestedFrom} onChange={requestedFrom => patch({ requestedFrom })} placeholder="اسم المطلوب منه..." /><Field label="التاريخ" value={doc.date} onChange={date => patch({ date })} /><Field label="رقم الفاتورة (اختياري)" value={doc.number} onChange={number => patch({ number })} placeholder="تلقائي إذا تُرك فارغاً..." /><Field label="الخصم (د.أ)" value={doc.invoiceDiscount} onChange={invoiceDiscount => patch({ invoiceDiscount })} placeholder="0.000" /></div>
    <label className="block"><span className="mb-1 block text-xs font-bold text-[#48635a]">نوع الفاتورة</span><select value={doc.invoiceStatus} onChange={e => patch({ invoiceStatus: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 sm:max-w-sm">{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <section><div className="mb-3 flex items-center justify-between"><h3 className="font-black text-[#174d3b]">الأصناف</h3><Button type="button" onClick={addRow} variant="outline" className="no-print"><Plus className="me-2 size-4" />إضافة صنف</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-sm"><thead><tr className="bg-[#edf5ee]"><th className="border border-[#cfe0d6] p-2">البيان</th><th className="border border-[#cfe0d6] p-2">الوحدة</th><th className="border border-[#cfe0d6] p-2">الكمية</th><th className="border border-[#cfe0d6] p-2">السعر الافرادي (د.أ)</th><th className="border border-[#cfe0d6] p-2">الإجمالي</th></tr></thead><tbody>{doc.rows.map((row, i) => <tr key={i}>{invoiceKeys.map(key => <td key={key} className="border border-[#d8e7dd] p-1"><Input value={row[key] || ""} onChange={e => patch({ rows: updateRow(doc.rows, i, key, e.target.value) })} placeholder={key === "item" ? "اسم الصنف..." : key === "quantity" ? "1" : "0.000"} className="h-9 min-w-24 rounded-md border-0 bg-transparent" /></td>)}</tr>)}</tbody></table></div></section>
    <div className="flex items-center justify-between rounded-xl bg-[#064b3a] p-4 text-white"><span className="font-bold">الإجمالي الكلي</span><b className="text-xl">{doc.finalTotal || "0.000"} د.أ</b></div>
    <Field label="ملاحظات" value={doc.notes} onChange={notes => patch({ notes })} multiline placeholder="ملاحظات اختيارية..." />
  </div>;
}
