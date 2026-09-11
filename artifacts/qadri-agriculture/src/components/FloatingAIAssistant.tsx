import { AIChatBox, type ChatAttachment, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bot, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function FloatingAIAssistant() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(() => typeof window !== "undefined" && localStorage.getItem("qadri-ai-chat-open") === "1");
  const [messages, setMessages] = useState<Message[]>([]);
  const consultation = trpc.ai.consult.useMutation({
    onSuccess: result => setMessages(previous => [...previous, { role: "assistant", content: result.content, ...(result.images?.length ? { images: result.images } : {}) }]),
    onError: error => setMessages(previous => [...previous, { role: "assistant", content: error.message || "تعذر الحصول على الرد الآن." }]),
  });
  useEffect(() => {
    if (location === "/financial-documents" && user?.role === "admin") setOpen(true);
  }, [location, user?.role]);
  useEffect(() => {
    localStorage.setItem("qadri-ai-chat-open", open ? "1" : "0");
  }, [open]);
  const send = (content: string, attachments?: ChatAttachment[]) => {
    const next = [...messages, { role: "user" as const, content, ...(attachments?.length ? { attachments } : {}) }];
    setMessages(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("financial-ai-command", { detail: { content } }));
      setOpen(true);
    }
    if (location === "/financial-documents" && /فاتورة|سند قبض|سند صرف|وصل قبض|وصل صرف/i.test(content)) {
      setMessages(previous => [...previous, { role: "assistant", content: "جهزت لك المستند وعبّيت البيانات المطلوبة. راجعه واضغط حفظ المستند." }]);
      return;
    }
    consultation.mutate({ messages: next.map(message => ({ role: message.role, content: message.content })), attachments, language: "ar" });
  };
  return <>
    <button type="button" onClick={() => setOpen(value => !value)} aria-label="فتح المساعد الذكي" className="fixed bottom-5 end-5 z-[70] grid size-16 place-items-center rounded-full border-4 border-white bg-[#07513e] p-1 shadow-[0_12px_32px_rgba(4,66,49,.35)] transition hover:scale-105"><img src="/assets/chatbot.png" alt="المساعد الذكي" className="size-full rounded-full object-contain" /></button>
    {open && <section className="fixed bottom-24 end-4 z-[70] flex h-[min(620px,calc(100dvh-7rem))] w-[min(420px,calc(100vw-2rem))] min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-[#9ccdb8] bg-white shadow-[0_20px_60px_rgba(3,63,47,.28)]" dir="rtl"><header className="flex shrink-0 items-center justify-between bg-[#07513e] px-4 py-3 text-white"><div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-full bg-white p-0.5"><img src="/assets/chatbot.png" alt="المساعد الذكي" className="size-full rounded-full object-contain" /></span><div><b className="block text-sm">المساعد الإداري الذكي</b><span className="text-[11px] text-[#cbe9dc]">{user?.role === "admin" ? "متاح لتحضير الفواتير" : "مساعد القادري الزراعي"}</span></div></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="إغلاق"><X className="size-5" /></button></header><div className="min-h-0 flex-1 overflow-hidden"><AIChatBox messages={messages} onSendMessage={send} isLoading={consultation.isPending} height="auto" className="h-full rounded-none border-0 shadow-none" placeholder={user?.role === "admin" ? "مثال: اعمل فاتورة تصدير للجهة..." : "اكتب سؤالك الزراعي..."} emptyStateMessage={user?.role === "admin" ? "اطلب تجهيز فاتورة أو اسألني عن الإدارة" : "كيف أساعدك؟"} suggestedPrompts={user?.role === "admin" ? ["اعمل فاتورة تصدير جديدة", "جهز سند قبض", "جهز سند صرف"] : ["كيف أعتني بنباتاتي؟"]} speechLanguage="ar" /></div></section>}
  </>;
}
