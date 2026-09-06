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

type RestResponse = { user?: AuthUser | null | { success: boolean }; error?: string; code?: string };

function readableError(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const item = value as { message?: unknown; json?: { message?: unknown } };
    if (typeof item.message === "string" && item.message.trim()) return item.message;
    if (typeof item.json?.message === "string" && item.json.message.trim()) return item.json.message;
  }
  return "تعذر تنفيذ طلب الحساب حاليًا.";
}

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

  const payload = await response.json() as AuthEnvelope[] | RestResponse;
  if (!Array.isArray(payload)) {
    if (payload.error) throw new Error(readableError(payload.error));
    if (Object.prototype.hasOwnProperty.call(payload, "user")) return payload.user ?? null;
    throw new Error("استجابة الحساب غير صالحة.");
  }
  const item = payload[0];
  if (!item) throw new Error("استجابة الحساب غير صالحة.");
  if (item.error) throw new Error(readableError(item.error));
  return item.result?.data?.json ?? null;
}

export const authClient = {
  me: () => request("me") as Promise<AuthUser | null>,
  login: (input: { identifier: string; password: string; admin: boolean }) => request("login", input) as Promise<AuthUser>,
  register: (input: { name: string; phone: string; password: string }) => request("register", input) as Promise<AuthUser>,
  logout: () => request("logout"),
};
