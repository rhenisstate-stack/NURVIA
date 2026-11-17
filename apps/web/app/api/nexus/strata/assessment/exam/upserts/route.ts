import { getNurviaCastoSessionHeaders } from "@/lib/lexmacasto/qlexSessionBridge";
// src/app/api/nexus/strata/assessment/exam/upserts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export interface DynamicStrataResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

// ───────────────────────────────────────────────────────────────────────────────
// BASE ROUTE LOGIC
// ───────────────────────────────────────────────────────────────────────────────

const STRATA_GROUP = "assessment";
const STRATA_NAME = "exams";
const BASE_ROUTE = `/api/castoline/strata/${STRATA_GROUP}/${STRATA_NAME}`;

// ───────────────────────────────────────────────────────────────────────────────
// ACTION GROUP → BACKEND SEGMENT
// ───────────────────────────────────────────────────────────────────────────────

const ACTION_GROUP_TO_SEGMENT: Record<string, string> = {
  ExamAnswers: "user/answers",
  ExamActions: "actions",
  QuestionActions: "question/actions",
  ExamLifecycle: "lifecycle",
  ExamPreferences: "preferences",
};

// ───────────────────────────────────────────────────────────────────────────────
// FORWARD HELPER
// ───────────────────────────────────────────────────────────────────────────────

async function forwardToBackend(
  req: NextRequest,
  method: "POST" | "PUT" | "DELETE" | "GET",
  backendPath: string,
  body?: unknown
): Promise<NextResponse> {
  try {
    const backendBaseUrl = getBackendBaseUrl();
    const url = `${backendBaseUrl}${backendPath}`;

    console.log(`🌿 [exams/upserts Route] Forwarding ${method} To :`, url);
    console.log("Request Body : ", JSON.stringify(body));

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
      body: JSON.stringify(body),
    });

    const responseBody: DynamicStrataResponse =
      await backendResponse.json().catch(() => ({
        error: "Failed to Parse Backend Response ⚓",
      }));

    if ("success" in responseBody && responseBody.success === false) {
      responseBody.error = responseBody.message ?? "Unknown Backend Error 🔖";
    }

    console.log("📌 Backend Response Body : ", responseBody);

    return NextResponse.json(responseBody, {
      status: backendResponse.status,
    });

  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Unknown upsert error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// POST  →  /api/nexus/strata/assessment/exam/upserts
// ───────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));

    const { actionGroup, isDiy } = body as {
      actionGroup?: string;
      isDiy?: boolean;
      [key: string]: unknown;
    };

    if (!actionGroup) {
      return NextResponse.json(
        { error: "Missing actionGroup in request body" },
        { status: 400 }
      );
    }

    const segment = ACTION_GROUP_TO_SEGMENT[actionGroup];

    if (!segment) {
      return NextResponse.json(
        { error: `Unknown actionGroup: ${actionGroup}` },
        { status: 400 }
      );
    }

    // DIY exams have no preferences endpoint on the backend, so acknowledge and skip
    if (isDiy && actionGroup === "ExamPreferences") {
      return NextResponse.json({ message: "DIY preferences not persisted ⚓" }, { status: 200 });
    }

    const backendPath = isDiy
      ? `${BASE_ROUTE}/upsert/diy/${segment}`
      : `${BASE_ROUTE}/upsert/${segment}`;
    return forwardToBackend(req, "POST", backendPath, body); // send everything as-is

  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Unknown POST error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────