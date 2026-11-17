"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nurviaApi } from "@/lib/api-client";
import { Bell, CheckCircle2, Mail, Send } from "lucide-react";

interface SupportMessageItem {
  id: string | number;
  subject?: string;
  title?: string;
  message?: string;
  body?: string;
  clientReadStatus?: string;
  createdAt?: string;
  createdAtUtc?: string;
}

function extractMessages(raw: unknown): SupportMessageItem[] {
  if (!raw || typeof raw !== "object") return [];
  const rec = raw as Record<string, unknown>;
  const list = Array.isArray(rec.items)
    ? rec.items
    : Array.isArray(rec.data)
      ? rec.data
      : Array.isArray(raw)
        ? raw
        : [];
  return list.filter((item): item is SupportMessageItem => Boolean(item && typeof item === "object"));
}

export default function LearnerNotificationsPage() {
  const [messages, setMessages] = React.useState<SupportMessageItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sendNotice, setSendNotice] = React.useState<string | null>(null);

  const loadMessages = React.useCallback(async (filter?: string) => {
    setLoading(true);
    setError(null);
    const res = await nurviaApi.getSupportMessages({
      fetchtype: "relative",
      status: filter || undefined,
      perPage: 20,
    });
    if (res.success) {
      setMessages(extractMessages(res.data));
    } else {
      setError(res.message || "Unable to load notifications and support messages from the server.");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void loadMessages(statusFilter);
  }, [loadMessages, statusFilter]);

  const handleMarkRead = async (id: string | number) => {
    const res = await nurviaApi.updateSupportMessageStatus({
      id,
      clientReadStatus: "Read",
    });
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, clientReadStatus: "Read" } : m))
      );
    }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setSendNotice(null);
    setError(null);
    const res = await nurviaApi.sendSupportMessage({
      subject: subject.trim(),
      message: body.trim(),
    });
    if (res.success) {
      setSendNotice("Support message sent.");
      setSubject("");
      setBody("");
      await loadMessages(statusFilter);
    } else {
      setError(res.message || "Unable to send support message.");
    }
    setSending(false);
  };

  return (
    <LearnerShell>
      <div className="space-y-6 max-w-4xl">
        <div className="space-y-1">
          <Badge variant="teal">Server Inbox</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Notifications &amp; Support Inbox
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            View server-delivered notifications and communicate with NURVIA support.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {["", "Unread", "Read", "Starred"].map((f) => (
            <Button
              key={f || "all"}
              size="sm"
              variant={statusFilter === f ? "primary" : "outline"}
              onClick={() => setStatusFilter(f)}
            >
              {f || "All"}
            </Button>
          ))}
        </div>

        {error && (
          <Card className="border-rose-500/30 bg-rose-500/5 p-4 text-xs sm:text-sm text-rose-700 dark:text-rose-300" role="alert">
            {error}
          </Card>
        )}
        {sendNotice && (
          <Card className="border-emerald-500/30 bg-emerald-500/5 p-4 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300" role="status">
            {sendNotice}
          </Card>
        )}

        <Card className="p-5 space-y-4">
          <h2 className="font-brand text-base font-bold text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-teal" /> Inbox Messages
          </h2>
          {loading ? (
            <p className="text-sm text-foreground-secondary py-6 text-center">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <Mail className="w-6 h-6 mx-auto text-foreground-muted" />
              <p className="text-sm text-foreground-secondary">No notifications or support messages found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map((m) => (
                <div key={String(m.id)} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {m.subject || m.title || "Notification"}
                      </span>
                      {m.clientReadStatus && (
                        <Badge variant="outline" className="text-[10px]">
                          {m.clientReadStatus}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-foreground-secondary">
                      {m.message || m.body || ""}
                    </p>
                  </div>
                  {m.clientReadStatus === "Unread" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs gap-1 shrink-0"
                      onClick={() => handleMarkRead(m.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-brand text-base font-bold text-foreground">New Support Message</h2>
          <form onSubmit={handleSendSupport} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question or issue"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support-body">Message</Label>
              <Textarea
                id="support-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe how we can help..."
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={sending} className="gap-1.5">
                <Send className="w-3.5 h-3.5" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </LearnerShell>
  );
}
