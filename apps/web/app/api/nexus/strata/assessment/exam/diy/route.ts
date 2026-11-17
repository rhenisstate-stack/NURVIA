import { getNurviaCastoSessionHeaders } from "@/lib/lexmacasto/qlexSessionBridge";
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

const BACKEND_PATH = "/api/castoline/strata/assessment/exams/diy/learning/store";

// POST ROUTE -> Store a DIY Learning Exam
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = `${getBackendBaseUrl()}${BACKEND_PATH}`;

    console.log("🌿 [diy exams Route] Forwarding POST To :", url);
    console.log("Request Body : ", JSON.stringify(body));

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(await getSiteHeaders()),
      ...(await getNurviaCastoSessionHeaders()),
    };

    const castoLine = req.headers.get("x-casto-line");
    const castoBadge = req.headers.get("x-casto-badge");
    if (castoLine) headers["x-casto-line"] = castoLine;
    if (castoBadge) headers["x-casto-badge"] = castoBadge;

    const backendResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const responseBody = await backendResponse.json().catch(() => ({
      error: "Failed to Parse Backend Response ⚓",
    }));

    // Normalize backend failures (custom { success:false, message })
    if (responseBody && responseBody.success === false) {
      responseBody.error = responseBody.message ?? "Unknown Backend Error 🔖";
    }

    // Surface ASP.NET validation errors (400 ProblemDetails) as a readable error
    if (responseBody?.errors && !responseBody.error) {
      responseBody.error = Object.values(responseBody.errors as Record<string, string[]>)
        .flat()
        .join(" | ");
    }

    console.log("📌 Backend Response Body : ", responseBody);
    return NextResponse.json(responseBody, { status: backendResponse.status });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown POST error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}