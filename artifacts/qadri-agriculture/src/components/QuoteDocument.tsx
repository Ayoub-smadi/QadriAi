import { getTotals, type QuoteColumnKey, type QuoteRecord } from "@/data/quoteStore";
import { useLanguage } from "@/lib/i18n";
import { forwardRef, type ReactNode } from "react";

type QuoteDocumentProps = { record: QuoteRecord; className?: string };

const money = (value: number) => `${value.toFixed(2)} د.أ`;

export const QuoteDocument = forwardRef<HTMLDivElement, QuoteDocumentProps>(function QuoteDocument({ record, className = "" }, ref) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const totals = getTotals(record);
  const visible = (key: QuoteColumnKey) => record.visibleColumns[key];
  const label = (key: QuoteColumnKey) => record.columnLabels[key] || key;
  const columns: QuoteColumnKey[] = ["number", "name", "description", "category", "quantity", "price", "total", "image"];

  return (
    <div ref={ref} dir={isArabic ? "rtl" : "ltr"} className={`quote-document w-full bg-white p-7 text-[#22351b] ${className}`}>
      <div className="flex items-start justify-between gap-5 border-b-2 border-[#35530e] pb-5">
        <div><img src="/assets/qadri-logo.png" alt="Al-Qadri" className="mb-3 h-16 w-auto object-contain" /><p className="text-xs font-bold tracking-[.18em] text-[#719449]">AL-QADRI AGRICULTURAL</p><h1 className="mt-1 text-2xl font-extrabold">{record.title || (isArabic ? "عرض سعر نباتات" : "Plant quotation")}</h1></div>
        <div className="text-left text-sm"><p className="font-bold text-[#35530e]">{isArabic ? "رقم العرض" : "Quote no."}: {record.quoteNumber}</p><p className="mt-2 text-[#6c7b62]">{new Date(record.updatedAt).toLocaleDateString(isArabic ? "ar-JO" : "en-US")}</p></div>
      </div>
      <div className="mt-5 grid gap-2 rounded-xl bg-[#f3f7ed] p-4 text-sm sm:grid-cols-2">
        <p><strong>{isArabic ? "العميل" : "Customer"}:</strong> {record.customerName || "—"}</p><p dir="ltr"><strong>{isArabic ? "الهاتف" : "Phone"}:</strong> {record.phone || "—"}</p>
        <p><strong>{isArabic ? "الطريقة" : "Method"}:</strong> {record.fulfillment === "delivery" ? (isArabic ? "توصيل" : "Delivery") : (isArabic ? "استلام من المشتل" : "Nursery pickup")}</p>
        {record.fulfillment === "delivery" && <p><strong>{isArabic ? "العنوان" : "Address"}:</strong> {[record.deliveryRegion, record.deliveryAddress].filter(Boolean).join("، ") || "—"}</p>}
      </div>
      <table className="mt-6 w-full border-collapse text-xs">
        <thead><tr className="bg-[#35530e] text-white">{columns.filter(visible).map(column => <th key={column} className="border border-[#274c3c] px-2 py-3 text-right font-bold">{label(column)}</th>)}</tr></thead>
        <tbody>{record.items.map((item, index) => <tr key={item.id} className="align-top even:bg-[#f8faf5]">{columns.filter(visible).map(column => {
          const content: Record<QuoteColumnKey, ReactNode> = {
            number: index + 1,
            name: <span className="font-bold">{isArabic ? item.nameAr : item.nameEn}<small className="mt-1 block font-normal text-[#718062]">{item.size}</small></span>,
            description: isArabic ? item.descriptionAr : item.descriptionEn,
            category: isArabic ? item.categoryAr : item.categoryEn,
            quantity: item.quantity,
            price: money(item.price),
            total: money(item.quantity * item.price),
            image: item.imagePath ? <img src={item.imagePath} alt="" className="mx-auto size-12 rounded-lg object-cover" /> : "—",
          };
          return <td key={column} className="border border-[#d9e3d1] px-2 py-3">{content[column]}</td>;
        })}</tr>)}</tbody>
      </table>
      <div className="mt-6 ms-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between border-b border-[#d9e3d1] pb-2"><span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span><strong>{money(totals.subtotal)}</strong></div><div className="flex justify-between border-b border-[#d9e3d1] pb-2"><span>{isArabic ? "رسوم الشحن" : "Shipping"}</span><strong>{money(totals.shipping)}</strong></div><div className="flex justify-between pt-1 text-base font-extrabold text-[#35530e]"><span>{isArabic ? "المجموع الكلي" : "Grand total"}</span><strong>{money(totals.total)}</strong></div></div>
      {(record.notes || record.footerText) && <div className="mt-7 border-t border-[#d9e3d1] pt-4 text-xs leading-6 text-[#68775a]">{record.notes && <p><strong>{isArabic ? "ملاحظات" : "Notes"}:</strong> {record.notes}</p>}{record.footerText && <p className="mt-1">{record.footerText}</p>}</div>}
    </div>
  );
});