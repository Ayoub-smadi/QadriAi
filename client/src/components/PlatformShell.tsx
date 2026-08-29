import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BadgeCheck, Bot, BookOpen, ChevronLeft, ClipboardList, DraftingCompass, FlaskConical, Leaf, LayoutDashboard, Menu, ScanSearch, ShoppingBag, Sprout, UserRound } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";

type PlatformShellProps = { children: ReactNode; title?: string; eyebrow?: string; compact?: boolean };

export const navigation = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
  { href: "/designer", label: "designer", icon: DraftingCompass },
  { href: "/engineer", label: "engineer", icon: Bot },
  { href: "/selector", label: "selector", icon: Sprout },
  { href: "/diagnosis", label: "diagnosis", icon: ScanSearch },
  { href: "/knowledge", label: "knowledge", icon: BookOpen },
  { href: "/projects", label: "projects", icon: ClipboardList },
  { href: "/shop", label: "shop", icon: ShoppingBag },
] as const;

export function PlatformShell({ children, title, eyebrow, compact = false }: PlatformShellProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const { itemCount, openCart } = useCart();
  const initials = user?.name?.trim().slice(0, 1) || "ق";

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#1d2814]">
      <header className="sticky top-0 z-50 border-b border-[#35530e]/10 bg-white/92 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between gap-3">
          <Link href="/" className="group flex items-center gap-3 no-underline">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#35530e] shadow-[0_8px_22px_rgba(53,83,14,.22)] transition-transform duration-200 group-hover:-rotate-6"><Leaf className="size-5 text-white" /></span>
            <span className="hidden leading-tight sm:block"><strong className="block text-[15px] font-bold text-[#35530e]">{t.brand}</strong><small className="text-[11px] font-medium tracking-wide text-[#738064]">SMART AGRICULTURE</small></span>
          </Link>

          {!compact && <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
            {navigation.map(item => {
              const Icon = item.icon;
              const active = location === item.href;
              return <Link key={item.href} href={item.href} className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium no-underline transition-colors", active ? "bg-[#eef3e8] text-[#35530e]" : "text-[#5d6a4f] hover:bg-[#f4f6f1] hover:text-[#35530e]")}><Icon className="size-4" />{t[item.label]}</Link>;
            })}
          </nav>}

          <div className="flex items-center gap-2">
            {isAuthenticated && <span className="hidden max-w-[180px] truncate text-xs font-bold text-[#5d6a4f] lg:block">{language === "ar" ? `أهلًا، ${user?.name || "بك"}` : `Welcome, ${user?.name || "there"}`}</span>}
            <button type="button" onClick={openCart} className="relative grid size-9 place-items-center rounded-xl border border-[#35530e]/15 text-[#35530e] hover:bg-[#f3f6ee]" aria-label={language === "ar" ? "فتح سلة المشتريات" : "Open shopping cart"}><ShoppingBag className="size-4" />{itemCount > 0 && <span className="absolute -end-1 -top-1 grid size-4 place-items-center rounded-full bg-[#35530e] text-[9px] font-bold text-white">{itemCount}</span>}</button>
            <button type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")} className="rounded-lg border border-[#35530e]/15 bg-white px-2.5 py-1.5 text-xs font-bold text-[#35530e] transition-colors hover:bg-[#f3f6ee]" aria-label="Switch language">{language === "ar" ? "EN" : "ع"}</button>
            {isAuthenticated ? <Link href="/profile" className="grid size-9 place-items-center rounded-xl bg-[#eaf0e2] text-sm font-bold text-[#35530e] no-underline" aria-label={t.profile}>{initials}</Link> : <Button onClick={() => setLocation("/auth") } className="hidden rounded-xl bg-[#35530e] px-4 text-white shadow-md hover:bg-[#294108] sm:inline-flex">{t.signIn}</Button>}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="grid size-9 place-items-center rounded-xl border border-[#35530e]/15 text-[#35530e] xl:hidden" aria-expanded={mobileMenu} aria-label="Open navigation"><Menu className="size-5" /></button>
          </div>
        </div>
        {mobileMenu && !compact && <div className="border-t border-[#35530e]/10 bg-white px-4 py-3 xl:hidden"><nav className="container grid grid-cols-2 gap-2">{navigation.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMobileMenu(false)} className="flex items-center gap-2 rounded-xl bg-[#f7f8f4] px-3 py-3 text-sm font-semibold text-[#35530e] no-underline"><Icon className="size-4" />{t[item.label]}</Link>; })}<Link href="/profile" onClick={() => setMobileMenu(false)} className="flex items-center gap-2 rounded-xl bg-[#f7f8f4] px-3 py-3 text-sm font-semibold text-[#35530e] no-underline"><UserRound className="size-4" />{t.profile}</Link></nav></div>}
      </header>
      {title && <div className="border-b border-[#35530e]/8 bg-white"><div className="container py-7"><div className="flex items-center gap-2 text-xs font-semibold text-[#758268]"><BadgeCheck className="size-4 text-[#819b4f]" />{eyebrow || t.safe}</div><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#293d12] sm:text-4xl">{title}</h1></div></div>}
      {children}
      <footer className="mt-16 border-t border-[#35530e]/10 bg-white"><div className="container flex flex-col items-center justify-between gap-3 py-7 text-center text-xs text-[#6b775e] sm:flex-row sm:text-start"><span>© {new Date().getFullYear()} {t.brand}</span><span className="flex items-center gap-1"><FlaskConical className="size-3.5" />{t.safe}</span></div></footer>
    </div>
  );
}

export function AccessGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  if (isAuthenticated) return <>{children}</>;
  return <section className="container py-12 sm:py-20"><div className="mx-auto max-w-lg rounded-[2rem] border border-[#35530e]/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(46,69,21,.08)]"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#edf3e6] text-[#35530e]"><UserRound className="size-7" /></span><h2 className="mt-5 text-2xl font-bold text-[#293d12]">{t.loginTitle}</h2><p className="mt-3 leading-7 text-[#627055]">{t.loginText}</p><Button onClick={() => setLocation("/auth") } className="mt-7 rounded-xl bg-[#35530e] px-6 text-white hover:bg-[#294108]">{t.loginAction}<ChevronLeft className="ms-2 size-4" /></Button></div></section>;
}
