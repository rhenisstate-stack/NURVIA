// src\lib\services\auth\validateService.ts
import { apiFetch } from "@/lib/api/api/api";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

export interface ResolvedValidation {
  email: string;
  userGuidId: string;
  context: string;
}

interface Envelope {
  success?: boolean;
  message?: string;
  error?: string;
  data?: ResolvedValidation;
}

function readError(err: unknown): string {
  if (err instanceof Error) {
    try {
      const p = JSON.parse(err.message);
      return p?.error ?? p?.message ?? p?.title ?? err.message;
    } catch {
      return err.message;
    }
  }
  return "Something went wrong. Please try again.";
}

// Checks a link (userGuidId + token) or a typed code (email + token) WITHOUT consuming it
export async function resolveValidation(p: {
  context: string;
  token: string;
  userGuidId?: string;
  email?: string;
}): Promise<{ data?: ResolvedValidation; error?: string }> {
  try {
    const qs = new URLSearchParams();
    qs.set("context", p.context);
    qs.set("token", p.token.trim());
    if (p.userGuidId) qs.set("userGuidId", p.userGuidId);
    if (p.email) qs.set("email", p.email.trim());

    const res = await apiFetch<Envelope>(`/api/auth/validate?${qs.toString()}`, {
      method: "GET",
      headers: { ...renderSystemSessionHeaders() },
      credentials: "include",
    });

    if (res?.error || res?.success === false || !res?.data)
      return { error: res?.error ?? res?.message ?? "This link or code is invalid or has expired." };

    return { data: res.data };
  } catch (err: unknown) {
    return { error: readError(err) };
  }
}