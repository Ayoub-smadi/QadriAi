import { PlatformShell } from "@/components/PlatformShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import { CircleAlert, ClipboardCheck, Droplets, MapPin, Sprout } from "lucide-react";
import { type FormEvent, useState } from "react";

type PlannerInput = {
  country: string;
  region: string;
  soilType: string;
  goal: string;
  waterSource: string;
  area: string;
};

const initial: PlannerInput = {
  country: "Jordan",
  region: "",
  soilType: "",
  goal: "",
  waterSource: "",
  area: "",
};

export default function Selector() {
  const { language } = useLanguage();
  const [form, setForm] = useState<PlannerInput>(initial);
  const [submitted, setSubmitted] = useState(false);
  const isArabic = language === "ar";

  const labels = isArabic
    ? {
        country: "الدولة",
        region: "المنطقة",
        soil: "نوع التربة",
        goal: "الغاية من الزراعة",
        water: "مصدر المياه",
        area: "حجم الأرض",
        submit: "إرسال البيانات",
        heading: "ماذا أزرع؟",
        sub: "أدخل بيانات أرضك حتى نجهّز لك ترشيحًا مناسبًا عند ربط خدمة التوصيات.",
      }
    : {
        country: "Country",
        region: "Region",
        soil: "Soil type",
        goal: "Purpose of farming",
        water: "Water source",
        area: "Land size",
        submit: "Send details",
        heading: "What should I grow?",
        sub: "Enter your land details so we can prepare suitable recommendations when the recommendation service is connected.",
      };

  const update = (field: keyof PlannerInput, value: string) => {
    setSubmitted(false);
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const missing = Object.values(form).filter(value => !value.trim()).length;
  const completion = Math.round(((Object.keys(form).length - missing) / Object.keys(form).length) * 100);
  const temporaryResponse = isArabic
    ? "تعذر الحصول على الرد الآن. Unable to transform response from server"
    : "Unable to transform response from server";

  return (
    <PlatformShell
      title={labels.heading}
      eyebrow={isArabic ? "بيانات زراعية قبل أي توصية" : "Agricultural details before any recommendation"}
    >
      <main className="container grid gap-6 py-8 lg:grid-cols-[.88fr_1.12fr]" dir={isArabic ? "rtl" : "ltr"}>
        <section className="rounded-[1.6rem] border border-[#35530e]/10 bg-white p-5 shadow-[0_14px_32px_rgba(48,67,22,.05)] sm:p-7">
          <div className="flex items-start gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#edf4e5] text-[#35530e]"><ClipboardCheck className="size-5" /></span>
            <div>
              <h2 className="text-xl font-bold text-[#314617]">{isArabic ? "بيانات الأرض" : "Land details"}</h2>
              <p className="mt-1 text-sm leading-6 text-[#6b785d]">{labels.sub}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f4f7ef] px-4 py-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#dfe8d2]">
              <div className="h-full rounded-full bg-[#73973a] transition-all" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-xs font-bold text-[#5c7339]">{completion}%</span>
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div>
              <Label>{labels.country}</Label>
              <Select value={form.country} onValueChange={value => update("country", value)}>
                <SelectTrigger className="mt-1.5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jordan">الأردن / Jordan</SelectItem>
                  <SelectItem value="Saudi Arabia">السعودية / Saudi Arabia</SelectItem>
                  <SelectItem value="UAE">الإمارات / UAE</SelectItem>
                  <SelectItem value="Qatar">قطر / Qatar</SelectItem>
                  <SelectItem value="Egypt">مصر / Egypt</SelectItem>
                  <SelectItem value="Palestine">فلسطين / Palestine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{labels.region}</Label>
                <Input value={form.region} onChange={event => update("region", event.target.value)} className="mt-1.5 h-11 rounded-xl" placeholder={isArabic ? "مثال: الأغوار الشمالية" : "e.g., Northern Jordan Valley"} required />
              </div>
              <div>
                <Label>{labels.area}</Label>
                <Input value={form.area} onChange={event => update("area", event.target.value)} className="mt-1.5 h-11 rounded-xl" placeholder={isArabic ? "مثال: 250 م² أو 2 دونم" : "e.g., 250 m² or 2 dunums"} required />
              </div>
            </div>

            <div>
              <Label>{labels.soil}</Label>
              <Input value={form.soilType} onChange={event => update("soilType", event.target.value)} className="mt-1.5 h-11 rounded-xl" placeholder={isArabic ? "مثال: طينية، رملية، طميية" : "e.g., clay, sandy, loamy"} required />
            </div>

            <div>
              <Label>{labels.goal}</Label>
              <Input value={form.goal} onChange={event => update("goal", event.target.value)} className="mt-1.5 h-11 rounded-xl" placeholder={isArabic ? "مثال: إنتاج منزلي أو مشروع تجاري" : "e.g., home production or commercial project"} required />
            </div>

            <div>
              <Label>{labels.water}</Label>
              <Input value={form.waterSource} onChange={event => update("waterSource", event.target.value)} className="mt-1.5 h-11 rounded-xl" placeholder={isArabic ? "مثال: بئر، شبكة، خزان، مياه أمطار" : "e.g., well, mains, tank, rainwater"} required />
            </div>

            <Button type="submit" disabled={missing > 0} className="mt-2 h-11 rounded-xl bg-[#35530e] text-white hover:bg-[#294108]">
              <Sprout className="size-4" />
              {labels.submit}
            </Button>
          </form>
        </section>

        <section className="min-w-0">
          <div className="rounded-[1.6rem] border border-[#35530e]/10 bg-[#f2f6ec] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{isArabic ? "الرد المؤقت" : "TEMPORARY RESPONSE"}</p>
                <h2 className="mt-2 text-xl font-bold text-[#314617]">{isArabic ? "نتيجة ماذا أزرع؟" : "What should I grow? result"}</h2>
              </div>
              <span className="grid size-11 place-items-center rounded-xl bg-white text-[#35530e]"><MapPin className="size-5" /></span>
            </div>

            {!submitted ? (
              <div className="mt-8 rounded-2xl border border-dashed border-[#b8cca0] bg-white/60 p-7 text-center">
                <Droplets className="mx-auto size-8 text-[#7f9d4d]" />
                <p className="mt-3 text-sm leading-6 text-[#68775a]">{isArabic ? "أدخل البيانات الستة ثم اضغط إرسال البيانات لعرض الرد المؤقت." : "Enter the six details and send them to display the temporary response."}</p>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-[#e7cf9e] bg-[#fffaf0] p-6" role="status" aria-live="polite">
                <div className="flex items-start gap-3 text-[#806536]">
                  <CircleAlert className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm font-semibold leading-7">{temporaryResponse}</p>
                </div>
                <p className="mt-4 border-t border-[#eadcbf] pt-4 text-xs leading-6 text-[#90784e]">
                  {isArabic ? "تم حفظ البيانات في النموذج مؤقتًا، وسيتم استخدام هذه الحقول عند ربط الـ API." : "The details remain in the form temporarily and will be used when the API is connected."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </PlatformShell>
  );
}
