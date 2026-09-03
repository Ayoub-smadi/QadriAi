import { categoryLabels, plantKnowledge, type PlantKnowledgeEntry } from "@/data/plantKnowledge";

export type QuoteFulfillment = "pickup" | "delivery";
export type QuoteStatus = "pending" | "priced" | "saved";
export type QuoteColumnKey = "number" | "name" | "description" | "category" | "quantity" | "price" | "total" | "image";

export type QuoteItem = {
  id: string;
  plantId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  categoryAr: string;
  categoryEn: string;
  quantity: number;
  size: string;
  price: number;
  imagePath: string;
};

export type QuoteRecord = {
  id: string;
  quoteNumber: string;
  kind: "request" | "quote";
  status: QuoteStatus;
  customerName: string;
  phone: string;
  fulfillment: QuoteFulfillment;
  deliveryRegion: string;
  deliveryAddress: string;
  notes: string;
  title: string;
  footerText: string;
  shippingFee: number;
  items: QuoteItem[];
  visibleColumns: Record<QuoteColumnKey, boolean>;
  columnLabels: Record<QuoteColumnKey, string>;
  createdAt: string;
  updatedAt: string;
};

export type QuoteDraft = { items: QuoteItem[] };

const RECORDS_KEY = "al-qadri-quote-records";
const DRAFT_KEY = "al-qadri-quote-draft";
const CHANGE_EVENT = "al-qadri-quote-records-change";

export const quoteColumnLabels = {
  number: "#",
  name: "الاسم",
  description: "الوصف",
  category: "القسم",
  quantity: "الكمية",
  price: "السعر",
  total: "الإجمالي",
  image: "الصورة",
} satisfies Record<QuoteColumnKey, string>;

export const defaultVisibleColumns: Record<QuoteColumnKey, boolean> = {
  number: true,
  name: true,
  description: true,
  category: true,
  quantity: true,
  price: true,
  total: true,
  image: true,
};

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function itemFromPlant(plant: PlantKnowledgeEntry, quantity = 1, size = ""): QuoteItem {
  const categoriesAr = plant.categoryTags.map(category => categoryLabels[category].ar).join("، ");
  const categoriesEn = plant.categoryTags.map(category => categoryLabels[category].en).join(", ");
  return {
    id: makeId("item"),
    plantId: plant.id,
    nameAr: plant.nameAr,
    nameEn: plant.nameEn,
    descriptionAr: plant.description.ar,
    descriptionEn: plant.description.en,
    categoryAr: categoriesAr,
    categoryEn: categoriesEn,
    quantity,
    size,
    price: 0,
    imagePath: plant.imagePath,
  };
}

export function findPlant(plantId: string) {
  return plantKnowledge.find(plant => plant.id === plantId);
}

export function createEmptyQuote(items: QuoteItem[] = [itemFromPlant(plantKnowledge[0])]): QuoteRecord {
  const now = new Date().toISOString();
  return {
    id: makeId("quote"),
    quoteNumber: `Q-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    kind: "quote",
    status: "pending",
    customerName: "",
    phone: "",
    fulfillment: "pickup",
    deliveryRegion: "",
    deliveryAddress: "",
    notes: "",
    title: "عرض سعر نباتات",
    footerText: "شكرًا لاختياركم القادري الزراعي.",
    shippingFee: 0,
    items,
    visibleColumns: { ...defaultVisibleColumns },
    columnLabels: { ...quoteColumnLabels },
    createdAt: now,
    updatedAt: now,
  };
}

export function getRecords(): QuoteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECORDS_KEY);
    const records = raw ? JSON.parse(raw) : [];
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: QuoteRecord) {
  const records = getRecords();
  const next = { ...record, updatedAt: new Date().toISOString() };
  const index = records.findIndex(item => item.id === record.id);
  if (index >= 0) records[index] = next;
  else records.unshift(next);
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  return next;
}

export function removeRecord(id: string) {
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(getRecords().filter(record => record.id !== id)));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function saveDraft(draft: QuoteDraft) {
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function readDraft(): QuoteDraft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  window.sessionStorage.removeItem(DRAFT_KEY);
}

export function createRequest(input: Omit<QuoteRecord, "id" | "quoteNumber" | "kind" | "status" | "createdAt" | "updatedAt">) {
  return saveRecord({
    ...input,
    id: makeId("request"),
    quoteNumber: `R-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    kind: "request",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export function getTotals(record: Pick<QuoteRecord, "items" | "shippingFee">) {
  const subtotal = record.items.reduce((sum, item) => sum + Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.price) || 0), 0);
  const shipping = Math.max(0, Number(record.shippingFee) || 0);
  return { subtotal, shipping, total: subtotal + shipping };
}

export function subscribeToRecords(listener: () => void) {
  const onChange = () => listener();
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}