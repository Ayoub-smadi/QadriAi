import { AccessGate, PlatformShell } from "@/components/PlatformShell";
import { useLanguage } from "@/lib/i18n";
import { UsersRound, Sprout, ScanSearch, ClipboardCheck } from "lucide-react";

type Metric = { ar: string; en: string; icon: typeof UsersRound; color: string };

const metrics: Metric[] = [
  { ar: "المستخدمون", en: "Users", icon: UsersRound, color: "#5c8b3d" },
  { ar: "المشاريع", en: "Projects", icon: Sprout, color: "#d49a32" },
  { ar: "التحليلات", en: "Analyses", icon: ScanSearch, color: "#4b8b9b" },
  { ar: "بانتظار المراجعة", en: "Pending review", icon: ClipboardCheck, color: "#a35d4b" },
];

export default function Dashboard() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return <PlatformShell title={isArabic ? "لوحة المعلومات" : "Dashboard"} eyebrow={isArabic ? "ملخص المنصة" : "Platform overview"}>
    <AccessGate>
      <main className="container py-10">
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ ar, en, icon: Icon, color }) => <article key={en} className="rounded-[1.6rem] border border-[#35530e]/10 bg-white p-6 text-center shadow-[0_12px_30px_rgba(48,67,22,.06)]">
            <div className="relative mx-auto grid size-44 place-items-center rounded-full" style={{ background: `conic-gradient(${color} 0deg, ${color} 290deg, #edf2e9 290deg 360deg)` }}>
              <div className="grid size-32 place-items-center rounded-full bg-white">
                <div className="flex flex-col items-center gap-2 text-[#314617]"><Icon className="size-7" style={{ color }} /><strong className="text-3xl font-black">—</strong></div>
              </div>
            </div>
            <h2 className="mt-5 text-lg font-black text-[#314617]">{isArabic ? ar : en}</h2>
          </article>)}
        </section>
      </main>
    </AccessGate>
  </PlatformShell>;
}
