export function getRedirectPathForAuthState(
  status: "loading" | "authenticated" | "unauthenticated" | "error",
  user: any,
  pathname: string
): string | null {
  // Handle loading state - show redirect screen
  if (status === "loading") {
    return "/redirect";
  }
  
  // Handle authenticated state
  if (status === "authenticated" && user) {
    // If user is already on a protected page, redirect to appropriate dashboard
    if (pathname === "/sign-in" || pathname === "/sign-up") {
      return user.role === "Learner" ? "/learner" : "/admin";
    }
    
    // If user is on an access denied page, redirect appropriately
    if (pathname === "/access-denied") {
      return user.role === "Learner" ? "/learner" : "/admin";
    }
  }
  
  // Handle unauthenticated state
  if (status === "unauthenticated") {
    // Don't redirect to sign-in if already there
    if (pathname !== "/sign-in" && pathname !== "/sign-up") {
      return `/sign-in?returnTo=${encodeURIComponent(pathname)}`;
    }
  }
  
  return null;
}