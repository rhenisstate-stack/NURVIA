"use client";

import React from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { nurviaApi } from "@/lib/api-client";
import { ShieldAlert, Search, Download, User, RefreshCw } from "lucide-react";

interface AuditLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  changesSummary: string;
  timestampUtc: string;
}

const ENTITY_TYPES = ["All", "UserAccount", "Question", "Exam"];

export default function AdminAuditPage() {
  const [search, setSearch] = React.useState("");
  const [entityType, setEntityType] = React.useState("All");
  const [pageNumber, setPageNumber] = React.useState(1);
  const pageSize = 20;

  const [items, setItems] = React.useState<AuditLogItem[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [hasPreviousPage, setHasPreviousPage] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadAuditLogs = React.useCallback(async (page: number, typeFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await nurviaApi.getAuditLogs({
        pageNumber: page,
        pageSize,
        entityType: typeFilter === "All" ? undefined : typeFilter,
      });

      if (!response.success || !response.data) {
        setError(response.message || "Unable to load audit logs from the backend.");
        setItems([]);
        setTotalCount(0);
        return;
      }

      setItems(response.data.items ?? []);
      setTotalCount(response.data.totalCount ?? 0);
      setTotalPages(Math.max(1, response.data.totalPages ?? 1));
      setHasNextPage(Boolean(response.data.hasNextPage));
      setHasPreviousPage(Boolean(response.data.hasPreviousPage));
    } catch {
      setError("Failed to connect to the audit log service.");
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAuditLogs(pageNumber, entityType);
  }, [loadAuditLogs, pageNumber, entityType]);

  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.action.toLowerCase().includes(q) ||
        item.entityType.toLowerCase().includes(q) ||
        item.entityId.toLowerCase().includes(q) ||
        item.actorName.toLowerCase().includes(q) ||
        item.actorRole.toLowerCase().includes(q) ||
        item.changesSummary.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleExportCsv = () => {
    if (filteredItems.length === 0) return;
    const escape = (val: string) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const header = ["TimestampUtc", "Action", "EntityType", "EntityId", "ActorName", "ActorRole", "ChangesSummary"].join(",");
    const rows = filteredItems.map((e) =>
      [e.timestampUtc, e.action, e.entityType, e.entityId, e.actorName, e.actorRole, e.changesSummary]
        .map(escape)
        .join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nurvia-audit-logs-page-${pageNumber}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
                System Audit &amp; Security Logs
              </h1>
              <p className="text-sm text-foreground-secondary">
                Persisted chronological trail of content editorial actions, security changes, and role assignments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void loadAuditLogs(pageNumber, entityType)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExportCsv}
              disabled={filteredItems.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-muted/30">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter loaded audit records..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="audit-entity-filter" className="text-xs font-medium text-foreground-secondary">
                Entity:
              </label>
              <select
                id="audit-entity-filter"
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value);
                  setPageNumber(1);
                }}
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-teal"
              >
                {ENTITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div role="alert" className="p-6 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          ) : loading ? (
            <div className="p-6 text-sm text-foreground-secondary">Loading audit records...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-6 text-sm text-foreground-secondary">
              No audit log entries found for the selected filter.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredItems.map((event) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-surface-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {event.action}
                      </Badge>
                      <span className="font-semibold text-foreground">
                        {event.entityType}
                        {event.entityId ? ` (${event.entityId})` : ""}
                      </span>
                    </div>
                    {event.changesSummary && (
                      <p className="text-foreground-secondary">{event.changesSummary}</p>
                    )}
                    <div className="text-foreground-secondary text-[11px] flex items-center gap-2">
                      <User className="w-3 h-3 text-foreground-muted" />
                      <span>{event.actorName || event.actorId}</span>
                      {event.actorRole && (
                        <>
                          <span>•</span>
                          <span>{event.actorRole}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:self-center">
                    <span className="text-foreground-muted font-mono text-[11px]">
                      {new Date(event.timestampUtc).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-foreground-secondary bg-surface-muted/20">
            <span>
              Page {pageNumber} of {totalPages} ({totalCount} total records)
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
      </div>
    </AdminShell>
  );
}
