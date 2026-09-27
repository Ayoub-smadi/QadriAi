import { Globe, Mail, Phone } from "lucide-react";
import { forwardRef, type ReactNode } from "react";

export function OfficialDocumentFooter({ stamp = "/assets/qadri-stamp.png" }: { stamp?: string }) {
  return <footer className="official-document-footer mt-auto border-t-2 border-black pt-4 text-xs text-black" dir="ltr"><div className="flex items-end justify-between gap-6"><div className="flex flex-col items-start"><div className="mb-1 text-start text-[11px] font-bold leading-5" dir="rtl">المدير العام / ثامر احمد القادري</div><img src={stamp} alt="ختم مؤسسة القادري الزراعية" className="h-24 w-52 object-contain object-left" /></div><div className="space-y-1 text-end text-[11px] font-bold leading-5" dir="rtl"><p>مؤسسة القادري الزراعية</p><p className="flex items-center justify-end gap-1"><Phone className="size-3" />00962777772211</p><p className="flex items-center justify-end gap-1"><Mail className="size-3" />tamerqadri@gmail.com</p><p className="flex items-center justify-end gap-1"><Globe className="size-3" />https://www.alqadrioffers.online</p></div></div></footer>;
}

export const A4Paper = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(function A4Paper({ children, className = "" }, ref) {
  return <div ref={ref} className={`a4-paper mx-auto flex min-h-[297mm] w-[210mm] max-w-full flex-col bg-white p-[14mm] shadow-[0_12px_35px_rgba(25,65,47,.14)] ${className}`}>{children}</div>;
});
