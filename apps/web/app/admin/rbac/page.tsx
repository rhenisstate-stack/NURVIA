"use client";

import React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nurviaApi } from "@/lib/api-client";
import { Lock, ShieldCheck, Search, RefreshCw } from "lucide-react";

interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
}

const STANDARD_ASSIGNABLE_ROLES = ["Learner", "Author", "Reviewer", "Publisher", "Administrator"];
const ALL_ROLES = [...STANDARD_ASSIGNABLE_ROLES, "Superadmin"];

const ROLE_POLICIES = [
  {
    name: "Superadmin",
    description: "Unrestricted platform governance, role assignment including Superadmin, and system audit access.",
    permissions: ["All Permissions", "Assign Superadmin", "Manage Administrators", "System Audit"],
  },
  {
    name: "Administrator",
    description: "Manages operational users, standard roles, content governance, and audit log review.",
    permissions: ["List Users", "Assign Standard Roles", "View Audit Logs", "Publish Content"],
  },
  {
    name: "Publisher",
    description: "Releases approved questions and exams to learners under ReviewReleasePolicy.",
    permissions: ["Publish Approved Content", "Manage Exams", "View Reviews"],
  },
  {
    name: "Reviewer",
    description: "Conducts clinical accuracy and editorial peer reviews on pending items.",
    permissions: ["Review Pending Items", "Approve / Request Changes", "View Drafts"],
  },
  {
    name: "Author",
    description: "Authors NGN questions, rationales, and exam drafts.",
    permissions: ["Create Questions", "Edit Own Drafts", "Submit for Review"],
  },
  {
    name: "Learner",
    description: "Accesses published exams, study library, performance analytics, and practice tools.",
    permissions: ["Take Published Exams", "Review Attempts", "Use Study Tools"],
  },
];

export default function AdminRbacPage() {
  const { user: currentUser } = useAuth();
  const isSuperadmin = currentUser?.role === "Superadmin";
  const assignableRoles = isSuperadmin ? ALL_ROLES : STANDARD_ASSIGNABLE_ROLES;

  const [search, setSearch] = React.useState("");
  const [pageNumber, setPageNumber] = React.useState(1);
  const pageSize = 15;

  const [users, setUsers] = React.useState<UserSummary[]>([]);
  const [pendingRoles, setPendingRoles] = React.useState<Record<string, string>>({});
  const [totalCount, setTotalCount] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [hasPreviousPage, setHasPreviousPage] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [savingUserId, setSavingUserId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async (page: number, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await nurviaApi.getUsers({
        pageNumber: page,
        pageSize,
        search: query.trim() || undefined,
      });

      if (!response.success || !response.data) {
        setError(response.message || "Unable to load users. Administrator or Superadmin access is required.");
        setUsers([]);
        setTotalCount(0);
        return;
      }

      const loaded = response.data.items ?? [];
      setUsers(loaded);
      setPendingRoles(
        loaded.reduce<Record<string, string>>((acc, item) => {
          acc[item.id] = item.role;
          return acc;
        }, {})
      );
      setTotalCount(response.data.totalCount ?? 0);
      setTotalPages(Math.max(1, response.data.totalPages ?? 1));
      setHasNextPage(Boolean(response.data.hasNextPage));
      setHasPreviousPage(Boolean(response.data.hasPreviousPage));
    } catch {
      setError("Failed to connect to the user directory service.");
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadUsers(pageNumber, search);
  }, [loadUsers, pageNumber, search]);

  const handleAssignRole = async (target: UserSummary) => {
    const selectedRole = pendingRoles[target.id] ?? target.role;
    if (selectedRole === target.role) return;

    setSavingUserId(target.id);
    setError(null);
    setStatusMessage(null);
    try {
      const response = await nurviaApi.assignRole({
        targetUserId: target.id,
        role: selectedRole,
      });

      if (!response.success) {
        setError(response.message || "Role assignment was rejected by policy.");
        return;
      }

      setStatusMessage(`Updated ${target.email} to role '${selectedRole}'.`);
      await loadUsers(pageNumber, search);
    } catch {
      setError("Unable to update user role. Please try again.");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-teal/15 dark:text-brand-teal">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
                Roles &amp; Access Control (RBAC)
              </h1>
              <p className="text-sm text-foreground-secondary">
                Manage persisted user account roles enforced by RoleAssignmentPolicy and database-backed authorization.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 self-start sm:self-center"
            onClick={() => void loadUsers(pageNumber, search)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-muted/30">
            <div>
              <h2 className="text-sm font-bold text-foreground">User Role Directory</h2>
              <p className="text-xs text-foreground-secondary">
                {isSuperadmin
                  ? "Signed in as Superadmin: all role transitions are available."
                  : "Signed in as Administrator: Superadmin assignment is restricted to Superadmin."}
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNumber(1);
                }}
                placeholder="Search by name, email, or role..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>
          </div>

          {statusMessage && (
            <div role="status" className="px-4 py-3 border-b border-border bg-emerald-50/70 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              {statusMessage}
            </div>
          )}

          {error && (
            <div role="alert" className="px-4 py-3 border-b border-border bg-rose-50/70 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-6 text-sm text-foreground-secondary">Loading user accounts...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-sm text-foreground-secondary">No matching user accounts found.</div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((account) => {
                const selectedRole = pendingRoles[account.id] ?? account.role;
                const isTargetSuperadmin = account.role === "Superadmin";
                const canEditTarget = isSuperadmin || !isTargetSuperadmin;
                const hasChanged = selectedRole !== account.role;

                return (
                  <div
                    key={account.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{account.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {account.role}
                        </Badge>
                        {!account.isActive && (
                          <Badge variant="warning" className="text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-foreground-secondary">{account.email}</p>
                      <p className="text-[11px] text-foreground-muted">
                        Joined {new Date(account.createdAtUtc).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Role for ${account.email}`}
                        value={selectedRole}
                        disabled={!canEditTarget || savingUserId === account.id}
                        onChange={(e) =>
                          setPendingRoles((prev) => ({ ...prev, [account.id]: e.target.value }))
                        }
                        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-teal disabled:opacity-60"
                      >
                        {!assignableRoles.includes(account.role) && (
                          <option value={account.role}>{account.role}</option>
                        )}
                        {assignableRoles.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleOption}
                          </option>
                        ))}
                      </select>

                      <Button
                        size="sm"
                        disabled={!canEditTarget || !hasChanged || savingUserId === account.id}
                        isLoading={savingUserId === account.id}
                        onClick={() => void handleAssignRole(account)}
                      >
                        Save Role
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-foreground-secondary bg-surface-muted/20">
            <span>
              Page {pageNumber} of {totalPages} ({totalCount} users)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || !hasPreviousPage}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loading || !hasNextPage}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLE_POLICIES.map((role) => (
            <Card key={role.name} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-foreground">{role.name}</span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Policy Reference
                  </span>
                </div>
                <p className="text-xs text-foreground-secondary leading-relaxed">{role.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-muted border border-border text-foreground-secondary"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
