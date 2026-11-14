"use client";

import * as React from "react";
import { BookOpen, CheckCircle2, HelpCircle, Lightbulb, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nurviaApi } from "@/lib/api-client";
import type {
  TutorEvaluateResponseDto,
  TutorHintResponseDto,
  TutorStage,
} from "@/lib/api-types";

interface TutorModePanelProps {
  attemptId: string;
  questionId: string;
  hasSelectedAnswer: boolean;
  serializedAnswer: string | null;
  evaluation: TutorEvaluateResponseDto | null;
  onEvaluated: (result: TutorEvaluateResponseDto) => void;
}

export function TutorModePanel({
  attemptId,
  questionId,
  hasSelectedAnswer,
  serializedAnswer,
  evaluation,
  onEvaluated,
}: TutorModePanelProps) {
  const [hints, setHints] = React.useState<TutorHintResponseDto[]>([]);
  const [loadingStage, setLoadingStage] = React.useState<TutorStage | "evaluate" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleRequestHint = async (stage: TutorStage) => {
    setLoadingStage(stage);
    setError(null);
    const res = await nurviaApi.requestTutorHint(attemptId, { questionId, stage });
    if (res.success && res.data) {
      setHints((prev) => {
        const filtered = prev.filter((h) => h.stage !== stage);
        return [...filtered, res.data!];
      });
    } else {
      setError(res.message || "Unable to load tutor hint.");
    }
    setLoadingStage(null);
  };

  const handleEvaluate = async () => {
    if (!serializedAnswer) return;
    setLoadingStage("evaluate");
    setError(null);
    const res = await nurviaApi.evaluateTutorAnswer(attemptId, {
      questionId,
      responseJson: serializedAnswer,
    });
    if (res.success && res.data) {
      onEvaluated(res.data);
    } else {
      setError(res.message || "Unable to evaluate your answer.");
    }
    setLoadingStage(null);
  };

  return (
    <div className="space-y-3 rounded-xl border border-brand-teal/25 bg-brand-teal/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-teal">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>Guided Tutor Mode</span>
        </div>

        {!evaluation && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              isLoading={loadingStage === "FirstHint"}
              onClick={() => void handleRequestHint("FirstHint")}
              className="h-8 text-xs"
            >
              <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              Ask for a Hint
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              isLoading={loadingStage === "GuidedReasoning"}
              onClick={() => void handleRequestHint("GuidedReasoning")}
              className="h-8 text-xs"
            >
              <HelpCircle className="mr-1.5 h-3.5 w-3.5 text-brand-teal" />
              Help Me Understand
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              isLoading={loadingStage === "ExplainConcept"}
              onClick={() => void handleRequestHint("ExplainConcept")}
              className="h-8 text-xs"
            >
              <BookOpen className="mr-1.5 h-3.5 w-3.5 text-brand-teal" />
              Explain the Concept
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!hasSelectedAnswer}
              isLoading={loadingStage === "evaluate"}
              onClick={() => void handleEvaluate()}
              className="h-8 text-xs"
            >
              Submit My Answer
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      {/* Progressive Hints (Stages 2 & 3) */}
      {hints.length > 0 && (
        <div className="space-y-2">
          {hints.map((hint) => (
            <div
              key={hint.stage}
              className="rounded-lg border border-border bg-surface p-3 text-xs text-foreground-secondary"
            >
              <p className="font-semibold text-foreground">{hint.title}</p>
              <p className="mt-1 leading-relaxed">{hint.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stage 4, 5, 6: Evaluation + Educational Explanation + Takeaway */}
      {evaluation && (
        <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold">
              {evaluation.isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Correct ({evaluation.pointsAwarded} / {evaluation.maxPoints} pt)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span className="text-rose-700 dark:text-rose-400">
                    Incorrect ({evaluation.pointsAwarded} / {evaluation.maxPoints} pt)
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] text-foreground-muted">{evaluation.nursingPrinciple}</span>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-foreground">Educational Explanation</p>
            <p className="leading-relaxed text-foreground-secondary">{evaluation.generalRationale}</p>
          </div>

          {evaluation.optionRationales.some((o) => o.specificRationale) && (
            <div className="space-y-1.5 border-t border-border pt-2.5">
              <p className="font-semibold text-foreground">Option Breakdown</p>
              <ul className="space-y-1.5">
                {evaluation.optionRationales.map((opt) => (
                  <li
                    key={opt.optionId}
                    className={`rounded-md p-2 ${
                      opt.isCorrect
                        ? "bg-emerald-500/10 text-foreground"
                        : "bg-background/60 text-foreground-secondary"
                    }`}
                  >
                    <span className="font-semibold">
                      {opt.isCorrect ? "✓ " : "• "}
                      {opt.optionText}
                    </span>
                    {opt.specificRationale && (
                      <p className="mt-0.5 text-[11px] leading-relaxed">{opt.specificRationale}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg bg-brand-teal/10 p-3 text-foreground">
            <p className="font-semibold text-brand-teal">Key Takeaway · {evaluation.clinicalConcept}</p>
            <p className="mt-1 leading-relaxed text-foreground-secondary">{evaluation.takeaway}</p>
          </div>
        </div>
      )}
    </div>
  );
}
