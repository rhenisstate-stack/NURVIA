"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, RotateCcw, Check, Sparkles } from "lucide-react";

export default function FlashcardsPage() {
  const [flipped, setFlipped] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const cards = [
    {
      front: "What is the therapeutic serum level for Lithium Carbonate, and what are early signs of toxicity?",
      back: "Therapeutic Range: 0.6 to 1.2 mEq/L.\nEarly toxicity (1.5–2.0 mEq/L): Nausea, vomiting, diarrhea, coarse hand tremors, lethargy, and slurred speech.",
      category: "Pharmacology",
    },
    {
      front: "What is the priority nursing intervention when late decelerations are noted on electronic fetal monitoring?",
      back: "Reposition client to left-lateral position, discontinue oxytocin infusion, apply high-flow oxygen via non-rebreather (8-10 L/min), and increase IV maintenance fluids to correct uteroplacental insufficiency.",
      category: "Maternity",
    },
    {
      front: "What is the antidote for heparin-induced anticoagulation excess?",
      back: "Protamine Sulfate (1 mg neutralizes approximately 100 units of unfractionated heparin).",
      category: "Pharmacology",
    },
  ];

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <LearnerShell>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-1 text-center">
          <Badge variant="teal">Spaced Repetition System</Badge>
          <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
            Spaced Flashcard Review
          </h1>
          <p className="text-xs text-foreground-secondary">
            Card {currentIndex + 1} of {cards.length} due for today&apos;s review
          </p>
        </div>

        {/* Flashcard Component */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="min-h-[260px] p-8 rounded-2xl border-2 border-border bg-surface text-foreground shadow-lg flex flex-col justify-between cursor-pointer hover:border-brand-teal transition-all text-center select-none"
        >
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-bold uppercase tracking-wider text-brand-teal">{currentCard.category}</span>
            <span>Click card to flip</span>
          </div>

          <div className="py-6 my-auto text-sm sm:text-base font-semibold leading-relaxed whitespace-pre-line">
            {flipped ? currentCard.back : currentCard.front}
          </div>

          <div className="text-[11px] text-foreground-muted">
            {flipped ? "💡 Mastered this card?" : "Tap anywhere to reveal answer"}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFlipped(!flipped)}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Flip Card
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            className="text-xs gap-1.5 bg-brand-navy hover:bg-brand-navyDeep text-white dark:bg-brand-teal dark:hover:bg-brand-tealDark"
          >
            <Check className="w-3.5 h-3.5" />
            Next Due Card
          </Button>
        </div>
      </div>
    </LearnerShell>
  );
}
