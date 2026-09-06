export type AuthUser = {
  id: number;
  username: string | null;
  phone: string | null;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
};

type AuthInput = Record<string, unknown>;

type AuthEnvelope = {
  result?: { data?: { json?: AuthUser | null | { success: boolean } } };
  error?: { json?: { message?: string; data?: { code?: string } } };
};

async function request(operation: string, input?: AuthInput) {
  const response = await fetch(`/api/auth/${operation}`, {
    method: operation === "me" ? "GET" : "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: operation === "me" ? undefined : JSON.stringify(input ?? {}),
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("تعذر الاتصال بخادم الحسابات. يرجى المحاولة مجددًا.");
  }

  const payload = (await response.json()) as AuthEnvelope[];
  const item = payload?.[0];
  if (!item) throw new Error("استجابة الحساب غير صالحة.");
  if (item.error) throw new Error(item.error.json?.message || "تعذر تنفيذ طلب الحساب.");
  return item.result?.data?.json ?? null;
}

export const authClient = {
  me: () => request("me") as Promise<AuthUser | null>,
  login: (input: { identifier: string; password: string; admin: boolean }) => request("login", input) as Promise<AuthUser>,
  register: (input: { name: string; phone: string; password: string }) => request("register", input) as Promise<AuthUser>,
  logout: () => request("logout"),
};
