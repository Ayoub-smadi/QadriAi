import { getTotals, type QuoteColumnKey, type QuoteRecord } from "@/data/quoteStore";
import { useLanguage } from "@/lib/i18n";
import { Globe, Mail, Phone } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

type QuoteDocumentProps = { record: QuoteRecord; className?: string; editable?: boolean; onChange?: (patch: Partial<QuoteRecord>) => void; onItemChange?: (itemId: string, patch: Partial<QuoteRecord["items"][number]>) => void };

const money = (value: number) => value.toFixed(2);

export const QuoteDocument = forwardRef<HTMLDivElement, QuoteDocumentProps>(function QuoteDocument({ record, className = "", editable = false, onChange, onItemChange }, ref) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const totals = getTotals(record);
  const visible = (key: QuoteColumnKey) => record.visibleColumns[key];
  const label = (key: QuoteColumnKey) => record.columnLabels[key] || key;
  const edit = (value: string, save: (value: string) => void, multiline = false) => editable ? (multiline ? <textarea defaultValue={value} onBlur={event => save(event.target.value)} className="min-h-16 w-full resize-y rounded border border-[#c9d9bf] bg-white/80 p-1 text-center align-middle text-inherit outline-none" /> : <input defaultValue={value} onBlur={event => save(event.target.value)} className="w-full min-w-0 rounded border border-[#c9d9bf] bg-white/80 p-1 text-center align-middle text-inherit outline-none" />) : value;
  const columns: QuoteColumnKey[] = ["number", "name", "description", "category", "quantity", "price", "total", "image"];

  return (
    <div ref={ref} dir={isArabic ? "rtl" : "ltr"} className={`quote-document w-full bg-white p-7 text-[#22351b] ${className}`}>
      <div data-quote-header="true" className="flex items-start justify-between gap-5 border-b-2 border-[#35530e] pb-5">
        <div className="flex-1"><img src={record.logoPath || "/assets/qadri-logo.png"} alt={isArabic ? record.companyNameAr || "الشعار" : record.companyNameEn || "Logo"} className="mb-4 h-24 w-auto object-contain" /><div dir="ltr" className="flex items-center justify-between gap-5 text-lg font-extrabold text-[#35530e]"><span>{edit(record.companyNameEn || "Al-Qadri Agricultural Establishment", value => onChange?.({ companyNameEn: value }))}</span><span dir="rtl">{edit(record.companyNameAr || "مؤسسة القادري الزراعية", value => onChange?.({ companyNameAr: value }))}</span></div><h1 className="mt-2 text-2xl font-extrabold">{edit(record.title || (isArabic ? "عرض سعر نباتات" : "Plant quotation"), value => onChange?.({ title: value }))}</h1></div>
        <div className="text-left text-lg"><p className="text-2xl font-extrabold text-[#35530e]">{isArabic ? "رقم العرض" : "Quote no."}</p><p dir="ltr" className="mt-2 text-3xl font-black tracking-wide text-[#22351b]">{record.quoteNumber}</p><p className="mt-2 text-base text-[#6c7b62]">{new Date(record.issueDate || record.updatedAt).toLocaleDateString(isArabic ? "ar-JO" : "en-US")}</p></div>
      </div>
      <div className="mt-5 grid gap-2 rounded-xl bg-[#f3f7ed] p-4 text-sm sm:grid-cols-2">
        <p><strong>{isArabic ? "العميل" : "Customer"}:</strong> {edit(record.customerName, value => onChange?.({ customerName: value }))}</p><p dir="ltr"><strong>{isArabic ? "الهاتف" : "Phone"}:</strong> {edit(record.phone, value => onChange?.({ phone: value }))}</p>
        <p><strong>{isArabic ? "الطريقة" : "Method"}:</strong> {record.fulfillment === "delivery" ? (isArabic ? "توصيل" : "Delivery") : (isArabic ? "استلام من المشتل" : "Nursery pickup")}</p>
        {record.fulfillment === "delivery" && <p><strong>{isArabic ? "العنوان" : "Address"}:</strong> {[record.deliveryRegion, record.deliveryAddress].filter(Boolean).join("، ") || "—"}</p>}
      </div>
      <table className="mt-6 w-full min-w-[980px] table-fixed border-collapse text-xs [word-break:normal] [overflow-wrap:break-word]">
        <colgroup>{columns.filter(visible).map(column => <col key={column} className={column === "number" ? "w-10" : column === "name" ? "w-32" : column === "description" ? "w-[310px]" : column === "category" ? "w-28" : column === "quantity" ? "w-20" : column === "price" || column === "total" ? "w-24" : "w-[229px]"} />)}</colgroup>
        <thead><tr className="bg-[#35530e] text-white">{columns.filter(visible).map(column => <th key={column} className="border border-[#274c3c] px-2 py-3 text-center font-bold">{label(column)}</th>)}</tr></thead>
        <tbody>{record.items.map((item, index) => <tr key={item.id} className="align-middle even:bg-[#f8faf5]">{columns.filter(visible).map(column => {
          const content: Record<QuoteColumnKey, ReactNode> = {
            number: index + 1,
            name: <span className="font-bold">{edit(isArabic ? item.nameAr : item.nameEn, value => onItemChange?.(item.id, isArabic ? { nameAr: value } : { nameEn: value }))}<small className="mt-1 block font-normal text-[#718062]">{edit(item.size, value => onItemChange?.(item.id, { size: value }))}</small></span>,
            description: <span className="block whitespace-normal break-words text-start leading-6">{edit(isArabic ? item.descriptionAr : item.descriptionEn, value => onItemChange?.(item.id, isArabic ? { descriptionAr: value } : { descriptionEn: value }), true)}</span>,
            category: <span className="block whitespace-normal break-words text-start leading-6">{edit(isArabic ? item.categoryAr : item.categoryEn, value => onItemChange?.(item.id, isArabic ? { categoryAr: value } : { categoryEn: value }), true)}</span>,
            quantity: editable ? <input type="number" min="1" defaultValue={item.quantity} onBlur={event => onItemChange?.(item.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} className="w-16 rounded border border-[#c9d9bf] p-1 text-center" /> : item.quantity,
            price: editable ? <input type="number" min="0" step="0.01" defaultValue={item.price} onBlur={event => onItemChange?.(item.id, { price: Math.max(0, Number(event.target.value) || 0) })} className="w-24 rounded border border-[#c9d9bf] p-1 text-center" /> : money(item.price),
            total: money(item.quantity * item.price),
            image: item.imagePath ? <img src={item.imagePath} alt={isArabic ? item.nameAr : item.nameEn} className="mx-auto h-[191px] w-[213px] min-w-[213px] rounded-xl object-cover ring-1 ring-[#d9e3d1]" /> : "—",
          };
          return <td key={column} className={`align-middle border border-[#d9e3d1] px-2 py-3 text-center leading-6 whitespace-normal [word-break:normal] [overflow-wrap:break-word] ${column === "image" ? "w-[229px] min-w-[229px] p-0 align-middle" : ""}`}>{content[column]}</td>;
        })}</tr>)}</tbody>
      </table>
      <div data-quote-end="true" className="quote-end-block [break-inside:avoid] [page-break-inside:avoid]"><div className="mt-6 ms-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between border-b border-[#d9e3d1] pb-2"><span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span><strong>{money(totals.subtotal)}</strong></div>{record.fulfillment === "delivery" && <div className="flex justify-between border-b border-[#d9e3d1] pb-2"><span>{isArabic ? "رسوم الشحن" : "Shipping"}</span><strong>{money(totals.shipping)}</strong></div>}<div className="flex justify-between pt-1 text-base font-extrabold text-[#35530e]"><span>{isArabic ? "المجموع الكلي" : "Grand total"}</span><strong>{money(record.fulfillment === "delivery" ? totals.total : totals.subtotal)}</strong></div></div>
      <div className="mt-7 border-t border-[#d9e3d1] pt-5 leading-6"><p className="text-center text-sm font-bold text-[#22351b]">{edit(record.closingText || "واقبلوا فائق الاحترام والتقدير،،،", value => onChange?.({ closingText: value }))}</p>{record.footerText && <p dir="rtl" className="mt-2 text-right text-xs text-[#68775a]">{edit(record.footerText, value => onChange?.({ footerText: value }), true)}</p>}{record.notes && <p dir="rtl" className="mt-3 text-right text-xs text-[#68775a]">{edit(record.notes, value => onChange?.({ notes: value }), true)}</p>}</div>
      <div dir="ltr" className="mt-7 flex items-end justify-between gap-8 border-t border-[#d9e3d1] pt-5 text-xs text-black"><img src={record.stampPath || "/assets/qadri-stamp.png"} alt="Stamp" className="h-20 w-auto max-w-[180px] object-contain object-left" /><div dir="rtl" className="space-y-1 text-right"><p className="font-bold">{edit(record.companyNameAr || "مؤسسة القادري الزراعية", value => onChange?.({ companyNameAr: value }))}</p><p className="flex items-center justify-end gap-2"><Phone className="size-3.5 text-black" />{edit(record.companyPhone || "00962777772211", value => onChange?.({ companyPhone: value }))}</p><p className="flex items-center justify-end gap-2"><Mail className="size-3.5 text-black" />{edit(record.companyEmail || "tamerqadri@gmail.com", value => onChange?.({ companyEmail: value }))}</p><p className="flex items-center justify-end gap-2"><Globe className="size-3.5 text-black" />{edit(record.companyWebsite || "https://www.alqadrioffers.online", value => onChange?.({ companyWebsite: value }))}</p></div></div></div>
    </div>
  );
});
