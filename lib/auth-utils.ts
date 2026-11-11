export function getSafeReturnToUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    
    // Only allow relative paths
    if (parsedUrl.origin !== window.location.origin) {
      return null;
    }
    
    // Block dangerous paths
    const blockedPaths = ['/sign-in', '/sign-up', '/access-denied'];
    if (blockedPaths.includes(parsedUrl.pathname)) {
      return null;
    }
    
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return null;
  }
}

export function getDefaultRedirectPath(role: string): string {
  switch (role) {
    case 'Learner':
      return '/learner';
    case 'Superadmin':
      return '/learner'; // Superadmin defaults to learner view
    case 'Author':
    case 'Reviewer':
    case 'Publisher':
    case 'Administrator':
      return '/admin';
    default:
      return '/access-denied';
  }
}