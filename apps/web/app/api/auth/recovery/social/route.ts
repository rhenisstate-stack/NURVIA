import { getNurviaCastoSessionHeaders } from "@/lib/lexmacasto/qlexSessionBridge";
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api"; // helper function to get backend URL
import { getSiteHeaders } from "@/lib/config/siteHeaders";

// Type definitions for incoming social account recovery request
export type SocialRecoveryRequest =
  | {
    step: "request";
    email: string;
    context: "social";
  }
  | {
    step: "verify";
    email: string;
    code: string;
    context: "social";
  }
  | {
    step: "reset";
    email: string;
    code: string;
    context: "social";
    loginMethod: "password" | "pin" | "both";
    password?: string;
    passwordConfirmation?: string;
    pin?: string;
    pinConfirmation?: string;
  };

// Expected backend response type
export interface RecoveryResponse {
  redirect_url?: string;
  error?: string;
  message?: string;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Parse incoming request body
    const body: SocialRecoveryRequest = await req.json();

    // Build full backend URL for social recovery endpoint - defined at backend\app\routers.py plus the prefix in main.py
    const backendBaseUrl = getBackendBaseUrl(); // e.g., "http://127.0.0.1:8000"
    const backendUrl = `${backendBaseUrl}/api/castoline/auth/recovery/social`;

    // Log the request URL and body for debugging
    console.log("💡 [recovery/social route] Forwarding POST request to:", backendUrl);
    console.log("💡 [recovery/social route] Request body:", JSON.stringify(body));

    // Forward request to the actual backend
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getSiteHeaders()),
        ...(await getNurviaCastoSessionHeaders()),
      },
      body: JSON.stringify(body),
    });

    // Log the backend response status and body for debugging
    console.log("💡 [recovery/social route] Backend response status:", backendResponse.status);
    const responseBody = await backendResponse.json().catch(() => ({
      error: "Failed to Parse Backend Response ⚓",
    }));

    console.log("📌 [recovery/social route] Backend response body:", responseBody);

    // Return data to frontend
    return NextResponse.json(responseBody, { status: backendResponse.status });

  } catch (err: unknown) {
    console.error("❌ [recovery/social route] Social recovery API route error:", err);
    const message = err instanceof Error ? err.message : "Social recovery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────