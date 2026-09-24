import { AIChatBox, type ChatAttachment, type Message } from "@/components/AIChatBox";
import LiveAvatarPanel from "@/components/LiveAvatarPanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { LiveAvatarSession } from "@heygen/liveavatar-web-sdk";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export default function FloatingAIAssistant() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceChatActive, setVoiceChatActive] = useState(false);
  const liveAvatarSessionRef = useRef<LiveAvatarSession | null>(null);
  const onAvatarTranscript = useCallback((text: string) => setMessages(previous => [...previous, { role: "assistant", content: text }]), []);
  const toggleVoiceChat = async (active: boolean) => { const session = liveAvatarSessionRef.current; if (!session) return; try { if (active) await session.voiceChat.start(); else session.voiceChat.stop(); setVoiceChatActive(active); } catch { setVoiceChatActive(false); setMessages(previous => [...previous, { role: "assistant", content: "تعذر تشغيل الميكروفون. اسمح بالوصول إلى الميكروفون ثم حاول مرة أخرى." }]); } };
  useEffect(() => { if (location === "/financial-documents") setOpen(false); }, [location]);
  useEffect(() => { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("qadri-ai-open", { detail: { open } })); }, [open]);
  const send = (content: string, attachments?: ChatAttachment[]) => {
    const next = [...messages, { role: "user" as const, content, ...(attachments?.length ? { attachments } : {}) }];
    setMessages(next);
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("financial-ai-command", { detail: { content } }));
    if (liveAvatarSessionRef.current && !attachments?.length) { liveAvatarSessionRef.current.message(content); return; }
    if (!liveAvatarSessionRef.current) setMessages(previous => [...previous, { role: "assistant", content: "الأفاتار غير متصل حاليًا. حاول فتح المساعد مرة أخرى." }]);
  };
  if (location === "/") return null;
  return <>
    <button type="button" onClick={() => setOpen(value => !value)} aria-label="فتح المساعد الذكي" className="fixed bottom-5 end-5 z-[70] grid size-14 place-items-center rounded-full border-4 border-white bg-[#07513e] p-1 shadow-[0_12px_32px_rgba(4,66,49,.35)] transition hover:scale-105"><img src="/assets/chatbot.png" alt="المساعد الذكي" className="size-full rounded-full object-contain" /></button>
    {open && <section className="fixed bottom-24 end-4 z-[70] flex h-[min(510px,calc(100dvh-7rem))] w-[min(620px,calc(100vw-2rem))] min-h-0 flex-col overflow-hidden rounded-[1.25rem] border border-[#9ccdb8] bg-white shadow-[0_20px_60px_rgba(3,63,47,.28)]" dir="rtl"><header className="flex shrink-0 items-center justify-between bg-[#07513e] px-3 py-2 text-white"><div className="flex items-center gap-2"><b className="text-sm">المساعد الإداري الذكي</b><span className="text-[10px] text-[#cbe9dc]">جلسة LiveAvatar واحدة</span></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="إغلاق"><X className="size-4" /></button></header><div className="flex min-h-0 flex-1 flex-row gap-2 p-2"><LiveAvatarPanel sessionRef={liveAvatarSessionRef} onTranscript={onAvatarTranscript} /><div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[#d8e7dd]"><AIChatBox messages={messages} onSendMessage={send} isLoading={false} height="auto" className="h-full rounded-none border-0 shadow-none" placeholder={user?.role === "admin" ? "اكتب سؤالك أو اطلب مستندًا..." : "اكتب سؤالك الزراعي..."} emptyStateMessage="اكتب سؤالك للمساعد" suggestedPrompts={user?.role === "admin" ? ["اعمل فاتورة تصدير جديدة", "جهز سند قبض"] : ["كيف أعتني بنباتاتي؟"]} speechLanguage="ar" onVoiceChatToggle={toggleVoiceChat} voiceChatActive={voiceChatActive} /></div></div></section>}
  </>;
}
