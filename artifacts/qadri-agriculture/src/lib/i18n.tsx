import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getNeonValue, setNeonValue } from "@/data/neonStorage";

export type Language = "ar" | "en";

const labels = {
  ar: {
    brand: "القادري الزراعي الذكي", home: "الرئيسية", dashboard: "لوحتي", designer: "مصمم لاندسكيب وري", engineer: "المهندس الذكي", selector: "ماذا أزرع؟", diagnosis: "تحليل نبات", knowledge: "المعرفة", videos: "فيديوهات عالم الزراعة", projects: "المشاريع", shop: "المتجر", quotes: "عروض أسعار", profile: "ملفي الشخصي", quoteRequests: "طلبات عروض الأسعار", financialDocuments: "الفواتير والسندات", pageEditor: "محررة الصفحات", control: "مركز التحكم", signIn: "تسجيل الدخول", start: "ابدأ الآن", arabic: "العربية", english: "English", backHome: "العودة للرئيسية", safe: "إرشاد آمن ومدعوم بالمراجعة", loginTitle: "سجّل الدخول للمتابعة", loginText: "احفظ ملفك الزراعي، واطلب مراجعة خبير، وتابع مشاريعك من مكان واحد.", loginAction: "تسجيل الدخول بأمان",
  },
  en: {
    brand: "Al-Qadri Smart Agriculture", home: "Home", dashboard: "My dashboard", designer: "Landscape & irrigation", engineer: "AI engineer", selector: "What should I grow?", diagnosis: "Plant analysis", knowledge: "Knowledge", videos: "Agriculture World Videos", projects: "Projects", shop: "Store", quotes: "Quotes", profile: "My profile", quoteRequests: "Quote requests", financialDocuments: "Invoices & vouchers", pageEditor: "Page editor", control: "Control center", signIn: "Sign in", start: "Get started", arabic: "العربية", english: "English", backHome: "Back to home", safe: "Safe guidance with expert oversight", loginTitle: "Sign in to continue", loginText: "Save your agricultural profile, request expert review, and follow your projects in one place.", loginAction: "Sign in securely",
  },
} as const;

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (typeof labels)[Language] };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  useEffect(() => {
    void getNeonValue<Language>("preference.language").then(value => { if (value === "ar" || value === "en") setLanguageState(value); }).catch(() => undefined);
  }, []);
  const setLanguage = (next: Language) => {
    setLanguageState(next);
    void setNeonValue("preference.language", next).catch(() => undefined);
  };
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: labels[language] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
