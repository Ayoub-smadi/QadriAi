import { PlatformShell } from "@/components/PlatformShell";
import { AIChatBox, type ChatAttachment } from "@/components/AIChatBox";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Engineer() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; attachments?: ChatAttachment[] }>>([]);
  const consultation = trpc.ai.consult.useMutation({
    onSuccess: result => setMessages(previous => [...previous, { role: "assistant", content: result.content }]),
    onError: error => {
      console.error("Agricultural consultation failed", error);
      setMessages(previous => [...previous, { role: "assistant", content: language === "ar" ? `تعذر الحصول على الرد الآن. ${error.message || "تحقق من الاتصال وحاول مرة أخرى."}` : `I could not get an answer right now. ${error.message || "Check your connection and try again."}` }]);
    },
  });
  const send = (content: string, attachments?: ChatAttachment[]) => { const next = [...messages, { role: "user" as const, content, ...(attachments?.length ? { attachments } : {}) }]; setMessages(next); consultation.mutate({ messages: next.map(message => ({ role: message.role, content: message.content })), attachments, language }); };
  const prompts = language === "ar" ? ["ما المحاصيل المناسبة لمساحة صغيرة؟", "كيف أتحقق من احتياج النبات للماء؟", "كيف أحسّن تربة الحديقة؟"] : ["Which crops suit a small space?", "How can I check a plant’s water needs?", "How can I improve garden soil?"];
  return (
    <PlatformShell
      title={language === "ar" ? "اسأل الذكاء الاصطناعي" : "Ask the AI"}
      eyebrow={language === "ar" ? "إجابات ذكية لكل سؤال زراعي" : "Smart answers for every agricultural question"}
    >
      <main className="container grid gap-5 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <AIChatBox
            messages={messages}
            onSendMessage={send}
            isLoading={consultation.isPending}
            height="min(650px, 68vh)"
            className="rounded-[1.5rem] border-[#35530e]/10 shadow-[0_16px_40px_rgba(48,67,22,.07)]"
            placeholder={language === "ar" ? "اكتب سؤالك الزراعي…" : "Ask an agricultural question…"}
            emptyStateMessage={language === "ar" ? "كيف يمكنني مساعدتك اليوم؟" : "How can I help today?"}
            suggestedPrompts={prompts}
          />
        </section>
        <aside className="flex min-h-[320px] items-center justify-center rounded-[1.5rem] border border-[#D4E7DF] bg-white p-8 shadow-[0_16px_40px_rgba(3,79,59,.07)]">
          <img
            src="/assets/qadri-bot-logo.png"
            alt={language === "ar" ? "شعار مساعد قدري الزراعي" : "Qadri agricultural assistant logo"}
            className="w-full max-w-[220px] object-contain"
          />
        </aside>
      </main>
    </PlatformShell>
  );
}
