'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  examService,
  type AnswerValue,
  type ExamSubmissionType,
} from '@/lib/services/nexus/strata/examService';

interface LiveExamActionContextType {
  answers: Record<string, AnswerValue>;
  flaggedQuestions: Record<string, boolean>;
  bookmarkedQuestions: Record<string, boolean>;
  submitting: boolean;
  setAnswer: (questionGuidId: string, value: AnswerValue) => void;
  toggleFlag: (examId: number, examGuidId: string, questionId: number, questionGuidId: string) => Promise<void>;
  toggleBookmark: (examId: number, examGuidId: string, questionId: number, questionGuidId: string) => Promise<void>;
  submitQuestionAnswer: (
    type: ExamSubmissionType,
    examId: number,
    examGuidId: string,
    sectionId: number,
    sectionGuidId: string,
    questionId: number,
    questionGuidId: string,
    answer: AnswerValue
  ) => Promise<void>;
}

const LiveExamActionContext = createContext<LiveExamActionContextType | undefined>(undefined);

export function LiveExamActionProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const setAnswer = useCallback((questionGuidId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionGuidId]: value }));
  }, []);

  const toggleFlag = useCallback(
    async (examId: number, examGuidId: string, questionId: number, questionGuidId: string) => {
      const next = !flaggedQuestions[questionGuidId];
      setFlaggedQuestions((prev) => ({ ...prev, [questionGuidId]: next }));
      await examService.submitTool('ActionQuestionFlag', {
        examId,
        examGuidId,
        questionId,
        questionGuidId,
        value: next,
      });
    },
    [flaggedQuestions]
  );

  const toggleBookmark = useCallback(
    async (examId: number, examGuidId: string, questionId: number, questionGuidId: string) => {
      const next = !bookmarkedQuestions[questionGuidId];
      setBookmarkedQuestions((prev) => ({ ...prev, [questionGuidId]: next }));
      await examService.submitTool('ActionQuestionBookmark', {
        examId,
        examGuidId,
        questionId,
        questionGuidId,
        value: next,
      });
    },
    [bookmarkedQuestions]
  );

  const submitQuestionAnswer = useCallback(
    async (
      type: ExamSubmissionType,
      examId: number,
      examGuidId: string,
      sectionId: number,
      sectionGuidId: string,
      questionId: number,
      questionGuidId: string,
      answer: AnswerValue
    ) => {
      setSubmitting(true);
      setAnswers((prev) => ({ ...prev, [questionGuidId]: answer }));
      try {
        await examService.submitAnswer(type, {
          examId,
          examGuidId,
          sectionId,
          sectionGuidId,
          questionId,
          questionGuidId,
          answer,
        });
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return (
    <LiveExamActionContext.Provider
      value={{
        answers,
        flaggedQuestions,
        bookmarkedQuestions,
        submitting,
        setAnswer,
        toggleFlag,
        toggleBookmark,
        submitQuestionAnswer,
      }}
    >
      {children}
    </LiveExamActionContext.Provider>
  );
}

export function useLiveExamActions() {
  const ctx = useContext(LiveExamActionContext);
  if (!ctx) throw new Error('useLiveExamActions must be used within LiveExamActionProvider');
  return ctx;
}
