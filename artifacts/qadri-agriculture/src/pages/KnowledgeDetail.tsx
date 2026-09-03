import { PlatformShell } from "@/components/PlatformShell";
import { plantKnowledge } from "@/data/plantKnowledge";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Bug, CalendarDays, ChevronLeft, Droplets, ExternalLink, Leaf, Scissors, ShieldAlert, Sun, Sprout } from "lucide-react";
import { Link, useRoute } from "wouter";

export default function KnowledgeDetail() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [, params] = useRoute("/knowledge/:id");
  const plant = plantKnowledge.find(item => item.id === params?.id);
  const BackArrow = isArabic ? ArrowRight : ArrowLeft;

  if (!plant) {
    return (
      <PlatformShell title={isArabic ? "النبات غير موجود" : "Plant not found"}>
        <main className="container py-16 text-center">
          <p className="text-[#68775a]">{isArabic ? "لم نعثر على بطاقة النبات المطلوبة." : "We could not find the requested plant card."}</p>
          <Link href="/knowledge" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#35530e] px-5 py-3 text-sm font-bold text-white no-underline">
            <BackArrow className="size-4" />{isArabic ? "العودة إلى المعرفة" : "Back to knowledge"}
          </Link>
        </main>
      </PlatformShell>
    );
  }

  const name = isArabic ? plant.nameAr : plant.nameEn;
  const description = isArabic ? plant.description.ar : plant.description.en;
  const careSteps = plant.careSteps?.[language] ?? [];

  return (
    <PlatformShell title={name} eyebrow={isArabic ? "بطاقة نباتية من دليل القادري" : "Plant card from the Al-Qadri guide"}>
      <main className="container py-8">
        <Link href="/knowledge" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#52731f] no-underline hover:text-[#35530e]">
          <BackArrow className="size-4" />{isArabic ? "العودة إلى المعرفة" : "Back to knowledge"}
        </Link>

        <article className="overflow-hidden rounded-[2rem] border border-[#35530e]/10 bg-white shadow-[0_16px_40px_rgba(48,67,22,.07)]">
          <div className="grid lg:grid-cols-[.85fr_1.15fr]">
            <div className="min-h-[280px] bg-[#e9f1df] lg:min-h-full">
              <img src={plant.imagePath} alt={name} className="size-full max-h-[520px] object-cover" />
            </div>
            <div className="p-6 sm:p-9">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#edf4e5] px-3 py-1.5 text-xs font-bold text-[#52731f]">
                <Leaf className="size-3.5" />{isArabic ? "دليل نباتي" : "Plant guide"}
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#314617] sm:text-4xl">{name}</h1>
              <p className="mt-2 text-lg italic text-[#7a8969]">{plant.scientificName}</p>
              <p className="mt-6 text-base leading-8 text-[#5f6d50]">{description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {plant.categoryTags.map(category => <span key={category} className="rounded-full bg-[#f4f8ee] px-3 py-1.5 text-xs font-bold text-[#5d7831]">{category}</span>)}
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#35530e]/8 bg-[#fbfcf8] p-6 sm:grid-cols-2 sm:p-9">
            <InfoBlock icon={<Sprout className="size-5" />} title={isArabic ? "طريقة الزراعة" : "Planting method"} text={isArabic ? plant.plantingGuidance.ar : plant.plantingGuidance.en} />
            <InfoBlock icon={<Droplets className="size-5" />} title={isArabic ? "الري" : "Watering"} text={isArabic ? plant.water.ar : plant.water.en} />
            <InfoBlock icon={<Sun className="size-5" />} title={isArabic ? "الإضاءة" : "Light"} text={isArabic ? plant.light.ar : plant.light.en} />
            <InfoBlock icon={<Scissors className="size-5" />} title={isArabic ? "العناية العامة" : "General care"} text={isArabic ? plant.careGuidance.ar : plant.careGuidance.en} />
          </div>

          {careSteps.length > 0 && (
            <section className="border-t border-[#35530e]/8 p-6 sm:p-9">
              <SectionTitle icon={<Scissors className="size-5" />} title={isArabic ? "العناية" : "Care"} />
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {careSteps.map(step => <li key={step} className="rounded-xl bg-[#f7f9f4] p-4 text-sm leading-6 text-[#68775a] before:me-2 before:text-[#78923a] before:content-['✓']">{step}</li>)}
              </ul>
            </section>
          )}

          <section className="border-t border-[#35530e]/8 p-6 sm:p-9">
            <SectionTitle icon={<ShieldAlert className="size-5" />} title={isArabic ? "الأمراض والآفات المحتملة" : "Potential diseases and pests"} />
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <IssueList icon={<ShieldAlert className="size-5" />} title={isArabic ? "الأمراض" : "Diseases"} items={plant.diseases.map(issue => ({ name: isArabic ? issue.nameAr : issue.nameEn, treatment: isArabic ? issue.treatmentAr : issue.treatmentEn }))} tone="olive" />
              <IssueList icon={<Bug className="size-5" />} title={isArabic ? "الآفات" : "Pests"} items={plant.pests.map(issue => ({ name: isArabic ? issue.nameAr : issue.nameEn, treatment: isArabic ? issue.treatmentAr : issue.treatmentEn }))} tone="amber" />
            </div>
          </section>

          {plant.prevention && (
            <section className="border-t border-[#35530e]/8 bg-[#f4f8ee] p-6 sm:p-9">
              <SectionTitle icon={<ShieldAlert className="size-5" />} title={isArabic ? "طرق العلاج والوقاية" : "Treatment and prevention"} />
              <p className="mt-4 text-sm leading-7 text-[#5f6d50]">{isArabic ? plant.prevention.ar : plant.prevention.en}</p>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#35530e]/8 p-6 sm:px-9">
            <p className="text-xs text-[#83907a]">{isArabic ? "المعلومات إرشادية، ويُنصح بالتشخيص المحلي قبل استخدام أي مبيد." : "This guidance is educational; seek local diagnosis before using any pesticide."}</p>
            <a href={plant.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#52731f] no-underline hover:underline">
              <ExternalLink className="size-4" />{plant.source.label}
            </a>
          </div>
        </article>
      </main>
    </PlatformShell>
  );
}

function InfoBlock({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-[#35530e]/8 bg-white p-5"><div className="flex items-center gap-2 text-[#52731f]">{icon}<h2 className="font-bold text-[#314617]">{title}</h2></div><p className="mt-3 text-sm leading-7 text-[#68775a]">{text}</p></div>;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-2 text-[#52731f]">{icon}<h2 className="text-xl font-bold text-[#314617]">{title}</h2></div>;
}

function IssueList({ icon, title, items, tone }: { icon: React.ReactNode; title: string; items: { name: string; treatment: string }[]; tone: "olive" | "amber" }) {
  return <div><div className={`flex items-center gap-2 font-bold ${tone === "olive" ? "text-[#6b7131]" : "text-[#8a5b31]"}`}>{icon}<h3>{title}</h3></div><div className="mt-3 space-y-3">{items.map(item => <div key={item.name} className="rounded-xl bg-[#f7f9f4] p-4"><p className="font-bold text-[#4f6930]">{item.name}</p><p className="mt-1 text-sm leading-6 text-[#68775a]">{item.treatment}</p></div>)}</div></div>;
}