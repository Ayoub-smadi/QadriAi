import { PlatformShell } from "@/components/PlatformShell";
import { AIChatBox, type ChatAttachment } from "@/components/AIChatBox";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Sparkles } from "lucide-react";
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
      <main className="container py-8">
        <section className="min-w-0">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#35530e]/10 bg-[#edf4e5] p-4 text-sm leading-6 text-[#4e6530]">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#35530e]">
              <Sparkles className="size-4" />
            </span>
            <p>
              {language === "ar"
                ? "اسأل عن الري، التربة، المحاصيل، الأشجار، الآفات، التقليم أو العناية بالنباتات."
                : "Ask about irrigation, soil, crops, trees, pests, pruning, or plant care."}
            </p>
          </div>
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
      </main>
    </PlatformShell>
  );
}
