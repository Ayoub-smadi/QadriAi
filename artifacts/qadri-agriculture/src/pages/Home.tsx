import { useAuth } from "@/_core/hooks/useAuth";
import { PlatformShell } from "@/components/PlatformShell";
import { SmartPlantRescue } from "@/components/SmartPlantRescue";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Bot, CheckCircle2, ClipboardCheck, DraftingCompass, Globe2, LineChart, Mail, Phone, ScanSearch, ShieldCheck, Sprout, TreePine } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";


function useTypewriter(text: string) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    let index = 0;
    let phase: "typing" | "pause" | "deleting" | "rewriting" | "done" = "typing";
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (phase === "typing" || phase === "rewriting") {
        if (index < text.length) {
          index += 1;
          setVisibleText(text.slice(0, index));
          timer = setTimeout(tick, 28);
          return;
        }
        phase = phase === "typing" ? "pause" : "done";
        timer = setTimeout(tick, phase === "pause" ? 2600 : 0);
        return;
      }

      if (phase === "pause") {
        phase = "deleting";
        timer = setTimeout(tick, 14);
        return;
      }

      if (phase === "deleting") {
        setVisibleText("");
        index = 0;
        phase = "rewriting";
        timer = setTimeout(tick, 500);
        return;
      }
    };

    setVisibleText("");
    tick();
    return () => clearTimeout(timer);
  }, [text]);

  return visibleText;
}

export default function Home() {
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const Arrow = language === "ar" ? ArrowLeft : ArrowRight;
  const bioText = language === "ar"
    ? "المهندس ثامر القادري من الشخصيات الزراعية البارزة في الأردن، كرّس سنوات طويلة لخدمة القطاع الزراعي وتطويره. ومن خلال إدارته لمشاتل القادري الزراعية، أسهم في توفير أصناف متميزة من الأشجار والنباتات، مع الحرص على الجودة والابتكار وتقديم أفضل الخدمات للمزارعين والمهتمين بالزراعة. ويُعرف برؤيته المهنية وخبرته الواسعة واهتمامه بنشر الثقافة الزراعية وتعزيز التنمية الخضراء، مما أكسبه مكانة مرموقة واحتراماً كبيراً في هذا المجال. كما يُشهد له بحسن التعامل والالتزام والمصداقية، وهي صفات جعلت من اسمه رمزاً للثقة والتميز في القطاع الزراعي."
    : "Engineer Thamer Al-Qadri is one of Jordan's distinguished agricultural figures. He has devoted many years to serving and advancing the agricultural sector. Through his leadership of Al-Qadri Agricultural Nurseries, he has helped provide distinguished varieties of trees and plants while championing quality, innovation, and excellent service for farmers and gardening enthusiasts. He is known for his professional vision, broad experience, and continued commitment to agricultural education and green development—earning lasting respect across the sector. His integrity, reliability, and warm dealings have made his name a trusted symbol of excellence in agriculture."
  const typedBio = useTypewriter(bioText);
  const steps = [
    { icon: Bot, ar: "اسأل", en: "Ask" }, { icon: ScanSearch, ar: "حلّل", en: "Analyze" }, { icon: Sprout, ar: "خطّط", en: "Plan" }, { icon: ClipboardCheck, ar: "راجع", en: "Review" }, { icon: LineChart, ar: "تابع", en: "Follow up" },
  ];
  const services = [
    { icon: Bot, title: language === "ar" ? "المهندس الزراعي الذكي" : "AI agricultural engineer", text: language === "ar" ? "إرشاد سياقي يراعي موقعك ومياهك وتربتك وأهدافك." : "Context-aware guidance shaped by your place, water, soil, and goals.", href: "/engineer", tone: "bg-[#eff5e7]" },
    { icon: DraftingCompass, title: language === "ar" ? "مصمم لاندسكيب وري" : "Landscape & irrigation designer", text: language === "ar" ? "صمّم أرضك بالسحب والإفلات، احسب الكميات، وصدّر مخططك وتقريرك الفني." : "Design with drag & drop, estimate quantities, and export your plan and technical report.", href: "/designer", tone: "bg-[#e8f2e7]" },
    { icon: ScanSearch, title: language === "ar" ? "حلّل نباتك" : "Analyze a plant", text: language === "ar" ? "ارفع صورة لتحصل على قراءة أولية حذرة وخطوات آمنة." : "Upload a photo for cautious initial triage and safe next steps.", href: "/diagnosis", tone: "bg-[#f6f1e6]" },
    { icon: Sprout, title: language === "ar" ? "ماذا أزرع؟" : "What should I grow?", text: language === "ar" ? "ترشيحات قابلة للتفسير قبل بدء التخطيط أو التنفيذ." : "Explainable suitability recommendations before you plan or build.", href: "/selector", tone: "bg-[#edf3ee]" },
    { icon: TreePine, title: language === "ar" ? "تابع مزرعتك وحديقتك" : "Manage farms & gardens", text: language === "ar" ? "مهام العناية والمشاريع والسجل الزراعي في مساحة واحدة." : "Care tasks, projects, and your agricultural record in one workspace.", href: "/dashboard", tone: "bg-[#edf0df]" },
  ];

  return <PlatformShell>
    <main>
      <section className="relative overflow-hidden border-b border-[#034f3b]/10 bg-[#edf8f4]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(255,255,255,.92),transparent_30%),linear-gradient(120deg,rgba(239,250,246,.98),rgba(215,239,230,.55))]" />
        <div className="container relative grid min-h-[620px] items-center gap-10 py-12 lg:grid-cols-[.85fr_1.15fr] lg:py-14">
          <div className="order-2 max-w-2xl lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4c947c]/25 bg-white/80 px-3 py-1.5 text-xs font-bold text-[#14634e] shadow-sm"><span className="size-1.5 rounded-full bg-[#58a98d]" />{language === "ar" ? "ذكاء زراعي مسؤول، بتوجيه من الخبرة" : "Responsible AI, guided by agricultural expertise"}</div>
            <h1 className="mt-6 max-w-[620px] text-balance text-4xl font-bold leading-[1.14] tracking-tight text-[#005842] sm:text-5xl lg:text-[4.3rem]">{language === "ar" ? "مهندس زراعي ذكي بين يديك." : "An intelligent agricultural engineer at your fingertips."}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#55766d]">{language === "ar" ? "من الاستشارة والتشخيص إلى التخطيط والمتابعة، يساعدك القادري الزراعي الذكي في اتخاذ قرارات أوضح لحديقتك أو مزرعتك — بذكاء سياقي ومراجعة خبراء عند الحاجة." : "From consultation and diagnosis to planning and follow-up, Al-Qadri helps you make clearer decisions for your garden or farm—with contextual intelligence and expert review when needed."}</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button asChild className="h-12 rounded-xl bg-[#034f3b] px-5 text-base text-white shadow-[0_12px_24px_rgba(3,79,59,.2)] hover:bg-[#023c2d]"><Link href={isAuthenticated ? "/dashboard" : "/selector"}>{t.start}<Arrow className="ms-2 size-4" /></Link></Button><Button asChild variant="outline" className="h-12 rounded-xl border-[#034f3b]/20 bg-white px-5 text-base text-[#034f3b] hover:bg-[#e8f5ef]"><Link href="/engineer"><Bot className="me-2 size-4" />{language === "ar" ? "اسأل الذكاء الاصطناعي" : "Ask the AI"}</Link></Button>{!isAuthenticated && <Button onClick={() => setLocation("/auth")} variant="outline" className="h-12 rounded-xl border-[#034f3b]/20 bg-white px-5 text-base text-[#034f3b] hover:bg-[#e8f5ef]">{t.signIn}</Button>}</div>
            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#55766d]"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#2a8068]" />{language === "ar" ? "توصيات حذرة" : "Cautious guidance"}</span><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#2a8068]" />{language === "ar" ? "خطوات قابلة للتفسير" : "Explainable next steps"}</span></div>
          </div>
          <div className="order-1 lg:order-2"><div className="relative mx-auto w-full max-w-[360px] lg:max-w-[390px]"><div className="absolute -inset-5 rounded-[2.5rem] bg-[#82cdb1]/25 blur-2xl" /><SmartPlantRescue language={language} /></div></div>
        </div>
      </section>

       <section className="container py-12 sm:py-16"><div className="relative overflow-hidden rounded-[2rem] border border-[#35530e]/10 bg-[#f4f8ee] p-6 shadow-[0_16px_40px_rgba(48,67,22,.07)] sm:p-9" dir={language === "ar" ? "rtl" : "ltr"}><div className="pointer-events-none absolute -end-16 -top-20 size-48 rounded-full bg-[#dcebbd]/70 blur-3xl" /><div className="relative max-w-4xl"><p className="text-xs font-bold tracking-[.16em] text-[#759244]">{language === "ar" ? "رؤية زراعية من الأردن" : "AN AGRICULTURAL VISION FROM JORDAN"}</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-[#293d12] sm:text-3xl">{language === "ar" ? "المهندس ثامر القادري" : "Engineer Thamer Al-Qadri"}</h2><img src="/assets/thamer-al-qadri.jpg" alt={language === "ar" ? "المهندس ثامر القادري خلال توقيع اتفاقية" : "Engineer Thamer Al-Qadri during an agreement signing"} className="mt-6 w-full max-w-3xl rounded-[1.5rem] object-cover shadow-[0_12px_28px_rgba(48,67,22,.12)]" loading="lazy" /><p className="mt-5 min-h-[11rem] text-base leading-8 text-[#5f6d50] sm:min-h-[8rem]" aria-live="polite">{typedBio}<span className="ms-1 inline-block font-bold text-[#6d9335] animate-pulse">|</span></p><div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-[#496327]"><a href="tel:0777772211" dir="ltr" className="inline-flex items-center gap-2 rounded-full border border-[#bcd3a1] bg-white/80 px-5 py-3 text-lg font-extrabold tracking-wide text-[#35530e] transition hover:bg-white"><Phone className="size-5" />0777772211</a><a href="mailto:tamerqadri@gmail.com" className="inline-flex items-center gap-2 rounded-full border border-[#bcd3a1] bg-white/80 px-4 py-2 transition hover:bg-white"><Mail className="size-4" />tamerqadri@gmail.com</a><a href="https://www.alqadrioffers.online" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#bcd3a1] bg-white/80 px-4 py-2 transition hover:bg-white"><Globe2 className="size-4" />{language === "ar" ? "الموقع الإلكتروني" : "Website"}</a></div></div></div></section>

      <section className="container py-12 sm:py-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold tracking-[.16em] text-[#759244]">{language === "ar" ? "رحلة مترابطة" : "A CONNECTED JOURNEY"}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#293d12]">{language === "ar" ? "من الملاحظة إلى متابعة ذات معنى" : "From observation to meaningful follow-up"}</h2></div><p className="max-w-md text-sm leading-6 text-[#68775a]">{language === "ar" ? "ليست خدمات منفصلة؛ كل خطوة تحفظ سياقك وتفتح ما بعدها." : "These are not disconnected tools; every step preserves context and unlocks the next."}</p></div><div className="mt-9 grid grid-cols-5 gap-2 sm:gap-4">{steps.map((step, index) => <div key={step.ar} className="relative text-center">{index < steps.length - 1 && <span className="absolute top-5 start-[61%] hidden h-px w-[78%] bg-[#cfdcc0] md:block" />}<span className="relative mx-auto grid size-10 place-items-center rounded-xl bg-[#e9f0df] text-[#35530e] sm:size-12"><step.icon className="size-4 sm:size-5" /></span><p className="mt-2 text-xs font-bold text-[#4d5d3b]">{language === "ar" ? step.ar : step.en}</p></div>)}</div></section>

      <section className="container pb-16"><div dir={language === "ar" ? "rtl" : "ltr"} className="relative overflow-hidden rounded-[2rem] bg-[#35530e] p-7 text-white shadow-[0_20px_50px_rgba(53,83,14,.2)] sm:p-10"><div className="pointer-events-none absolute -end-10 -top-20 size-56 rounded-full bg-[#84a94b]/30 blur-3xl" /><div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-[#e2efcb]"><Bot className="size-3.5" />{language === "ar" ? "مساعدك الزراعي متاح الآن" : "Your agricultural assistant is ready"}</div><h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">{language === "ar" ? "اسأل الذكاء الاصطناعي عن أي موضوع زراعي." : "Ask AI anything about agriculture."}</h2><p className="mt-4 max-w-xl leading-7 text-[#e1ebd0]">{language === "ar" ? "من الري والتربة إلى اختيار المحاصيل والعناية بالنباتات، اكتب سؤالك وسيجيبك بإرشاد عملي حذر ومفهوم." : "From irrigation and soil to crop selection and plant care, ask your question and get practical, careful, understandable guidance."}</p><Button asChild className="mt-6 h-11 rounded-xl bg-white px-5 text-[#35530e] hover:bg-[#eef5e4]"><Link href="/engineer">{language === "ar" ? "ابدأ بالسؤال" : "Start asking"}<Arrow className="ms-2 size-4" /></Link></Button></div><div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm"><p className="text-xs font-bold tracking-[.14em] text-[#d5e5b8]">{language === "ar" ? "أمثلة سريعة" : "QUICK EXAMPLES"}</p><div className="mt-4 space-y-2"><Link href="/engineer" className="block rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/20">{language === "ar" ? "كيف أعرف أن النبات يحتاج ماء؟" : "How do I know a plant needs water?"}</Link><Link href="/engineer" className="block rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/20">{language === "ar" ? "ما المحاصيل المناسبة لمساحتي؟" : "Which crops suit my space?"}</Link><Link href="/engineer" className="block rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/20">{language === "ar" ? "كيف أحسّن تربة الحديقة؟" : "How can I improve garden soil?"}</Link></div></div></div></div></section>

      <section className="border-y border-[#35530e]/8 bg-white"><div className="container py-14 sm:py-20"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[.16em] text-[#759244]">{language === "ar" ? "خدمات موجهة بالفعل" : "PURPOSEFUL SERVICES"}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#293d12] sm:text-4xl">{language === "ar" ? "كل ما تحتاجه لاتخاذ قرار زراعي أفضل" : "Everything needed for a better agricultural decision"}</h2></div><div className="mt-10 grid gap-4 sm:grid-cols-2">{services.map(service => <Link key={service.href} href={service.href} className="group rounded-[1.5rem] border border-[#35530e]/8 bg-white p-5 no-underline shadow-[0_10px_30px_rgba(48,67,22,.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(48,67,22,.1)]"><span className={`grid size-11 place-items-center rounded-xl ${service.tone} text-[#35530e]`}><service.icon className="size-5" /></span><h3 className="mt-5 text-lg font-bold text-[#314617]">{service.title}</h3><p className="mt-2 text-sm leading-6 text-[#68775a]">{service.text}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#52731f]">{language === "ar" ? "اكتشف الخدمة" : "Explore service"}<Arrow className="size-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" /></span></Link>)}</div></div></section>
      <section className="container py-16"><div className="grid gap-6 rounded-[2rem] bg-[#35530e] p-7 text-white shadow-[0_20px_50px_rgba(53,83,14,.2)] sm:p-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center"><div><p className="text-xs font-bold tracking-[.16em] text-[#d5e5b8]">{language === "ar" ? "الرعاية أولاً" : "SAFETY FIRST"}</p><h2 className="mt-3 text-3xl font-bold leading-tight">{language === "ar" ? "الذكاء يساند القرار؛ والخبرة تراجع ما يستحق المراجعة." : "Intelligence supports decisions; expertise reviews what deserves review."}</h2><p className="mt-4 max-w-xl leading-7 text-[#e1ebd0]">{language === "ar" ? "نوضح حدود التوصية، نجمع البيانات الناقصة، ونصعّد الحالات الحساسة أو الحرجة إلى المختصين." : "We explain recommendation limits, collect missing data, and escalate sensitive or critical cases to specialists."}</p></div><div className="flex justify-start lg:justify-end"><Button asChild className="h-12 rounded-xl bg-white px-5 text-[#35530e] hover:bg-[#eef5e4]"><Link href="/knowledge">{language === "ar" ? "استكشف قاعدة المعرفة" : "Explore knowledge hub"}<Arrow className="ms-2 size-4" /></Link></Button></div></div></section>
    </main>
  </PlatformShell>;
}
