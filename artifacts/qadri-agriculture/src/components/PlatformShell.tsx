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
  DollarSign,
  Facebook,
  FileText,
  FlaskConical,
  Home as HomeIcon,
  Instagram,
  LayoutDashboard,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  ScanSearch,
  ShoppingBag,
  Sprout,
  Store,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Fragment, ReactNode, useState } from "react";
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
  { href: "/videos", label: "videos", icon: Video },
  { href: "/projects", label: "projects", icon: ClipboardList },
  { href: "/quotes", label: "quotes", icon: DollarSign },
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 overflow-hidden border-b border-white/10 bg-primary text-primary-foreground shadow-[0_12px_36px_rgba(3,79,59,.25)]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#9dd7bd]/90 to-transparent" />

        <div className="border-b border-white/10 bg-[#003f31]/80">
          <div className="container flex h-9 items-center justify-between gap-4 text-[11px] font-semibold text-[#d5eee3]">
            <a
              href="tel:0777772211"
              dir="ltr"
              className="inline-flex items-center gap-2 rounded-full px-1.5 py-1 text-sm font-extrabold no-underline transition-colors hover:text-white"
              aria-label="Call 0777772211"
            >
              <span className="grid size-5 place-items-center rounded-full bg-[#9dd7bd] text-[#034f3b]">
                <Phone className="size-3" />
              </span>
              <span dir="ltr">0777772211</span>
            </a>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <BadgeCheck className="size-3.5 text-[#9dd7bd]" />
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
              <span className="grid size-12 shrink-0 place-items-center rounded-[1.1rem] border border-white/20 bg-white/10 p-1.5 shadow-[0_8px_24px_rgba(15,35,3,.24)] transition-transform duration-200 group-hover:-rotate-6 group-hover:bg-white/15">
              <img src="/assets/qadri-bot-logo.png" alt="" aria-hidden="true" className="size-full rounded-lg object-contain" />
            </span>
              <span className="hidden min-w-0 leading-tight sm:block">
              <strong className="block max-w-[240px] truncate text-base font-bold text-white">
                {t.brand}
              </strong>
              <small className="text-[10px] font-semibold tracking-[.2em] text-[#b9dfcf]">
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
                className="relative grid size-11 place-items-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9dd7bd]"
              aria-label={
                language === "ar" ? "فتح سلة المشتريات" : "Open shopping cart"
              }
            >
              <ShoppingBag className="size-5" />
              {itemCount > 0 && (
                  <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-[#9dd7bd] text-[10px] font-extrabold text-[#034f3b]">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9dd7bd]"
              aria-label="Switch language"
            >
              {language === "ar" ? "EN" : "ع"}
            </button>
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="grid size-11 place-items-center rounded-xl bg-[#d4eee3] text-base font-extrabold text-primary no-underline transition-transform hover:-translate-y-0.5 hover:bg-white"
                aria-label={t.profile}
              >
                {initials}
              </Link>
            ) : (
              <Button
                onClick={() => setLocation("/auth")}
                className="hidden h-11 rounded-xl bg-white px-5 font-bold text-primary shadow-md hover:bg-[#e7f5ef] sm:inline-flex"
              >
                {t.signIn}
              </Button>
            )}
            {!compact && (
              <button
                type="button"
                onClick={() => setMobileMenu(!mobileMenu)}
                 className="grid size-11 place-items-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9dd7bd] xl:hidden"
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
          <div className="hidden border-t border-white/10 bg-[#003f31]/90 xl:block">
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
                          ? "bg-[#9dd7bd] text-[#034f3b] shadow-[0_6px_16px_rgba(157,215,189,.25)]"
                          : "text-[#d9eee6] hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="size-5.5 shrink-0" />
                      <span className="whitespace-nowrap">{t[item.label]}</span>
                      <span
                        className={cn(
                          "absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full transition-opacity",
                          active
                           ? "bg-white/80 opacity-100"
                           : "bg-[#9dd7bd] opacity-0 group-hover:opacity-80"
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
          <div className="border-t border-white/10 bg-[#003f31]/95 px-4 py-4 backdrop-blur-xl xl:hidden">
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
      <footer className="mt-16 overflow-hidden bg-[#003f31] text-white">
        <div className="container grid gap-10 py-12 sm:py-14 lg:grid-cols-[1.1fr_1.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-14 place-items-center rounded-2xl border border-white/20 bg-white/10 p-2">
                <img src="/assets/qadri-bot-logo.png" alt="" aria-hidden="true" className="size-full rounded-xl object-contain" />
              </span>
              <div>
                <p className="text-xl font-bold">{t.brand}</p>
                <p className="mt-1 text-xs font-semibold tracking-[.18em] text-[#b9dfcf]">SMART AGRICULTURE</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#d5eee3]">
              {language === "ar" ? "تواصل مع القادري الزراعي لمزيد من المعلومات والخدمات الزراعية." : "Connect with Al-Qadri Agricultural for more information and agricultural services."}
            </p>
            <a href="tel:0777772211" dir="ltr" className="mt-5 inline-flex items-center gap-3 text-2xl font-extrabold tracking-wide text-white no-underline transition-colors hover:text-[#b9dfcf]">
              <Phone className="size-6 text-[#9dd7bd]" />0777772211
            </a>
          </div>

          <div>
            <h2 className="text-lg font-bold">{language === "ar" ? "تواصل معنا" : "Connect with us"}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <FooterLink href="https://api.whatsapp.com/send/?phone=962777772211&text&type=phone_number&app_absent=0" icon={<MessageCircle className="size-5" />} label={language === "ar" ? "واتساب" : "WhatsApp"} />
              <FooterLink href="https://www.instagram.com/alqadri_agricultural__jerash/" icon={<Instagram className="size-5" />} label={language === "ar" ? "إنستغرام" : "Instagram"} />
              <FooterLink href="https://web.facebook.com/msateelalqadry?rdid=7y0JQhPVm9CAngY7&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F1JquHHzpXy%2F%3F_rdc%3D1%26_rdr#" icon={<Facebook className="size-5" />} label={language === "ar" ? "فيسبوك" : "Facebook"} />
              <FooterLink href="https://drive.google.com/file/d/1il6mcWDQ_bhefXjxEGfPudlhNvC-91n1/view?usp=sharing" icon={<FileText className="size-5" />} label={language === "ar" ? "الكتيب" : "Brochure"} />
              <FooterLink href="https://www.alqadrioffers.online/agri-store" icon={<Store className="size-5" />} label={language === "ar" ? "المتجر الزراعي" : "Agricultural store"} />
              <FooterLink href="mailto:tamerqadri@gmail.com" icon={<Mail className="size-5" />} label="tamerqadri@gmail.com" />
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-[#b9dfcf] sm:flex-row sm:text-start">
            <span>© {new Date().getFullYear()} {t.brand}</span>
            <span className="flex items-center gap-1"><FlaskConical className="size-3.5" />{t.safe}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="flex min-h-12 items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white no-underline transition-colors hover:bg-white/20">
      <span className="text-[#9dd7bd]">{icon}</span>{label}
    </a>
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
