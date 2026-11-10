"use client";

import * as React from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
}

export function FloatingStudyChat() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "m1",
      sender: "bot",
      text: "Hello! I am your NURVIA Clinical Study Assistant. Need an explanation on an ATI pharmacology topic, HESI med-surg rationale, or NGN clinical cue prioritization?",
      time: "Just now",
    },
  ]);

  const quickPrompts = [
    "Explain Digoxin apical pulse rules",
    "Calculate IV drop rate (gtt/min)",
    "Differentiate PE vs Atelectasis cues",
    "What are early signs of lithium toxicity?",
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");

    // Simulate intelligent nursing educator response
    setTimeout(() => {
      let responseText =
        "In clinical judgment (NGN), remember to prioritize acute ABCs (Airway, Breathing, Circulation) and analyze systemic cues before organ-specific signs. Review the evidence-based rationale in your study set for detailed step-by-step guidance.";

      const lower = text.toLowerCase();
      if (lower.includes("digoxin")) {
        responseText =
          "Digoxin clinical rule: Always auscultate the apical pulse for 1 full minute prior to administration. Withhold if HR < 60 bpm in adults (< 90 in infants). Monitor potassium closely: hypokalemia significantly increases the risk of fatal digoxin toxicity.";
      } else if (lower.includes("drop rate") || lower.includes("drip") || lower.includes("gtt")) {
        responseText =
          "IV Drop Rate formula: (Total Volume in mL × Drop Factor in gtt/mL) ÷ Total Time in minutes = Infusion Rate in gtt/min. For example: (1,000 mL × 15 gtt/mL) ÷ 480 min = 31.25 → 31 gtt/min.";
      } else if (lower.includes("pe") || lower.includes("pulmonary embolism") || lower.includes("atelectasis")) {
        responseText =
          "PE vs Atelectasis cue analysis: PE typically has sudden-onset sharp pleuritic pain, acute tachycardia, tachypnea, and refractory hypoxia post-surgery. Atelectasis tends to develop gradually with low-grade fever responsive to incentive spirometry.";
      } else if (lower.includes("lithium")) {
        responseText =
          "Lithium toxicity cues: Therapeutic range is 0.6–1.2 mEq/L. Early toxic cues (1.5–2.0 mEq/L) include gastrointestinal symptoms (nausea, vomiting, diarrhea), slurred speech, and muscle weakness with coarse hand tremors.";
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating Chat Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-teal hover:bg-brand-tealDark text-white shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-teal/70 font-semibold text-xs"
        aria-label="Open Clinical Study Chat"
      >
        <MessageSquare className="w-4 h-4 fill-white" />
        <span>Chat</span>
        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
      </button>

      {/* Slide-over Chat Box */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] rounded-2xl border border-border bg-surface text-foreground shadow-2xl overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-brand-navy dark:bg-brand-navyDeep text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center font-bold">
                <Bot className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-none">NURVIA Study Assistant</h4>
                <span className="text-[10px] text-teal-300 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online · Clinical Guidance
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick prompt chips */}
          <div className="p-2 border-b border-border bg-surface-muted/50 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-[11px]">
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSend(p)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full border border-border bg-background hover:border-brand-teal text-foreground-secondary hover:text-foreground transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-2xl leading-relaxed",
                    m.sender === "user"
                      ? "bg-brand-navy text-white rounded-br-xs dark:bg-brand-teal"
                      : "bg-surface-muted text-foreground border border-border rounded-bl-xs"
                  )}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-foreground-muted mt-1 px-1">{m.time}</span>
              </div>
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a clinical question..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
            <Button type="submit" size="sm" className="h-8 px-3 text-xs bg-brand-teal hover:bg-brand-tealDark">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
