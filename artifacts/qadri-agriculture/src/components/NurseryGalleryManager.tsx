import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addNurseryGalleryImage, getNurseryGallery, removeNurseryGalleryImage, type NurseryGalleryImage } from "@/data/nurseryGallery";
import { ImagePlus, Plus, Trash2, Upload } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";

const blank = { ar: "", en: "", src: "" };

function readImage(file: File, onLoad: (src: string) => void, onError: () => void) {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(objectUrl);
    onLoad(canvas.toDataURL("image/jpeg", 0.84));
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    onError();
  };
  image.src = objectUrl;
}

export default function NurseryGalleryManager() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [images, setImages] = useState<NurseryGalleryImage[]>(() => getNurseryGallery());
  const [draft, setDraft] = useState(blank);

  if (user?.role !== "admin") return null;

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(language === "ar" ? "اختَر ملف صورة فقط" : "Choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error(language === "ar" ? "حجم الصورة يجب ألا يتجاوز 8 ميغابايت" : "Image must be under 8 MB");
      return;
    }
    readImage(file, src => setDraft(current => ({ ...current, src })), () => toast.error(language === "ar" ? "تعذر قراءة الصورة" : "Could not read image"));
  };

  const save = () => {
    if (!draft.src) {
      toast.error(language === "ar" ? "ارفع صورة أولًا" : "Upload an image first");
      return;
    }
    const image = addNurseryGalleryImage({
      src: draft.src,
      ar: draft.ar.trim() || "من مشاتل القادري",
      en: draft.en.trim() || "From Al-Qadri Nurseries",
    });
    setImages(current => [...current, image]);
    setDraft(blank);
    toast.success(language === "ar" ? "تمت إضافة الصورة إلى المعرض" : "Image added to the gallery");
  };

  const remove = (image: NurseryGalleryImage) => {
    if (!window.confirm(language === "ar" ? "هل تريد حذف هذه الصورة من المعرض؟" : "Remove this image from the gallery?")) return;
    removeNurseryGalleryImage(image.id);
    setImages(current => current.filter(item => item.id !== image.id));
    toast.success(language === "ar" ? "تم حذف الصورة من المعرض" : "Image removed from the gallery");
  };

  return (
    <section className="mt-6 rounded-[1.6rem] border border-[#35530e]/10 bg-white p-5 sm:p-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[.14em] text-[#78924a]">{language === "ar" ? "معرض الصفحة الرئيسية" : "HOME GALLERY"}</p>
          <h2 className="mt-1 text-xl font-bold text-[#314617]">{language === "ar" ? "إضافة وحذف صور جمال ينمو بخبرة القادري" : "Manage the Beauty grown with Al-Qadri expertise gallery"}</h2>
          <p className="mt-2 text-sm text-[#718062]">{language === "ar" ? "هذه الأدوات متاحة للأدمن فقط، وتظهر التغييرات مباشرة في الصفحة الرئيسية." : "These controls are available to admins only and update the home page immediately."}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 rounded-2xl bg-[#f7f9f3] p-4 sm:grid-cols-2">
        <Input value={draft.ar} onChange={event => setDraft({ ...draft, ar: event.target.value })} placeholder="عنوان الصورة بالعربية (اختياري)" className="h-10 rounded-xl bg-white" />
        <Input value={draft.en} onChange={event => setDraft({ ...draft, en: event.target.value })} placeholder="Image title in English (optional)" className="h-10 rounded-xl bg-white" />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#b9d0a7] bg-white px-4 py-3 text-sm font-bold text-[#35530e] hover:bg-[#f0f7ef] sm:col-span-2">
          <Upload className="size-4" />
          {language === "ar" ? "اختيار صورة من الجهاز" : "Choose an image"}
          <input type="file" accept="image/*" onChange={selectImage} className="hidden" />
        </label>
        {draft.src && <img src={draft.src} alt="" className="h-32 w-full rounded-xl object-cover sm:col-span-2" />}
        <Button type="button" onClick={save} className="h-10 rounded-xl bg-[#35530e] text-white hover:bg-[#294108] sm:col-span-2"><Plus className="me-2 size-4" />{language === "ar" ? "إضافة الصورة للمعرض" : "Add image to gallery"}</Button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map(image => (
          <article key={image.id} className="overflow-hidden rounded-2xl border border-[#35530e]/10 bg-[#f7f9f3]">
            <img src={image.src} alt={language === "ar" ? image.ar : image.en} className="h-36 w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="line-clamp-2 text-xs font-bold text-[#405525]">{language === "ar" ? image.ar : image.en}</span>
              <Button type="button" onClick={() => remove(image)} variant="outline" className="h-8 shrink-0 rounded-lg border-[#e2bdb1] px-2 text-xs text-[#914f42]"><Trash2 className="size-3.5" /><span className="sr-only">{language === "ar" ? "حذف" : "Delete"}</span></Button>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-[#718062]"><ImagePlus className="size-3.5" />{language === "ar" ? `${images.length} صورة ظاهرة حاليًا في المعرض` : `${images.length} images currently shown in the gallery`}</p>
    </section>
  );
}