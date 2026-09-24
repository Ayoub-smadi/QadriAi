import { AIChatBox, type ChatAttachment, type Message } from "@/components/AIChatBox";
import LiveAvatarPanel from "@/components/LiveAvatarPanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { LiveAvatarSession } from "@heygen/liveavatar-web-sdk";
import { useCallback, useRef, useState } from "react";

export function HomeLiveAvatarChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceChatActive, setVoiceChatActive] = useState(false);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const onTranscript = useCallback((text: string) => setMessages(previous => [...previous, { role: "assistant", content: text }]), []);
  const send = (content: string, attachments?: ChatAttachment[]) => {
    const next = [...messages, { role: "user" as const, content, ...(attachments?.length ? { attachments } : {}) }];
    setMessages(next);
    if (sessionRef.current && !attachments?.length) sessionRef.current.message(content);
    else if (!sessionRef.current) setMessages(previous => [...previous, { role: "assistant", content: "الأفاتار غير متصل حاليًا. حاول فتح الصفحة مرة أخرى." }]);
  };
  const toggleVoice = async (active: boolean) => { const session = sessionRef.current; if (!session) return; try { if (active) await session.voiceChat.start(); else session.voiceChat.stop(); setVoiceChatActive(active); } catch { setVoiceChatActive(false); setMessages(previous => [...previous, { role: "assistant", content: "تعذر تشغيل الميكروفون. اسمح بالوصول إليه ثم حاول مرة أخرى." }]); } };
  return <div className="relative mx-auto w-full max-w-[680px] lg:max-w-[700px]"><div className="absolute -inset-5 rounded-[2.5rem] bg-[#82cdb1]/25 blur-2xl" /><div className="relative flex min-h-[430px] flex-row gap-2 overflow-hidden rounded-[2rem] border border-[#9ccdb8] bg-[#f4fbf7] p-2 shadow-[0_24px_60px_rgba(3,79,59,.14)]" dir="rtl"><LiveAvatarPanel sessionRef={sessionRef} onTranscript={onTranscript} /><div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[#d8e7dd] bg-white"><AIChatBox messages={messages} onSendMessage={send} isLoading={false} height="100%" className="h-full rounded-none border-0 shadow-none" placeholder={user?.role === "admin" ? "اكتب طلبك أو سؤالك..." : "اكتب سؤالك الزراعي..."} emptyStateMessage="اسأل الأفاتار كتابةً أو تحدث معه صوتيًا" suggestedPrompts={undefined} speechLanguage="ar" onVoiceChatToggle={toggleVoice} voiceChatActive={voiceChatActive} /></div></div></div>;
}
