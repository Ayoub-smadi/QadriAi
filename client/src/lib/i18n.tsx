import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "ar" | "en";

const labels = {
  ar: {
    brand: "القادري الزراعي الذكي", home: "الرئيسية", dashboard: "لوحتي", engineer: "المهندس الذكي", selector: "ماذا أزرع؟", diagnosis: "تحليل نبات", knowledge: "المعرفة", projects: "المشاريع", shop: "المتجر", profile: "ملفي الزراعي", control: "مركز التحكم", signIn: "تسجيل الدخول", start: "ابدأ الآن", arabic: "العربية", english: "English", backHome: "العودة للرئيسية", safe: "إرشاد آمن ومدعوم بالمراجعة", loginTitle: "سجّل الدخول للمتابعة", loginText: "احفظ ملفك الزراعي، واطلب مراجعة خبير، وتابع مشاريعك من مكان واحد.", loginAction: "تسجيل الدخول بأمان",
  },
  en: {
    brand: "Al-Qadri Smart Agriculture", home: "Home", dashboard: "My dashboard", engineer: "AI engineer", selector: "What should I grow?", diagnosis: "Plant analysis", knowledge: "Knowledge", projects: "Projects", shop: "Store", profile: "My farm profile", control: "Control center", signIn: "Sign in", start: "Get started", arabic: "العربية", english: "English", backHome: "Back to home", safe: "Safe guidance with expert oversight", loginTitle: "Sign in to continue", loginText: "Save your agricultural profile, request expert review, and follow your projects in one place.", loginAction: "Sign in securely",
  },
} as const;

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (typeof labels)[Language] };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("al-qadri-language") as Language) || "ar");
  useEffect(() => {
    localStorage.setItem("al-qadri-language", language);
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
