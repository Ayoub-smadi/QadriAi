export type NurseryGalleryImage = {
  id: string;
  src: string;
  ar: string;
  en: string;
};

const GALLERY_KEY = "al-qadri-nursery-gallery-v1";
const CHANGE_EVENT = "al-qadri-nursery-gallery-change";

export const defaultNurseryGallery: NurseryGalleryImage[] = [
  { id: "nursery-01", src: "/assets/nursery-01.jpeg", ar: "مشاتل القادري الزراعية", en: "Al-Qadri Agricultural Nurseries" },
  { id: "nursery-02", src: "/assets/nursery-02.jpeg", ar: "أشجار مزهرة للحدائق", en: "Flowering trees for gardens" },
  { id: "nursery-03", src: "/assets/nursery-03.jpeg", ar: "نباتات وتنسيقات موسمية", en: "Seasonal plants and arrangements" },
  { id: "nursery-04", src: "/assets/nursery-04.jpeg", ar: "نخيل وتنسيقات خارجية", en: "Palms and outdoor landscaping" },
  { id: "nursery-05", src: "/assets/nursery-05.jpeg", ar: "أشجار الزينة والخضرة", en: "Ornamental trees and greenery" },
  { id: "nursery-06", src: "/assets/nursery-06.jpeg", ar: "ألوان من مشتلنا", en: "Color from our nursery" },
  { id: "nursery-07", src: "/assets/nursery-07.jpeg", ar: "حدائق تنبض بالحياة", en: "Gardens full of life" },
  { id: "nursery-08", src: "/assets/nursery-08.jpeg", ar: "خبرة تنمو معك", en: "Experience that grows with you" },
  { id: "gallery-09", src: "/assets/gallery-09-sculpted-planters.jpeg", ar: "أحواض وأعمال حجرية فنية", en: "Sculpted planters and stonework" },
  { id: "gallery-10", src: "/assets/gallery-10-olive-nursery.jpeg", ar: "شتلات الزيتون في مشتلنا", en: "Olive seedlings in our nursery" },
  { id: "gallery-11", src: "/assets/gallery-11-greenhouse-seedlings.jpeg", ar: "شتلات خضراء داخل البيوت المحمية", en: "Green seedlings in the greenhouse" },
  { id: "gallery-12", src: "/assets/gallery-12-old-olive-trees.jpeg", ar: "أشجار زيتون معمّرة", en: "Mature olive trees" },
  { id: "gallery-13", src: "/assets/gallery-13-ficus-nursery.jpeg", ar: "فيكس وتنسيقات داخلية", en: "Ficus trees and indoor arrangements" },
  { id: "gallery-14", src: "/assets/gallery-14-ornamental-plants.jpeg", ar: "نباتات زينة مختارة", en: "Selected ornamental plants" },
  { id: "gallery-15", src: "/assets/gallery-15-grafted-olive-trees.jpeg", ar: "زيتون مطعّم بعناية", en: "Carefully grafted olive trees" },
  { id: "gallery-16", src: "/assets/gallery-16-garden-tree.jpeg", ar: "أشجار للحدائق والمساحات الخارجية", en: "Trees for gardens and outdoor spaces" },
  { id: "gallery-17", src: "/assets/gallery-17-nursery-greenery.jpeg", ar: "خضرة تنمو بخبرة القادري", en: "Greenery grown with Al-Qadri expertise" },
];

function readStored(): NurseryGalleryImage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GALLERY_KEY) || "null");
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === "string" && typeof item.src === "string") : null;
  } catch {
    return null;
  }
}

export function getNurseryGallery() {
  return readStored() ?? defaultNurseryGallery;
}

export function saveNurseryGallery(images: NurseryGalleryImage[]) {
  window.localStorage.setItem(GALLERY_KEY, JSON.stringify(images));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function addNurseryGalleryImage(input: Omit<NurseryGalleryImage, "id">) {
  const image = { ...input, id: `gallery-custom-${Date.now()}` };
  saveNurseryGallery([...getNurseryGallery(), image]);
  return image;
}

export function removeNurseryGalleryImage(id: string) {
  saveNurseryGallery(getNurseryGallery().filter(image => image.id !== id));
}

export function subscribeToNurseryGallery(listener: () => void) {
  const handler = () => listener();
  window.addEventListener("storage", handler);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}