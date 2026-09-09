import rawVideos from "./realAgriVideos.json";

export type VideoCategory =
  | "pruning" | "propagation" | "protection" | "soil" | "irrigation"
  | "fertilizing" | "greenhouse" | "harvest" | "safety";
export type VideoLevel = "beginner" | "intermediate" | "advanced";
export type VideoLesson = {
  id: string;
  titleAr: string;
  titleEn: string;
  category: VideoCategory;
  duration: string;
  level: VideoLevel;
  descriptionAr: string;
  descriptionEn: string;
  visual: "tree" | "hands" | "soil" | "water" | "leaf" | "greenhouse" | "crate" | "shield";
  featured?: boolean;
  youtubeId: string;
  sourceLabel: string;
};

export const videoCategories: VideoCategory[] = ["pruning", "propagation", "protection", "soil", "irrigation", "fertilizing", "greenhouse", "harvest", "safety"];

const categoryLabels: Record<VideoCategory, { keywords: string[]; visual: VideoLesson["visual"] }> = {
  pruning: { keywords: ["prun", "تقليم", "olive", "زيتون", "grape", "عنب"], visual: "tree" },
  propagation: { keywords: ["graft", "طع", "cutting", "عقل", "seedling", "شتل", "nursery", "مشتل"], visual: "hands" },
  protection: { keywords: ["pest", "مرض", "disease", "مبيد", "spray", "رش", "حشرة", "fung", "آفة"], visual: "shield" },
  soil: { keywords: ["soil", "تربة", "compost", "كمبوست", "salin", "ملوح", "land preparation", "تحضير"], visual: "soil" },
  irrigation: { keywords: ["irrig", "ري", "water", "مياه", "drip", "تنقيط", "sprinkler", "رطوب"], visual: "water" },
  fertilizing: { keywords: ["fertil", "سماد", "تسميد", "nutrition", "تغذية", "fertigation"], visual: "leaf" },
  greenhouse: { keywords: ["greenhouse", "دفيئة", "بيت بلاستيكي", "بيوت محمية", "climate control"], visual: "greenhouse" },
  harvest: { keywords: ["harvest", "قطاف", "حصاد", "postharvest", "post-harvest", "بعد الحصاد", "produce handling"], visual: "crate" },
  safety: { keywords: ["safety", "سلامة", "ppe", "protective", "وقاية", "chemical"], visual: "shield" },
};

function categoryFor(title: string, query: string): VideoCategory {
  const text = `${title} ${query}`.toLocaleLowerCase();
  return (Object.entries(categoryLabels).find(([, item]) => item.keywords.some(keyword => text.includes(keyword)))?.[0] || "soil") as VideoCategory;
}
function durationFor(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "فيديو حقيقي";
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
function levelFor(index: number): VideoLevel {
  return index % 7 === 0 ? "advanced" : index % 3 === 0 ? "intermediate" : "beginner";
}

export const videoLessons: VideoLesson[] = rawVideos.map((video, index) => {
  const category = categoryFor(video.title, video.query);
  const visual = categoryLabels[category].visual;
  return {
    id: `real-${video.id}`,
    titleAr: video.title,
    titleEn: video.title,
    category,
    duration: durationFor(video.duration),
    level: levelFor(index),
    descriptionAr: `فيديو زراعي حقيقي من ${video.channel || "YouTube"} حول ${video.title}.`,
    descriptionEn: `Real agricultural video from ${video.channel || "YouTube"} about ${video.title}.`,
    visual,
    featured: index === 0,
    youtubeId: video.id,
    sourceLabel: video.channel || "YouTube",
  };
});
