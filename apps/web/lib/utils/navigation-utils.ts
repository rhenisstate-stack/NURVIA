/**
 * Navigation utilities for NURVIA application
 */

import { isValidRedirectUrl } from './auth-utils';

/**
 * Safe navigation function
 */
export async function safeNavigate(url: string, options?: { replace?: boolean }): Promise<void> {
  // Validate the URL first
  if (!isValidRedirectUrl(url)) {
    console.warn(`Invalid redirect URL attempted: ${url}`);
    return;
  }
  
  // Navigate using Next.js router or window.location
  if (typeof window !== 'undefined') {
    if (options?.replace) {
      window.location.replace(url);
    } else {
      window.location.href = url;
    }
  }
}

/**
 * Get login redirect URL
 */
export function getLoginRedirectUrl(redirectUrl?: string): string {
  // If there's a valid redirect URL, use it
  if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
    return redirectUrl;
  }
  
  // Default to dashboard
  return '/';
}

/**
 * Get logout redirect URL
 */
export function getLogoutRedirectUrl(): string {
  return '/';
}

/**
 * Navigate to appropriate dashboard based on user role
 */
export function navigateToDashboard(userRole: string | null): string {
  if (!userRole) return '/';
  
  switch (userRole.toLowerCase()) {
    case 'superadmin':
      return '/superadmin/dashboard';
    case 'administrator':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    case 'reviewer':
      return '/reviewer/dashboard';
    case 'learner':
      return '/learner/dashboard';
    default:
      return '/';
  }
}

/**
 * Check if navigation to a route is allowed
 */
export function isNavigationAllowed(currentRole: string | null, targetRoute: string): boolean {
  if (!currentRole) return false;
  
  // Define role-based access control
  const roleAccess: Record<string, string[]> = {
    'Learner': ['/learner'],
    'Administrator': ['/admin'],
    'SuperAdmin': ['/superadmin', '/admin'],
    'Instructor': ['/instructor'],
    'Reviewer': ['/reviewer']
  };
  
  const allowedPaths = roleAccess[currentRole] || [];
  
  return allowedPaths.some(path => targetRoute.startsWith(path));
}