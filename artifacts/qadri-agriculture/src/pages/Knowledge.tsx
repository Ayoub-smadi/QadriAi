import { PlatformShell } from "@/components/PlatformShell";
import { Input } from "@/components/ui/input";
import { categoryLabels, countryLabels, plantKnowledge, type PlantCategory, type PlantKnowledgeEntry, type SupportedCountry } from "@/data/plantKnowledge";
import { useLanguage } from "@/lib/i18n";
import { BookOpen, Bug, CalendarDays, Check, ChevronLeft, ChevronRight, Droplets, ExternalLink, Leaf, Lightbulb, Search, ShieldAlert, Sprout, X } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

const countries: Array<"all" | SupportedCountry> = ["all", "الأردن", "فلسطين", "مصر", "قطر"];
const categories: Array<"all" | PlantCategory> = ["all", "trees", "shrubs", "flowers", "fruit", "ornamental", "tropical"];

function localized(entry: PlantKnowledgeEntry, language: "ar" | "en", field: "description" | "plantingGuidance" | "careGuidance" | "water" | "light") {
  return entry[field][language];
}

function GuideImage({ entry, compact = false }: { entry: PlantKnowledgeEntry; compact?: boolean }) {
  return (
    <div className={`knowledge-card__image ${compact ? "knowledge-card__image--compact" : ""}`}>
      <img src={entry.imagePath} alt="" loading="lazy" data-testid={`img-plant-${entry.id}`} />
      <span className="knowledge-card__image-label" aria-hidden="true">
        <Leaf className="size-3" />
        QADRI FIELD NOTE
      </span>
    </div>
  );
}

function IssueList({ title, items, isArabic, kind }: { title: string; items: PlantKnowledgeEntry["diseases"]; isArabic: boolean; kind: "disease" | "pest" }) {
  const Icon = kind === "disease" ? ShieldAlert : Bug;
  return (
    <section className="knowledge-detail__section">
      <h3 className="knowledge-detail__section-title">
        <Icon className="size-4" />
        {title}
      </h3>
      <div className="grid gap-2">
        {items.map((issue) => (
          <div key={issue.nameEn} className="knowledge-issue">
            <strong>{isArabic ? issue.nameAr : issue.nameEn}</strong>
            <p>{isArabic ? issue.treatmentAr : issue.treatmentEn}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailsPanel({ entry, isArabic, onClose }: { entry: PlantKnowledgeEntry; isArabic: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="knowledge-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="knowledge-detail" role="dialog" aria-modal="true" aria-labelledby={`detail-title-${entry.id}`} dir={isArabic ? "rtl" : "ltr"} data-testid={`dialog-plant-${entry.id}`}>
        <button type="button" className="knowledge-detail__close" onClick={onClose} aria-label={isArabic ? "إغلاق التفاصيل" : "Close details"} data-testid="button-close-plant-details">
          <X className="size-5" />
        </button>
        <div className="knowledge-detail__hero">
          <GuideImage entry={entry} compact />
          <div className="knowledge-detail__heading">
            <p className="knowledge-eyebrow">{isArabic ? "بطاقة الحقل" : "FIELD REFERENCE"} <span>· {isArabic ? "مراجعة عملية" : "Practical review"}</span></p>
            <h2 id={`detail-title-${entry.id}`} data-testid={`text-detail-name-${entry.id}`}>{isArabic ? entry.nameAr : entry.nameEn}</h2>
            <p className="knowledge-detail__scientific">{entry.scientificName}</p>
            <div className="knowledge-tags">
              {entry.categoryTags.map((tag) => <span key={tag}>{categoryLabels[tag][isArabic ? "ar" : "en"]}</span>)}
            </div>
          </div>
        </div>
        <div className="knowledge-detail__body">
          <p className="knowledge-detail__description">{localized(entry, isArabic ? "ar" : "en", "description")}</p>
          <div className="knowledge-fact-grid">
            <div className="knowledge-fact">
              <CalendarDays className="size-5" />
              <div><span>{isArabic ? "متى وكيف تزرع" : "Planting window"}</span><strong>{localized(entry, isArabic ? "ar" : "en", "plantingGuidance")}</strong></div>
            </div>
            <div className="knowledge-fact">
              <Sprout className="size-5" />
              <div><span>{isArabic ? "العناية" : "Care"}</span><strong>{localized(entry, isArabic ? "ar" : "en", "careGuidance")}</strong></div>
            </div>
            <div className="knowledge-fact">
              <Droplets className="size-5" />
              <div><span>{isArabic ? "الماء" : "Water"}</span><strong>{localized(entry, isArabic ? "ar" : "en", "water")}</strong></div>
            </div>
            <div className="knowledge-fact">
              <Lightbulb className="size-5" />
              <div><span>{isArabic ? "الضوء" : "Light"}</span><strong>{localized(entry, isArabic ? "ar" : "en", "light")}</strong></div>
            </div>
          </div>
          <div className="knowledge-detail__issues">
            <IssueList title={isArabic ? "علامات وأمراض شائعة" : "Common diseases"} items={entry.diseases} isArabic={isArabic} kind="disease" />
            <IssueList title={isArabic ? "آفات تستحق المراقبة" : "Pests to watch"} items={entry.pests} isArabic={isArabic} kind="pest" />
          </div>
          <div className="knowledge-detail__footer">
            <div><span>{isArabic ? "مناسب للزراعة في" : "Suitable for"}</span><div className="knowledge-tags">{entry.supportedCountries.map((country) => <span key={country}>{countryLabels[country][isArabic ? "ar" : "en"]}</span>)}</div></div>
            <a href={entry.source.url} target="_blank" rel="noreferrer" data-testid={`link-source-${entry.id}`}><ExternalLink className="size-4" />{isArabic ? `المصدر: ${entry.source.label}` : `Source: ${entry.source.label}`}</a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Knowledge() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<"all" | SupportedCountry>("all");
  const [category, setCategory] = useState<"all" | PlantCategory>("all");
  const [selectedPlant, setSelectedPlant] = useState<PlantKnowledgeEntry | null>(null);
  const [page, setPage] = useState(1);

  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return plantKnowledge.filter((entry) => {
      const searchable = [entry.nameAr, entry.nameEn, entry.scientificName, entry.description.ar, entry.description.en, ...entry.categoryTags, ...entry.supportedCountries].join(" ").toLocaleLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesCountry = country === "all" || entry.supportedCountries.includes(country);
      const matchesCategory = category === "all" || entry.categoryTags.includes(category);
      return matchesQuery && matchesCountry && matchesCategory;
    });
  }, [category, country, query]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredPlants.length / pageSize));
  const visiblePlants = filteredPlants.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [query, country, category]);

  return (
    <PlatformShell title={isArabic ? "دليل النباتات الزراعي" : "Plant knowledge guide"} eyebrow={isArabic ? "مرجع ميداني واضح للمناخات العربية" : "A clear field reference for Arab growing conditions"}>
      <main className="knowledge-page" dir={isArabic ? "rtl" : "ltr"}>
        <section className="knowledge-hero">
          <div className="knowledge-hero__texture" aria-hidden="true" />
          <div className="knowledge-hero__content">
            <div className="knowledge-kicker"><BookOpen className="size-4" />{isArabic ? "ملاحظات القادري الميدانية" : "QADRI FIELD NOTES"}</div>
            <h1>{isArabic ? "ازرع وأنت تعرف." : "Grow with context."}</h1>
            <p>{isArabic ? "اختيارات نباتية منتقاة للحدائق والمزارع في الأردن وفلسطين ومصر وقطر — من أول حفرة إلى أول حصاد." : "A focused collection for gardens and farms across Jordan, Palestine, Egypt, and Qatar — from the first hole to the first harvest."}</p>
            <div className="knowledge-search">
              <Search className="size-5" aria-hidden="true" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "ابحث بالاسم أو الاسم العلمي..." : "Search by name or scientific name..."} aria-label={isArabic ? "ابحث في دليل النباتات" : "Search the plant guide"} data-testid="input-plant-search" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label={isArabic ? "مسح البحث" : "Clear search"} data-testid="button-clear-search"><X className="size-4" /></button>}
            </div>
          </div>
          <div className="knowledge-hero__stamp" aria-label={isArabic ? "مرجع محلي" : "Local reference"}>
            <span>06</span><small>{isArabic ? "بطاقات منتقاة" : "CURATED CARDS"}</small>
          </div>
        </section>

        <section className="knowledge-controls" aria-label={isArabic ? "خيارات التصفية" : "Filter options"}>
          <div className="knowledge-control-row">
            <div className="knowledge-count" data-testid="text-result-count"><strong>{filteredPlants.length}</strong><span>{isArabic ? "نباتات جاهزة للاستكشاف" : "plants ready to explore"}</span></div>
            <label className="knowledge-country">
              <span>{isArabic ? "الزراعة في" : "Growing in"}</span>
              <select value={country} onChange={(event) => setCountry(event.target.value as "all" | SupportedCountry)} aria-label={isArabic ? "تصفية حسب الدولة" : "Filter by country"} data-testid="select-country-filter">
                <option value="all">{isArabic ? "كل الدول" : "All countries"}</option>
                {countries.filter((item): item is SupportedCountry => item !== "all").map((item) => <option key={item} value={item}>{countryLabels[item][isArabic ? "ar" : "en"]}</option>)}
              </select>
              <ChevronDownIcon />
            </label>
          </div>
          <div className="knowledge-categories" role="group" aria-label={isArabic ? "التصفية حسب الفئة" : "Filter by category"}>
            {categories.map((item) => {
              const active = category === item;
              return <button type="button" className={`knowledge-filter ${active ? "knowledge-filter--active" : ""}`} key={item} onClick={() => setCategory(item)} aria-pressed={active} data-testid={`button-filter-${item}`}>
                {item === "all" ? (isArabic ? "الكل" : "All") : categoryLabels[item][isArabic ? "ar" : "en"]}
                {active && <Check className="size-3.5" />}
              </button>;
            })}
          </div>
        </section>

        {visiblePlants.length > 0 ? <section className="knowledge-grid" aria-live="polite">
          {visiblePlants.map((entry, index) => (
            <article className="knowledge-card" key={entry.id} style={{ "--card-delay": `${index * 55}ms` } as CSSProperties} data-testid={`card-plant-${entry.id}`}>
              <GuideImage entry={entry} />
              <div className="knowledge-card__body">
                <div className="knowledge-card__meta"><span>{entry.categoryTags.slice(0, 2).map((tag) => categoryLabels[tag][isArabic ? "ar" : "en"]).join(" · ")}</span><span>{entry.supportedCountries.length} {isArabic ? "دول" : "countries"}</span></div>
                <h2 data-testid={`text-plant-name-${entry.id}`}>{isArabic ? entry.nameAr : entry.nameEn}</h2>
                <p className="knowledge-card__scientific">{entry.scientificName}</p>
                <p className="knowledge-card__description">{localized(entry, isArabic ? "ar" : "en", "description")}</p>
                <div className="knowledge-card__quickfacts">
                  <span><Droplets className="size-3.5" />{isArabic ? "ري منتظم" : "Regular water"}</span>
                  <span><Lightbulb className="size-3.5" />{isArabic ? "ضوء جيد" : "Bright light"}</span>
                </div>
                <button type="button" className="knowledge-card__action" onClick={() => setSelectedPlant(entry)} aria-haspopup="dialog" data-testid={`button-open-plant-${entry.id}`}>
                  <span>{isArabic ? "افتح بطاقة الحقل" : "Open field note"}</span>
                  {isArabic ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
              </div>
            </article>
          ))}
        </section> : <section className="knowledge-empty" data-testid="empty-plant-results"><div><Search className="size-6" /></div><h2>{isArabic ? "لا توجد بطاقة بهذا الوصف" : "No field note matches that"}</h2><p>{isArabic ? "جرّب اسمًا آخر، أو أعد ضبط الفلاتر لتوسيع البحث." : "Try another name, or reset the filters to broaden your search."}</p><button type="button" onClick={() => { setQuery(""); setCountry("all"); setCategory("all"); }} data-testid="button-reset-filters">{isArabic ? "إظهار كل النباتات" : "Show all plants"}</button></section>}

        {filteredPlants.length > pageSize && <nav className="knowledge-pagination" aria-label={isArabic ? "صفحات الدليل" : "Guide pages"}>
          <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label={isArabic ? "الصفحة السابقة" : "Previous page"} data-testid="button-previous-page">{isArabic ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</button>
          <span data-testid="text-page-status">{page} <i>/</i> {pageCount}</span>
          <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label={isArabic ? "الصفحة التالية" : "Next page"} data-testid="button-next-page">{isArabic ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}</button>
        </nav>}
        <footer className="knowledge-disclaimer"><span><Check className="size-4" />{isArabic ? "معلومة عملية، وليست وصفة مبيد." : "Practical guidance, not a pesticide prescription."}</span><span>{isArabic ? "تحقق من الملصق واستشر مرشدًا زراعيًا محليًا عند الشك." : "Check the label and ask a local agronomist when symptoms are unclear."}</span></footer>
      </main>
      {selectedPlant && <DetailsPanel entry={selectedPlant} isArabic={isArabic} onClose={() => setSelectedPlant(null)} />}
    </PlatformShell>
  );
}

function ChevronDownIcon() {
  return <ChevronRight className="knowledge-country__chevron" aria-hidden="true" />;
}