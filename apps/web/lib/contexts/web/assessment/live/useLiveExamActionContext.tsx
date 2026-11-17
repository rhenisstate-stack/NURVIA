"use client";

import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from "react";

import {
  useLiveExamActionsHook,
  ExamActionPayload,
  ExamLifecyclePayload,
} from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveExamActionsHook";

import {
  ExamSubmissionType,
  ExamUxPayload,
  SubmitAnswerPayload,
} from "@/lib/services/nexus/strata/examService";

import type { LiveToolSubmissionType } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveExamActionsHook";

// ═══════════════════════════════════════════════════════════════════════════════
// ANSWER STATE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, unknown>
  | null;

export type AnswerEntry = {
  questionId: number;
  questionGuidId: string;
  examId: number;
  examGuidId: string;
  sectionId: number;
  sectionGuidId: string;
  submissionType: ExamSubmissionType;
  answer: AnswerValue;
  savedAt?: string;
  dirty: boolean;
  saving: boolean;
  retryCount?: number;
  error?: string;
};

type AnswerStore = Record<number, AnswerEntry>;

// ═══════════════════════════════════════════════════════════════════════════════
// EXAM LIFECYCLE STATUS
// ═══════════════════════════════════════════════════════════════════════════════

export type ExamLifecycleStatus =
  | "idle"
  | "pausing"
  | "paused"
  | "resuming"
  | "resumed"
  | "terminating"
  | "terminated"
  | "submitting"
  | "submitted"
  | "error";

// ═══════════════════════════════════════════════════════════════════════════════
// ANSWER REDUCER
// ═══════════════════════════════════════════════════════════════════════════════

type AnswerAction =
  | { type: "SET_ANSWER"; payload: Omit<AnswerEntry, "dirty" | "saving"> }
  | { type: "MARK_SAVING"; questionId: number }
  | { type: "MARK_SAVED"; questionId: number; savedAt: string }
  | { type: "MARK_ERROR"; questionId: number; error: string }
  | { type: "CLEAR" };

function answerReducer(state: AnswerStore, action: AnswerAction): AnswerStore {
  switch (action.type) {
    case "SET_ANSWER":
      return {
        ...state,
        [action.payload.questionId]: {
          ...action.payload,
          dirty: true,
          saving: false,
          error: undefined,
        },
      };
    case "MARK_SAVING":
      return state[action.questionId]
        ? { ...state, [action.questionId]: { ...state[action.questionId], saving: true, error: undefined } }
        : state;
    case "MARK_SAVED":
      return state[action.questionId]
        ? { ...state, [action.questionId]: { ...state[action.questionId], saving: false, dirty: false, savedAt: action.savedAt } }
        : state;
    case "MARK_ERROR":
      return state[action.questionId]
        ? { ...state, [action.questionId]: { ...state[action.questionId], saving: false, error: action.error } }
        : state;
    case "CLEAR":
      return {};
    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEBOUNCE_MS = 800;
const MAX_RETRIES = 8;
const RETRY_DELAY = 3000;

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT VALUE SHAPE
// ═══════════════════════════════════════════════════════════════════════════════

type LiveExamActionContextValue = {
  // ── Answer state ──────────────────────────────────────────────────────────────
  answers: AnswerStore;
  answeredCount: number;
  getAnswer: (questionId: number) => AnswerEntry | undefined;
  clearAnswers: () => void;

  // ── Answer submission ─────────────────────────────────────────────────────────
  submitAnswer: (
    submissionType: ExamSubmissionType,
    entry: Omit<AnswerEntry, "dirty" | "saving" | "submissionType">
  ) => void;

  // ── Tools ─────────────────────────────────────────────────────────────────────
  submitTool: (
    submissionType: LiveToolSubmissionType,
    payload: ExamActionPayload
  ) => Promise<void>;

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  saveResidualDuration: (payload: ExamLifecyclePayload) => Promise<void>;
  pauseExam: (payload: ExamLifecyclePayload) => Promise<{ success: boolean; message: string | null }>;
  resumeExam: (payload: ExamLifecyclePayload) => Promise<{ success: boolean; message: string | null }>;
  terminateExam: (payload: ExamLifecyclePayload) => Promise<{ success: boolean; message: string | null }>;
  submitExam: (payload: ExamLifecyclePayload) => Promise<{ success: boolean; message: string | null }>;
  lifecycleStatus: ExamLifecycleStatus;
  lifecycleError: string | null;

  // ── Timer ─────────────────────────────────────────────────────────────────────
  secondsLeft: number;
  setSecondsLeft: React.Dispatch<React.SetStateAction<number>>;

  // ── Preferences ───────────────────────────────────────────────────────────────
  updateLayout: (payload: ExamUxPayload) => Promise<void>;
  updateTheme: (payload: ExamUxPayload) => Promise<void>;
  updateMode: (payload: ExamUxPayload) => Promise<void>;
  updateStatus: (payload: ExamUxPayload) => Promise<void>;

  // ── Hook passthrough ──────────────────────────────────────────────────────────
  loading: boolean;
  error: string | null;
  success: string | null;

  // ── Submit toast ──────────────────────────────────────────────────────────────
  submitStatus: "idle" | "saving" | "saved" | "error";
  submitMessage: string | null;
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

const LiveExamActionContext = createContext<LiveExamActionContextValue | null>(null);


// ═══════════════════════════════════════════════════════════════════════════════
// AUTH-RESOLUTION FAILURE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════
// Backend returns success:false + a message like "Unable To Resolve Authenticated
// User ⚓" whenever the session's auth can't be resolved server-side (expired
// token, logged out elsewhere, etc). Any of our fire-and-forget calls (residual
// duration autosave, tool actions, lifecycle actions, answer autosave) can hit
// this — so we check for it in one place and broadcast a single event.
function isAuthResolutionFailure(message?: string | null): boolean {
  if (!message) return false;
  const text = message.toLowerCase();
  return (
    text.includes("unable to resolve authenticated user") ||
    text.includes("not authenticated") ||
    text.includes("authentication required") ||
    text.includes("unauthorized")
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

export function LiveExamActionProvider({
  children,
  initialResidualSeconds,
}: {
  children: ReactNode;
  initialResidualSeconds?: number;
}) {
  // ── Answer reducer ─────────────────────────────────────────────────────────────
  const [answers, dispatch] = useReducer(answerReducer, {});
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // ── Timer state ────────────────────────────────────────────────────────────────
  const [secondsLeft, setSecondsLeft] = useState<number>(initialResidualSeconds ?? 0);

  // ── Lifecycle status ───────────────────────────────────────────────────────────
  const [lifecycleStatus, setLifecycleStatus] = useState<ExamLifecycleStatus>("idle");
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);

  // ── Submit toast status ────────────────────────────────────────────────────────
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const submitToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerToast = useCallback((status: "saving" | "saved" | "error", message?: string) => {
    if (submitToastTimer.current) clearTimeout(submitToastTimer.current);
    setSubmitStatus(status);
    setSubmitMessage(message ?? null);
    if (status !== "saving") {
      submitToastTimer.current = setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitMessage(null);
      }, 500); // Toast Duration 
    }
  }, []);

  const notifyAuthRequired = useCallback((message?: string | null) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("exam:auth:required", { detail: { message: message ?? null } })
    );
  }, []);


  // ── Hook delegate ──────────────────────────────────────────────────────────────
  const {
    loading,
    error,
    success,
    submitAnswer: hookSubmitAnswer,
    submitTool: hookSubmitTool,
    saveResidualDuration: hookSaveResidualDuration,
    pauseExam: hookPauseExam,
    resumeExam: hookResumeExam,
    terminateExam: hookTerminateExam,
    submitExam: hookSubmitExam,
    updateLayout: hookUpdateLayout,
    updateTheme: hookUpdateTheme,
    updateMode: hookUpdateMode,
    updateStatus: hookUpdateStatus,
  } = useLiveExamActionsHook();

  // ── Sync to backend (with retry) ───────────────────────────────────────────────
  const syncToBackend = useCallback(
    async (entry: AnswerEntry) => {
      dispatch({ type: "MARK_SAVING", questionId: entry.questionId });
      triggerToast("saving");

      const payload: SubmitAnswerPayload = {
        examId: entry.examId,
        examGuidId: entry.examGuidId,
        sectionId: entry.sectionId,
        sectionGuidId: entry.sectionGuidId,
        questionId: entry.questionId,
        questionGuidId: entry.questionGuidId,
        answer: entry.answer,
      };

      const result = await hookSubmitAnswer(entry.submissionType as never, payload);

      if (result?.error) {
        dispatch({ type: "MARK_ERROR", questionId: entry.questionId, error: result.error });
        triggerToast("error", result.error);
        if (isAuthResolutionFailure(result.error)) notifyAuthRequired(result.error);
        const retryCount = entry.retryCount ?? 0;
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => syncToBackend({ ...entry, retryCount: retryCount + 1 }), RETRY_DELAY);
        }
        return;
      }

      dispatch({ type: "MARK_SAVED", questionId: entry.questionId, savedAt: new Date().toISOString() });
      const msg = result && "message" in result && typeof result.message === "string" ? result.message : undefined;
      triggerToast("saved", msg ?? "Saved Successfully ⚓");
    },
    [hookSubmitAnswer, triggerToast, notifyAuthRequired]
  );

  // ── Submit answer (debounced) ──────────────────────────────────────────────────
  const submitAnswer = useCallback(
    (
      submissionType: ExamSubmissionType,
      entry: Omit<AnswerEntry, "dirty" | "saving" | "submissionType">
    ) => {
      const full: Omit<AnswerEntry, "dirty" | "saving"> = { ...entry, submissionType };
      dispatch({ type: "SET_ANSWER", payload: full });

      if (timers.current[entry.questionId]) clearTimeout(timers.current[entry.questionId]);
      timers.current[entry.questionId] = setTimeout(() => {
        syncToBackend({ ...full, dirty: true, saving: false });
      }, DEBOUNCE_MS);
    },
    [syncToBackend]
  );

  // ── Submit tool ────────────────────────────────────────────────────────────────
  const submitTool = useCallback(
    async (submissionType: LiveToolSubmissionType, payload: ExamActionPayload) => {
      triggerToast("saving");
      try {
        const result = await hookSubmitTool(submissionType as never, payload as never);
        const errMsg = (result as { error?: string })?.error;
        if (errMsg) {
          triggerToast("error", errMsg);
          if (isAuthResolutionFailure(errMsg)) notifyAuthRequired(errMsg);
          console.error(`[submitTool] ${submissionType} failed:`, errMsg);
          return;
        }
        triggerToast("saved", (result as { message?: string })?.message ?? "Saved Successfully ⚓");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to Save ⚓";
        triggerToast("error", msg);
        if (isAuthResolutionFailure(msg)) notifyAuthRequired(msg);
        console.error(`[submitTool] ${submissionType} failed:`, err);
      }
    },
    [hookSubmitTool, triggerToast, notifyAuthRequired]
  );

  // Lifecycle helpers ──────────────────────────────────────────────────────────
  const runLifecycle = useCallback(
    async (
      status: { pending: ExamLifecycleStatus; done: ExamLifecycleStatus },
      fn: () => Promise<unknown>
    ): Promise<{ success: boolean; message: string | null }> => {
      setLifecycleStatus(status.pending);
      setLifecycleError(null);
      triggerToast("saving");
      try {
        const result = await fn() as { message?: string; error?: string; success?: boolean } | undefined;

        // Backend returned success: false — treat as error
        if (result?.success === false || result?.error) {
          const msg = result?.message ?? result?.error ?? "Submission failed ⚓";
          setLifecycleStatus("error");
          setLifecycleError(msg);
          triggerToast("error", msg);
          if (isAuthResolutionFailure(msg)) notifyAuthRequired(msg);
          return { success: false, message: msg };
        }

        const msg = result?.message ?? "Saved Successfully ⚓";
        setLifecycleStatus(status.done);
        triggerToast("saved", msg);
        return { success: true, message: msg };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Lifecycle error ⚓";
        setLifecycleStatus("error");
        setLifecycleError(msg);
        triggerToast("error", msg);
        if (isAuthResolutionFailure(msg)) notifyAuthRequired(msg);
        return { success: false, message: msg };
      }
    },
    [triggerToast, notifyAuthRequired]
  );

  const saveResidualDuration = useCallback(
    async (p: ExamLifecyclePayload) => {
      const result = await hookSaveResidualDuration(p) as
        | { success?: boolean; message?: string; error?: string }
        | undefined;
      const failureMsg = result?.error ?? (result?.success === false ? result?.message : null);
      if (failureMsg && isAuthResolutionFailure(failureMsg)) {
        notifyAuthRequired(failureMsg);
      }
    },
    [hookSaveResidualDuration, notifyAuthRequired]
  );

  const pauseExam = useCallback(
    (payload: ExamLifecyclePayload) =>
      runLifecycle({ pending: "pausing", done: "paused" }, () => hookPauseExam(payload)),
    [hookPauseExam, runLifecycle]
  );

  const resumeExam = useCallback(
    (payload: ExamLifecyclePayload) =>
      runLifecycle({ pending: "resuming", done: "resumed" }, () => hookResumeExam(payload)),
    [hookResumeExam, runLifecycle]
  );

  const terminateExam = useCallback(
    (payload: ExamLifecyclePayload) =>
      runLifecycle({ pending: "terminating", done: "terminated" }, () => hookTerminateExam(payload)),
    [hookTerminateExam, runLifecycle]
  );

  const submitExam = useCallback(
    (payload: ExamLifecyclePayload) =>
      runLifecycle({ pending: "submitting", done: "submitted" }, () => hookSubmitExam(payload)),
    [hookSubmitExam, runLifecycle]
  );

  // ── Preferences ────────────────────────────────────────────────────────────────
  const updateLayout = useCallback((p: ExamUxPayload) => hookUpdateLayout(p).then(() => { }), [hookUpdateLayout]);
  const updateTheme = useCallback((p: ExamUxPayload) => hookUpdateTheme(p).then(() => { }), [hookUpdateTheme]);
  const updateMode = useCallback((p: ExamUxPayload) => hookUpdateMode(p).then(() => { }), [hookUpdateMode]);
  const updateStatus = useCallback((p: ExamUxPayload) => hookUpdateStatus(p).then(() => { }), [hookUpdateStatus]);

  // ── Helpers ────────────────────────────────────────────────────────────────────
  const getAnswer = useCallback((questionId: number) => answers[questionId], [answers]);
  const clearAnswers = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.answer !== null && a.answer !== undefined && a.answer !== "").length,
    [answers]
  );

  // ── Provide ────────────────────────────────────────────────────────────────────
  return (
    <LiveExamActionContext.Provider
      value={{
        answers,
        answeredCount,
        getAnswer,
        clearAnswers,
        submitAnswer,
        submitTool,
        pauseExam,
        resumeExam,
        terminateExam,
        submitExam,
        saveResidualDuration,
        lifecycleStatus,
        lifecycleError,
        secondsLeft,
        setSecondsLeft,
        updateLayout,
        updateTheme,
        updateMode,
        updateStatus,
        loading,
        error,
        success,
        submitStatus,
        submitMessage,
      }}
    >
      {children}
    </LiveExamActionContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useLiveExamActionContext() {
  const ctx = useContext(LiveExamActionContext);
  if (!ctx) throw new Error("useLiveExamActionContext must be used inside LiveExamActionProvider");
  return ctx;
}

export const useLiveExamActions = useLiveExamActionContext;

// ───────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────