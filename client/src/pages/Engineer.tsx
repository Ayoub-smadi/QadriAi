import { AccessGate, PlatformShell } from "@/components/PlatformShell";
import { AIChatBox } from "@/components/AIChatBox";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

export default function Engineer() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const retryCount = useRef(0);
  const consultation = trpc.ai.consult.useMutation({
    onSuccess: result => {
      retryCount.current = 0;
      setMessages(previous => [...previous, { role: "assistant", content: result.content }]);
    },
    onError: (error, variables) => {
      if (retryCount.current < 2) {
        retryCount.current += 1;
        window.setTimeout(() => consultation.mutate(variables), retryCount.current * 900);
        return;
      }
      retryCount.current = 0;
      console.error("Agricultural consultation failed", error);
      setMessages(previous => [...previous, { role: "assistant", content: language === "ar" ? "لم يصل الرد بعد. أعد إرسال السؤال وسأتابع معك." : "The answer did not arrive yet. Send the question again and I will continue." }]);
    },
  });
  const send = (content: string) => { retryCount.current = 0; const next = [...messages, { role: "user" as const, content }]; setMessages(next); consultation.mutate({ messages: next }); };
  const prompts = language === "ar" ? ["ما المحاصيل المناسبة لمساحة صغيرة؟", "كيف أتحقق من احتياج النبات للماء؟", "ما البيانات التي تحتاجها قبل تصميم الري؟"] : ["Which crops suit a small space?", "How can I check a plant’s water needs?", "What data do you need before irrigation design?"];
  return <PlatformShell title={language === "ar" ? "المهندس الزراعي الذكي" : "AI agricultural engineer"} eyebrow={language === "ar" ? "استشارة سياقية، حذرة، وقابلة للتفسير" : "Contextual, cautious, explainable guidance"}><AccessGate><main className="container grid gap-5 py-8 lg:grid-cols-[1fr_320px]"><section className="min-w-0"><div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#35530e]/10 bg-[#edf4e5] p-4 text-sm leading-6 text-[#4e6530]"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#35530e]"><Sparkles className="size-4" /></span><p>{language === "ar" ? "تستند الإجابة إلى المعلومات التي تشاركها في ملفك الزراعي. كلما كانت بيانات الموقع والمياه والتربة أوضح، كانت الإرشادات أدق." : "Answers use the information you save in your agricultural profile. The clearer your site, water, and soil data, the more useful the guidance."}</p></div><AIChatBox messages={messages} onSendMessage={send} isLoading={consultation.isPending} height="min(650px, 68vh)" className="rounded-[1.5rem] border-[#35530e]/10 shadow-[0_16px_40px_rgba(48,67,22,.07)]" placeholder={language === "ar" ? "اكتب سؤالك الزراعي…" : "Ask an agricultural question…"} emptyStateMessage={language === "ar" ? "كيف يمكنني مساعدتك اليوم؟" : "How can I help today?"} suggestedPrompts={prompts} /></section><aside className="space-y-4"><div className="rounded-[1.5rem] bg-[#35530e] p-5 text-white"><ShieldCheck className="size-6 text-[#d8e9b7]" /><h2 className="mt-4 text-lg font-bold">{language === "ar" ? "كيف نحافظ على سلامة الإرشاد؟" : "How guidance stays safe"}</h2><p className="mt-2 text-sm leading-6 text-[#e0ead0]">{language === "ar" ? "لا نتعامل مع توصيات المبيدات أو الأمراض كحقيقة مؤكدة دون أدلة كافية. في الحالات الحساسة، نوجهك لمهندس محلي مرخّص." : "We do not present pesticide or disease advice as certain without enough evidence. In sensitive cases, we direct you to a licensed local expert."}</p></div><div className="rounded-[1.5rem] border border-[#e5c7b7] bg-[#fffaf7] p-5"><AlertTriangle className="size-5 text-[#a85a38]" /><h3 className="mt-3 font-bold text-[#76442c]">{language === "ar" ? "متى تصعّد الحالة؟" : "When to escalate"}</h3><p className="mt-2 text-sm leading-6 text-[#8b654f]">{language === "ar" ? "عند انتشار سريع للأعراض، ذبول شديد، احتمالات تلوث، أو خطر على الغذاء والإنسان والحيوان." : "For rapidly spreading symptoms, severe wilting, possible contamination, or risks to food, people, or animals."}</p></div></aside></main></AccessGate></PlatformShell>;
}
