import { plantKnowledge, type PlantCategory, type PlantKnowledgeEntry } from "./plantKnowledge";
import { backupPlantCatalog } from "./backupPlantCatalog";

const CATALOG_KEY = "al-qadri-plant-catalog-v1";
const REMOVED_KEY = "al-qadri-plant-catalog-removed-v1";
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
  categoryTags: [plant.categoryKey as PlantCategory],
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

function readRemoved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(REMOVED_KEY) || "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function getCatalog(): EditablePlant[] {
  const removed = readRemoved();
  const stored = readStored();
  if (!stored) return [...plantKnowledge, ...backupPlants].filter(item => !removed.has(item.id));
  const existing = new Set(stored.map(item => item.id));
  const backupById = new Map(backupPlants.map(item => [item.id, item]));
  const refreshed = stored.map(item => {
    const backup = backupById.get(item.id);
    return backup ? { ...item, imagePath: backup.imagePath, categoryTags: backup.categoryTags } : item;
  });
  return [...refreshed, ...backupPlants.filter(item => !existing.has(item.id) && !removed.has(item.id))].filter(item => !removed.has(item.id));
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
  const removed = readRemoved();
  removed.add(id);
  window.localStorage.setItem(REMOVED_KEY, JSON.stringify([...removed]));
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
  window.localStorage.removeItem(REMOVED_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}
