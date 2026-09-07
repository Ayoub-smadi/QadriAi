import type { QuoteRecord } from "@/data/quoteStore";

function unwrap<T>(payload: any): T {
  const value = Array.isArray(payload) ? payload[0] : payload;
  if (value?.error) throw new Error(value.error.json?.message || value.error.message || "تعذر تنفيذ الطلب.");
  return value?.result?.data?.json ?? value?.result?.data ?? value;
}

async function call<T>(input: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/trpc/quotes", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ json: input }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error("تعذر الاتصال بالخادم.");
  return unwrap<T>(payload);
}

export const quoteApi = {
  create(payload: QuoteRecord) {
    return call<any>({ action: "create", payload });
  },
  mine() {
    return call<any[]>({ action: "mine" });
  },
  adminList() {
    return call<any[]>({ action: "list" });
  },
  update(id: string, payload: QuoteRecord) {
    return call<any>({ action: "update", id, status: payload.status, payload });
  },
  remove(id: string) {
    return call<{ success: boolean }>({ action: "delete", id });
  },
};

export function serverRowToQuoteRecord(row: any): QuoteRecord {
  const payload = row?.payload && typeof row.payload === "object" ? row.payload : {};
  return {
    ...payload,
    id: String(row.id),
    quoteNumber: row.quoteNumber || payload.quoteNumber,
    status: row.status || payload.status || "pending",
    createdAt: row.createdAt || payload.createdAt,
    updatedAt: row.updatedAt || payload.updatedAt,
    customerName: payload.customerName || row.userName || "",
    phone: payload.phone || row.userPhone || "",
    kind: payload.kind || "request",
  } as QuoteRecord;
}

export async function createRemoteQuote(record: QuoteRecord) {
  return serverRowToQuoteRecord(await quoteApi.create(record));
}

export async function fetchRemoteQuotes(scope: "mine" | "admin") {
  const rows = scope === "admin" ? await quoteApi.adminList() : await quoteApi.mine();
  return rows.map(serverRowToQuoteRecord);
}

export async function updateRemoteQuote(record: QuoteRecord) {
  return serverRowToQuoteRecord(await quoteApi.update(record.id, record));
}

export async function deleteRemoteQuote(id: string) {
  await quoteApi.remove(id);
}
