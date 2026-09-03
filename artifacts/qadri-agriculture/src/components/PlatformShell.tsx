import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Bot,
  BookOpen,
  ChevronLeft,
  ClipboardList,
  DraftingCompass,
  FlaskConical,
  Home as HomeIcon,
  Leaf,
  LayoutDashboard,
  Menu,
  Phone,
  ScanSearch,
  ShoppingBag,
  Sprout,
  UserRound,
  X,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";

type PlatformShellProps = {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  compact?: boolean;
};

export const navigation = [
  { href: "/", label: "home", icon: HomeIcon },
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
  { href: "/designer", label: "designer", icon: DraftingCompass },
  { href: "/engineer", label: "engineer", icon: Bot },
  { href: "/selector", label: "selector", icon: Sprout },
  { href: "/diagnosis", label: "diagnosis", icon: ScanSearch },
  { href: "/knowledge", label: "knowledge", icon: BookOpen },
  { href: "/projects", label: "projects", icon: ClipboardList },
  { href: "/shop", label: "shop", icon: ShoppingBag },
] as const;

export function PlatformShell({
  children,
  title,
  eyebrow,
  compact = false,
}: PlatformShellProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const { itemCount, openCart } = useCart();
  const initials = user?.name?.trim().slice(0, 1) || "ق";

  const isActive = (href: string) =>
    href === "/"
      ? location === "/"
      : location === href || location.startsWith(`${href}/`);

  const closeMobileMenu = () => setMobileMenu(false);

  useEffect(() => {
    setMobileMenu(false);
  }, [location]);

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground",
      compact ? "pt-[114px]" : "pt-[114px] xl:pt-[192px]"
    )}>
      <header className="fixed inset-x-0 top-0 z-50 overflow-hidden border-b border-white/10 bg-primary text-primary-foreground shadow-[0_12px_36px_rgba(53,83,14,.25)]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#b4ce65]/90 to-transparent" />

        <div className="border-b border-white/10 bg-[#294108]/80">
          <div className="container flex h-9 items-center justify-between gap-4 text-[11px] font-semibold text-[#dce9bd]">
            <a
              href="tel:0777772211"
              dir="ltr"
              className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 no-underline transition-colors hover:text-white"
              aria-label="Call 0777772211"
            >
              <span className="grid size-5 place-items-center rounded-full bg-[#b4ce65] text-[#29410d]">
                <Phone className="size-3" />
              </span>
              <span className="text-sm font-bold tracking-wide">0777772211</span>
            </a>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <BadgeCheck className="size-3.5 text-[#b4ce65]" />
              {t.safe}
            </span>
          </div>
        </div>

        <div className="container relative flex h-[78px] items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 no-underline"
            aria-label={t.home}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-[1.1rem] border border-white/20 bg-white/10 shadow-[0_8px_24px_rgba(15,35,3,.24)] transition-transform duration-200 group-hover:-rotate-6 group-hover:bg-white/15">
              <Leaf className="size-6 text-[#d7e9a8]" />
            </span>
            <span className="hidden min-w-0 leading-tight sm:block">
              <strong className="block max-w-[240px] truncate text-base font-bold text-white">
                {t.brand}
              </strong>
              <small className="text-[10px] font-semibold tracking-[.2em] text-[#c7dc91]">
                SMART AGRICULTURE
              </small>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            {isAuthenticated && (
              <span className="hidden max-w-[180px] truncate text-xs font-bold text-[#e1eccb] 2xl:block">
                {language === "ar"
                  ? `أهلًا، ${user?.name || "بك"}`
                  : `Welcome, ${user?.name || "there"}`}
              </span>
            )}
            <button
              type="button"
              onClick={openCart}
              className="relative grid size-11 place-items-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4ce65]"
              aria-label={
                language === "ar" ? "فتح سلة المشتريات" : "Open shopping cart"
              }
            >
              <ShoppingBag className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-[#b4ce65] text-[10px] font-extrabold text-[#29410d]">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4ce65]"
              aria-label="Switch language"
            >
              {language === "ar" ? "EN" : "ع"}
            </button>
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="grid size-11 place-items-center rounded-xl bg-[#dcebbd] text-base font-extrabold text-primary no-underline transition-transform hover:-translate-y-0.5 hover:bg-white"
                aria-label={t.profile}
              >
                {initials}
              </Link>
            ) : (
              <Button
                onClick={() => setLocation("/auth")}
                className="hidden h-11 rounded-xl bg-white px-5 font-bold text-primary shadow-md hover:bg-[#eef5e4] sm:inline-flex"
              >
                {t.signIn}
              </Button>
            )}
            {!compact && (
              <button
                type="button"
                onClick={() => setMobileMenu(!mobileMenu)}
                className="grid size-11 place-items-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4ce65] xl:hidden"
                aria-expanded={mobileMenu}
                aria-label={
                  mobileMenu
                    ? language === "ar"
                      ? "إغلاق القائمة"
                      : "Close navigation"
                    : language === "ar"
                      ? "فتح القائمة"
                      : "Open navigation"
                }
              >
                {mobileMenu ? (
                  <X className="size-6" />
                ) : (
                  <Menu className="size-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {!compact && (
          <div className="hidden border-t border-white/10 bg-[#294108]/70 xl:block">
            <nav
              className="container flex items-stretch justify-center gap-1 overflow-x-auto py-2"
              aria-label="Primary navigation"
            >
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Fragment key={item.href}>
                    {index === 4 && (
                      <span
                        className="mx-2 my-2 w-px shrink-0 bg-white/15"
                        aria-hidden="true"
                      />
                    )}
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex min-w-[74px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-center text-[11px] font-bold no-underline transition-all",
                        active
                          ? "bg-[#b4ce65] text-[#29410d] shadow-[0_6px_16px_rgba(180,206,101,.2)]"
                          : "text-[#e1eccb] hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="size-5.5 shrink-0" />
                      <span className="whitespace-nowrap">{t[item.label]}</span>
                      <span
                        className={cn(
                          "absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full transition-opacity",
                          active
                            ? "bg-white/80 opacity-100"
                            : "bg-[#b4ce65] opacity-0 group-hover:opacity-80"
                        )}
                      />
                    </Link>
                  </Fragment>
                );
              })}
            </nav>
          </div>
        )}

        {mobileMenu && !compact && (
          <div className="border-t border-white/10 bg-[#294108]/95 px-4 py-4 backdrop-blur-xl xl:hidden">
            <nav
              className="container grid grid-cols-2 gap-2 sm:grid-cols-3"
              aria-label="Mobile navigation"
            >
              {navigation.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[66px] items-center gap-3 rounded-xl border px-3 py-3 text-sm font-bold no-underline transition-colors",
                      active
                        ? "border-[#b4ce65]/50 bg-[#b4ce65] text-[#29410d]"
                        : "border-white/10 bg-white/10 text-white hover:bg-white/16"
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-black/10">
                      <Icon className="size-5" />
                    </span>
                    <span className="truncate">{t[item.label]}</span>
                  </Link>
                );
              })}
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="flex min-h-[66px] items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white no-underline transition-colors hover:bg-white/16"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-black/10">
                    <UserRound className="size-5" />
                  </span>
                  <span className="truncate">{t.profile}</span>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  onClick={closeMobileMenu}
                  className="flex min-h-[66px] items-center gap-3 rounded-xl border border-white/60 bg-white px-3 py-3 text-sm font-bold text-primary no-underline transition-colors hover:bg-[#eef5e4]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#edf3e6]">
                    <UserRound className="size-5" />
                  </span>
                  <span className="truncate">{t.signIn}</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {title && (
        <div className="border-b border-primary/8 bg-white">
          <div className="container py-7">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#758268]">
              <BadgeCheck className="size-4 text-[#819b4f]" />
              {eyebrow || t.safe}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#293d12] sm:text-4xl">
              {title}
            </h1>
          </div>
        </div>
      )}
      {children}
      <footer className="mt-16 border-t border-primary/10 bg-white">
        <div className="container flex flex-col items-center justify-between gap-3 py-7 text-center text-xs text-[#6b775e] sm:flex-row sm:text-start">
          <span>
            © {new Date().getFullYear()} {t.brand}
          </span>
          <span className="flex items-center gap-1">
            <FlaskConical className="size-3.5" />
            {t.safe}
          </span>
        </div>
      </footer>
    </div>
  );
}

export function AccessGate({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  if (isAuthenticated) return <>{children}</>;
  return (
    <section className="container py-12 sm:py-20">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-primary/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(46,69,21,.08)]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#edf3e6] text-primary">
          <UserRound className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-[#293d12]">
          {t.loginTitle}
        </h2>
        <p className="mt-3 leading-7 text-[#627055]">{t.loginText}</p>
        <Button
          onClick={() => setLocation("/auth")}
          className="mt-7 rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
        >
          {t.loginAction}
          <ChevronLeft className="ms-2 size-4" />
        </Button>
      </div>
    </section>
  );
}
