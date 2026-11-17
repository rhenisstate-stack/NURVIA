import { apiFetch } from "@/lib/api/api/api";
import { clearSystemUserSessionCookies } from "@/lib/utils/sessions/clearSystemUserSessionCookies";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

interface LogoutApiResponse {
  success?: boolean;
  redirect_to?: string;
  message?: string;
  error?: string;
}

//  @param targetDashboard - The dashboard to redirect after logout
//  @param fetchType - "distinct" = current session, "relative" = all sessions
export const dynamicLogoutService = async (
  targetDashboard: string,
  fetchType: "distinct" | "relative" = "distinct"
): Promise<LogoutApiResponse> => {
  let backendResponse: LogoutApiResponse = { success: false };

  try {
    // Call backend to destroy server session
    backendResponse = (await apiFetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        ...renderSystemSessionHeaders(),
      },
      body: JSON.stringify({
        targetDashboard, // SENT TO BACKEND
        fetchType,
      }),
    })) as LogoutApiResponse;

  } catch (err) {
    console.warn("Logout API Call Failed:", err);
    backendResponse = { success: false, redirect_to: "/signin", message: "Logout failed" };
  } finally {
    // Clear cookies and memory state (ALWAYS LAST)
    clearSystemUserSessionCookies();
  }

  // Return what backend actually responded (with redirect_to if present)
  return backendResponse;
};
