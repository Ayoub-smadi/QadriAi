import { LockKeyhole, MessageCircle, Mic, Send, Sparkles } from "lucide-react";

export function DigitalHumanPreview({ language }: { language: "ar" | "en" }) {
  const isArabic = language === "ar";
  const openAssistant = () => window.dispatchEvent(new CustomEvent("qadri-ai-open"));

  return (
    <section id="avatar-chat-preview" dir={isArabic ? "rtl" : "ltr"} className="relative overflow-hidden rounded-[2rem] bg-[#071f1a] p-4 shadow-[0_24px_60px_rgba(3,79,59,.2)] sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(102,196,157,.18),transparent_34%),radial-gradient(circle_at_86%_70%,rgba(83,153,121,.16),transparent_38%)]" />
      <div className="relative mb-4 flex items-center justify-between border-b border-white/10 px-2 pb-4 text-white">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-[#64d7ab] shadow-[0_0_12px_#64d7ab]" />
          <div><div className="text-sm font-bold">{isArabic ? "م. ثامر القادري" : "Eng. Thamer Al-Qadri"}</div><div className="mt-0.5 text-[10px] text-white/45">{isArabic ? "مساعد القادري الزراعي" : "Al-Qadri agricultural assistant"}</div></div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/45"><LockKeyhole className="size-3.5" />{isArabic ? "جلسة خاصة" : "Private session"}</div>
      </div>

      <div className="relative grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
        <div className="order-2 flex min-h-[320px] flex-col rounded-[1.4rem] border border-white/10 bg-[#081815]/90 p-4 lg:order-1">
          <div className="mb-4 flex items-center justify-between text-[10px] text-white/40"><span>{isArabic ? "المحادثة الحالية" : "Current conversation"}</span><span>{isArabic ? "الآن" : "Now"}</span></div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-end"><div className="max-w-[95%] rounded-2xl rounded-tr-md border border-[#64d7ab]/15 bg-[#64d7ab]/10 px-3 py-2.5 text-xs leading-6 text-white/85">{isArabic ? "مرحبًا، أنا م. ثامر القادري. كيف يمكنني مساعدتك اليوم؟" : "Hello, I am Eng. Thamer Al-Qadri. How can I help you today?"}</div></div>
            <div className="flex flex-wrap gap-2 pt-2"><button type="button" onClick={openAssistant} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/55 transition hover:border-[#64d7ab]/50 hover:text-[#c7f8e3]">{isArabic ? "سعر شجرة الزيتون؟" : "Olive tree price?"}</button><button type="button" onClick={openAssistant} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/55 transition hover:border-[#64d7ab]/50 hover:text-[#c7f8e3]">{isArabic ? "ما هي خدماتكم؟" : "Your services?"}</button></div>
          </div>
          <button type="button" onClick={openAssistant} className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.045] p-2 text-start text-xs text-white/35 transition hover:border-[#64d7ab]/45"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#b9f2dc] text-[#0a3025]"><Send className="size-4" /></span><span className="flex-1">{isArabic ? "اكتب سؤالك هنا..." : "Write your question here..."}</span><Mic className="size-4 text-white/45" /></button>
          <div className="mt-3 flex items-center justify-between text-[9px] text-white/30"><span>{isArabic ? "يدعم العربية والإنجليزية" : "Arabic and English supported"}</span><span className="inline-flex items-center gap-1"><Sparkles className="size-3" />{isArabic ? "إجابة موثوقة" : "Trusted answer"}</span></div>
        </div>

        <div className="order-1 flex min-h-[320px] flex-col items-center justify-end overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#152b2d] px-5 pt-6 lg:order-2">
          <div className="absolute h-52 w-52 rounded-full bg-[#62d5ad]/15 blur-3xl" />
          <div className="relative w-full max-w-[190px] overflow-hidden rounded-[6rem_6rem_1.4rem_1.4rem] border border-[#b9f2dc]/30 bg-[#193437] shadow-[0_18px_35px_rgba(0,0,0,.28)]"><img src="/assets/thamer-al-qadri.jpg" alt={isArabic ? "المهندس ثامر القادري" : "Engineer Thamer Al-Qadri"} className="aspect-[4/5] w-full object-cover object-top" loading="lazy" /></div>
          <div className="relative z-10 -mt-3 mb-5 rounded-full border border-white/10 bg-[#071f1a]/90 px-3 py-1.5 text-[10px] text-white/65">{isArabic ? "جاهز لتشغيل البث الواقعي..." : "Ready for live avatar stream..."}</div>
        </div>
      </div>
    </section>
  );
}
