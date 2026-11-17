export type ExamActionGroup =
  | 'ExamAnswers'
  | 'ExamActions'
  | 'QuestionActions'
  | 'ExamLifecycle'
  | 'ExamPreferences';

export type ExamSubmissionType =
  | 'ActionSingleChoice'
  | 'ActionMultipleSelect'
  | 'ActionTrueFalse'
  | 'ActionNumericResponse'
  | 'ActionMatching'
  | 'ActionOrderingNumber'
  | 'ActionOrderingItem'
  | 'ActionOrderingDragDrop'
  | 'ActionDynamicImage'
  | 'ActionMultipleImage'
  | 'ActionBlankSelect'
  | 'ActionBlankFill'
  | 'ActionHotspot'
  | 'ActionOpenEnded'
  | 'ActionHighLight'
  | 'ActionAudioBased'
  | 'ActionVideoBased'
  | 'ActionMatrixSingleChoice'
  | 'ActionMatrixMultipleSelect'
  | 'ActionCaseBasedSingleChoice'
  | 'ActionCaseBasedMultipleSelect'
  | 'ActionCaseBasedTrueFalse'
  | 'ActionCaseBasedNumericResponse'
  | 'ActionCaseBasedMatching'
  | 'ActionCaseBasedOrderingNumber'
  | 'ActionCaseBasedOrderingItem'
  | 'ActionCaseBasedOrderingDragDrop'
  | 'ActionCaseBasedDynamicImage'
  | 'ActionCaseBasedMultipleImage'
  | 'ActionCaseBasedBlankSelect'
  | 'ActionCaseBasedBlankFill'
  | 'ActionCaseBasedHotspot'
  | 'ActionCaseBasedOpenEnded'
  | 'ActionCaseBasedMatrixSingleChoice'
  | 'ActionCaseBasedMatrixMultipleSelect'
  | 'ActionCaseBasedHighLight'
  | 'ActionCaseBasedAudioBased'
  | 'ActionCaseBasedVideoBased'
  | 'ActionExamFlag'
  | 'ActionExamBookmark'
  | 'ActionExamStar'
  | 'ActionExamPin'
  | 'ActionExamFeedback'
  | 'ActionQuestionFlag'
  | 'ActionQuestionBookmark'
  | 'ActionQuestionStar'
  | 'ActionQuestionPin'
  | 'ActionQuestionFeedback'
  | 'ActionExamDuration'
  | 'ActionExamTerminate'
  | 'ActionExamPause'
  | 'ActionExamResume'
  | 'ActionExamSubmit'
  | 'ActionExamLayout'
  | 'ActionExamTheme'
  | 'ActionExamMode'
  | 'ActionExamStatus';

const SUBMISSION_TO_GROUP: Record<ExamSubmissionType, ExamActionGroup> = {
  ActionSingleChoice: 'ExamAnswers',
  ActionMultipleSelect: 'ExamAnswers',
  ActionTrueFalse: 'ExamAnswers',
  ActionNumericResponse: 'ExamAnswers',
  ActionMatching: 'ExamAnswers',
  ActionOrderingNumber: 'ExamAnswers',
  ActionOrderingItem: 'ExamAnswers',
  ActionOrderingDragDrop: 'ExamAnswers',
  ActionDynamicImage: 'ExamAnswers',
  ActionMultipleImage: 'ExamAnswers',
  ActionBlankSelect: 'ExamAnswers',
  ActionBlankFill: 'ExamAnswers',
  ActionHotspot: 'ExamAnswers',
  ActionOpenEnded: 'ExamAnswers',
  ActionHighLight: 'ExamAnswers',
  ActionAudioBased: 'ExamAnswers',
  ActionVideoBased: 'ExamAnswers',
  ActionMatrixSingleChoice: 'ExamAnswers',
  ActionMatrixMultipleSelect: 'ExamAnswers',
  ActionCaseBasedSingleChoice: 'ExamAnswers',
  ActionCaseBasedMultipleSelect: 'ExamAnswers',
  ActionCaseBasedTrueFalse: 'ExamAnswers',
  ActionCaseBasedNumericResponse: 'ExamAnswers',
  ActionCaseBasedMatching: 'ExamAnswers',
  ActionCaseBasedOrderingNumber: 'ExamAnswers',
  ActionCaseBasedOrderingItem: 'ExamAnswers',
  ActionCaseBasedOrderingDragDrop: 'ExamAnswers',
  ActionCaseBasedDynamicImage: 'ExamAnswers',
  ActionCaseBasedMultipleImage: 'ExamAnswers',
  ActionCaseBasedBlankSelect: 'ExamAnswers',
  ActionCaseBasedBlankFill: 'ExamAnswers',
  ActionCaseBasedHotspot: 'ExamAnswers',
  ActionCaseBasedOpenEnded: 'ExamAnswers',
  ActionCaseBasedMatrixSingleChoice: 'ExamAnswers',
  ActionCaseBasedMatrixMultipleSelect: 'ExamAnswers',
  ActionCaseBasedHighLight: 'ExamAnswers',
  ActionCaseBasedAudioBased: 'ExamAnswers',
  ActionCaseBasedVideoBased: 'ExamAnswers',
  ActionExamFlag: 'ExamActions',
  ActionExamBookmark: 'ExamActions',
  ActionExamStar: 'ExamActions',
  ActionExamPin: 'ExamActions',
  ActionExamFeedback: 'ExamActions',
  ActionQuestionFlag: 'QuestionActions',
  ActionQuestionBookmark: 'QuestionActions',
  ActionQuestionStar: 'QuestionActions',
  ActionQuestionPin: 'QuestionActions',
  ActionQuestionFeedback: 'QuestionActions',
  ActionExamDuration: 'ExamLifecycle',
  ActionExamTerminate: 'ExamLifecycle',
  ActionExamPause: 'ExamLifecycle',
  ActionExamResume: 'ExamLifecycle',
  ActionExamSubmit: 'ExamLifecycle',
  ActionExamLayout: 'ExamPreferences',
  ActionExamTheme: 'ExamPreferences',
  ActionExamMode: 'ExamPreferences',
  ActionExamStatus: 'ExamPreferences',
};

export type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | Record<string, unknown>
  | null;

export interface SubmitAnswerPayload {
  examId: number;
  examGuidId: string;
  sectionId: number;
  sectionGuidId: string;
  questionId: number;
  questionGuidId: string;
  answer: AnswerValue;
}

export interface ExamUxPayload {
  examId: number;
  examGuidId: string;
  value: string;
}

export interface ExamLifecyclePayload {
  examId: number;
  examGuidId: string;
}

export interface ExamActionPayload {
  examId: number;
  examGuidId: string;
  sectionId?: number;
  sectionGuidId?: string;
  questionId?: number;
  questionGuidId?: string;
  value?: string | boolean | number;
}

export interface ExamServiceResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  [key: string]: unknown;
}

export async function examServiceCall<T = unknown>(
  submissionType: ExamSubmissionType,
  payload?: object
): Promise<ExamServiceResponse<T>> {
  const actionGroup = SUBMISSION_TO_GROUP[submissionType];
  if (!actionGroup) {
    return { success: false, error: `Unknown submissionType: ${submissionType}` };
  }

  const flat = (payload as Record<string, unknown>) ?? {};
  const isDiy =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('diyidentifier');

  const body = {
    ...flat,
    ...(flat.value !== undefined && flat.value !== null ? { value: String(flat.value) } : {}),
    submissionType,
    actionGroup,
    isDiy,
  };

  try {
    const res = await fetch('/api/exams/upserts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json?.message || `Exam action failed (${res.status})`,
      };
    }
    return { success: true, ...json };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export const examService = {
  submitAnswer: (type: ExamSubmissionType, payload: SubmitAnswerPayload) =>
    examServiceCall(type, payload),
  submitTool: (type: ExamSubmissionType, payload: ExamActionPayload) =>
    examServiceCall(type, payload),
  saveResidualDuration: (payload: ExamLifecyclePayload) =>
    examServiceCall('ActionExamDuration', payload),
  pauseExam: (payload: ExamLifecyclePayload) => examServiceCall('ActionExamPause', payload),
  resumeExam: (payload: ExamLifecyclePayload) => examServiceCall('ActionExamResume', payload),
  terminateExam: (payload: ExamLifecyclePayload) =>
    examServiceCall('ActionExamTerminate', payload),
  submitExam: (payload: ExamLifecyclePayload) => examServiceCall('ActionExamSubmit', payload),
  updateLayout: (payload: ExamUxPayload) => examServiceCall('ActionExamLayout', payload),
  updateTheme: (payload: ExamUxPayload) => examServiceCall('ActionExamTheme', payload),
  updateMode: (payload: ExamUxPayload) => examServiceCall('ActionExamMode', payload),
  updateStatus: (payload: ExamUxPayload) => examServiceCall('ActionExamStatus', payload),
};
