import { getNurviaCastoSessionHeaders } from "@/lib/lexmacasto/qlexSessionBridge";
// D:\Estupendo\FastAPI\skewblanc\frontend\src\app\api\strata\${STRATA_NAME}\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export interface DynamicStrataResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T; // Optional Payload for List Endpoints 📌
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Base Route Logic 📌
const STRATA_GROUP = "assessment";
const STRATA_NAME = "exams";
const TARGET_NAME = "results";
const BASE_ROUTE = `/api/castoline/strata/${STRATA_GROUP}/${STRATA_NAME}/${TARGET_NAME}`;

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Helper function to Forward Requests to  Backend ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
async function forwardToBackend(
  req: NextRequest,
  method: "POST" | "PUT" | "DELETE" | "GET",
  backendPath: string
): Promise<NextResponse> {
  try {
    let body: unknown = {};
    if (method !== "GET") {
      body = await req.json().catch(() => ({}));
    }

    const backendBaseUrl = getBackendBaseUrl();
    const queryParams = method === "GET" ? new URL(req.url).searchParams.toString() : "";
    const url = `${backendBaseUrl}${backendPath}${queryParams ? `?${queryParams}` : ""}`;

    console.log(`🌿 [${STRATA_NAME} Route] Forwarding ${method} To :`, url);
    if (method !== "GET") console.log("Request Body : ", JSON.stringify(body));

    //  EXTRACT SESSION HEADERS FIRST
    const castoLine = req.headers.get("x-casto-line");
    const castoBadge = req.headers.get("x-casto-badge");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(await getSiteHeaders()),
      ...(await getNurviaCastoSessionHeaders()),
    };

    if (castoLine) headers["x-casto-line"] = castoLine;
    if (castoBadge) headers["x-casto-badge"] = castoBadge;

    const backendResponse = await fetch(url, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(body) : undefined,
    });

    const responseBody: DynamicStrataResponse = await backendResponse.json().catch(() => ({
      error: "Failed to Parse Backend Response ⚓",
    }));

    // Normalize Backend Failures and Errors !
    if ('success' in responseBody && responseBody.success === false) {
      responseBody.error = responseBody.message ?? "Unknown Backend Error 🔖";
    }

    console.log("📌 Backend Response Body : ", responseBody);

    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : `Unknown ${method} error`;
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// DELETE ROUTE -> Remove / Destroy Record !
export async function DELETE(req: NextRequest) {
  return forwardToBackend(req, "DELETE", `${BASE_ROUTE}/delete`);
}

// ────────────────────────────────────────────────────────────────────────────────────
// GET ROUTE -> list [ Supports Filters / Pagination ]
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const fetchtype = params.get("fetchtype");
  const isDiy = params.get("isDiy") === "true";

  const prefix = isDiy ? "list/diy" : "list";

  if (
    fetchtype === "absolute" ||
    fetchtype === "relative" ||
    fetchtype === "current" ||
    fetchtype === "distinct"
  ) {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/${prefix}/${fetchtype}`);
  }

  if (fetchtype === "nominal" && !isDiy) {
    return forwardToBackend(req, "GET", `${BASE_ROUTE}/list/nominal`);
  }

  return NextResponse.json({ error: "Invalid Fetchtype" }, { status: 400 });
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
