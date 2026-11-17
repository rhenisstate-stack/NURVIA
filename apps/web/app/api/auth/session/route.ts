import { getNurviaCastoSessionHeaders } from "@/lib/lexmacasto/qlexSessionBridge";
import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export async function GET(request: Request) {
  try {
    const backendBaseUrl = getBackendBaseUrl();
    const backendUrl = `${backendBaseUrl}/api/castoline/auth/system/user`;

    //  EXTRACT SESSION HEADERS FIRST
    const castoLine = request.headers.get("x-casto-line");
    const castoBadge = request.headers.get("x-casto-badge");

    console.log("➡️ Forwarding Session Headers :", {
      castoLine,
      castoBadge,
    });

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        ...(await getSiteHeaders()),
        ...(await getNurviaCastoSessionHeaders()),
        ...(castoLine ? { "x-casto-line": castoLine } : {}),
        ...(castoBadge ? { "x-casto-badge": castoBadge } : {}),
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { logged_in: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("➡️ Session Route Error :", error);
    return NextResponse.json({ logged_in: false }, { status: 500 });
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────




// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
