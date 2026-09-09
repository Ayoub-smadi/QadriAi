import { useAuth } from "@/_core/hooks/useAuth";
import { PlatformShell } from "@/components/PlatformShell";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useLocation } from "wouter";

const COLORS = ["#5c8b3d", "#d49a32", "#4b8b9b", "#a35d4b"];

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/auth" });
  const [, setLocation] = useLocation();
  const summary = trpc.control.summary.useQuery(undefined, { enabled: user?.role === "admin", staleTime: 30_000 });
  const isArabic = language === "ar";

  if (loading || !user) return <PlatformShell compact><main className="container grid min-h-[55vh] place-items-center py-12"><div className="size-9 animate-spin rounded-full border-4 border-[#b9dfcf] border-t-[#063f33]" /></main></PlatformShell>;
  if (user.role !== "admin") { setLocation("/profile"); return null; }

  const values = [summary.data?.users ?? 0, summary.data?.projects ?? 0, summary.data?.analyses ?? 0, summary.data?.pendingReviews ?? 0];
  const labels = isArabic ? ["المستخدمون", "المشاريع", "التحليلات", "بانتظار المراجعة"] : ["Users", "Projects", "Analyses", "Pending review"];
  const total = values.reduce((sum, value) => sum + value, 0);
  const chartData = labels.map((name, index) => ({ name, value: values[index], percent: total ? (values[index] / total) * 100 : 0 }));

  return <PlatformShell compact>
    <main className="min-h-[calc(100vh-115px)] bg-[#f4f7f0]" dir={isArabic ? "rtl" : "ltr"}>
      <div className="container py-10">
        <section className="mx-auto max-w-3xl rounded-[1.8rem] border border-[#35530e]/10 bg-white p-6 shadow-[0_12px_30px_rgba(48,67,22,.06)] sm:p-10">
          <div className="mx-auto h-[360px] w-full max-w-[520px]">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={88} outerRadius={142} paddingAngle={2} stroke="#fff" strokeWidth={3}>{chartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} />)}</Pie><Tooltip formatter={(value: number, _name: string, item: { payload?: { percent: number } }) => [`${value} (${item.payload?.percent.toFixed(1) ?? "0.0"}%)`, ""]} /></PieChart></ResponsiveContainer>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {chartData.map((item, index) => <div key={item.name} className="flex items-center justify-between rounded-xl bg-[#f7f9f3] px-4 py-3"><span className="flex items-center gap-2 text-sm font-bold text-[#405525]"><span className="size-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />{item.name}</span><strong className="text-sm text-[#314617]">{item.percent.toFixed(1)}%</strong></div>)}
          </div>
        </section>
      </div>
    </main>
  </PlatformShell>;
}
