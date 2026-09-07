import { PlatformShell } from "@/components/PlatformShell";
import { plantKnowledge } from "@/data/plantKnowledge";
import { useLanguage } from "@/lib/i18n";
import { BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function Knowledge() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <PlatformShell
      title={isArabic ? "دليل النباتات الزراعي" : "Agricultural Plant Guide"}
      eyebrow={isArabic ? "زراعة وعناية بمعلومات واضحة ومختارة" : "Planting and care with clear, curated information"}
    >
      <main className="container py-8">
        <section className="rounded-[1.6rem] bg-[#35530e] p-6 text-white sm:p-8">
          <div className="flex items-center gap-3">
            <BookOpen className="size-7 text-[#d8e9b7]" />
            <span className="text-xs font-bold tracking-[.14em] text-[#d8e9b7]">
              {isArabic ? "دليل القادري للنباتات" : "AL-QADRI PLANT GUIDE"}
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
            {isArabic ? "تعرف على نباتات حديقتك" : "Get to know your garden plants"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#e0ebcf]">
            {isArabic
              ? "اختر أي بطاقة لعرض الاسم العلمي، الوصف، طريقة الزراعة، العناية، الأمراض والآفات المحتملة وطرق الوقاية."
              : "Choose a card to view the scientific name, description, planting method, care, potential diseases and pests, and prevention guidance."}
          </p>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[.14em] text-[#759244]">
                {isArabic ? "نباتات مختارة" : "FEATURED PLANTS"}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#314617]">
                {isArabic ? "بطاقات المعرفة" : "Knowledge cards"}
              </h2>
            </div>
            <span className="text-sm text-[#68775a]">
              {isArabic ? "اضغط على البطاقة للتفاصيل" : "Select a card for details"}
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plantKnowledge.map(item => (
              <Link
                key={item.id}
                href={`/knowledge/${item.id}`}
                className="group overflow-hidden rounded-[1.5rem] border border-[#35530e]/10 bg-white no-underline shadow-[0_10px_25px_rgba(48,67,22,.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(48,67,22,.1)]"
              >
                <div className="h-44 overflow-hidden bg-[#e9f1df]">
                  <img
                    src={item.imagePath}
                    alt={isArabic ? item.nameAr : item.nameEn}
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#314617]">{isArabic ? item.nameAr : item.nameEn}</h3>
                  <p className="mt-1 text-sm italic text-[#7a8969]">{item.scientificName}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#69785b]">
                    {isArabic ? item.description.ar : item.description.en}
                  </p>
                  <span className="mt-4 inline-flex text-sm font-bold text-[#52731f]">
                    {isArabic ? "عرض المعلومات ←" : "View information →"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PlatformShell>
  );
}