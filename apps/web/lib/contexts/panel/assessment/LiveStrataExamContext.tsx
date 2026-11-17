'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface LiveStrataExamContextType {
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
  totalQuestions: number;
  setTotalQuestions: (count: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

const LiveStrataExamContext = createContext<LiveStrataExamContextType | undefined>(undefined);

export function LiveStrataExamProvider({ children }: { children: ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <LiveStrataExamContext.Provider
      value={{
        currentIndex,
        setCurrentIndex,
        totalQuestions,
        setTotalQuestions,
        isPaused,
        setIsPaused,
      }}
    >
      {children}
    </LiveStrataExamContext.Provider>
  );
}

export function useLiveStrataExam() {
  const ctx = useContext(LiveStrataExamContext);
  if (!ctx) throw new Error('useLiveStrataExam must be used within LiveStrataExamProvider');
  return ctx;
}
