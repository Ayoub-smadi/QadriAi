import { getCatalog, type EditablePlant } from "./plantCatalog";

export type DailyPlant = {
  id: string;
  image: string;
  ar: { name: string; scientific: string; summary: string; habitat: string; origin: string; growing: string; care: string };
  en: { name: string; scientific: string; summary: string; habitat: string; origin: string; growing: string; care: string };
};

function toDailyPlant(plant: EditablePlant): DailyPlant {
  const countriesAr = plant.supportedCountries?.length ? plant.supportedCountries.join("، ") : "الأردن والمنطقة العربية";
  const countriesEn = plant.supportedCountries?.length ? plant.supportedCountries.join(", ") : "Jordan and the region";
  const categoriesAr = plant.categoryTags?.join("، ") || "نباتات زراعية متنوعة";
  const categoriesEn = plant.categoryTags?.join(", ") || "Mixed agricultural plants";
  return {
    id: plant.id,
    image: plant.imagePath || "/assets/olive.jpg",
    ar: { name: plant.nameAr, scientific: plant.scientificName || "غير محدد في الكتالوج", summary: plant.description.ar, habitat: `يناسب المناطق المسجلة في الكتالوج: ${countriesAr}.`, origin: `مصنّف ضمن فئة ${categoriesAr} في قاعدة القادري.`, growing: plant.plantingGuidance.ar, care: plant.careGuidance.ar },
    en: { name: plant.nameEn, scientific: plant.scientificName || "Not listed in the catalog", summary: plant.description.en, habitat: `Suitable for the catalogued regions: ${countriesEn}.`, origin: `Classified under ${categoriesEn} in the Al-Qadri knowledge base.`, growing: plant.plantingGuidance.en, care: plant.careGuidance.en },
  };
}

export function getDailyPlant() {
  const catalog = getCatalog().filter(plant => plant.nameAr && plant.imagePath);
  const fallback = catalog[0];
  if (!fallback) throw new Error("لا توجد نباتات في الكتالوج");
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return toDailyPlant(catalog[day % catalog.length]);
}
