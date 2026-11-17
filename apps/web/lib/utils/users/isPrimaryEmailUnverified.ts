type EmailLike = { isPrimary?: boolean; isVerified?: boolean };

export function isPrimaryEmailUnverified(
  user?: { emails?: EmailLike[] | null } | null
): boolean {
  if (!user) return false; // not logged in -> nothing to verify
  const primary = user.emails?.find((e) => e.isPrimary);
  return !!primary && primary.isVerified === false;
}