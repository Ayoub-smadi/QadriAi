import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlatformShell } from "@/components/PlatformShell";
import { authClient } from "@/lib/authClient";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Check, Leaf, Loader2, LockKeyhole, ShieldCheck, Sprout, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Auth() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const isAdminLogin = mode === "login" && identifier.trim().toLowerCase() === "ayoub";

  const copy = isArabic ? {
    badge: "مساحتك الزراعية الآمنة", login: "تسجيل الدخول", register: "إنشاء حساب", loginTitle: "أهلًا بك من جديد", registerTitle: "ابدأ رحلتك الزراعية", loginText: "ادخل إلى مشاريعك، توصياتك، وطلبات عروض الأسعار من مكان واحد.", registerText: "أنشئ حسابًا بسيطًا واحفظ قراراتك الزراعية لتعود إليها في أي وقت.", name: "الاسم الكامل", namePlaceholder: "مثال: أحمد القادري", identifier: mode === "login" ? "اسم المستخدم أو رقم الهاتف" : "رقم الهاتف", identifierPlaceholder: mode === "login" ? "اكتب Ayoub لحساب الأدمن" : "مثال: 0790000000", password: "كلمة المرور", passwordPlaceholder: "6 أحرف أو أكثر", confirm: "تأكيد كلمة المرور", action: mode === "login" ? (isAdminLogin ? "دخول لوحة الأدمن" : "تسجيل الدخول") : "إنشاء الحساب", switch: mode === "login" ? "ليس لديك حساب؟ أنشئ حسابًا" : "لديك حساب؟ سجّل الدخول", back: "العودة للرئيسية", benefits: ["جلسة آمنة وبيانات مشفرة", "متابعة طلبات عروض الأسعار", "تجربة عربية واضحة وبسيطة"]
  } : {
    badge: "YOUR SECURE FARM SPACE", login: "Sign in", register: "Create account", loginTitle: "Welcome back", registerTitle: "Start your agriculture journey", loginText: "Access your projects, recommendations, and quote requests in one place.", registerText: "Create a simple account and keep your agricultural decisions ready whenever you need them.", name: "Full name", namePlaceholder: "e.g. Ahmad Al-Qadri", identifier: mode === "login" ? "Username or phone number" : "Phone number", identifierPlaceholder: mode === "login" ? "Enter Ayoub for admin access" : "e.g. +962790000000", password: "Password", passwordPlaceholder: "6 characters or more", confirm: "Confirm password", action: mode === "login" ? (isAdminLogin ? "Open admin desk" : "Sign in") : "Create account", switch: mode === "login" ? "New here? Create an account" : "Already have an account? Sign in", back: "Back home", benefits: ["Secure session and protected data", "Follow quote requests", "A clear, focused experience"]
  };

  const switchMode = (next: "login" | "register") => { setMode(next); setName(""); setIdentifier(""); setPassword(""); setConfirmPassword(""); };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "register" && password !== confirmPassword) { toast.error(isArabic ? "كلمتا المرور غير متطابقتين." : "Passwords do not match."); return; }
    setPending(true);
    try {
      const user = mode === "login"
        ? await authClient.login({ identifier: identifier.trim(), password, admin: isAdminLogin })
        : await authClient.register({ name: name.trim(), phone: identifier.trim(), password });
      queryClient.setQueryData(["auth", "me"], user);
      toast.success(isArabic ? `أهلًا ${user.name || "بك"}، تم الدخول بنجاح.` : `Welcome ${user.name || "back"}.`);
      setLocation(user.role === "admin" ? "/dashboard" : "/profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (isArabic ? "تعذر تنفيذ الطلب." : "Could not complete the request."));
    } finally { setPending(false); }
  };

  return <PlatformShell compact>
    <main className="min-h-[calc(100vh-115px)] bg-[#f6f8f1] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.2rem] border border-[#dbe5d0] bg-white shadow-[0_24px_80px_rgba(38,73,43,.12)] lg:grid-cols-[.9fr_1.1fr]" dir={isArabic ? "rtl" : "ltr"}>
        <section className="relative overflow-hidden bg-[#063f33] px-7 py-9 text-white sm:px-12 sm:py-12 lg:order-2 lg:min-h-[650px] lg:py-16">
          <div className="absolute -end-20 -top-20 size-64 rounded-full border-[34px] border-[#2f7862]/40" /><div className="absolute -bottom-20 -start-20 size-64 rounded-full border-[34px] border-[#2f7862]/30" />
          <div className="relative flex h-full flex-col justify-between"><div><div className="flex items-center gap-3 text-[#b9dfcf]"><span className="grid size-11 place-items-center rounded-2xl bg-white/10"><Sprout className="size-5" /></span><span className="text-xs font-black tracking-[.18em]">AL-QADRI SMART AGRICULTURE</span></div><h1 className="mt-16 max-w-md text-4xl font-black leading-[1.12] sm:text-5xl">{isArabic ? "قرارات زراعية أوضح تبدأ بحسابك." : "Clearer agriculture starts with your account."}</h1><p className="mt-5 max-w-md text-sm leading-8 text-[#d7ece3]">{isArabic ? "مكان واحد لمشاريعك، اختياراتك، وتواصل أسهل مع فريق القادري." : "One focused space for your projects, selections, and easier communication with Al-Qadri."}</p></div><div className="mt-12 grid gap-3">{copy.benefits.map(item => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 text-sm font-bold text-[#e3f2eb]"><Check className="size-4 text-[#9dd7bd]" />{item}</div>)}</div></div>
        </section>
        <section className="px-6 py-8 sm:px-12 sm:py-12 lg:order-1 lg:py-16">
          <div className="mx-auto max-w-md"><div className="flex items-center gap-2 text-xs font-black tracking-[.16em] text-[#6f914c]"><Leaf className="size-4" />{copy.badge}</div><h2 className="mt-5 text-3xl font-black tracking-tight text-[#294a2e] sm:text-4xl">{mode === "login" ? copy.loginTitle : copy.registerTitle}</h2><p className="mt-3 text-sm leading-7 text-[#718062]">{mode === "login" ? copy.loginText : copy.registerText}</p>
            <div className="mt-8 grid grid-cols-2 rounded-2xl bg-[#f0f4eb] p-1"><button type="button" onClick={() => switchMode("login")} className={`rounded-xl px-3 py-3 text-sm font-black transition ${mode === "login" ? "bg-white text-[#17483b] shadow-sm" : "text-[#7b896e]"}`}>{copy.login}</button><button type="button" onClick={() => switchMode("register")} className={`rounded-xl px-3 py-3 text-sm font-black transition ${mode === "register" ? "bg-white text-[#17483b] shadow-sm" : "text-[#7b896e]"}`}>{copy.register}</button></div>
             <form onSubmit={submit} className="mt-7 space-y-4">{mode === "register" && <div><Label>{copy.name}</Label><Input required value={name} onChange={e => setName(e.target.value)} placeholder={copy.namePlaceholder} className="mt-1.5 h-12 rounded-xl border-[#d8e3ce] bg-[#fbfcf9]" /></div>}<div><Label>{copy.identifier}</Label><Input required value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={copy.identifierPlaceholder} dir="ltr" className="mt-1.5 h-12 rounded-xl border-[#d8e3ce] bg-[#fbfcf9] text-left" autoComplete={mode === "login" ? "username" : "tel"} /></div><div><Label>{copy.password}</Label><Input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={copy.passwordPlaceholder} dir="ltr" className="mt-1.5 h-12 rounded-xl border-[#d8e3ce] bg-[#fbfcf9] text-left" autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>{mode === "register" && <div><Label>{copy.confirm}</Label><Input required minLength={6} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} dir="ltr" className="mt-1.5 h-12 rounded-xl border-[#d8e3ce] bg-[#fbfcf9] text-left" autoComplete="new-password" /></div>}<Button disabled={pending} type="submit" className="h-12 w-full rounded-xl bg-[#063f33] text-base font-black text-white shadow-[0_10px_24px_rgba(6,63,51,.18)] hover:bg-[#052f27]">{pending ? <Loader2 className="size-5 animate-spin" /> : isAdminLogin ? <ShieldCheck className="size-5" /> : <LockKeyhole className="size-5" />}{copy.action}</Button></form>
            <button type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")} className="mt-6 w-full text-center text-sm font-black text-[#52731f] hover:underline">{copy.switch}</button><Link href="/" className="mt-7 flex items-center justify-center gap-2 text-xs font-bold text-[#87937d] no-underline hover:text-[#35530e]">{isArabic ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}{copy.back}</Link></div>
        </section>
      </div>
    </main>
  </PlatformShell>;
}
