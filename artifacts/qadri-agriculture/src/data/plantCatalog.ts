import { plantKnowledge, type PlantKnowledgeEntry } from "./plantKnowledge";
import { backupPlantCatalog } from "./backupPlantCatalog";

const CATALOG_KEY = "al-qadri-plant-catalog-v1";
const CHANGE_EVENT = "al-qadri-plant-catalog-change";

export type EditablePlant = PlantKnowledgeEntry;

const backupPlants: EditablePlant[] = backupPlantCatalog.map((plant, index) => ({
  ...plantKnowledge[index % plantKnowledge.length],
  id: plant.id,
  nameAr: plant.nameAr,
  nameEn: plant.nameEn,
  scientificName: plant.scientificName,
  imagePath: plant.imagePath,
  description: { ar: plant.descriptionAr, en: plant.descriptionEn },
  categoryTags: ["ornamental"],
}));

function readStored(): EditablePlant[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CATALOG_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
}

export function getCatalog(): EditablePlant[] {
  const stored = readStored();
  if (!stored) return [...plantKnowledge, ...backupPlants];
  const existing = new Set(stored.map(item => item.id));
  return [...stored, ...backupPlants.filter(item => !existing.has(item.id))];
}

export function saveCatalog(items: EditablePlant[]) {
  window.localStorage.setItem(CATALOG_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function updateCatalogPlant(id: string, patch: Partial<EditablePlant>) {
  saveCatalog(getCatalog().map(item => item.id === id ? { ...item, ...patch } : item));
}

export function addCatalogPlant(input: Pick<EditablePlant, "nameAr" | "nameEn" | "description" | "imagePath"> & Partial<EditablePlant>) {
  const now = Date.now();
  const base = getCatalog()[0] || plantKnowledge[0];
  const item: EditablePlant = {
    ...base,
    ...input,
    id: input.id || `plant-${now}`,
    scientificName: input.scientificName || "",
    categoryTags: input.categoryTags || ["ornamental"],
    supportedCountries: input.supportedCountries || base.supportedCountries,
    description: input.description || { ar: input.nameAr, en: input.nameEn },
    imagePath: input.imagePath || "/assets/olive.jpg",
  };
  saveCatalog([...getCatalog(), item]);
  return item;
}

export function removeCatalogPlant(id: string) {
  saveCatalog(getCatalog().filter(item => item.id !== id));
}

export function subscribeToCatalog(listener: () => void) {
  const handler = () => listener();
  window.addEventListener("storage", handler);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}

export function resetCatalog() {
  window.localStorage.removeItem(CATALOG_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}
