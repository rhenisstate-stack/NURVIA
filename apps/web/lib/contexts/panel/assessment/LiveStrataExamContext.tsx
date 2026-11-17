// src\lib\contexts\dashboards\assessment\LiveStrataExamContext.tsx
"use client";

import {
  createContext,
  useContext,
  useMemo,
} from "react";

import { useLiveStrataExam } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import type { StrataExamSessionResponse } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";


// ─────────────────────────────────────────────────────────────
// CONTEXT TYPE
// ─────────────────────────────────────────────────────────────

interface LiveStrataExamContextType {
  examSession: StrataExamSessionResponse | null;
  loading: boolean;
  error: string | null;

  examIdentifier: string;
  isDiy: boolean;
}

// ─────────────────────────────────────────────────────────────

const LiveStrataExamContext =
  createContext<LiveStrataExamContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────

export function LiveStrataExamProvider({
  examIdentifier,
  isDiy = false,
  selectedMode,
  selectedLayout,
  targetAttemptNumber,
  children,
}: {
  examIdentifier: string;
  isDiy?: boolean;
  selectedMode?: string;
  selectedLayout?: string;
  targetAttemptNumber?: number | null;
  children: React.ReactNode;
}) {
  const {
    examSession,
    loading,
    error,
  } = useLiveStrataExam({
    examIdentifier,
    isDiy,
    selectedMode,
    selectedLayout,
    targetAttemptNumber,
  });

  const value = useMemo(
    () => ({
      examSession,
      loading,
      error,
      examIdentifier,
      isDiy,
    }),
    [examSession, loading, error, examIdentifier, isDiy]
  );

  return (
    <LiveStrataExamContext.Provider value={value}>
      {children}
    </LiveStrataExamContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

export function useLiveStrataExamContext() {
  const ctx = useContext(LiveStrataExamContext);

  if (!ctx) {
    throw new Error(
      "useLiveStrataExamContext must be used inside LiveStrataExamProvider"
    );
  }

  return ctx;
}