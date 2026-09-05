import { PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n";
import {
  Bug,
  Camera,
  CheckCircle2,
  CircleAlert,
  Droplets,
  FileImage,
  Flower2,
  Leaf,
  ScanSearch,
  ShieldCheck,
  Sprout,
  SunMedium,
  UploadCloud,
  X,
} from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

const analysisFeatures = [
  { icon: Leaf, ar: "تعرّف أولي على النبات", en: "Plant identification" },
  { icon: Bug, ar: "مؤشرات الآفات والأعراض", en: "Pest & symptom clues" },
  { icon: Droplets, ar: "فحص الري والإجهاد", en: "Irrigation & stress check" },
  { icon: SunMedium, ar: "قراءة الضوء والبيئة", en: "Light & environment read" },
];

export default function Diagnosis() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [mimeType, setMimeType] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [analysisRequested, setAnalysisRequested] = useState(false);

  const heading = isArabic ? "تحليل نبات" : "Plant analysis";
  const helper = isArabic
    ? "التقط صورة واضحة أو ارفعها لنجهّز قراءة أولية حذرة عند ربط خدمة التحليل."
    : "Take a clear photo or upload one so we can prepare a cautious first reading when the analysis service is connected.";

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setAnalysisRequested(false);
    if (!( ["image/jpeg", "image/png", "image/webp"] as string[]).includes(file.type)) {
      setError(isArabic ? "يرجى اختيار صورة JPG أو PNG أو WebP." : "Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 4_000_000) {
      setError(isArabic ? "يجب ألا يزيد حجم الصورة عن 4 ميغابايت." : "Image size must be 4 MB or less.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result));
      setMimeType(file.type as typeof mimeType);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageDataUrl("");
    setAnalysisRequested(false);
    setError("");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  const analyze = () => {
    if (!imageDataUrl) {
      setError(isArabic ? "اختر صورة نبات أولًا." : "Choose a plant image first.");
      return;
    }
    setAnalysisRequested(true);
  };

  return (
    <PlatformShell
      title={heading}
      eyebrow={isArabic ? "صورة أوضح، ملاحظة أدق، قرار أكثر أمانًا" : "A clearer photo, a sharper note, a safer decision"}
    >
      <main className="container py-8 sm:py-10" dir={isArabic ? "rtl" : "ltr"}>
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#17483b] px-6 py-8 text-white shadow-[0_22px_60px_rgba(30,76,53,.18)] sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -end-24 -top-28 size-80 rounded-full border-[28px] border-[#b7d574]/10" />
          <div className="pointer-events-none absolute -bottom-40 start-1/3 size-96 rounded-full border-[24px] border-[#e2b478]/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-[#e4efc9]">
                <ScanSearch className="size-4" />
                {isArabic ? "مختبر النبات الذكي" : "SMART PLANT LAB"}
              </div>
              <h2 className="mt-5 max-w-xl text-3xl font-black leading-[1.12] tracking-tight sm:text-5xl">
                {isArabic ? "افهم إشارات نباتك قبل أن تتصرف." : "Read your plant's signals before you act."}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#d6e6d2] sm:text-base">{helper}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-[#e7efcd]">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">{isArabic ? "كاميرا أو تحميل" : "Camera or upload"}</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">{isArabic ? "حتى 4 ميغابايت" : "Up to 4 MB"}</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">{isArabic ? "قراءة أولية حذرة" : "Cautious first reading"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              {analysisFeatures.map(({ icon: Icon, ar, en }) => (
                <div key={ar} className="rounded-2xl border border-white/10 bg-[#0e352d]/45 p-4">
                  <Icon className="size-6 text-[#dbeaa9]" strokeWidth={1.6} />
                  <p className="mt-3 text-xs font-bold leading-5 text-white">{isArabic ? ar : en}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <section className="rounded-[1.6rem] border border-[#dfe8d3] bg-white p-5 shadow-[0_14px_32px_rgba(48,67,22,.05)] sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#edf4e5] text-[#35530e]"><Flower2 className="size-5" /></span>
              <div>
                <h2 className="text-xl font-bold text-[#314617]">{isArabic ? "أرسل صورة النبات" : "Send a plant image"}</h2>
                <p className="mt-1 text-sm leading-6 text-[#6b785d]">{isArabic ? "اجعل الورقة أو الثمرة في منتصف الصورة وبإضاءة واضحة." : "Keep the leaf or fruit centered and use clear lighting."}</p>
              </div>
            </div>

            <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={selectFile} className="sr-only" />
            <input ref={uploadInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} className="sr-only" />

            <div className="mt-6 overflow-hidden rounded-[1.4rem] border-2 border-dashed border-[#a9c182] bg-[#f7faf3]">
              {imageDataUrl ? (
                <div className="relative p-3">
                  <img src={imageDataUrl} alt={isArabic ? "الصورة المختارة للنبات" : "Selected plant"} className="max-h-[340px] w-full rounded-2xl object-cover" />
                  <button type="button" onClick={clearImage} className="absolute end-6 top-6 grid size-10 place-items-center rounded-full bg-[#173b32]/85 text-white shadow-lg transition hover:bg-[#173b32]" aria-label={isArabic ? "إزالة الصورة" : "Remove image"}><X className="size-5" /></button>
                </div>
              ) : (
                <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-8 text-center">
                  <span className="grid size-16 place-items-center rounded-[1.4rem] bg-[#e8f1dc] text-[#5d7e31]"><UploadCloud className="size-8" /></span>
                  <h3 className="mt-4 text-base font-extrabold text-[#496327]">{isArabic ? "ابدأ بصورة قريبة وواضحة" : "Start with a close, clear image"}</h3>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-[#718062]">{isArabic ? "صوّر الورقة أو الساق أو الثمرة المتأثرة دون اهتزاز أو إضاءة قوية جدًا." : "Photograph the affected leaf, stem, or fruit without blur or harsh glare."}</p>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button type="button" onClick={() => cameraInputRef.current?.click()} className="h-12 rounded-xl bg-[#17483b] text-white shadow-sm hover:bg-[#0f392e]"><Camera className="size-5" />{isArabic ? "التقاط بالكاميرا" : "Use camera"}</Button>
              <Button type="button" onClick={() => uploadInputRef.current?.click()} variant="outline" className="h-12 rounded-xl border-[#a9c182] bg-white text-[#35530e] hover:bg-[#f0f6e9]"><UploadCloud className="size-5" />{isArabic ? "تحميل صورة" : "Upload image"}</Button>
            </div>

            <Textarea value={note} onChange={event => { setNote(event.target.value); setAnalysisRequested(false); }} placeholder={isArabic ? "ملاحظة اختيارية: متى بدأت الأعراض؟ هل انتشرت؟" : "Optional note: when did the symptoms start? Did they spread?"} className="mt-4 min-h-24 rounded-xl border-[#dfe8d3]" />
            {error && <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#a64f37]" role="alert"><CircleAlert className="size-4 shrink-0" />{error}</p>}
            <Button type="button" onClick={analyze} disabled={!imageDataUrl} className="mt-4 h-12 w-full rounded-xl bg-[#73973a] text-white hover:bg-[#5d7e31]"><ScanSearch className="size-5" />{isArabic ? "ابدأ التحليل" : "Start analysis"}</Button>
            <div className="mt-4 flex gap-2 rounded-xl border border-[#ead0a8] bg-[#fffaf1] p-3 text-xs leading-5 text-[#806436]"><ShieldCheck className="mt-0.5 size-4 shrink-0" />{isArabic ? "التحليل مساعد وليس بديلًا عن المعاينة الميدانية أو استشارة المهندس الزراعي." : "This tool assists but does not replace field inspection or agricultural expert advice."}</div>
          </section>

          <section className="min-w-0">
            {!analysisRequested ? (
              <div className="flex min-h-[540px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-[#b7cba0] bg-[#f2f6ec] p-8 text-center">
                <span className="grid size-20 place-items-center rounded-[1.8rem] bg-white text-[#78984a] shadow-sm"><ScanSearch className="size-10" /></span>
                <h2 className="mt-5 text-2xl font-black text-[#38501b]">{isArabic ? "منطقة نتيجة التحليل" : "Analysis result area"}</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-[#68775a]">{isArabic ? "بعد اختيار الصورة، اضغط «ابدأ التحليل». ستظهر النتيجة هنا عند ربط خدمة الذكاء الاصطناعي." : "Choose an image and press “Start analysis”. Results will appear here when the AI service is connected."}</p>
                <div className="mt-6 grid w-full max-w-md gap-3 sm:grid-cols-3">
                  {[{ icon: Leaf, ar: "النبات", en: "Plant" }, { icon: Bug, ar: "الأعراض", en: "Symptoms" }, { icon: ShieldCheck, ar: "الخطوات الآمنة", en: "Safe steps" }].map(({ icon: Icon, ar, en }) => <div key={ar} className="rounded-2xl bg-white/75 p-4 text-center"><Icon className="mx-auto size-5 text-[#73973a]" /><p className="mt-2 text-xs font-bold text-[#60714d]">{isArabic ? ar : en}</p></div>)}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.6rem] border border-[#e7cf9e] bg-[#fffaf1] p-6 shadow-[0_14px_32px_rgba(120,91,37,.06)] sm:p-8" role="status" aria-live="polite">
                <div className="flex items-start gap-3 text-[#806536]"><CircleAlert className="mt-1 size-6 shrink-0" /><div><p className="text-xs font-bold tracking-[.14em]">{isArabic ? "الرد المؤقت" : "TEMPORARY RESPONSE"}</p><h2 className="mt-2 text-2xl font-black text-[#5e4927]">{isArabic ? "تعذر الحصول على الرد الآن." : "The response is not available yet."}</h2><p className="mt-3 text-sm leading-7">{isArabic ? "Unable to transform response from server" : "Unable to transform response from server"}</p></div></div>
                <div className="mt-6 border-t border-[#eadcbf] pt-5 text-sm leading-7 text-[#90784e]">{isArabic ? "تم تجهيز الصورة والملاحظة محليًا، وسيظهر التحليل الحقيقي هنا بعد ربط الـ API." : "The image and note are prepared locally. The real analysis will appear here after the API is connected."}</div>
              </div>
            )}
          </section>
        </div>
      </main>
    </PlatformShell>
  );
}
