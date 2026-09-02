import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlatformShell } from "@/components/PlatformShell";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Leaf, Loader2, LockKeyhole, Phone, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Auth() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [admin, setAdmin] = useState(false);
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: user => {
      utils.auth.me.setData(undefined, user);
      toast.success(language === "ar" ? `أهلًا ${user?.name || "بك"}، تم تسجيل الدخول بنجاح.` : `Welcome ${user?.name || "back"}, you are signed in.`);
      setLocation(admin ? "/control" : "/dashboard");
    },
    onError: error => toast.error(error.message),
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: user => {
      utils.auth.me.setData(undefined, user);
      toast.success(language === "ar" ? `مرحبًا ${user?.name || "بك"}، تم إنشاء حسابك.` : `Welcome ${user?.name || "there"}, your account is ready.`);
      setLocation("/dashboard");
    },
    onError: error => toast.error(error.message),
  });

  const isPending = login.isPending || register.isPending;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "register") {
      if (password !== confirmPassword) {
        toast.error(language === "ar" ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
        return;
      }
      register.mutate({ name, phone: identifier, password });
      return;
    }
    login.mutate({ identifier, password, admin });
  };

  const copy = language === "ar" ? {
    eyebrow: "حسابك في القادري",
    title: mode === "login" ? "أهلًا بك من جديد" : "أنشئ حسابك الزراعي",
    subtitle: mode === "login" ? "سجّل الدخول لمتابعة مزرعتك، مشاريعك، وتوصياتك المخصصة." : "أنشئ حسابًا بالاسم ورقم الهاتف واحفظ رحلتك الزراعية في مكان واحد.",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    user: "مستخدم",
    admin: "أدمن",
    name: "الاسم الكامل",
    namePlaceholder: "اكتب اسمك كما تحب أن يظهر",
    phone: "رقم الهاتف",
    phonePlaceholder: "مثال: 0790000000",
    username: "اسم المستخدم أو رقم الهاتف",
    usernamePlaceholder: "Ayoub للأدمن أو رقم هاتفك للمستخدم",
    password: "كلمة المرور",
    passwordPlaceholder: "6 أحرف أو أكثر",
    confirm: "تأكيد كلمة المرور",
    submitLogin: admin ? "دخول لوحة الأدمن" : "دخول آمن",
    submitRegister: "إنشاء الحساب والدخول",
    switchLogin: "لديك حساب؟ سجّل الدخول",
    switchRegister: "ليس لديك حساب؟ أنشئ حسابًا",
    adminNote: "دخول الأدمن مخصص للحساب الإداري فقط.",
    back: "العودة للرئيسية",
  } : {
    eyebrow: "Your Al-Qadri account",
    title: mode === "login" ? "Welcome back" : "Create your agriculture account",
    subtitle: mode === "login" ? "Sign in to follow your farm, projects, and tailored recommendations." : "Create an account with your name and phone number to keep your agricultural journey in one place.",
    login: "Sign in",
    register: "Create account",
    user: "User",
    admin: "Admin",
    name: "Full name",
    namePlaceholder: "How should we display your name?",
    phone: "Phone number",
    phonePlaceholder: "Example: +962790000000",
    username: "Username or phone number",
    usernamePlaceholder: "Ayoub for admin or your phone for users",
    password: "Password",
    passwordPlaceholder: "6 characters or more",
    confirm: "Confirm password",
    submitLogin: admin ? "Open admin control" : "Sign in securely",
    submitRegister: "Create account and sign in",
    switchLogin: "Already have an account? Sign in",
    switchRegister: "New here? Create an account",
    adminNote: "Admin sign-in is reserved for the administrator account.",
    back: "Back home",
  };

  return <PlatformShell compact>
    <main className="container grid min-h-[calc(100vh-150px)] items-center gap-8 py-10 lg:grid-cols-[.9fr_1.1fr]">
      <section className="hidden overflow-hidden rounded-[2rem] bg-[#35530e] p-8 text-white shadow-[0_24px_60px_rgba(53,83,14,.18)] lg:block">
        <div className="flex items-center gap-3 text-[#d9e9bd]"><span className="grid size-11 place-items-center rounded-2xl bg-white/10"><Leaf className="size-5" /></span><span className="text-xs font-bold tracking-[.18em]">SMART AGRICULTURE</span></div>
        <h2 className="mt-16 max-w-md text-4xl font-bold leading-tight">{language === "ar" ? "قرارات أوضح تبدأ بحسابك." : "Clearer decisions start with your account."}</h2>
        <p className="mt-5 max-w-md leading-7 text-[#e0ebcf]">{language === "ar" ? "احفظ سياق مزرعتك، واعرض توصياتك، وارجع إلى مشاريعك من أي جهاز." : "Save your farm context, revisit recommendations, and follow projects from any device."}</p>
        <div className="mt-14 grid gap-3 text-sm text-[#e0ebcf]"><div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"><ShieldCheck className="size-5" />{language === "ar" ? "جلسات آمنة وكلمات مرور مشفرة" : "Secure sessions and hashed passwords"}</div><div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"><UserRound className="size-5" />{language === "ar" ? "ترحيب مخصص باسمك في كل زيارة" : "A personal welcome on every visit"}</div></div>
      </section>

      <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-[#35530e]/10 bg-white p-6 shadow-[0_18px_50px_rgba(48,67,22,.08)] sm:p-9">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-[.16em] text-[#759244]">{copy.eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#293d12]">{copy.title}</h1><p className="mt-3 text-sm leading-6 text-[#68775a]">{copy.subtitle}</p></div><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#edf3e6] text-[#35530e]"><LockKeyhole className="size-5" /></span></div>
        <div className="mt-7 grid grid-cols-2 rounded-2xl bg-[#f4f7f0] p-1"><button type="button" onClick={() => setMode("login")} className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${mode === "login" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718064]"}`}>{copy.login}</button><button type="button" onClick={() => { setMode("register"); setAdmin(false); }} className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${mode === "register" ? "bg-white text-[#35530e] shadow-sm" : "text-[#718064]"}`}>{copy.register}</button></div>
        {mode === "login" && <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => setAdmin(false)} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition ${!admin ? "border-[#35530e] bg-[#f0f5e9] text-[#35530e]" : "border-[#35530e]/10 text-[#718064]"}`}><UserRound className="size-4" />{copy.user}</button><button type="button" onClick={() => setAdmin(true)} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition ${admin ? "border-[#35530e] bg-[#f0f5e9] text-[#35530e]" : "border-[#35530e]/10 text-[#718064]"}`}><ShieldCheck className="size-4" />{copy.admin}</button></div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" && <div><Label>{copy.name}</Label><Input required value={name} onChange={event => setName(event.target.value)} placeholder={copy.namePlaceholder} className="mt-1.5 h-12 rounded-xl" /></div>}
          <div><Label>{mode === "login" ? copy.username : copy.phone}</Label><div className="relative mt-1.5"><Input required value={identifier} onChange={event => setIdentifier(event.target.value)} placeholder={mode === "login" ? copy.usernamePlaceholder : copy.phonePlaceholder} className="h-12 rounded-xl pe-11" dir="ltr" autoComplete={mode === "login" ? "username" : "tel"} /><Phone className="pointer-events-none absolute end-3 top-3.5 size-5 text-[#90a17e]" /></div></div>
          <div><Label>{copy.password}</Label><div className="relative mt-1.5"><Input required minLength={6} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder={copy.passwordPlaceholder} className="h-12 rounded-xl pe-11" dir="ltr" autoComplete={mode === "login" ? "current-password" : "new-password"} /><LockKeyhole className="pointer-events-none absolute end-3 top-3.5 size-5 text-[#90a17e]" /></div></div>
          {mode === "register" && <div><Label>{copy.confirm}</Label><Input required minLength={6} type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-1.5 h-12 rounded-xl" dir="ltr" autoComplete="new-password" /></div>}
          {admin && mode === "login" && <p className="rounded-xl bg-[#fff8e8] px-4 py-3 text-xs leading-5 text-[#80631e]">{copy.adminNote}</p>}
          <Button disabled={isPending} type="submit" className="h-12 w-full rounded-xl bg-[#35530e] text-white hover:bg-[#294108]">{isPending ? <Loader2 className="size-5 animate-spin" /> : admin ? <ShieldCheck className="size-5" /> : <ArrowLeft className="size-5" />}{mode === "login" ? copy.submitLogin : copy.submitRegister}</Button>
        </form>
        <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setAdmin(false); }} className="mt-5 w-full text-center text-sm font-bold text-[#52731f] hover:underline">{mode === "login" ? copy.switchRegister : copy.switchLogin}</button>
        <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-[#77856d] no-underline hover:text-[#35530e]"><ArrowLeft className="size-4" />{copy.back}</Link>
      </section>
    </main>
  </PlatformShell>;
}
