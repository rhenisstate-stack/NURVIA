"use client";

import * as React from "react";
import Link from "next/link";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nurviaApi } from "@/lib/api-client";
import type { TutorChatSessionDto } from "@/lib/api-types";
import { Bot, Plus, Send, Trash2, MessageSquare } from "lucide-react";

export default function AiTutorPage() {
  const [sessions, setSessions] = React.useState<TutorChatSessionDto[]>([]);
  const [activeSession, setActiveSession] = React.useState<TutorChatSessionDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [messageInput, setMessageInput] = React.useState("");
  const [newTopic, setNewTopic] = React.useState("General Nursing");
  const [newPathway, setNewPathway] = React.useState("RN");

  const loadSessions = React.useCallback(async () => {
    setLoading(true);
    const res = await nurviaApi.getTutorSessions();
    if (res.success && res.data) {
      setSessions(res.data);
      if (res.data.length > 0 && !activeSession) {
        const detail = await nurviaApi.getTutorSession(res.data[0].id);
        if (detail.success && detail.data) setActiveSession(detail.data);
      }
    } else {
      setError(res.message || "Unable to load tutor sessions.");
    }
    setLoading(false);
  }, [activeSession]);

  React.useEffect(() => {
    void loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartSession = async () => {
    setError(null);
    const res = await nurviaApi.createTutorSession({
      title: `${newPathway} · ${newTopic}`,
      pathway: newPathway,
      topic: newTopic,
    });
    if (res.success && res.data) {
      setActiveSession(res.data);
      setSessions((prev) => [res.data!, ...prev]);
    } else {
      setError(res.message || "Unable to create tutor session.");
    }
  };

  const handleSelectSession = async (id: string) => {
    setError(null);
    const res = await nurviaApi.getTutorSession(id);
    if (res.success && res.data) {
      setActiveSession(res.data);
    }
  };

  const handleDeleteSession = async (id: string) => {
    const res = await nurviaApi.deleteTutorSession(id);
    if (res.success) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) setActiveSession(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !messageInput.trim() || sending) return;
    setSending(true);
    setError(null);
    const res = await nurviaApi.sendTutorMessage(activeSession.id, messageInput);
    if (res.success && res.data) {
      setActiveSession(res.data);
      setMessageInput("");
    } else {
      setError(res.message || "Unable to send message to Socratic tutor.");
    }
    setSending(false);
  };

  return (
    <LearnerShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="teal">Socratic Clinical Tutor</Badge>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              AI Clinical Judgment Tutor
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Persisted Socratic clinical reasoning sessions grounded in NURVIA care plans, study guides, and lectures.
            </p>
          </div>
          <Link href="/learner/custom-practice">
            <Button size="sm" variant="outline" className="text-xs">
              Launch Exam Tutor Mode
            </Button>
          </Link>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <h2 className="font-brand text-sm font-bold text-foreground">New Clinical Session</h2>
              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label="Pathway"
                  value={newPathway}
                  onChange={(e) => setNewPathway(e.target.value)}
                  className="h-9 rounded-md border border-border bg-surface px-2 text-xs"
                >
                  <option value="RN">RN</option>
                  <option value="PN">PN</option>
                </select>
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Topic"
                  className="h-9 text-xs"
                />
              </div>
              <Button size="sm" onClick={() => void handleStartSession()} className="w-full gap-1.5 bg-brand-teal text-white text-xs">
                <Plus className="w-3.5 h-3.5" /> Start New Session
              </Button>
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Saved Sessions</h3>
              {loading ? (
                <p className="text-xs text-foreground-secondary">Loading...</p>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-foreground-secondary">No sessions yet. Start one above.</p>
              ) : (
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between gap-2 rounded-lg p-2 text-xs cursor-pointer border ${
                        activeSession?.id === s.id
                          ? "border-brand-teal bg-brand-teal/10"
                          : "border-transparent hover:bg-surface-muted"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void handleSelectSession(s.id)}
                        className="flex-1 text-left truncate font-medium text-foreground"
                      >
                        <MessageSquare className="w-3 h-3 inline mr-1.5 text-brand-teal" />
                        {s.title}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete session ${s.title}`}
                        onClick={() => void handleDeleteSession(s.id)}
                        className="text-foreground-muted hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-5 flex flex-col min-h-[420px]">
            {!activeSession ? (
              <div className="my-auto text-center space-y-3 py-12">
                <Bot className="w-10 h-10 mx-auto text-brand-teal" />
                <h2 className="font-brand text-base font-bold text-foreground">Start a Clinical Reasoning Dialogue</h2>
                <p className="text-xs text-foreground-secondary max-w-md mx-auto">
                  Create a new session on the left to ask clinical prioritization, pharmacology, or NGN judgment questions.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-brand text-base font-bold text-foreground">{activeSession.title}</h2>
                    <p className="text-[11px] text-foreground-muted">
                      Pathway: {activeSession.pathway} · Topic: {activeSession.topic}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1 mb-4">
                  {(activeSession.messages ?? []).map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl p-3.5 text-xs leading-relaxed whitespace-pre-line ${
                        m.role === "User"
                          ? "ml-8 bg-brand-navy text-white dark:bg-brand-teal"
                          : "mr-8 bg-surface-muted border border-border text-foreground"
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                        {m.role === "User" ? "You" : "NURVIA Socratic Tutor"}
                      </div>
                      {m.content}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-border">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Ask a clinical judgment or prioritization question..."
                    className="h-10 text-xs"
                    required
                  />
                  <Button type="submit" disabled={sending} className="gap-1.5 bg-brand-teal hover:bg-brand-tealDark text-white">
                    <Send className="w-3.5 h-3.5" />
                    {sending ? "Thinking..." : "Send"}
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </LearnerShell>
  );
}
