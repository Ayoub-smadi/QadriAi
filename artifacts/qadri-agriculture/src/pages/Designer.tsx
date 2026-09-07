import { AIChatBox, type ChatAttachment, type Message } from "@/components/AIChatBox";
import { PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Download, ImagePlus, Loader2, MessageCircle, RotateCcw, Sparkles, Upload, WandSparkles, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

type Mode = "courtyard" | "farm" | "irrigation";

type ModeCopy = {
  ar: string;
  en: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
};

const modeLabels: Record<Mode, ModeCopy> = {
  courtyard: {
    ar: "فناء مزرعة",
    en: "Farm courtyard",
    descriptionAr: "تنسيق فناء عملي ومريح حول المزرعة",
    descriptionEn: "A practical, welcoming farm courtyard",
    icon: "🏡",
  },
  farm: {
    ar: "أرض زراعية",
    en: "Agricultural land",
    descriptionAr: "تخطيط المحاصيل والصفوف وممرات الخدمة",
    descriptionEn: "Plan crops, rows, and service paths",
    icon: "🌾",
  },
  irrigation: {
    ar: "شبكة ري",
    en: "Irrigation network",
    descriptionAr: "إظهار شبكة الري بالتنقيط داخل الأرض",
    descriptionEn: "Visualize drip irrigation across the land",
    icon: "💧",
  },
};

const quickPrompts = [
  {
    ar: "ليمون + ري بالتنقيط",
    en: "Lemon trees + drip irrigation",
    value: "صمم شبكة ري بالتنقيط للأرض وازرع بها صفوف شجر ليمون، مع ترك ممر خدمة واضح في المنتصف.",
  },
  {
    ar: "زيتون + ممرات خدمة",
    en: "Olives + service paths",
    value: "ازرع أشجار زيتون بصفوف منتظمة، وأضف شبكة ري مناسبة وممرات خدمة بين القطع.",
  },
  {
    ar: "خضار موسمية",
    en: "Seasonal vegetables",
    value: "قسّم الأرض إلى أحواض خضار موسمية مرتبة، مع خطوط ري بالتنقيط وممرات سهلة للوصول.",
  },
];

async function readImage(file: File) {
  if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) throw new Error("استخدم صورة JPG أو PNG أو WebP.");
  if (file.size > 13 * 1024 * 1024) throw new Error("حجم الصورة كبير. استخدم صورة أصغر من 13 ميغابايت.");
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة."));
    reader.readAsDataURL(file);
  });
}

export default function Designer() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("irrigation");
  const [siteImage, setSiteImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [brief, setBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const consultation = trpc.ai.consult.useMutation({
    onSuccess: response => setMessages(previous => [...previous, { role: "assistant", content: response.content }]),
    onError: () => setMessages(previous => [...previous, { role: "assistant", content: ar ? "فهمت طلبك. جرّب تعديل الصورة بعبارة أوضح، مثل: أضف صفوف ليمون مع شبكة تنقيط وممر خدمة." : "Try a more specific edit, such as: add lemon rows with drip irrigation and a service path." }]),
  });

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setSiteImage(await readImage(file));
      setGeneratedImage(null);
      toast.success(ar ? "تم تجهيز صورة الأرض للتصميم" : "Site image is ready for design");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (ar ? "تعذر قراءة الصورة" : "Could not read the image"));
    } finally {
      event.target.value = "";
    }
  };

  const generate = async () => {
    if (!brief.trim()) {
      toast.error(ar ? "اكتب وصفًا واضحًا للنتيجة المطلوبة" : "Describe the result you want");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch("/api/design/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: brief.trim(), imageDataUrl: siteImage, mode, style: "productive", language }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.imageUrl) throw new Error(payload.message || (ar ? "تعذر إنشاء التصميم الآن" : "Could not generate the design"));
      setGeneratedImage(payload.imageUrl);
      toast.success(ar ? "تم إنشاء التصور الزراعي الواقعي" : "Photorealistic agricultural concept is ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (ar ? "تعذر إنشاء التصميم الآن" : "Could not generate the design"));
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setGeneratedImage(null);
    setBrief("");
    setSiteImage(null);
    setMode("irrigation");
  };

  const send = (content: string, attachments?: ChatAttachment[]) => {
    const next = [...messages, { role: "user" as const, content, ...(attachments?.length ? { attachments } : {}) }];
    setMessages(next);
    consultation.mutate({ messages: next.map(item => ({ role: item.role, content: item.content })), attachments, language });
  };

  return <PlatformShell title={ar ? "مصمم الأرض الزراعية والري بالذكاء الاصطناعي" : "AI farm land & irrigation designer"} eyebrow={ar ? "ارفع صورة أرضك، اكتب طلبك، وشاهد تصورًا واقعيًا يحافظ على شكل الموقع." : "Upload your land, describe the goal, and get a realistic visualization that preserves the site."}>
    <main className="container py-6 sm:py-8" dir={ar ? "rtl" : "ltr"}>
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#073f35] p-6 text-white shadow-[0_20px_50px_rgba(6,63,53,.2)] sm:p-8">
        <div className="pointer-events-none absolute -end-20 -top-24 size-72 rounded-full bg-[#8ebc58]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 start-1/3 size-80 rounded-full bg-[#42a982]/15 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#c8e4b0]"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{ar ? "استوديو القادري الزراعي" : "Al-Qadri farm studio"}</span><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{ar ? "تصور قبل التنفيذ" : "Visualize before building"}</span></div>
            <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">{ar ? "من صورة الأرض إلى فكرة زراعية واضحة" : "From a land photo to a clear agricultural vision"}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d4e7d0] sm:text-base">{ar ? "لا تختار نمطًا جاهزًا. حدّد هدفك، ارفع صورة الموقع، ودع الذكاء الاصطناعي يركّب المحاصيل والري وممرات الخدمة على أرضك نفسها." : "Skip generic styles. Define your goal, upload the site, and let AI place crops, irrigation, and service paths on your actual land."}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StudioStep number="01" title={ar ? "صوّر" : "Upload"} text={ar ? "صورة الموقع" : "Site photo"} />
            <StudioStep number="02" title={ar ? "صف" : "Describe"} text={ar ? "ما تريده" : "Your goal"} />
            <StudioStep number="03" title={ar ? "شاهد" : "Visualize"} text={ar ? "النتيجة" : "The result"} />
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
        <section className="order-2 rounded-[1.6rem] border border-[#dce6d7] bg-white p-5 shadow-[0_12px_35px_rgba(35,65,35,.06)] xl:order-1 sm:p-7">
          <div className="mt-7 flex items-end justify-between gap-3"><div><h2 className="text-lg font-black text-[#294a2e]">{ar ? "النتيجة الواقعية" : "Photorealistic result"}</h2><p className="mt-1 text-xs text-[#81917b]">{ar ? "يتم الحفاظ على حدود الأرض والمنظور وإضافة المطلوب فقط." : "The land boundaries and viewpoint are preserved while adding your request."}</p></div>{generatedImage && <div className="flex items-center gap-3"><a href={generatedImage} download="qadri-agricultural-design.png" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-[#78924a]"><Download className="size-3.5" />{ar ? "تحميل" : "Download"}</a><button type="button" onClick={reset} className="flex items-center gap-1 text-xs font-bold text-[#78924a]"><RotateCcw className="size-3.5" />{ar ? "إعادة" : "Reset"}</button></div>}</div>
          {generatedImage ? <div className="mt-4 overflow-hidden rounded-2xl border border-[#cfe0bd] bg-[#f2f7ed]"><div className="relative aspect-[4/3] sm:aspect-[16/9]"><img src={generatedImage} alt={ar ? "التصميم الزراعي الناتج" : "Generated agricultural design"} className="size-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#063f33]/90 to-transparent p-5 pt-14 text-white"><p className="text-xs font-bold text-[#b9dfcf]">{ar ? modeLabels[mode].ar : modeLabels[mode].en} · {ar ? "تصور إنتاجي مخصص" : "Custom productive concept"}</p><p className="mt-1 line-clamp-2 text-sm font-bold">{brief}</p></div></div><div className="grid gap-3 p-4 sm:grid-cols-3"><ResultTag icon="🌱" text={ar ? "محاصيل بصفوف واقعية" : "Realistic crop rows"} /><ResultTag icon="💧" text={ar ? "شبكة ري متكاملة" : "Integrated irrigation"} /><ResultTag icon="📐" text={ar ? "الحفاظ على منظور الأرض" : "Preserved site perspective"} /></div><p className="mx-4 mb-4 rounded-xl bg-white p-3 text-xs leading-6 text-[#617354]">{ar ? "هذه صورة تصور بصري وليست مخططًا هندسيًا نهائيًا. راجع مهندسًا زراعيًا قبل التنفيذ لتحديد الضغط والتدفق وتباعد الأشجار." : "This is a visual concept, not a final engineering plan. Consult an agricultural engineer before construction to verify flow, pressure, and tree spacing."}</p></div> : <div className="mt-4 grid min-h-72 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-[#d7e3d0] bg-[#fbfdf9] p-8 text-center">{isGenerating ? <div><Loader2 className="mx-auto size-10 animate-spin text-[#2f715b]" /><p className="mt-4 text-sm font-black text-[#425627]">{ar ? "جاري تصميم أرضك بصورة واقعية…" : "Creating a photorealistic design…"}</p><p className="mt-2 text-xs text-[#81917b]">{ar ? "قد يستغرق ذلك بضع ثوانٍ" : "This may take a few seconds"}</p></div> : <div>{siteImage ? <img src={siteImage} alt="" className="mx-auto mb-4 max-h-44 max-w-full rounded-xl object-cover shadow-sm" /> : <Sparkles className="mx-auto size-9 text-[#9bb57d]" />}<p className="mt-3 text-sm font-bold text-[#718062]">{ar ? "ارفع صورة الأرض واكتب طلبك لتظهر النتيجة هنا" : "Upload your land and describe the result to see it here"}</p></div>}</div>}
        </section>

        <aside className="order-1 space-y-4 xl:order-2">
          <section className="rounded-[1.6rem] border border-[#dce6d7] bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.12em] text-[#78924a]">{ar ? "01 · الهدف" : "01 · GOAL"}</p><h2 className="mt-1 text-lg font-black text-[#294a2e]">{ar ? "ماذا تريد أن تصمم؟" : "What are you designing?"}</h2></div><span className="rounded-xl bg-[#f1f7e9] px-2.5 py-2 text-lg">{modeLabels[mode].icon}</span></div><div className="mt-4 space-y-2">{(Object.keys(modeLabels) as Mode[]).map(item => <button type="button" key={item} onClick={() => setMode(item)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition ${mode === item ? "border-[#2f715b] bg-[#f0f7ec] shadow-[0_8px_18px_rgba(47,113,91,.1)]" : "border-[#e1e9dc] bg-white hover:border-[#b9d2a9]"}`}><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f5f9ef] text-xl">{modeLabels[item].icon}</span><span className="min-w-0"><strong className="block text-sm font-black text-[#36532d]">{ar ? modeLabels[item].ar : modeLabels[item].en}</strong><span className="mt-0.5 block text-[11px] leading-5 text-[#81917b]">{ar ? modeLabels[item].descriptionAr : modeLabels[item].descriptionEn}</span></span><span className={`ms-auto grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${mode === item ? "border-[#2f715b] bg-[#2f715b] text-white" : "border-[#cbdac1] text-transparent"}`}>✓</span></button>)}</div></section>
          <section className="rounded-[1.6rem] border border-[#dce6d7] bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#edf5e5] text-lg">⌁</span><div><p className="text-xs font-black tracking-[.12em] text-[#78924a]">{ar ? "02 · الموقع" : "02 · SITE"}</p><h2 className="mt-1 text-lg font-black text-[#294a2e]">{ar ? "ارفع صورة الأرض" : "Upload your land"}</h2></div></div><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="hidden" /><button type="button" onClick={() => fileRef.current?.click()} className="mt-4 grid min-h-32 w-full place-items-center rounded-2xl border-2 border-dashed border-[#d7e3d0] bg-[#fbfdf9] p-3 text-center text-xs text-[#89977f] transition hover:border-[#9fbe7c]">{siteImage ? <img src={siteImage} alt="" className="max-h-28 rounded-xl object-cover" /> : <ImagePlus className="size-7 text-[#789b5c]" />}<span className="mt-1">{siteImage ? (ar ? "تغيير الصورة" : "Change image") : (ar ? "JPG أو PNG أو WebP" : "JPG, PNG, or WebP")}</span><span className="mt-1 rounded-lg bg-[#073f35] px-3 py-1 text-[10px] font-bold text-white"><Upload className="me-1 inline size-3" />{ar ? "اختيار الصورة" : "Choose image"}</span></button>{siteImage && <button type="button" onClick={() => { setSiteImage(null); setGeneratedImage(null); }} className="mt-2 flex items-center gap-1 text-xs text-[#a05c4c]"><X className="size-3" />{ar ? "إزالة الصورة" : "Remove image"}</button>}</section>
          <section className="rounded-[1.6rem] border border-[#dce6d7] bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#edf5e5] text-lg">✎</span><div><p className="text-xs font-black tracking-[.12em] text-[#78924a]">{ar ? "03 · الوصف" : "03 · BRIEF"}</p><h2 className="mt-1 text-lg font-black text-[#294a2e]">{ar ? "صف النتيجة المطلوبة" : "Describe the result"}</h2></div></div><Textarea value={brief} onChange={event => setBrief(event.target.value)} maxLength={1200} rows={6} placeholder={ar ? "مثال: صمم شبكة ري بالتنقيط للأرض وازرع بها صفوف شجر ليمون، واترك ممر خدمة في المنتصف…" : "Example: design drip irrigation for the land and plant lemon trees in rows, leaving a service path in the middle…"} className="mt-4 resize-none rounded-xl border-[#d7e3d0] text-xs leading-6" /><div className="mt-1 text-end text-[10px] text-[#9aa592]">{brief.length}/1200</div><div className="mt-3"><p className="mb-2 text-[11px] font-bold text-[#718062]">{ar ? "ابدأ من فكرة جاهزة" : "Start with a quick idea"}</p><div className="flex flex-wrap gap-2">{quickPrompts.map(prompt => <button type="button" key={prompt.ar} onClick={() => setBrief(prompt.value)} className="rounded-full border border-[#dce8d3] bg-[#f8fbf5] px-2.5 py-1.5 text-[10px] font-bold text-[#58713e] transition hover:border-[#9fbe7c] hover:bg-[#eef6e8]">{ar ? prompt.ar : prompt.en}</button>)}</div></div><Button onClick={generate} disabled={isGenerating} className="mt-4 h-12 w-full rounded-xl bg-[#073f35] font-black text-white shadow-[0_8px_18px_rgba(7,63,53,.18)] hover:bg-[#052f27] disabled:opacity-70">{isGenerating ? <Loader2 className="size-4 animate-spin" /> : <WandSparkles className="size-4" />}{isGenerating ? (ar ? "جاري إنشاء الصورة…" : "Generating image…") : (ar ? "أنشئ التصميم الواقعي" : "Generate realistic design")}</Button></section>
        </aside>
      </div>
      <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end gap-3">{chatOpen && <div className="w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#35530e]/15 bg-white shadow-[0_20px_60px_rgba(20,55,30,.22)]"><div className="flex items-center justify-between bg-[#073f35] px-4 py-3 text-white"><div><strong className="block text-sm">{ar ? "مساعد تعديل التصميم" : "Design edit assistant"}</strong><span className="text-[10px] text-[#b9dfcf]">{ar ? "اطلب تعديلًا على النتيجة" : "Ask to edit the result"}</span></div><button type="button" onClick={() => setChatOpen(false)}><X className="size-4" /></button></div><AIChatBox messages={messages} onSendMessage={send} isLoading={consultation.isPending} height="390px" className="rounded-none border-0 shadow-none" placeholder={ar ? "مثال: أضف أشجار زيتون…" : "e.g. add olive trees…"} emptyStateMessage={ar ? "كيف أعدّل التصميم؟" : "How should I edit the design?"} suggestedPrompts={ar ? ["أضف صفوف أشجار ليمون", "اجعل الري بالتنقيط", "اترك ممر خدمة بعرض مناسب"] : ["Add rows of lemon trees", "Use drip irrigation", "Leave a practical service path"]} /></div>}<button type="button" onClick={() => setChatOpen(value => !value)} className="grid size-14 place-items-center rounded-full bg-[#073f35] text-white shadow-[0_12px_30px_rgba(3,63,51,.3)] hover:scale-105" aria-label={ar ? "فتح مساعد التصميم" : "Open design assistant"}><MessageCircle className="size-6" /></button></div>
    </main>
  </PlatformShell>;
}

function StudioStep({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-sm sm:p-4"><span className="text-[10px] font-black tracking-[.16em] text-[#a9d27d]">{number}</span><strong className="mt-2 block text-sm font-black">{title}</strong><span className="mt-1 block text-[10px] text-[#c7ddd0]">{text}</span></div>;
}


function ResultTag({ icon, text }: { icon: string; text: string }) {
  return <div className="rounded-xl bg-[#f8faf5] p-3 text-center text-xs font-bold text-[#617354]"><span className="block text-lg">{icon}</span><span className="mt-1 block">{text}</span></div>;
}
