import { PlatformShell } from "@/components/PlatformShell";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { BookOpen, Bug, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Search, ShieldAlert, TreePine, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const countries = ["all", "الأردن", "فلسطين", "مصر", "السعودية", "قطر"] as const;
const countryNames = { ar: { all: "كل الدول", "الأردن": "الأردن", "فلسطين": "فلسطين", "مصر": "مصر", "السعودية": "السعودية", "قطر": "قطر" }, en: { all: "All countries", "الأردن": "Jordan", "فلسطين": "Palestine", "مصر": "Egypt", "السعودية": "Saudi Arabia", "قطر": "Qatar" } } as const;

type TreeData = { countries?: string[]; planting?: string; care?: string; water?: string; light?: string; diseases?: string[]; pests?: string[]; control?: string; sources?: { label: string; url: string }[]; imageUrl?: string; growthStages?: { label: string; note: string }[] };
type CatalogImage = { url?: string; license?: string; creator?: string; source?: string };
type CatalogItem = { speciesKey: number; scientificName: string; canonicalName?: string; family?: string; genus?: string; taxonClass?: string; countries: string[]; sourceUrl: string; image?: CatalogImage };
type KnowledgeItem = { id: number; category: string; nameAr: string; nameEn: string; scientificName?: string | null; summaryAr: string; summaryEn: string; growingData?: TreeData | null };

const catalogStageData = (item: CatalogItem): TreeData => ({
  countries: item.countries,
  planting: "يحدد موعد الزراعة بعد معرفة نوع النبات، الصنف، الارتفاع، خطر الصقيع وحرارة التربة في الدولة المختارة.",
  care: "هذه بطاقة تعريف أولية مبنية على سجل نباتي إقليمي. افحص احتياج الصنف للماء والملوحة والصرف والضوء قبل الزراعة، وابدأ بعدد صغير للتجربة.",
  water: "يحتاج تحديدًا حسب النوع والتربة والعمر؛ لا تعتمد على الاسم العلمي وحده لتحديد كمية الري.",
  light: "يحدد حسب النوع والصنف والحرارة؛ ابدأ بضوء مناسب للنبات وراقب الإجهاد الحراري.",
  diseases: ["لا يُشخّص المرض من الاسم العلمي وحده", "راقب تغير اللون والذبول والبقع والجذور"],
  pests: ["افحص النموات الحديثة والسطح السفلي للأوراق", "استخدم المراقبة والمكافحة المتكاملة قبل أي مبيد"],
  control: "المعلومة إرشادية أولية وليست وصفة علاج. عند أعراض شديدة، اعزل النبات وصوّر الأعراض واستشر مهندسًا زراعيًا محليًا.",
  sources: [{ label: item.image?.creator ? `Image: ${item.image.creator}` : "GBIF species record", url: item.image?.source || item.sourceUrl }, ...(item.image?.license ? [{ label: `License: ${item.image.license}`, url: item.image.source || item.sourceUrl }] : [])],
  imageUrl: item.image?.url || "/assets/ai-plant-icon.png",
  growthStages: [
    { label: "بذرة", note: "اختيار بذور سليمة ومصدر موثوق؛ لا تتوفر صورة حقيقية لكل الأنواع في المصدر المفتوح." },
    { label: "بادرة", note: "تحتاج رطوبة متوازنة وضوءًا تدريجيًا وحماية من التغدق والحرارة المفاجئة." },
    { label: "نمو خضري", note: "راقب الجذور والنمو الجديد وعدّل الماء والضوء حسب استجابة النبات." },
    { label: "نبات بالغ", note: "يختلف الشكل والحجم والإزهار أو الإثمار حسب النوع والصنف والبيئة." },
  ],
});

export default function Knowledge() {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<(typeof countries)[number]>("all");
  const [page, setPage] = useState(1);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const list = trpc.knowledge.list.useQuery({ query: query || undefined, category: "all" });
  const isArabic = language === "ar";
  const countryName = countryNames[language];

  useEffect(() => {
    fetch("/data/gbif-catalog.json")
      .then(response => response.ok ? response.json() : [])
      .then(data => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => setCatalog([]));
  }, []);

  const importedItems = useMemo<KnowledgeItem[]>(() => catalog.map((item, index) => ({
    id: -100000 - index,
    category: "plant",
    nameAr: item.canonicalName || item.scientificName,
    nameEn: item.canonicalName || item.scientificName,
    scientificName: item.scientificName,
    summaryAr: `نوع نباتي مسجل في ${item.countries.join(" و")}. هذه بطاقة تعريفية أولية تساعدك على البحث، وتحتاج ملاءمة الصنف مع المناخ والتربة والماء قبل التنفيذ.`,
    summaryEn: `A plant taxon recorded in ${item.countries.join(", ")}. This preliminary card supports exploration; cultivar suitability must be checked against local climate, soil, and water before planting.`,
    growingData: catalogStageData(item),
  })), [catalog]);

  const allItems = useMemo(() => [...((list.data ?? []) as KnowledgeItem[]), ...importedItems], [list.data, importedItems]);
  const filteredItems = useMemo(() => allItems.filter(item => {
    const data = item.growingData;
    const searchable = [item.nameAr, item.nameEn, item.scientificName, item.summaryAr, item.summaryEn, ...(data?.countries ?? []), ...(data?.diseases ?? []), ...(data?.pests ?? [])].join(" ").toLocaleLowerCase();
    const countryMatch = country === "all" || data?.countries?.includes(country);
    return countryMatch && (!query.trim() || searchable.includes(query.trim().toLocaleLowerCase()));
  }), [allItems, country, query]);
  const pageSize = 24;
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query, country]);

  return <PlatformShell title={isArabic ? "دليل النباتات الزراعي" : "Agricultural Plant Guide"} eyebrow={isArabic ? "زراعة وعناية وتشخيص أولي بمراجع موثوقة" : "Planting, care, and first-line diagnosis with trusted references"}><main className="container py-8"><section className="rounded-[1.6rem] bg-[#35530e] p-6 text-white sm:p-8"><div className="flex items-center gap-3"><BookOpen className="size-7 text-[#d8e9b7]" /><span className="text-xs font-bold tracking-[.14em] text-[#d8e9b7]">{isArabic ? "موسوعة النباتات" : "PLANT ENCYCLOPEDIA"}</span></div><h2 className="mt-4 text-2xl font-bold">{isArabic ? "أكثر من 4000 نوع للاستكشاف" : "More than 4,000 plants to explore"}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#e0ebcf]">{isArabic ? "ابحث في فهرس نباتي واسع للأنواع المسجلة في الأردن وفلسطين وقطر ومصر والسعودية. كل بطاقة تعرض الاسم العلمي، الدول المسجلة، إرشادًا أوليًا، مراحل النمو ومصدر السجل." : "Explore a large plant index of taxa recorded in Jordan, Palestine, Qatar, Egypt, and Saudi Arabia. Each card shows the scientific name, recorded countries, first-line guidance, growth stages, and the source record."}</p><div className="relative mt-6 max-w-xl"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#839d5b]" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder={isArabic ? "ابحث باسم النبات أو الاسم العلمي…" : "Search by plant or scientific name…"} className="h-12 rounded-xl border-0 bg-white ps-10 text-[#344b18] placeholder:text-[#81916f]" /></div></section><div className="mt-6 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#edf4e5] px-4 py-2 text-sm font-bold text-[#52731f]">{filteredItems.length.toLocaleString()} {isArabic ? "نوعًا متاحًا" : "taxa available"}</span><label className="ms-auto flex items-center gap-2 rounded-full border border-[#35530e]/12 bg-white px-3 py-1.5 text-sm font-bold text-[#596d3c]"><span>{isArabic ? "الدولة:" : "Country:"}</span><select value={country} onChange={event => setCountry(event.target.value as (typeof countries)[number])} className="bg-transparent text-[#35530e] outline-none"><option value="all">{countryName.all}</option>{countries.filter(item => item !== "all").map(item => <option key={item} value={item}>{countryName[item]}</option>)}</select></label></div><section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.isLoading && Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-[1.5rem] bg-white" />)}{list.error && <div className="rounded-2xl border border-[#e9c5bd] bg-[#fff8f6] p-5 text-sm text-[#8d4b3e] md:col-span-2 xl:col-span-3">{isArabic ? "تعذر تحميل الدليل المحلي، لكن يمكنك متابعة استكشاف الفهرس النباتي." : "The local guide could not load, but you can continue exploring the plant index."}</div>}{visibleItems.map(item => { const data = item.growingData; return <article key={item.id} className="overflow-hidden rounded-[1.5rem] border border-[#35530e]/10 bg-white shadow-[0_10px_25px_rgba(48,67,22,.04)]"><div className="flex items-center gap-3 border-b border-[#35530e]/8 bg-[#f7f9f0] p-4"><div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#e9f1df]"><img src={data?.imageUrl || "/assets/ai-plant-icon.png"} alt={data?.imageUrl ? (isArabic ? "صورة النبات من سجل مفتوح" : "Plant image from an open record") : (isArabic ? "صورة تعليمية عامة للنبات" : "General educational plant image")} className="size-full object-contain p-1" loading="lazy" /></div><div className="min-w-0"><span className="rounded-full bg-[#edf4e5] px-2 py-1 text-[10px] font-bold text-[#5d7831]">{item.id < 0 ? (isArabic ? "فهرس إقليمي" : "Regional index") : (isArabic ? "دليل محلي" : "Curated guide")}</span><h2 className="mt-2 truncate text-base font-bold text-[#314617]">{isArabic ? item.nameAr : item.nameEn}</h2><p className="truncate text-xs italic text-[#7a8969]">{item.scientificName || "—"}</p></div></div><div className="p-5"><p className="text-sm leading-6 text-[#69785b]">{isArabic ? item.summaryAr : item.summaryEn}</p><div className="mt-4 grid gap-2 text-xs text-[#61724e]"><div className="flex items-start gap-2 rounded-lg bg-[#f7f9f4] px-3 py-2"><CalendarDays className="mt-0.5 size-4 shrink-0 text-[#78923a]" /><span><strong>{isArabic ? "الزراعة: " : "Planting: "}</strong>{data?.planting ?? "—"}</span></div><div className="flex items-start gap-2 rounded-lg bg-[#f7f9f4] px-3 py-2"><Wrench className="mt-0.5 size-4 shrink-0 text-[#78923a]" /><span><strong>{isArabic ? "العناية: " : "Care: "}</strong>{data?.care ?? "—"}</span></div><div className="rounded-lg bg-[#f7f9f4] px-3 py-2"><strong>{isArabic ? "الماء والضوء: " : "Water and light: "}</strong>{data?.water ?? "—"} · {data?.light ?? "—"}</div></div>{data?.countries?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{data.countries.map(item => <span key={item} className="rounded-full bg-[#edf4e5] px-2 py-1 text-[10px] font-bold text-[#5d7831]">{item}</span>)}</div> : null}{data?.growthStages?.length ? <details className="mt-4 rounded-xl border border-[#35530e]/8 bg-[#fbfcf8] p-3"><summary className="cursor-pointer text-sm font-bold text-[#4f6930]">{isArabic ? "مراحل النمو من البذرة إلى النبات" : "Growth stages from seed to plant"}</summary><div className="mt-3 grid gap-2 sm:grid-cols-2">{data.growthStages.map(stage => <div key={stage.label} className="rounded-lg bg-[#f3f6ee] p-2 text-xs leading-5 text-[#68775a]"><strong className="text-[#52731f]">{stage.label}: </strong>{stage.note}</div>)}</div></details> : null}<details className="mt-4 rounded-xl border border-[#35530e]/8 bg-[#fbfcf8] p-3"><summary className="cursor-pointer text-sm font-bold text-[#4f6930]">{isArabic ? "الأمراض والآفات وطرق التعامل" : "Diseases, pests, and management"}</summary><div className="mt-3 space-y-3 text-xs leading-5 text-[#68775a]"><div><p className="flex items-center gap-1 font-bold text-[#6b7131]"><ShieldAlert className="size-4" />{isArabic ? "الأمراض:" : "Diseases:"}</p><p className="mt-1">{data?.diseases?.join(" · ") || "—"}</p></div><div><p className="flex items-center gap-1 font-bold text-[#8a5b31]"><Bug className="size-4" />{isArabic ? "الآفات:" : "Pests:"}</p><p className="mt-1">{data?.pests?.join(" · ") || "—"}</p></div><div className="rounded-lg bg-[#f3f6ee] p-2"><strong>{isArabic ? "الوقاية والتعامل: " : "Prevention and management: "}</strong>{data?.control ?? "—"}</div></div></details>{data?.sources?.length ? <div className="mt-4 flex flex-wrap gap-3 border-t border-[#35530e]/8 pt-3">{data.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#52731f] no-underline hover:underline"><ExternalLink className="size-3" />{source.label}</a>)}</div> : null}</div></article>; })}</section>{!list.isLoading && filteredItems.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-[#bdcfa8] bg-white p-8 text-center text-sm text-[#68775a]">{isArabic ? "لم نجد نوعًا مطابقًا. جرّب اسمًا علميًا أو دولة أخرى." : "No matching taxa found. Try a scientific name or another country."}</div>}<div className="mt-8 flex items-center justify-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))} className="grid size-10 place-items-center rounded-full border border-[#35530e]/12 bg-white text-[#52731f] disabled:cursor-not-allowed disabled:opacity-40" aria-label={isArabic ? "الصفحة السابقة" : "Previous page"}>{isArabic ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}</button><span className="rounded-full bg-[#35530e] px-4 py-2 text-sm font-bold text-white">{page} / {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))} className="grid size-10 place-items-center rounded-full border border-[#35530e]/12 bg-white text-[#52731f] disabled:cursor-not-allowed disabled:opacity-40" aria-label={isArabic ? "الصفحة التالية" : "Next page"}>{isArabic ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}</button></div><p className="mt-8 text-center text-xs leading-5 text-[#83907a]">{isArabic ? "الفهرس الإقليمي مبني على سجلات GBIF للاستكشاف. الملاءمة الزراعية، الصنف، موعد الزراعة، والمرض تحتاج تحققًا محليًا قبل التنفيذ." : "The regional index is based on GBIF records for exploration. Suitability, cultivar, planting time, and disease guidance require local verification before action."}</p></main></PlatformShell>;
}
