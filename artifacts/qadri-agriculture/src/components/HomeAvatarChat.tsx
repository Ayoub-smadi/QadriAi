import { AIChatBox, type ChatAttachment, type Message } from "@/components/AIChatBox";
import LiveAvatarPanel from "@/components/LiveAvatarPanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { LiveAvatarSession } from "@heygen/liveavatar-web-sdk";
import { useCallback, useRef, useState } from "react";

export function HomeAvatarChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceChatActive, setVoiceChatActive] = useState(false);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const onTranscript = useCallback((text: string) => setMessages(previous => [...previous, { role: "assistant", content: text }]), []);
  const send = (content: string, attachments?: ChatAttachment[]) => {
    const next = [...messages, { role: "user" as const, content, ...(attachments?.length ? { attachments } : {}) }];
    setMessages(next);
    if (sessionRef.current && !attachments?.length) sessionRef.current.message(content);
    else if (!sessionRef.current) setMessages(previous => [...previous, { role: "assistant", content: "الأفاتار غير متصل حاليًا. حاول مرة أخرى." }]);
  };
  const toggleVoice = async (active: boolean) => { const session = sessionRef.current; if (!session) return; try { if (active) await session.voiceChat.start(); else session.voiceChat.stop(); setVoiceChatActive(active); } catch { setVoiceChatActive(false); setMessages(previous => [...previous, { role: "assistant", content: "تعذر تشغيل الميكروفون. اسمح بالوصول ثم حاول مرة أخرى." }]); } };
  return <section className="container py-10 sm:py-14"><div className="overflow-hidden rounded-[2rem] border border-[#9ccdb8] bg-[#f4fbf7] p-3 shadow-[0_18px_50px_rgba(20,69,48,.12)]" dir="rtl"><div className="mb-3 flex items-center justify-between px-2"><div><h2 className="text-xl font-black text-[#174d3b]">المساعد الزراعي المباشر</h2><p className="mt-1 text-xs text-[#60766b]">اسأل كتابةً أو تحدث صوتيًا مع الأفاتار</p></div><span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#216248]">جلسة واحدة</span></div><div className="flex min-h-[390px] flex-row gap-3"><LiveAvatarPanel sessionRef={sessionRef} onTranscript={onTranscript} /><div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[#d8e7dd] bg-white"><AIChatBox messages={messages} onSendMessage={send} isLoading={false} height="100%" className="h-full rounded-none border-0 shadow-none" placeholder={user?.role === "admin" ? "اكتب سؤالك أو اطلب مستندًا..." : "اكتب سؤالك الزراعي..."} emptyStateMessage="اكتب سؤالك أو اضغط زر الميكروفون" suggestedPrompts={user?.role === "admin" ? ["اعمل فاتورة تصدير جديدة", "جهز سند قبض"] : ["كيف أعتني بنباتاتي؟"]} speechLanguage="ar" onVoiceChatToggle={toggleVoice} voiceChatActive={voiceChatActive} /></div></div></div></section>;
}
