import { LockKeyhole, MessageCircle, Phone, Sparkles } from "lucide-react";

export function PrivateAvatarSession({ language }: { language: "ar" | "en" }) {
  const isArabic = language === "ar";
  const openAssistant = () => {
    window.dispatchEvent(new CustomEvent("qadri-ai-open"));
  };

  return (
    <section
      id="private-session"
      dir={isArabic ? "rtl" : "ltr"}
      className="relative overflow-hidden rounded-[2rem] border border-[#9ccdb8] bg-[linear-gradient(125deg,#f2fbf6,#e1f2e8)] p-5 shadow-[0_18px_45px_rgba(3,79,59,.11)] sm:p-7"
      aria-labelledby="private-session-title"
    >
      <div className="pointer-events-none absolute -end-12 -top-16 size-52 rounded-full bg-[#9bd6ba]/35 blur-3xl" />
      <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5a9d82]/25 bg-white/70 px-3 py-1.5 text-xs font-bold text-[#14634e]">
            <LockKeyhole className="size-3.5" />
            {isArabic ? "جلسة خاصة" : "Private session"}
          </div>
          <h2 id="private-session-title" className="mt-4 text-2xl font-bold tracking-tight text-[#07513e] sm:text-3xl">
            {isArabic ? "تحدث مباشرة مع المهندس ثامر" : "Talk directly with Engineer Thamer"}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#55766d]">
            {isArabic
              ? "جلسة مرتبطة بالمساعد الزراعي وصندوق المحادثة في الموقع. ابدأ من هنا وسيُفتح لك الحوار الخاص دون مغادرة الصفحة."
              : "A private entry point connected to the agricultural assistant and the site's chat box. Start here without leaving the page."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#3c755f]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9ccdb8] bg-white/65 px-3 py-2"><Sparkles className="size-3.5" />{isArabic ? "إجابة من المعرفة المعتمدة" : "Grounded answers"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9ccdb8] bg-white/65 px-3 py-2"><Phone className="size-3.5" />0777772211</span>
          </div>
          <button type="button" onClick={openAssistant} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#07513e] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(4,66,49,.2)] transition hover:-translate-y-0.5 hover:bg-[#034330]">
            <MessageCircle className="size-4" />
            {isArabic ? "ابدأ الجلسة الخاصة" : "Start private session"}
          </button>
        </div>
        <div className="relative mx-auto w-full max-w-[220px]">
          <div className="absolute inset-4 rounded-full bg-[#8ac9aa]/35 blur-2xl" />
          <div className="relative overflow-hidden rounded-[5rem_5rem_1.5rem_1.5rem] border-4 border-white/80 bg-[#dceee3] shadow-[0_16px_30px_rgba(3,79,59,.15)]">
            <img src="/assets/thamer-al-qadri.jpg" alt={isArabic ? "المهندس ثامر القادري" : "Engineer Thamer Al-Qadri"} className="aspect-[4/5] w-full object-cover object-top" loading="lazy" />
          </div>
          <div className="absolute bottom-3 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/70 bg-[#07513e]/90 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg">
            {isArabic ? "متصل بالمساعد الذكي" : "Connected to AI assistant"}
          </div>
        </div>
      </div>
    </section>
  );
}
