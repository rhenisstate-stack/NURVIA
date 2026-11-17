import { apiFetch } from "@/lib/api/api/api";

// Types for registration credentials
export type RegisterCredentials = {
  username: string;
  email: string;
  phone: string;
  password?: string;
  passwordConfirmation?: string;
  pin?: string;
  pin_confirmation?: string;
  loginMethod: "password" | "pin" | "both";
  agree: boolean;
  role?: string;
  dashboardName?: string;
  provider?: string; // email | google | apple | facebook | github | linkedin | microsoft
  providerPayload?: string; // token or code from OAuth provider
  challenge: string; 
};

// Expected response type from register
export interface RegisterResponse {
  redirect_url?: string;
  error?: string;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Register a new user

export const registerUser = async (data: RegisterCredentials): Promise<RegisterResponse> => {
  console.log("💡 [registerService] registerUser() called with data:", data);

  try {
    const result = await apiFetch<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
        pin: data.pin,
        pin_confirmation: data.pin_confirmation,
        loginMethod: data.loginMethod,
        agree: data.agree,
        challenge: data.challenge,
        role: data.role || "user",
        dashboardName: data.dashboardName || "web",
        provider: data.provider || "email",
        providerPayload: data.providerPayload || "Void",
      }),
    });

    console.log("💡 [registerService] Backend response:", result);
    return result;
  } catch (err: unknown) {
    console.error("❌ [registerService] registerUser() failed:", err);

    return { error: err instanceof Error ? err.message : "Unknown registration error" };
  }
};
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
