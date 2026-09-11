import { AccessGate, AdminGate, PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n";
import { documentTypeLabel, emptyDocument, getDocuments, removeDocument, saveDocument, subscribeToDocuments, type DocumentType, type FinancialDocument, type InvoiceRow, type PaymentMethod } from "@/data/financialDocuments";
import { FileDown, Plus, Printer, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const tabs: DocumentType[] = ["exportInvoice", "receipt", "disbursement"];
const paymentLabels: Record<PaymentMethod, string> = { cash: "نقداً", check: "شيك", transfer: "تحويل", online: "أونلاين" };
const updateRow = (rows: InvoiceRow[], index: number, key: keyof InvoiceRow, value: string) => rows.map((row, i) => i === index ? { ...row, [key]: value } : row);

export default function FinancialDocuments() {
  const { language } = useLanguage();
  const [type, setType] = useState<DocumentType>("exportInvoice");
  const [documents, setDocuments] = useState<FinancialDocument[]>(() => getDocuments());
  const [doc, setDoc] = useState<FinancialDocument>(() => emptyDocument("exportInvoice"));
  const [query, setQuery] = useState("");
  useEffect(() => subscribeToDocuments(() => setDocuments(getDocuments())), []);
  useEffect(() => {
    const handleCommand = (event: Event) => {
      const content = (event as CustomEvent<{ content?: string }>).detail?.content?.trim() || "";
      if (!content) return;
      const lower = content.toLocaleLowerCase();
      const nextType: DocumentType = /سند\s*قبض|وصل\s*قبض/.test(lower) ? "receipt" : /سند\s*صرف|وصل\s*صرف/.test(lower) ? "disbursement" : /فاتورة|تصدير/.test(lower) ? "exportInvoice" : type;
      setType(nextType);
      setDoc(current => {
        const next = { ...current, type: nextType };
        const name = content.match(/(?:لـ|ل|من|اسم(?:ه)?|الدافع|المستلم)\s*[:：]?\s*([\u0600-\u06FFa-zA-Z][\u0600-\u06FFa-zA-Z\s]{2,40})/i)?.[1]?.trim();
        const amount = content.match(/(?:بمبلغ|المبلغ|بقيمة)\s*[:：]?\s*([\d٠-٩]+(?:[.,][\d٠-٩]+)?)/i)?.[1];
        const destination = content.match(/(?:إلى|للجهة|لجهة)\s*[:：]?\s*([\u0600-\u06FFa-zA-Z][\u0600-\u06FFa-zA-Z\s]{2,50})/i)?.[1]?.trim();
        if (nextType === "exportInvoice") {
          const item = content.match(/(?:صنف|بند|نبات)\s*[:：]?\s*([\u0600-\u06FFa-zA-Z][\u0600-\u06FFa-zA-Z\s]{2,50})/i)?.[1]?.trim();
          return { ...next, destination: destination || next.destination, totalDinar: amount || next.totalDinar, rows: item ? [{ ...next.rows[0], item, dinar: amount || next.rows[0].dinar }] : next.rows };
        }
        return { ...next, personName: name || next.personName, amount: amount || next.amount };
      });
    };
    window.addEventListener("financial-ai-command", handleCommand);
    return () => window.removeEventListener("financial-ai-command", handleCommand);
  }, [type]);
  const filtered = useMemo(() => documents.filter(item => item.type === type && `${item.number} ${item.personName} ${item.destination} ${item.sourceName}`.includes(query)), [documents, type, query]);
  const changeType = (next: DocumentType) => { setType(next); setDoc(emptyDocument(next)); };
  const patch = (changes: Partial<FinancialDocument>) => setDoc(current => ({ ...current, ...changes }));
  const save = () => { saveDocument(doc); setDocuments(getDocuments()); };
  const print = () => window.print();
  const addRow = () => patch({ rows: [...doc.rows, { item: "", weight: "", quantity: "", origin: "", notes: "", dinar: "0", fils: "000" }] });
  return <AccessGate><AdminGate><PlatformShell title="الفواتير والسندات" eyebrow="إدارة المستندات المالية"><main className="container py-8" dir="rtl">
    <style>{`@media print { body * { visibility: hidden !important; } #financial-document, #financial-document * { visibility: visible !important; } #financial-document { position: absolute; inset: 0; width: 100%; } .no-print { display: none !important; } }`}</style>
    <section className="no-print rounded-[1.6rem] bg-[#064b3a] p-6 text-white"><p className="text-xs font-bold tracking-[.16em] text-[#bde1c9]">ADMIN FINANCIAL DOCUMENTS</p><h1 className="mt-2 text-3xl font-black">الفواتير والسندات</h1><p className="mt-2 text-sm text-[#d5eee3]">أنشئ واحفظ وعدّل واطبع المستندات بصلاحيات الإدارة.</p></section>
    <div className="no-print mt-6 flex flex-wrap gap-2">{tabs.map(item => <button key={item} type="button" onClick={() => changeType(item)} className={`rounded-xl px-4 py-3 text-sm font-bold ${type === item ? "bg-[#0a4b39] text-white" : "border border-[#cfe0d6] bg-white text-[#49665b]"}`}>{documentTypeLabel(item)}</button>)}</div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
      <section className="no-print rounded-2xl border bg-white p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-black text-[#17342d]">المحفوظات</h2><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="بحث..." className="h-9 w-36 rounded-lg" /></div><div className="mt-4 space-y-2">{filtered.map(item => <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#f4f8f4] p-3"><button type="button" className="min-w-0 flex-1 text-start" onClick={() => setDoc(item)}><b className="block truncate text-sm">{item.number}</b><span className="text-xs text-[#6c8177]">{item.date} · {item.personName || item.destination || item.sourceName || "بدون اسم"}</span></button><button type="button" onClick={() => { removeDocument(item.id); setDocuments(getDocuments()); }} className="rounded-lg p-2 text-red-700" aria-label="حذف"><Trash2 className="size-4" /></button></div>)}{!filtered.length && <p className="rounded-xl border border-dashed p-4 text-center text-sm text-[#71877c]">لا توجد مستندات محفوظة.</p>}</div></section>
      <section id="financial-document" className="rounded-2xl border-2 border-[#174d3b] bg-white p-5 shadow-sm sm:p-8"><div className="flex items-start justify-between gap-4 border-b-2 border-[#c8a75a] pb-5"><div><h2 className="text-2xl font-black text-[#174d3b]">مؤسسة القادري الزراعية</h2><p className="mt-1 text-sm text-[#60766b]">{doc.address || "الأردن"}</p></div><div className="text-end"><h1 className="text-2xl font-black text-[#174d3b]">{documentTypeLabel(type)}</h1><p className="mt-2 text-sm">رقم: <b>{doc.number}</b> · التاريخ: <b>{doc.date}</b></p></div></div>
        {type === "exportInvoice" ? <ExportForm doc={doc} patch={patch} addRow={addRow} /> : <VoucherForm type={type} doc={doc} patch={patch} />}
        <div className="no-print mt-6 flex flex-wrap gap-2 border-t pt-5"><Button onClick={save} className="bg-[#0a4b39] text-white"><Save className="me-2 size-4" />حفظ المستند</Button><Button onClick={() => { setDoc(emptyDocument(type)); }} variant="outline"><Plus className="me-2 size-4" />مستند جديد</Button><Button onClick={print} variant="outline"><Printer className="me-2 size-4" />طباعة / PDF</Button><Button onClick={print} variant="outline"><FileDown className="me-2 size-4" />PDF صفحة واحدة</Button></div>
      </section>
    </div>
  </main></PlatformShell></AdminGate></AccessGate>;
}
function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) { return <label className="block"><span className="mb-1 block text-xs font-bold text-[#48635a]">{label}</span>{multiline ? <Textarea value={value} onChange={e => onChange(e.target.value)} className="min-h-20 rounded-lg" /> : <Input value={value} onChange={e => onChange(e.target.value)} className="h-10 rounded-lg" />}</label>; }
function ExportForm({ doc, patch, addRow }: { doc: FinancialDocument; patch: (changes: Partial<FinancialDocument>) => void; addRow: () => void }) { return <div className="mt-6 space-y-5"><div className="grid gap-3 sm:grid-cols-2"><Field label="اسم المصدر / المنشأة" value={doc.sourceName} onChange={sourceName => patch({ sourceName })} /><Field label="رقم المنشأة" value={doc.facilityNumber} onChange={facilityNumber => patch({ facilityNumber })} /><Field label="الجهة المصدر إليها" value={doc.destination} onChange={destination => patch({ destination })} /><Field label="العنوان" value={doc.address} onChange={address => patch({ address })} /></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-sm"><thead><tr className="bg-[#edf5ee]">{["الصنف","الوزن","الكمية","المنشأ","ملاحظات","دينار","فلس"].map(h => <th key={h} className="border p-2">{h}</th>)}</tr></thead><tbody>{doc.rows.map((row, i) => <tr key={i}>{(["item","weight","quantity","origin","notes","dinar","fils"] as (keyof InvoiceRow)[]).map(key => <td key={key} className="border p-1"><Input value={row[key]} onChange={e => patch({ rows: updateRow(doc.rows, i, key, e.target.value) })} className="h-9 min-w-20 rounded-md border-0" /></td>)}</tr>)}</tbody></table></div><Button type="button" onClick={addRow} variant="outline" className="no-print"><Plus className="me-2 size-4" />إضافة بند</Button><div className="grid gap-3 sm:grid-cols-2"><Field label="المجموع بالدينار" value={doc.totalDinar} onChange={totalDinar => patch({ totalDinar })} /><Field label="المجموع بالفلس" value={doc.totalFils} onChange={totalFils => patch({ totalFils })} /><Field label="المجموع كتابةً" value={doc.totalInWords} onChange={totalInWords => patch({ totalInWords })} /><Field label="نص الشهادة" value={doc.certificateText} onChange={certificateText => patch({ certificateText })} multiline /><Field label="عبارة السماح بالتصدير" value={doc.exportPermissionText} onChange={exportPermissionText => patch({ exportPermissionText })} multiline /></div></div>; }
function VoucherForm({ type, doc, patch }: { type: "receipt" | "disbursement"; doc: FinancialDocument; patch: (changes: Partial<FinancialDocument>) => void }) { const isReceipt = type === "receipt"; return <div className="mt-6 space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="التاريخ" value={doc.date} onChange={date => patch({ date })} /><Field label="الرقم" value={doc.number} onChange={number => patch({ number })} /><label className="block"><span className="mb-1 block text-xs font-bold text-[#48635a]">اللقب</span><select value={doc.namePrefix} onChange={e => patch({ namePrefix: e.target.value })} className="h-10 w-full rounded-lg border px-3"><option>السيد</option><option>السيدة</option><option>السادة</option><option>أخرى</option></select></label><Field label={isReceipt ? "اسم الدافع" : "اسم المستلم"} value={doc.personName} onChange={personName => patch({ personName })} /><Field label="المبلغ بالدينار" value={doc.amount} onChange={amount => patch({ amount })} /><Field label="المبلغ كتابةً" value={doc.amountText} onChange={amountText => patch({ amountText })} /><Field label="وذلك عن / سبب الدفع" value={doc.description} onChange={description => patch({ description })} /><label className="block"><span className="mb-1 block text-xs font-bold text-[#48635a]">طريقة الدفع</span><select value={doc.paymentMethod} onChange={e => patch({ paymentMethod: e.target.value as PaymentMethod })} className="h-10 w-full rounded-lg border px-3">{Object.entries(paymentLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><Field label="ملاحظات" value={doc.notes} onChange={notes => patch({ notes })} multiline /></div><div className="rounded-xl bg-[#f4f8f4] p-5 text-lg font-bold">{isReceipt ? "استلمنا من" : "صرفنا لـ"} {doc.namePrefix}: {doc.personName || "................"}<br /><span className="text-sm font-normal">المبلغ: {doc.amount || "0"} دينار · {paymentLabels[doc.paymentMethod]}</span></div></div>; }
