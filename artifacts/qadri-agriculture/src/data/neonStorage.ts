export type NeonStoredValue = { value: unknown; updatedAt?: string } | null;

async function request(input: Record<string, unknown>) {
  const response = await fetch("/api/trpc/storage?format=rest&operation=storage", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ json: input }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.error || data?.[0]?.error) throw new Error(data?.error || "تعذر الاتصال بقاعدة البيانات");
  return data?.user ?? data?.[0]?.result?.data?.json ?? data;
}

export function getNeonValue<T>(key: string): Promise<T | null> {
  return request({ action: "get", key }).then((result: NeonStoredValue) => result?.value as T ?? null);
}

export function setNeonValue<T>(key: string, value: T) {
  return request({ action: "set", key, value });
}

export function deleteNeonValue(key: string) {
  return request({ action: "delete", key });
}

export function listNeonValues() {
  return request({ action: "list" }) as Promise<Array<{ key: string; value: unknown; updatedAt?: string }>>;
}
