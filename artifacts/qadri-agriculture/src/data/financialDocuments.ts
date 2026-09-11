export type DocumentType = "exportInvoice" | "receipt" | "disbursement";
export type PaymentMethod = "cash" | "check" | "transfer" | "online";
export type InvoiceRow = { item: string; weight: string; quantity: string; origin: string; notes: string; dinar: string; fils: string };
export type FinancialDocument = {
  id: string; type: DocumentType; number: string; date: string; institutionName: string; address: string;
  sourceName: string; facilityNumber: string; destination: string; totalDinar: string; totalFils: string;
  totalInWords: string; certificateText: string; exportPermissionText: string; stampUrl: string; rows: InvoiceRow[];
  namePrefix: string; personName: string; amount: string; amountText: string; description: string;
  paymentMethod: PaymentMethod; notes: string; createdAt: string; updatedAt: string;
};
const KEY = "al-qadri-financial-documents-v1";
const EVENT = "al-qadri-financial-documents-change";
const now = () => new Date().toISOString();
const id = () => `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const emptyDocument = (type: DocumentType): FinancialDocument => ({
  id: id(), type, number: type === "exportInvoice" ? `EXP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}` : `${type === "receipt" ? "REC" : "DIS"}-${Date.now().toString().slice(-5)}`,
  date: now().slice(0, 10), institutionName: "مؤسسة القادري الزراعية", address: "الأردن", sourceName: "", facilityNumber: "", destination: "", totalDinar: "0", totalFils: "000", totalInWords: "", certificateText: "", exportPermissionText: "", stampUrl: "/assets/qadri-stamp.png", rows: [{ item: "", weight: "", quantity: "", origin: "", notes: "", dinar: "0", fils: "000" }], namePrefix: "السيد", personName: "", amount: "0", amountText: "", description: "", paymentMethod: "cash", notes: "", createdAt: now(), updatedAt: now(),
});
export function getDocuments(): FinancialDocument[] { if (typeof window === "undefined") return []; try { const data = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(data) ? data : []; } catch { return []; } }
export function saveDocument(doc: FinancialDocument) { const list = getDocuments(); const next = { ...doc, updatedAt: now() }; const i = list.findIndex(item => item.id === doc.id); if (i >= 0) list[i] = next; else list.unshift(next); localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(EVENT)); return next; }
export function removeDocument(documentId: string) { localStorage.setItem(KEY, JSON.stringify(getDocuments().filter(item => item.id !== documentId))); window.dispatchEvent(new CustomEvent(EVENT)); }
export function subscribeToDocuments(listener: () => void) { const handler = () => listener(); window.addEventListener("storage", handler); window.addEventListener(EVENT, handler); return () => { window.removeEventListener("storage", handler); window.removeEventListener(EVENT, handler); }; }
export const documentTypeLabel = (type: DocumentType) => type === "exportInvoice" ? "فاتورة تصدير" : type === "receipt" ? "سند قبض" : "سند صرف";
