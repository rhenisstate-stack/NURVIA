/**
 * Authentication utilities for NURVIA application
 */

import { AuthUserDto } from '@/lib/api-types';

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: AuthUserDto | null): boolean {
  return !!user && !!user.email;
}

/**
 * Check if user has a specific role.
 * Users carry a single role (AuthUserDto.role, sourced from the backend CurrentUser.Role).
 * Matching is case-insensitive to mirror the backend's OrdinalIgnoreCase comparison.
 * This is a UI convenience only; authorization is enforced by the API.
 */
export function hasRole(user: AuthUserDto | null, role: string): boolean {
  if (!user || !user.role) return false;
  return user.role.toLowerCase() === role.toLowerCase();
}

/**
 * Get the appropriate redirect URL after login
 */
export function getLoginRedirectUrl(user: AuthUserDto | null, defaultUrl: string = '/'): string {
  if (!user) return defaultUrl;
  
  // Determine the appropriate dashboard based on user roles
  if (hasRole(user, 'Superadmin')) {
    return '/admin/dashboard';
  } else if (hasRole(user, 'Administrator')) {
    return '/admin/dashboard';
  } else if (hasRole(user, 'Instructor')) {
    return '/instructor/dashboard';
  } else if (hasRole(user, 'Reviewer')) {
    return '/reviewer/dashboard';
  } else if (hasRole(user, 'Learner')) {
    return '/learner/dashboard';
  }
  
  // Default fallback
  return defaultUrl;
}

/**
 * Get the appropriate redirect URL after logout
 */
export function getLogoutRedirectUrl(): string {
  return '/';
}

/**
 * Check if a route is protected
 */
export function isProtectedRoute(path: string): boolean {
  // Define protected routes
  const protectedRoutes = [
    '/admin',
    '/learner',
    '/instructor',
    '/reviewer',
    '/superadmin'
  ];
  
  return protectedRoutes.some(route => path.startsWith(route));
}

/**
 * Validate redirect URL (prevent open redirects)
 */
export function isValidRedirectUrl(url: string): boolean {
  // Allow relative URLs
  if (url.startsWith('/')) {
    return true;
  }
  
  // Allow URLs from the same origin
  try {
    const urlObj = new URL(url);
    return urlObj.origin === window.location.origin;
  } catch {
    // If URL parsing fails, assume it's not valid
    return false;
  }
}