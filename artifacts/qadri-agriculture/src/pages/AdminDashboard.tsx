import { useAuth } from "@/_core/hooks/useAuth";
import { PlatformShell } from "@/components/PlatformShell";
import { useLanguage } from "@/lib/i18n";
import { UsersRound, Sprout, ScanSearch, ClipboardCheck } from "lucide-react";
import { useLocation } from "wouter";

type Metric = { ar: string; en: string; icon: typeof UsersRound; color: string };

const metrics: Metric[] = [
  { ar: "المستخدمون", en: "Users", icon: UsersRound, color: "#5c8b3d" },
  { ar: "المشاريع", en: "Projects", icon: Sprout, color: "#d49a32" },
  { ar: "التحليلات", en: "Analyses", icon: ScanSearch, color: "#4b8b9b" },
  { ar: "بانتظار المراجعة", en: "Pending review", icon: ClipboardCheck, color: "#a35d4b" },
];

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/auth" });
  const [, setLocation] = useLocation();
  const isArabic = language === "ar";

  if (loading || !user) return <PlatformShell compact><main className="container grid min-h-[55vh] place-items-center py-12"><div className="size-9 animate-spin rounded-full border-4 border-[#b9dfcf] border-t-[#063f33]" /></main></PlatformShell>;
  if (user.role !== "admin") { setLocation("/profile"); return null; }

  return <PlatformShell compact>
    <main className="min-h-[calc(100vh-115px)] bg-[#f4f7f0]" dir={isArabic ? "rtl" : "ltr"}>
      <div className="container py-10">
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
      </div>
    </main>
  </PlatformShell>;
}
