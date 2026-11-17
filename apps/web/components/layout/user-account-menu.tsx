"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { UserAvatar } from "@/components/shared/avatar/UserAvatar";

interface UserAccountMenuProps {
  avatarUrl: string | null;
}

export function UserAccountMenu({ avatarUrl }: UserAccountMenuProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const [signOutError, setSignOutError] = React.useState<string | null>(null);
  const menuId = React.useId();

  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const firstLinkRef = React.useRef<HTMLAnchorElement>(null);

  const isSuperadmin = user?.role === "Superadmin";
  const isLearner = user?.role === "Learner";
  const canUseLearnerAccount = isLearner || isSuperadmin;

  const canAccessAdmin = Boolean(
    user &&
      ["Author", "Reviewer", "Publisher", "Administrator", "Superadmin"].includes(
        user.role
      )
  );

  React.useEffect(() => {
    setOpen(false);
    setSignOutError(null);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        const items = Array.from(
          rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []
        );
        if (items.length === 0) return;
        event.preventDefault();

        const currentIndex = items.indexOf(document.activeElement as HTMLElement);
        if (event.key === "Home") {
          items[0]?.focus();
        } else if (event.key === "End") {
          items[items.length - 1]?.focus();
        } else if (event.key === "ArrowDown") {
          const next = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0;
          items[next]?.focus();
        } else {
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prev]?.focus();
        }
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    const frame = requestAnimationFrame(() => {
      if (firstLinkRef.current) {
        firstLinkRef.current.focus();
      } else {
        const firstItem = rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
        firstItem?.focus();
      }
    });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(frame);
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setSignOutError(null);
  };

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);
    setSignOutError(null);

    try {
      const response = await signOut();

      if (!response.success) {
        setSignOutError(
          response.message || "Unable to sign out. Please try again."
        );
        setSigningOut(false);
        return;
      }

      setOpen(false);
      router.replace("/");
    } catch {
      setSignOutError("Unable to sign out. Please try again.");
      setSigningOut(false);
    }
  };

  const linkClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          setSignOutError(null);
        }}
        className="flex items-center gap-2 rounded-full border border-border bg-background p-1.5 pr-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <UserAvatar name={user?.name} avatarUrl={avatarUrl} size="sm" />
        <span className="hidden max-w-36 truncate text-left text-xs font-semibold sm:block">
          {user?.name || "My Account"}
        </span>
        <ChevronDown
          size={15}
          className={`text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account options"
          className="absolute right-0 z-50 mt-3 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl"
        >
          <div className="border-b border-border bg-muted/40 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar name={user?.name} avatarUrl={avatarUrl} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.name || "Account"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
                <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1 p-2">
            {canUseLearnerAccount && (
              <>
                <Link
                  ref={firstLinkRef}
                  role="menuitem"
                  href="/learner/account"
                  onClick={closeMenu}
                  className={linkClass}
                >
                  <UserRound size={16} />
                  My Account
                </Link>

                <Link
                  role="menuitem"
                  href="/learner/profile"
                  onClick={closeMenu}
                  className={linkClass}
                >
                  <UserRound size={16} />
                  Profile
                </Link>

                <Link
                  role="menuitem"
                  href="/learner/settings"
                  onClick={closeMenu}
                  className={linkClass}
                >
                  <Settings size={16} />
                  Settings
                </Link>

                <Link
                  role="menuitem"
                  href="/learner/settings/security"
                  onClick={closeMenu}
                  className={linkClass}
                >
                  <ShieldCheck size={16} />
                  Security Settings
                </Link>
              </>
            )}

            {canAccessAdmin && (
              <Link
                ref={!canUseLearnerAccount ? firstLinkRef : undefined}
                role="menuitem"
                href="/admin"
                onClick={closeMenu}
                className={linkClass}
              >
                <LayoutDashboard size={16} />
                Admin Dashboard
              </Link>
            )}

            {isSuperadmin && (
              <Link
                role="menuitem"
                href="/learner"
                onClick={closeMenu}
                className={linkClass}
              >
                <LayoutDashboard size={16} />
                Learner Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-border p-2">
            {signOutError && (
              <p role="alert" className="px-3 py-2 text-xs text-destructive">
                {signOutError}
              </p>
            )}

            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={16} />
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
