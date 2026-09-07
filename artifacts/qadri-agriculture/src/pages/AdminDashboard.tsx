import { useAuth } from "@/_core/hooks/useAuth";
import { PlatformShell } from "@/components/PlatformShell";
import { useLanguage } from "@/lib/i18n";
import { ClipboardList, LayoutDashboard, LogOut, Settings2, ShieldCheck, UsersRound } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/auth" });
  const [location, setLocation] = useLocation();
  const isArabic = language === "ar";
  if (loading || !user) return <PlatformShell compact><main className="container grid min-h-[55vh] place-items-center py-12"><div className="size-9 animate-spin rounded-full border-4 border-[#b9dfcf] border-t-[#063f33]" /></main></PlatformShell>;
  if (user.role !== "admin") { setLocation("/profile"); return null; }
  const nav = [
    { href: "/dashboard", label: isArabic ? "نظرة عامة" : "Overview", icon: LayoutDashboard },
    { href: "/quotes-admin", label: isArabic ? "طلبات عروض الأسعار" : "Quote requests", icon: ClipboardList },
    { href: "/control", label: isArabic ? "إدارة الصلاحيات" : "Access control", icon: ShieldCheck },
  ];
  return <PlatformShell compact>
    <main className="min-h-[calc(100vh-115px)] bg-[#f4f7f0]" dir={isArabic ? "rtl" : "ltr"}>
      <div className="container flex gap-6 py-7 lg:py-9">
        <aside className="hidden w-72 shrink-0 rounded-[1.8rem] bg-[#063f33] p-4 text-white shadow-[0_18px_45px_rgba(6,63,51,.16)] md:block">
          <div className="border-b border-white/10 px-3 pb-5"><p className="text-xs font-black tracking-[.16em] text-[#9dd7bd]">ADMIN DESK</p><h1 className="mt-2 text-xl font-black">{isArabic ? "لوحة الإدارة" : "Admin dashboard"}</h1><p className="mt-2 text-xs leading-5 text-[#cfe9df]">{isArabic ? `مرحبًا ${user.name || "بك"}` : `Welcome ${user.name || "back"}`}</p></div>
          <nav className="mt-4 space-y-2">{nav.map(item => { const Icon = item.icon; const active = location === item.href; return <button key={item.href} type="button" onClick={() => setLocation(item.href)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? "bg-[#9dd7bd] text-[#063f33]" : "text-[#d9eee6] hover:bg-white/10"}`}><Icon className="size-5" />{item.label}</button>; })}</nav>
          <button type="button" onClick={async () => { await logout(); setLocation("/"); }} className="mt-8 flex w-full items-center gap-3 rounded-xl border border-[#f0c8ba]/30 bg-[#7d382b]/25 px-3 py-3 text-sm font-bold text-white hover:bg-[#7d382b]/45"><LogOut className="size-5" />{isArabic ? "تسجيل الخروج" : "Log out"}</button>
        </aside>
        <section className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-xs font-black tracking-[.16em] text-[#6d8d47]">{isArabic ? "مركز الإدارة" : "ADMIN CENTER"}</p><h2 className="mt-2 text-3xl font-black text-[#294a2e]">{isArabic ? "مرحبًا بك في لوحة التحكم" : "Welcome to your dashboard"}</h2></div><button type="button" onClick={() => setLocation("/quotes-admin")} className="hidden rounded-xl bg-[#063f33] px-4 py-3 text-sm font-black text-white shadow-md sm:inline-flex">{isArabic ? "عرض الطلبات" : "View requests"}</button></div>
          <div className="grid gap-4 sm:grid-cols-3"><Stat icon={ClipboardList} title={isArabic ? "طلبات عروض الأسعار" : "Quote requests"} value={isArabic ? "مراجعة وإدارة" : "Review & manage"} /><Stat icon={UsersRound} title={isArabic ? "المستخدمون" : "Users"} value={isArabic ? "صلاحيات الحسابات" : "Account access"} /><Stat icon={Settings2} title={isArabic ? "الإعدادات" : "Settings"} value={isArabic ? "قواعد المنصة" : "Platform rules"} /></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><article className="rounded-[1.6rem] bg-[#063f33] p-6 text-white shadow-[0_18px_45px_rgba(6,63,51,.13)]"><p className="text-xs font-black tracking-[.14em] text-[#9dd7bd]">{isArabic ? "مسار العمل" : "WORKFLOW"}</p><h3 className="mt-3 text-2xl font-black">{isArabic ? "طلبات العروض في مكان واحد" : "All quote requests in one place"}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-[#d4eee4]">{isArabic ? "راجع طلبات المستخدمين، حدّث الأسعار والملاحظات، ثم احفظ العرض أو نزّله بصيغة PDF. كل مستخدم يرى طلباته فقط." : "Review user requests, update pricing and notes, then save or download a PDF quote. Each user can see only their own requests."}</p><button type="button" onClick={() => setLocation("/quotes-admin")} className="mt-6 rounded-xl bg-[#9dd7bd] px-5 py-3 text-sm font-black text-[#063f33] hover:bg-white">{isArabic ? "فتح طلبات عروض الأسعار" : "Open quote requests"}</button></article><article className="rounded-[1.6rem] border border-[#dce8d1] bg-white p-6"><ShieldCheck className="size-7 text-[#5d8d3e]" /><h3 className="mt-4 text-xl font-black text-[#294a2e]">{isArabic ? "صلاحيات محمية" : "Protected access"}</h3><p className="mt-3 text-sm leading-7 text-[#718062]">{isArabic ? "لوحة الإدارة وطلبات المستخدمين لا تظهر إلا للحسابات التي تحمل دور الأدمن." : "The admin dashboard and user requests are visible only to accounts with the admin role."}</p></article></div>
        </section>
      </div>
    </main>
  </PlatformShell>;
}

function Stat({ icon: Icon, title, value }: { icon: typeof ClipboardList; title: string; value: string }) { return <article className="rounded-[1.35rem] border border-[#dce8d1] bg-white p-5"><Icon className="size-6 text-[#5d8d3e]" /><p className="mt-4 text-xs font-bold text-[#718062]">{title}</p><p className="mt-1 text-sm font-black text-[#294a2e]">{value}</p></article>; }
