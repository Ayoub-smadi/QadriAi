import { AIChatBox, type ChatAttachment, type Message } from "@/components/AIChatBox";
import { PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Check, Download, ImagePlus, Loader2, MessageCircle, RotateCcw, Sparkles, Upload, WandSparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Mode = "courtyard" | "farm" | "irrigation";
type Style = "simple" | "modern" | "arabic" | "productive" | "natural" | "traditional";
type Card = { id: Style; ar: string; en: string; image: string };

const styleCards: Card[] = [
  { id: "simple", ar: "فناء زراعي بسيط", en: "Simple farm courtyard", image: "/assets/qadri-simple-courtyard.jpg" },
  { id: "modern", ar: "فناء زراعي عصري", en: "Modern farm courtyard", image: "/assets/qadri-modern-courtyard.jpg" },
  { id: "arabic", ar: "فناء عربي زراعي", en: "Arabic farm courtyard", image: "/assets/qadri-arabic-courtyard.jpg" },
  { id: "productive", ar: "حديقة إنتاجية", en: "Productive garden", image: "/assets/qadri-productive-garden.jpg" },
  { id: "natural", ar: "زراعة طبيعية", en: "Natural agriculture", image: "/assets/qadri-natural-agriculture.jpg" },
  { id: "traditional", ar: "ريفي تقليدي", en: "Traditional rural", image: "/assets/qadri-traditional-rural.jpg" },
];

const modeLabels = {
  courtyard: ["فناء مزرعة", "Farm courtyard"],
  farm: ["أرض زراعية", "Agricultural land"],
  irrigation: ["شبكة ري", "Irrigation network"],
} as const;

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
  const [style, setStyle] = useState<Style>("productive");
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
  const selectedStyle = styleCards.find(card => card.id === style) || styleCards[0];

  const chooseImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        body: JSON.stringify({ description: brief.trim(), imageDataUrl: siteImage, mode, style, language }),
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
    setStyle("productive");
  };

  const send = (content: string, attachments?: ChatAttachment[]) => {
    const next = [...messages, { role: "user" as const, content, ...(attachments?.length ? { attachments } : {}) }];
    setMessages(next);
    consultation.mutate({ messages: next.map(item => ({ role: item.role, content: item.content })), attachments, language });
  };

  return <PlatformShell title={ar ? "مصمم الأرض الزراعية والري بالذكاء الاصطناعي" : "AI farm land & irrigation designer"} eyebrow={ar ? "ارفع صورة أرضك، اكتب طلبك، وشاهد تصورًا واقعيًا يحافظ على شكل الموقع." : "Upload your land, describe the goal, and get a realistic visualization that preserves the site."}>
    <main className="container py-6 sm:py-8" dir={ar ? "rtl" : "ltr"}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section className="order-2 rounded-[1.5rem] border border-[#dce6d7] bg-white p-5 shadow-[0_12px_35px_rgba(35,65,35,.06)] xl:order-1 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-black tracking-[.12em] text-[#78924a]">{ar ? "تصميم زراعي واقعي من صورتك" : "REALISTIC AGRICULTURAL DESIGN FROM YOUR PHOTO"}</p><h1 className="mt-2 text-xl font-black text-[#294a2e] sm:text-2xl">{ar ? "شاهد أرضك بعد التنفيذ" : "See your land after the transformation"}</h1></div>
            <span className="rounded-full bg-[#eef5e8] px-3 py-1 text-xs font-bold text-[#6b8543]">{ar ? "صورة + وصف" : "Photo + prompt"}</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{styleCards.map(card => <button type="button" key={card.id} onClick={() => setStyle(card.id)} className={`group overflow-hidden rounded-2xl border-2 text-start transition ${style === card.id ? "border-[#294a2e] shadow-[0_8px_20px_rgba(41,74,46,.15)]" : "border-transparent hover:border-[#bfd3b4]"}`}><div className="relative h-28 overflow-hidden bg-[#edf4e5] sm:h-32"><img src={card.image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />{style === card.id && <span className="absolute inset-0 grid place-items-center bg-[#063f33]/35"><span className="grid size-10 place-items-center rounded-full bg-[#063f33] text-white shadow-lg"><Check className="size-5" /></span></span>}</div><p className="bg-white px-2 py-2 text-center text-xs font-bold text-[#425627]">{ar ? card.ar : card.en}</p></button>)}</div>
          <div className="mt-7 border-t border-[#edf2e9] pt-6">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-[#294a2e]">{ar ? "النتيجة الواقعية" : "Photorealistic result"}</h2><p className="mt-1 text-xs text-[#81917b]">{ar ? "يتم الحفاظ على حدود الأرض والمنظور وإضافة المطلوب فقط." : "The land boundaries and viewpoint are preserved while adding your request."}</p></div>{generatedImage && <div className="flex items-center gap-2"><a href={generatedImage} download="qadri-agricultural-design.png" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-[#78924a]"><Download className="size-3.5" />{ar ? "تحميل" : "Download"}</a><button type="button" onClick={reset} className="flex items-center gap-1 text-xs font-bold text-[#78924a]"><RotateCcw className="size-3.5" />{ar ? "إعادة" : "Reset"}</button></div>}</div>
            {generatedImage ? <div className="mt-4 overflow-hidden rounded-2xl border border-[#cfe0bd] bg-[#f2f7ed]"><div className="relative aspect-[4/3] sm:aspect-[16/9]"><img src={generatedImage} alt={ar ? "التصميم الزراعي الناتج" : "Generated agricultural design"} className="size-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#063f33]/90 to-transparent p-5 pt-14 text-white"><p className="text-xs font-bold text-[#b9dfcf]">{ar ? modeLabels[mode][0] : modeLabels[mode][1]} · {ar ? selectedStyle.ar : selectedStyle.en}</p><p className="mt-1 line-clamp-2 text-sm font-bold">{brief}</p></div></div><div className="grid gap-3 p-4 sm:grid-cols-3"><ResultTag icon="🌱" text={ar ? "محاصيل بصفوف واقعية" : "Realistic crop rows"} /><ResultTag icon="💧" text={ar ? "شبكة ري متكاملة" : "Integrated irrigation"} /><ResultTag icon="📐" text={ar ? "الحفاظ على منظور الأرض" : "Preserved site perspective"} /></div><p className="mx-4 mb-4 rounded-xl bg-white p-3 text-xs leading-6 text-[#617354]">{ar ? "هذه صورة تصور بصري وليست مخططًا هندسيًا نهائيًا. راجع مهندسًا زراعيًا قبل التنفيذ لتحديد الضغط والتدفق وتباعد الأشجار." : "This is a visual concept, not a final engineering plan. Consult an agricultural engineer before construction to verify flow, pressure, and tree spacing."}</p></div> : <div className="mt-4 grid min-h-72 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-[#d7e3d0] bg-[#fbfdf9] p-8 text-center">{isGenerating ? <div><Loader2 className="mx-auto size-10 animate-spin text-[#2f715b]" /><p className="mt-4 text-sm font-black text-[#425627]">{ar ? "جاري تصميم أرضك بصورة واقعية…" : "Creating a photorealistic design…"}</p><p className="mt-2 text-xs text-[#81917b]">{ar ? "قد يستغرق ذلك بضع ثوانٍ" : "This may take a few seconds"}</p></div> : <div>{siteImage ? <img src={siteImage} alt="" className="mx-auto mb-4 max-h-44 max-w-full rounded-xl object-cover shadow-sm" /> : <Sparkles className="mx-auto size-9 text-[#9bb57d]" />}<p className="mt-3 text-sm font-bold text-[#718062]">{ar ? "ارفع صورة الأرض واكتب طلبك لتظهر النتيجة هنا" : "Upload your land and describe the result to see it here"}</p></div>}</div>}
          </div>
        </section>
        <aside className="order-1 space-y-4 xl:order-2">
          <section className="rounded-[1.5rem] border border-[#dce6d7] bg-white p-4 shadow-sm"><h2 className="text-sm font-black text-[#425627]">{ar ? "نوع التصميم" : "Design type"}</h2><div className="mt-3 grid grid-cols-3 gap-2">{(Object.keys(modeLabels) as Mode[]).map(item => <button type="button" key={item} onClick={() => setMode(item)} className={`rounded-xl border px-2 py-3 text-center text-[11px] font-bold transition ${mode === item ? "border-[#294a2e] bg-[#f1f7e9] text-[#294a2e]" : "border-[#e1e9dc] text-[#89977f]"}`}><span className="mb-1 block text-lg">{item === "irrigation" ? "💧" : item === "farm" ? "🌾" : "🏡"}</span>{ar ? modeLabels[item][0] : modeLabels[item][1]}</button>)}</div></section>
          <section className="rounded-[1.5rem] border border-[#dce6d7] bg-white p-4 shadow-sm"><h2 className="text-sm font-black text-[#425627]">{ar ? "ارفع صورة الأرض" : "Upload your land"}</h2><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="hidden" /><button type="button" onClick={() => fileRef.current?.click()} className="mt-3 grid min-h-28 w-full place-items-center rounded-2xl border-2 border-dashed border-[#d7e3d0] bg-[#fbfdf9] p-3 text-center text-xs text-[#89977f] hover:border-[#9fbe7c]">{siteImage ? <img src={siteImage} alt="" className="max-h-24 rounded-xl object-cover" /> : <ImagePlus className="size-6" />}<span className="mt-1">{siteImage ? (ar ? "تغيير الصورة" : "Change image") : (ar ? "انقر لاختيار صورة JPG أو PNG" : "Choose a JPG or PNG image")}</span><span className="mt-1 rounded-lg bg-[#063f33] px-3 py-1 text-[10px] font-bold text-white"><Upload className="me-1 inline size-3" />{ar ? "رفع الصورة" : "Upload image"}</span></button>{siteImage && <button type="button" onClick={() => { setSiteImage(null); setGeneratedImage(null); }} className="mt-2 flex items-center gap-1 text-xs text-[#a05c4c]"><X className="size-3" />{ar ? "إزالة الصورة" : "Remove image"}</button>}</section>
          <section className="rounded-[1.5rem] border border-[#dce6d7] bg-white p-4 shadow-sm"><h2 className="text-sm font-black text-[#425627]">{ar ? "صف النتيجة المطلوبة" : "Describe the result"}</h2><Textarea value={brief} onChange={event => setBrief(event.target.value)} maxLength={1200} rows={6} placeholder={ar ? "مثال: صمم شبكة ري بالتنقيط للأرض وازرع بها صفوف شجر ليمون، واترك ممر خدمة في المنتصف…" : "Example: design drip irrigation for the land and plant lemon trees in rows, leaving a service path in the middle…"} className="mt-3 resize-none rounded-xl border-[#d7e3d0] text-xs leading-6" /><div className="mt-1 text-end text-[10px] text-[#9aa592]">{brief.length}/1200</div><Button onClick={generate} disabled={isGenerating} className="mt-3 h-11 w-full rounded-xl bg-[#063f33] font-black text-white hover:bg-[#052f27] disabled:opacity-70">{isGenerating ? <Loader2 className="size-4 animate-spin" /> : <WandSparkles className="size-4" />}{isGenerating ? (ar ? "جاري إنشاء الصورة…" : "Generating image…") : (ar ? "أنشئ التصميم الواقعي" : "Generate realistic design")}</Button></section>
        </aside>
      </div>
      <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end gap-3">{chatOpen && <div className="w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#35530e]/15 bg-white shadow-[0_20px_60px_rgba(20,55,30,.22)]"><div className="flex items-center justify-between bg-[#063f33] px-4 py-3 text-white"><div><strong className="block text-sm">{ar ? "مساعد تعديل التصميم" : "Design edit assistant"}</strong><span className="text-[10px] text-[#b9dfcf]">{ar ? "اطلب تعديلًا على النتيجة" : "Ask to edit the result"}</span></div><button type="button" onClick={() => setChatOpen(false)}><X className="size-4" /></button></div><AIChatBox messages={messages} onSendMessage={send} isLoading={consultation.isPending} height="390px" className="rounded-none border-0 shadow-none" placeholder={ar ? "مثال: أضف أشجار زيتون…" : "e.g. add olive trees…"} emptyStateMessage={ar ? "كيف أعدّل التصميم؟" : "How should I edit the design?"} suggestedPrompts={ar ? ["أضف صفوف أشجار ليمون", "اجعل الري بالتنقيط", "اترك ممر خدمة بعرض مناسب"] : ["Add rows of lemon trees", "Use drip irrigation", "Leave a practical service path"]} /></div>}<button type="button" onClick={() => setChatOpen(value => !value)} className="grid size-14 place-items-center rounded-full bg-[#063f33] text-white shadow-[0_12px_30px_rgba(3,63,51,.3)] hover:scale-105" aria-label={ar ? "فتح مساعد التصميم" : "Open design assistant"}><MessageCircle className="size-6" /></button></div>
    </main>
  </PlatformShell>;
}

function ResultTag({ icon, text }: { icon: string; text: string }) {
  return <div className="rounded-xl bg-[#f8faf5] p-3 text-center text-xs font-bold text-[#617354]"><span className="block text-lg">{icon}</span><span className="mt-1 block">{text}</span></div>;
}
