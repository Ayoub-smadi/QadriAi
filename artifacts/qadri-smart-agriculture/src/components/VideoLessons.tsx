import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { videoLessons, type VideoLesson } from "@/data/videoLessons";
import { useLanguage } from "@/lib/i18n";
import { ExternalLink, PlayCircle, Video } from "lucide-react";
import { useState } from "react";

export function VideoLessons() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);

  return (
    <>
      <section className="mt-10 rounded-[1.6rem] border border-[#35530e]/10 bg-white p-5 shadow-[0_10px_25px_rgba(48,67,22,.04)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[.14em] text-[#759244]">{isArabic ? "مصادر مرئية مختارة" : "CURATED VIDEO SOURCES"}</p>
            <h2 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-[#314617]">
              <Video className="size-6 text-[#52731f]" />
              {isArabic ? "دروس زراعية بالفيديو" : "Agricultural video lessons"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#69785b]">
              {isArabic ? "فيديوهات عامة مرتبطة مباشرة بالموضوع، مع مصدر واضح لكل درس." : "Public videos linked directly to the topic, with a clear source for every lesson."}
            </p>
          </div>
          <span className="text-xs font-bold text-[#7a8969]">{videoLessons.length} {isArabic ? "دروس موثقة" : "verified lessons"}</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {videoLessons.map(lesson => (
            <article key={lesson.id} className="overflow-hidden rounded-2xl border border-[#35530e]/10 bg-[#fbfcf8]">
              <div className="relative aspect-video overflow-hidden bg-[#17342d]">
                <img src={`https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`} alt="" className="size-full object-cover opacity-75" loading="lazy" />
                <div className="absolute inset-0 bg-[#063f33]/35" />
                <button type="button" onClick={() => setActiveVideo(lesson)} className="absolute inset-0 grid place-items-center text-white outline-none transition hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white" aria-label={isArabic ? `تشغيل ${lesson.titleAr}` : `Play ${lesson.titleEn}`}>
                  <PlayCircle className="size-14 drop-shadow-lg transition-transform hover:scale-110" />
                </button>
              </div>
              <div className="p-4">
                <span className="rounded-full bg-[#edf4e5] px-2.5 py-1 text-[10px] font-bold text-[#5d7831]">{isArabic ? lesson.categoryAr : lesson.categoryEn}</span>
                <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-bold leading-6 text-[#314617]">{isArabic ? lesson.titleAr : lesson.titleEn}</h3>
                <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#68775a]">{isArabic ? lesson.descriptionAr : lesson.descriptionEn}</p>
                <button type="button" onClick={() => setActiveVideo(lesson)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#52731f] hover:text-[#35530e]">
                  <PlayCircle className="size-4" />{isArabic ? "مشاهدة الفيديو" : "Watch video"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Dialog open={Boolean(activeVideo)} onOpenChange={open => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-4xl rounded-[1.5rem] border-[#dce8cf] bg-[#fbfcf8] p-0" dir={isArabic ? "rtl" : "ltr"}>
          {activeVideo && (
            <>
              <div className="aspect-video overflow-hidden rounded-t-[1.5rem] bg-black">
                <iframe
                  className="size-full"
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?rel=0`}
                  title={isArabic ? activeVideo.titleAr : activeVideo.titleEn}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-5 sm:p-7">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-[#314617]">{isArabic ? activeVideo.titleAr : activeVideo.titleEn}</DialogTitle>
                  <DialogDescription className="mt-2 text-sm leading-6 text-[#68775a]">{isArabic ? activeVideo.descriptionAr : activeVideo.descriptionEn}</DialogDescription>
                </DialogHeader>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#35530e]/10 pt-4">
                  <span className="text-xs font-bold text-[#7a8969]">{activeVideo.sourceLabel}</span>
                  <a href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#35530e] px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#294108]">
                    <ExternalLink className="size-4" />{isArabic ? "فتح المصدر الأصلي" : "Open original source"}
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}