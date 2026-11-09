"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "tutor" | "learner";
  text: string;
}

export default function AiTutorPage() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      sender: "tutor",
      text: "Welcome to your NURVIA Clinical Reasoning Tutor. I am here to help you dissect Next-Gen case studies, clarify physiological mechanisms, or practice Socratic questioning. What concept would you like to explore today?",
    },
  ]);
  const [input, setInput] = React.useState("");

  const handleSend = (text?: string) => {
    const q = text || input.trim();
    if (!q) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "learner", text: q };
    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput("");

    setTimeout(() => {
      let reply = "In Next-Gen NCLEX clinical judgment, consider: What cues in the patient chart are most critical right now? Prioritize physiological life threats (ABCs) before addressing comfort or chronic conditions.";
      if (q.toLowerCase().includes("warfarin")) {
        reply = "When reviewing Warfarin (Coumadin): Remember it blocks vitamin K-dependent clotting factors (II, VII, IX, X). Therapeutic INR is 2.0–3.0. Antidote is Vitamin K (Phytonadione). The nurse must counsel the patient on consistent green leafy vegetable intake!";
      } else if (q.toLowerCase().includes("digoxin")) {
        reply = "Digoxin key concept: Positive inotrope (increases cardiac contractility), negative chronotrope (slows heart rate). Priority check: auscultate apical pulse for 60 seconds (withhold if < 60 bpm in adults). Watch potassium closely—hypokalemia increases toxicity!";
      }

      const botReply: ChatMessage = { id: (Date.now() + 1).toString(), sender: "tutor", text: reply };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  return (
    <LearnerShell>
      <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
        <div className="space-y-1">
          <Badge variant="teal">Socratic Clinical Tutor</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            AI Clinical Judgment Tutor
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Interactive reasoning companion designed to guide you through NCLEX clinical cues without giving away answers prematurely.
          </p>
        </div>

        {/* Chat Conversation Card */}
        <Card className="flex-1 flex flex-col overflow-hidden p-0">
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-start gap-3 max-w-[85%]",
                  m.sender === "learner" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                    m.sender === "learner"
                      ? "bg-brand-navy text-white dark:bg-brand-teal"
                      : "bg-brand-teal/15 text-brand-teal"
                  )}
                >
                  {m.sender === "learner" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={cn(
                    "p-4 rounded-2xl text-xs sm:text-sm leading-relaxed",
                    m.sender === "learner"
                      ? "bg-brand-navy text-white rounded-tr-xs dark:bg-brand-teal"
                      : "bg-surface-muted text-foreground border border-border rounded-tl-xs"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="p-3 border-t border-border bg-surface-muted/30 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-foreground-muted whitespace-nowrap">Suggested:</span>
            {["Explain Warfarin vs Heparin", "Digoxin apical pulse rule", "NGN 6 cognitive skills breakdown"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSend(p)}
                className="whitespace-nowrap px-3 py-1 rounded-full border border-border bg-surface hover:border-brand-teal text-foreground-secondary hover:text-foreground transition-colors text-[11px]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border bg-surface flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for clinical clarification, Socratic hint, or rationale breakdown..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs sm:text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
            <Button type="submit" size="sm" className="h-10 px-4 bg-brand-teal hover:bg-brand-tealDark text-white gap-1.5">
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </Card>
      </div>
    </LearnerShell>
  );
}
