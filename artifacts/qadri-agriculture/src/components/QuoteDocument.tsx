import { getTotals, type QuoteColumnKey, type QuoteRecord } from "@/data/quoteStore";
import { useLanguage } from "@/lib/i18n";
import { Globe, Mail, Phone } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

type QuoteDocumentProps = { record: QuoteRecord; className?: string };

const money = (value: number) => value.toFixed(2);

export const QuoteDocument = forwardRef<HTMLDivElement, QuoteDocumentProps>(function QuoteDocument({ record, className = "" }, ref) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const totals = getTotals(record);
  const visible = (key: QuoteColumnKey) => record.visibleColumns[key];
  const label = (key: QuoteColumnKey) => record.columnLabels[key] || key;
  const columns: QuoteColumnKey[] = ["number", "name", "description", "category", "quantity", "price", "total", "image"];

  return (
    <div ref={ref} dir={isArabic ? "rtl" : "ltr"} className={`quote-document w-full bg-white p-7 text-[#22351b] ${className}`}>
      <div data-quote-header="true" className="flex items-start justify-between gap-5 border-b-2 border-[#35530e] pb-5">
        <div className="flex-1"><img src={record.logoPath || "/assets/qadri-logo.png"} alt={isArabic ? record.companyNameAr || "الشعار" : record.companyNameEn || "Logo"} className="mb-4 h-24 w-auto object-contain" /><div dir="ltr" className="flex items-center justify-between gap-5 text-lg font-extrabold text-[#35530e]"><span>{record.companyNameEn || "Al-Qadri Agricultural Establishment"}</span><span dir="rtl">{record.companyNameAr || "مؤسسة القادري الزراعية"}</span></div><h1 className="mt-2 text-2xl font-extrabold">{record.title || (isArabic ? "عرض سعر نباتات" : "Plant quotation")}</h1></div>
        <div className="text-left text-lg"><p className="text-2xl font-extrabold text-[#35530e]">{isArabic ? "رقم العرض" : "Quote no."}</p><p dir="ltr" className="mt-2 text-3xl font-black tracking-wide text-[#22351b]">{record.quoteNumber}</p><p className="mt-2 text-base text-[#6c7b62]">{new Date(record.issueDate || record.updatedAt).toLocaleDateString(isArabic ? "ar-JO" : "en-US")}</p></div>
      </div>
      <div className="mt-5 grid gap-2 rounded-xl bg-[#f3f7ed] p-4 text-sm sm:grid-cols-2">
        <p><strong>{isArabic ? "العميل" : "Customer"}:</strong> {record.customerName || "—"}</p><p dir="ltr"><strong>{isArabic ? "الهاتف" : "Phone"}:</strong> {record.phone || "—"}</p>
        <p><strong>{isArabic ? "الطريقة" : "Method"}:</strong> {record.fulfillment === "delivery" ? (isArabic ? "توصيل" : "Delivery") : (isArabic ? "استلام من المشتل" : "Nursery pickup")}</p>
        {record.fulfillment === "delivery" && <p><strong>{isArabic ? "العنوان" : "Address"}:</strong> {[record.deliveryRegion, record.deliveryAddress].filter(Boolean).join("، ") || "—"}</p>}
      </div>
      <table className="mt-6 w-full min-w-[980px] table-fixed border-collapse text-xs [word-break:normal] [overflow-wrap:break-word]">
        <colgroup>{columns.filter(visible).map(column => <col key={column} className={column === "number" ? "w-10" : column === "name" ? "w-32" : column === "description" ? "w-[310px]" : column === "category" ? "w-28" : column === "quantity" ? "w-20" : column === "price" || column === "total" ? "w-24" : "w-[229px]"} />)}</colgroup>
        <thead><tr className="bg-[#35530e] text-white">{columns.filter(visible).map(column => <th key={column} className="border border-[#274c3c] px-2 py-3 text-center font-bold">{label(column)}</th>)}</tr></thead>
        <tbody>{record.items.map((item, index) => <tr key={item.id} className="align-top even:bg-[#f8faf5]">{columns.filter(visible).map(column => {
          const content: Record<QuoteColumnKey, ReactNode> = {
            number: index + 1,
            name: <span className="font-bold">{isArabic ? item.nameAr : item.nameEn}<small className="mt-1 block font-normal text-[#718062]">{item.size}</small></span>,
            description: <span className="block whitespace-normal break-words text-start leading-6">{isArabic ? item.descriptionAr : item.descriptionEn}</span>,
            category: <span className="block whitespace-normal break-words text-start leading-6">{isArabic ? item.categoryAr : item.categoryEn}</span>,
            quantity: item.quantity,
            price: money(item.price),
            total: money(item.quantity * item.price),
            image: item.imagePath ? <img src={item.imagePath} alt={isArabic ? item.nameAr : item.nameEn} className="mx-auto h-[191px] w-[213px] min-w-[213px] rounded-xl object-cover ring-1 ring-[#d9e3d1]" /> : "—",
          };
          return <td key={column} className={`align-top border border-[#d9e3d1] px-2 py-3 leading-6 whitespace-normal [word-break:normal] [overflow-wrap:break-word] ${column === "image" ? "w-[229px] min-w-[229px] p-0 align-top" : ""}`}>{content[column]}</td>;
        })}</tr>)}</tbody>
      </table>
      <div data-quote-end="true" className="quote-end-block [break-inside:avoid] [page-break-inside:avoid]"><div className="mt-6 ms-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between border-b border-[#d9e3d1] pb-2"><span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span><strong>{money(totals.subtotal)}</strong></div>{record.fulfillment === "delivery" && <div className="flex justify-between border-b border-[#d9e3d1] pb-2"><span>{isArabic ? "رسوم الشحن" : "Shipping"}</span><strong>{money(totals.shipping)}</strong></div>}<div className="flex justify-between pt-1 text-base font-extrabold text-[#35530e]"><span>{isArabic ? "المجموع الكلي" : "Grand total"}</span><strong>{money(record.fulfillment === "delivery" ? totals.total : totals.subtotal)}</strong></div></div>
      <div className="mt-7 border-t border-[#d9e3d1] pt-5 leading-6"><p className="text-center text-sm font-bold text-[#22351b]">{record.closingText || "واقبلوا فائق الاحترام والتقدير،،،"}</p>{record.footerText && <p dir="rtl" className="mt-2 text-right text-xs text-[#68775a]">{record.footerText}</p>}{record.notes && <p dir="rtl" className="mt-3 text-right text-xs text-[#68775a]">{record.notes}</p>}</div>
      <div dir="ltr" className="mt-7 flex items-end justify-between gap-8 border-t border-[#d9e3d1] pt-5 text-xs text-black"><img src={record.stampPath || "/assets/qadri-stamp.png"} alt="Stamp" className="h-20 w-auto max-w-[180px] object-contain object-left" /><div dir="rtl" className="space-y-1 text-right"><p className="font-bold">{record.companyNameAr || "مؤسسة القادري الزراعية"}</p>{record.companyPhone && <p className="flex items-center justify-end gap-2"><Phone className="size-3.5 text-black" />{record.companyPhone}</p>}{record.companyEmail && <p className="flex items-center justify-end gap-2"><Mail className="size-3.5 text-black" />{record.companyEmail}</p>}{record.companyWebsite && <p className="flex items-center justify-end gap-2"><Globe className="size-3.5 text-black" />{record.companyWebsite}</p>}</div></div></div>
    </div>
  );
});
