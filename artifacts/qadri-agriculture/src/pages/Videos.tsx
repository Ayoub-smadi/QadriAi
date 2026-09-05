import { Input } from "@/components/ui/input";
import { PlatformShell } from "@/components/PlatformShell";
import { videoCategories, videoLessons, type VideoCategory, type VideoLesson, type VideoLevel } from "@/data/videoLibrary";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Droplets,
  ExternalLink,
  Fence,
  Filter,
  FlaskConical,
  Hand,
  Leaf,
  Play,
  PlayCircle,
  Search,
  ShieldCheck,
  Sprout,
  TreePine,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const categoryLabels: Record<VideoCategory, { ar: string; en: string }> = {
  pruning: { ar: "تقليم وتربية", en: "Pruning & training" },
  propagation: { ar: "إكثار وتطعيم", en: "Propagation & grafting" },
  protection: { ar: "وقاية وآفات", en: "Protection & pests" },
  soil: { ar: "تربة وتجهيز", en: "Soil & preparation" },
  irrigation: { ar: "ري ومياه", en: "Irrigation & water" },
  fertilizing: { ar: "تسميد وتغذية", en: "Fertilising" },
  greenhouse: { ar: "بيوت محمية", en: "Greenhouses" },
  harvest: { ar: "قطاف وما بعده", en: "Harvest & handling" },
  safety: { ar: "سلامة مهنية", en: "Workplace safety" },
};

const levelLabels: Record<VideoLevel, { ar: string; en: string }> = {
  beginner: { ar: "مبتدئ", en: "Beginner" },
  intermediate: { ar: "متوسط", en: "Intermediate" },
  advanced: { ar: "متقدم", en: "Advanced" },
};

const visualIcons = {
  tree: TreePine,
  hands: Hand,
  soil: Sprout,
  water: Droplets,
  leaf: Leaf,
  greenhouse: Fence,
  crate: BookOpen,
  shield: ShieldCheck,
};

const visualThemes = {
  tree: "from-[#224f42] via-[#36745a] to-[#b4cf76]",
  hands: "from-[#7d4e32] via-[#ba8052] to-[#e7c28e]",
  soil: "from-[#684c32] via-[#a2744c] to-[#d6ba81]",
  water: "from-[#134e59] via-[#237d7e] to-[#a7d4bb]",
  leaf: "from-[#255342] via-[#6d9443] to-[#d5df8d]",
  greenhouse: "from-[#214c4f] via-[#4d8a7d] to-[#b1d6ae]",
  crate: "from-[#70502c] via-[#ab7944] to-[#e2bd78]",
  shield: "from-[#33444a] via-[#577070] to-[#b4c9ae]",
};

function ThumbnailVisual({ lesson, large = false }: { lesson: VideoLesson; large?: boolean }) {
  const Icon = visualIcons[lesson.visual];
  return (
      <div className={cn("relative isolate overflow-hidden bg-gradient-to-br", visualThemes[lesson.visual], large ? "h-56 sm:h-full" : "h-44")} aria-hidden="true">
      <img src={`https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`} alt="" className="absolute inset-0 size-full object-cover opacity-75 transition duration-500 group-hover:scale-105" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#173b32]/35 via-transparent to-[#102c24]/55" />
      <div className="absolute -end-8 -top-10 size-40 rounded-full border border-white/20 bg-white/10" />
      <div className="absolute -bottom-16 -start-10 size-44 rounded-full border border-white/15 bg-black/10" />
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
        <span className="grid size-14 place-items-center rounded-2xl border border-white/35 bg-[#173b32]/35 text-white shadow-lg backdrop-blur-sm">
          <Icon className={large ? "size-8" : "size-7"} strokeWidth={1.5} />
        </span>
        <span className="rounded-full border border-white/30 bg-[#173b32]/45 px-3 py-1.5 text-[10px] font-bold tracking-[.13em] text-white backdrop-blur-sm">
          FIELD NOTE {lesson.id.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <span className="absolute start-5 top-5 grid size-9 place-items-center rounded-full bg-white/90 text-[#17483b] shadow-sm transition-transform duration-300 group-hover:scale-110">
        <Play className="ms-0.5 size-4 fill-current" />
      </span>
    </div>
  );
}

function LessonMeta({ lesson, isArabic }: { lesson: VideoLesson; isArabic: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-[#73826d]">
      <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5 text-[#779a52]" />{lesson.duration}</span>
      <span className="size-1 rounded-full bg-[#b9c9a1]" aria-hidden="true" />
      <span>{isArabic ? levelLabels[lesson.level].ar : levelLabels[lesson.level].en}</span>
      <span className="rounded-full bg-[#eaf1df] px-2.5 py-1 text-[10px] font-bold text-[#5f793e]">{isArabic ? "فيديو عربي" : "Arabic video"}</span>
    </div>
  );
}

export default function Videos() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VideoCategory | "all">("all");
  const [level, setLevel] = useState<VideoLevel | "all">("all");
  const [selected, setSelected] = useState<VideoLesson | null>(null);
  const featured = videoLessons.find(lesson => lesson.featured) || videoLessons[0];

  const filteredLessons = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return videoLessons.filter(lesson => {
      const searchable = [lesson.titleAr, lesson.titleEn, lesson.descriptionAr, lesson.descriptionEn, categoryLabels[lesson.category].ar, categoryLabels[lesson.category].en].join(" ").toLocaleLowerCase();
      return (category === "all" || lesson.category === category) && (level === "all" || lesson.level === level) && (!normalized || searchable.includes(normalized));
    });
  }, [category, level, query]);

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setLevel("all");
  };

  return (
    <PlatformShell
      title={isArabic ? "مكتبة الفيديو الزراعي" : "Agricultural video library"}
      eyebrow={isArabic ? "معرفة عملية من الحقل إلى الحصاد" : "Practical knowledge from field to harvest"}
    >
      <main className="container py-7 sm:py-10" dir={isArabic ? "rtl" : "ltr"}>
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#17483b] px-6 py-7 text-white shadow-[0_22px_60px_rgba(30,76,53,.18)] sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -end-24 -top-32 size-96 rounded-full border-[34px] border-[#b7d574]/10" />
          <div className="pointer-events-none absolute -bottom-32 start-1/3 size-72 rounded-full border-[20px] border-[#e2b478]/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 text-[#dbeaa9]">
                <span className="grid size-10 place-items-center rounded-xl bg-[#dbeaa9]/15"><PlayCircle className="size-5" /></span>
                <span className="text-[11px] font-extrabold tracking-[.2em]">{isArabic ? "دروس القادري الميدانية" : "AL-QADRI FIELD LESSONS"}</span>
              </div>
              <h2 className="mt-5 max-w-xl text-3xl font-black leading-[1.15] tracking-tight sm:text-5xl">
                {isArabic ? "شاهد، جرّب، وارجع إلى الحقل بثقة." : "Watch, try, and return to the field with confidence."}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#d6e6d2] sm:text-base">
                {isArabic ? "مقاطع قصيرة مرتبة حسب المهمة الزراعية، من أول قصّة تقليم إلى آخر صندوق بعد القطاف. محتوى واضح للزارع والمهندس وصاحب الحديقة." : "Short lessons organised around real farm tasks, from the first pruning cut to the last crate after harvest. Clear guidance for growers, engineers, and home gardeners."}
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5 text-xs font-bold text-[#e7efcd]">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">{videoLessons.length} {isArabic ? "درسًا محليًا" : "local lessons"}</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">{isArabic ? "فيديوهات عربية تعليمية" : "Arabic educational videos"}</span>
              </div>
            </div>
            <button type="button" data-testid="button-featured-lesson" onClick={() => setSelected(featured)} className="group relative overflow-hidden rounded-[1.5rem] border border-white/20 bg-[#0e352d] text-start shadow-2xl transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dbeaa9]">
              <ThumbnailVisual lesson={featured} large />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0e352d] via-[#0e352d]/90 to-transparent px-5 pb-5 pt-16">
                <span className="text-[10px] font-extrabold tracking-[.16em] text-[#dbeaa9]">{isArabic ? "الدرس المختار" : "EDITOR'S PICK"}</span>
                <h3 className="mt-1 text-lg font-bold text-white">{isArabic ? featured.titleAr : featured.titleEn}</h3>
              </div>
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[#dfe8d3] bg-white p-4 shadow-[0_12px_35px_rgba(46,73,35,.05)] sm:p-5" aria-label={isArabic ? "تصفية الدروس" : "Filter lessons"}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#77905f]" />
              <Input data-testid="input-video-search" value={query} onChange={event => setQuery(event.target.value)} placeholder={isArabic ? "ابحث عن تقليم، ري، مبيد، تربة…" : "Search pruning, irrigation, spraying, soil…"} className="h-11 rounded-xl border-[#dfe8d3] bg-[#fbfcf8] ps-10 text-sm focus-visible:ring-[#7d9d4c]" />
            </label>
            <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#dfe8d3] bg-[#fbfcf8] px-3 text-sm font-bold text-[#536a43]">
              <Filter className="size-4 text-[#789752]" />
              <span className="hidden sm:inline">{isArabic ? "المستوى" : "Level"}</span>
              <select data-testid="select-video-level" value={level} onChange={event => setLevel(event.target.value as VideoLevel | "all")} className="max-w-[115px] bg-transparent text-[#304e31] outline-none">
                <option value="all">{isArabic ? "كل المستويات" : "All levels"}</option>
                {(Object.keys(levelLabels) as VideoLevel[]).map(item => <option key={item} value={item}>{isArabic ? levelLabels[item].ar : levelLabels[item].en}</option>)}
              </select>
              <ChevronDown className="size-4 text-[#789752]" />
            </label>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button type="button" data-testid="button-category-all" onClick={() => setCategory("all")} className={cn("shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition-colors", category === "all" ? "bg-[#17483b] text-white" : "bg-[#f0f5e8] text-[#5c743e] hover:bg-[#e4eed7]")}>{isArabic ? "كل الدروس" : "All lessons"}</button>
            {videoCategories.map(item => (
              <button type="button" data-testid={`button-category-${item}`} key={item} onClick={() => setCategory(item)} className={cn("shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition-colors", category === item ? "bg-[#b7d574] text-[#1d4328]" : "bg-[#f0f5e8] text-[#5c743e] hover:bg-[#e4eed7]")}>
                {isArabic ? categoryLabels[item].ar : categoryLabels[item].en}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold tracking-[.18em] text-[#7e9b54]">{isArabic ? "رفّ الدروس" : "THE LESSON SHELF"}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#27492c] sm:text-3xl">{isArabic ? "ما تحتاجه اليوم في الحقل" : "What you need in the field today"}</h2>
          </div>
          <span data-testid="text-video-result-count" className="hidden rounded-full bg-[#edf4e5] px-3 py-2 text-xs font-bold text-[#5f793e] sm:inline-flex">{filteredLessons.length} {isArabic ? "درسًا" : "lessons"}</span>
        </div>

        {filteredLessons.length > 0 ? (
          <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label={isArabic ? "دروس الفيديو" : "Video lessons"}>
            {filteredLessons.map((lesson, index) => (
              <button type="button" data-testid={`card-video-${lesson.id}`} key={lesson.id} onClick={() => setSelected(lesson)} className="video-library-reveal group overflow-hidden rounded-[1.5rem] border border-[#e0e8d6] bg-white text-start shadow-[0_10px_30px_rgba(46,73,35,.05)] transition duration-300 hover:-translate-y-1 hover:border-[#a9c475] hover:shadow-[0_18px_38px_rgba(46,73,35,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#789752]" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
                <ThumbnailVisual lesson={lesson} />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-[10px] font-extrabold tracking-[.08em] text-[#799750]">{isArabic ? categoryLabels[lesson.category].ar : categoryLabels[lesson.category].en}</span>
                    <span className="rounded-full bg-[#f0f5e8] px-2.5 py-1 text-[10px] font-bold text-[#5f793e]">{isArabic ? levelLabels[lesson.level].ar : levelLabels[lesson.level].en}</span>
                  </div>
                  <h3 data-testid={`text-video-title-${lesson.id}`} className="mt-3 min-h-[3.5rem] text-lg font-extrabold leading-7 text-[#294a2e]">{isArabic ? lesson.titleAr : lesson.titleEn}</h3>
                  <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#71806c]">{isArabic ? lesson.descriptionAr : lesson.descriptionEn}</p>
                  <p className="mt-3 truncate text-[11px] font-semibold text-[#8a987f]">{isArabic ? "المصدر العربي: " : "Arabic source: "}{lesson.sourceLabel}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-[#eef1e8] pt-4">
                    <LessonMeta lesson={lesson} isArabic={isArabic} />
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#557e45]">{isArabic ? "شاهد الدرس" : "View lesson"}<ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                  </div>
                </div>
              </button>
            ))}
          </section>
        ) : (
          <section className="mt-5 rounded-[1.5rem] border border-dashed border-[#b9cda0] bg-[#fbfcf8] px-6 py-14 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eaf2df] text-[#5e803d]"><Search className="size-6" /></span>
            <h3 className="mt-5 text-xl font-extrabold text-[#304f32]">{isArabic ? "لم نجد درسًا بهذه المواصفات" : "No lessons match these filters"}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#71806c]">{isArabic ? "جرّب كلمة أخرى أو أعد عرض كل الدروس. المكتبة محلية ويمكن توسيعها بدروس جديدة لاحقًا." : "Try another term or bring back the full shelf. This local library can grow with new lessons later."}</p>
            <button type="button" data-testid="button-clear-video-filters" onClick={clearFilters} className="mt-6 rounded-xl bg-[#17483b] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0f392e]">{isArabic ? "إظهار كل الدروس" : "Show all lessons"}</button>
          </section>
        )}

        <section className="mt-10 flex flex-col gap-4 rounded-[1.5rem] border border-[#dbe6d2] bg-[#eef4e5] p-5 text-[#46613b] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#d9e8bd] text-[#4d7338]"><CheckCircle2 className="size-5" /></span>
            <div>
              <h3 className="font-extrabold">{isArabic ? "تعلم عملي، وقرارك يبقى محليًا" : "Practical learning, local decisions"}</h3>
              <p className="mt-1 text-sm leading-6 text-[#67805a]">{isArabic ? "هذه الدروس إرشادية وليست بديلًا عن فحص الحقل أو بطاقة المبيد أو استشارة المهندس." : "These lessons guide your work; they do not replace field checks, product labels, or local expert advice."}</p>
            </div>
          </div>
          <FlaskConical className="hidden size-8 shrink-0 text-[#89a45b] sm:block" />
        </section>
      </main>

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#102c24]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="video-viewer-title" className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-[#fbfcf8] shadow-2xl sm:rounded-[2rem]">
            <div className="flex items-center justify-between border-b border-[#e0e8d6] px-5 py-4 sm:px-7">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[.12em] text-[#6f914c]"><PlayCircle className="size-4" />{isArabic ? "عارض الدرس" : "LESSON VIEWER"}</span>
              <button type="button" data-testid="button-close-video-viewer" onClick={() => setSelected(null)} className="grid size-10 place-items-center rounded-xl text-[#57705b] transition-colors hover:bg-[#eaf1e2] hover:text-[#21492e]" aria-label={isArabic ? "إغلاق العارض" : "Close viewer"}><X className="size-5" /></button>
            </div>
            <div className="p-5 sm:p-7">
              <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-black shadow-inner">
                <iframe
                  className="size-full"
                  src={`https://www.youtube-nocookie.com/embed/${selected.youtubeId}?rel=0`}
                  title={isArabic ? selected.titleAr : selected.titleEn}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#789553]"><span className="rounded-full bg-[#eaf1df] px-3 py-1.5">{isArabic ? categoryLabels[selected.category].ar : categoryLabels[selected.category].en}</span><span className="rounded-full bg-[#eaf1df] px-3 py-1.5">{selected.duration}</span><span className="rounded-full bg-[#eaf1df] px-3 py-1.5">{isArabic ? levelLabels[selected.level].ar : levelLabels[selected.level].en}</span><span className="rounded-full bg-[#eaf1df] px-3 py-1.5">{isArabic ? "فيديو عربي" : "Arabic video"}</span></div>
                <h2 id="video-viewer-title" className="mt-4 text-2xl font-black leading-tight text-[#294a2e] sm:text-3xl">{isArabic ? selected.titleAr : selected.titleEn}</h2>
                <p className="mt-3 text-sm leading-7 text-[#667767]">{isArabic ? selected.descriptionAr : selected.descriptionEn}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d7e3c7] bg-[#f0f5e8] p-4 text-sm leading-6 text-[#55704b]">
                  <span className="inline-flex items-center gap-2"><ShieldCheck className="size-5 shrink-0 text-[#6e9149]" />{isArabic ? `المصدر العربي: ${selected.sourceLabel}` : `Arabic source: ${selected.sourceLabel}`}</span>
                  <a href={`https://www.youtube.com/watch?v=${selected.youtubeId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#17483b] px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-[#0f392e]">
                    <ExternalLink className="size-4" />{isArabic ? "فتح الفيديو على YouTube" : "Open on YouTube"}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </PlatformShell>
  );
}