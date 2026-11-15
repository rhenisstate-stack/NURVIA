"use client";

import * as React from "react";
import { LearnerShell } from "@/components/layout/learner-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nurviaApi } from "@/lib/api-client";
import type { FlashcardDto } from "@/lib/api-types";
import { RotateCcw, Plus, Trash2, Layers, Sparkles } from "lucide-react";

export default function FlashcardsPage() {
  const [cards, setCards] = React.useState<FlashcardDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState("All");
  const [dueOnly, setDueOnly] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [submittingReview, setSubmittingReview] = React.useState(false);

  const [showCreate, setShowCreate] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState("Pharmacology");
  const [newPathway, setNewPathway] = React.useState("RN");
  const [newFront, setNewFront] = React.useState("");
  const [newBack, setNewBack] = React.useState("");
  const [newHint, setNewHint] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const loadCards = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await nurviaApi.getFlashcards({
      category: category === "All" ? undefined : category,
      dueOnly,
    });
    if (res.success && res.data) {
      setCards(res.data);
      setCurrentIndex(0);
      setFlipped(false);
    } else {
      setError(res.message || "Unable to load flashcards.");
    }
    setLoading(false);
  }, [category, dueOnly]);

  React.useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const currentCard = cards[currentIndex] ?? null;

  const handleRate = async (rating: "Again" | "Hard" | "Good" | "Easy") => {
    if (!currentCard || submittingReview) return;
    setSubmittingReview(true);
    const res = await nurviaApi.reviewFlashcard(currentCard.id, rating);
    if (res.success && res.data) {
      const updated = res.data;
      setCards((prev) => {
        const next = prev.map((c) => (c.id === updated.id ? updated : c));
        if (dueOnly && rating !== "Again") {
          return next.filter((c) => c.id !== updated.id);
        }
        return next;
      });
      setFlipped(false);
      setCurrentIndex((prev) => (cards.length > 1 ? (prev + 1) % cards.length : 0));
    } else {
      setError(res.message || "Unable to save review outcome.");
    }
    setSubmittingReview(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const res = await nurviaApi.createFlashcard({
      category: newCategory,
      pathway: newPathway,
      front: newFront,
      back: newBack,
      hint: newHint || undefined,
    });
    if (res.success && res.data) {
      setNewFront("");
      setNewBack("");
      setNewHint("");
      setShowCreate(false);
      await loadCards();
    } else {
      setError(res.message || "Unable to create flashcard.");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const res = await nurviaApi.deleteFlashcard(id);
    if (res.success) {
      await loadCards();
    } else {
      setError(res.message || "Unable to delete flashcard.");
    }
  };

  const categories = ["All", "Pharmacology", "Maternal-Newborn", "Med-Surg", "Fundamentals", "Pediatrics", "General"];

  return (
    <LearnerShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="teal">SM-2 Spaced Repetition</Badge>
            <h1 className="font-brand text-2xl sm:text-3xl font-bold text-foreground">
              Spaced Flashcard Review
            </h1>
            <p className="text-xs text-foreground-secondary">
              Persisted active-recall decks with SM-2 scheduling intervals stored in PostgreSQL.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
            className="gap-1.5 bg-brand-teal hover:bg-brand-tealDark text-white"
          >
            <Plus className="w-4 h-4" />
            {showCreate ? "Close Form" : "New Flashcard"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={category === cat ? "primary" : "outline"}
                onClick={() => setCategory(cat)}
                className="text-xs h-8"
              >
                {cat}
              </Button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-foreground-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={dueOnly}
              onChange={(e) => setDueOnly(e.target.checked)}
              className="rounded border-border"
            />
            Due for review only
          </label>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {showCreate && (
          <Card className="p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <h2 className="font-brand text-base font-bold text-foreground">Create Personal Flashcard</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="fc-category">Category</Label>
                  <Input id="fc-category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fc-pathway">Pathway</Label>
                  <select
                    id="fc-pathway"
                    value={newPathway}
                    onChange={(e) => setNewPathway(e.target.value)}
                    className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                  >
                    <option value="RN">RN</option>
                    <option value="PN">PN</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="fc-front">Front (Question / Prompt)</Label>
                <Textarea id="fc-front" value={newFront} onChange={(e) => setNewFront(e.target.value)} required rows={2} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fc-back">Back (Clinical Answer &amp; Rationale)</Label>
                <Textarea id="fc-back" value={newBack} onChange={(e) => setNewBack(e.target.value)} required rows={3} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fc-hint">Hint (Optional)</Label>
                <Input id="fc-hint" value={newHint} onChange={(e) => setNewHint(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={creating} className="bg-brand-teal text-white">
                  {creating ? "Saving..." : "Save Flashcard"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <Card className="p-10 text-center text-sm text-foreground-secondary">Loading flashcard deck…</Card>
        ) : !currentCard ? (
          <Card className="p-10 text-center space-y-3">
            <Layers className="w-8 h-8 mx-auto text-brand-teal" />
            <p className="font-brand font-bold text-base text-foreground">
              {dueOnly ? "All due cards reviewed!" : "No flashcards match this filter."}
            </p>
            <p className="text-xs text-foreground-secondary">
              {dueOnly ? "Uncheck 'Due for review only' to practice ahead or create a new card." : "Try another category or create your own card."}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-foreground-secondary">
              <span>
                Card {currentIndex + 1} of {cards.length} · Interval: {currentCard.intervalDays}d · Repetitions: {currentCard.repetitions}
              </span>
              {currentCard.isOwnedByCaller && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void handleDelete(currentCard.id)}
                  className="text-rose-600 hover:text-rose-700 h-7 px-2 text-xs gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              )}
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setFlipped((f) => !f)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFlipped((f) => !f);
                }
              }}
              className="min-h-[260px] p-8 rounded-2xl border-2 border-border bg-surface text-foreground shadow-lg flex flex-col justify-between cursor-pointer hover:border-brand-teal transition-all text-center select-none"
            >
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <span className="font-bold uppercase tracking-wider text-brand-teal">
                  {currentCard.category} · {currentCard.pathway}
                </span>
                <span>{flipped ? "Answer" : "Tap or press Enter to flip"}</span>
              </div>

              <div className="py-6 my-auto text-sm sm:text-base font-semibold leading-relaxed whitespace-pre-line">
                {flipped ? currentCard.back : currentCard.front}
              </div>

              <div className="text-[11px] text-foreground-muted">
                {!flipped && currentCard.hint ? (
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-teal" /> Hint: {currentCard.hint}
                  </span>
                ) : (
                  <span>Last rating: {currentCard.lastRating}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setFlipped((f) => !f)} className="text-xs gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Flip
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={submittingReview}
                onClick={() => void handleRate("Again")}
                className="text-xs border-rose-300 text-rose-700 hover:bg-rose-50 dark:text-rose-300"
              >
                Again (10m)
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={submittingReview}
                onClick={() => void handleRate("Hard")}
                className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50 dark:text-amber-300"
              >
                Hard
              </Button>
              <Button
                size="sm"
                disabled={submittingReview}
                onClick={() => void handleRate("Good")}
                className="text-xs bg-brand-teal hover:bg-brand-tealDark text-white"
              >
                Good
              </Button>
              <Button
                size="sm"
                disabled={submittingReview}
                onClick={() => void handleRate("Easy")}
                className="text-xs bg-brand-navy hover:bg-brand-navyDeep text-white"
              >
                Easy
              </Button>
            </div>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
