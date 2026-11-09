import {
  ApiResponse,
  PagedResult,
  QuestionDto,
  ExamDto,
  QuestionVersionDto,
  StartAttemptResultDto,
  AutosaveResponseRequest,
  AutosaveResultDto,
  SubmittedExamResultDto,
  ExamAttemptSummaryDto,
} from './api-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5055';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nurvia_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-User-Role': 'Learner',
    'X-User-Name': 'Jane Doe, SN',
    'X-User-Id': 'usr-learner-01',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store',
    });

    const json = await res.json();
    return json;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network error connecting to NURVIA API',
      errors: [error?.message || 'Unknown network error'],
    };
  }
}

export const nurviaApi = {
  // Questions
  async getQuestions(params?: Record<string, any>): Promise<ApiResponse<PagedResult<QuestionDto>>> {
    const query = new URLSearchParams(params || {}).toString();
    return request<PagedResult<QuestionDto>>(`/api/questions${query ? `?${query}` : ''}`);
  },

  async getQuestionById(id: string): Promise<ApiResponse<QuestionDto>> {
    return request<QuestionDto>(`/api/questions/${id}`);
  },

  async createQuestion(payload: any): Promise<ApiResponse<QuestionDto>> {
    return request<QuestionDto>('/api/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateQuestion(id: string, payload: any): Promise<ApiResponse<QuestionDto>> {
    return request<QuestionDto>(`/api/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async validateQuestion(id: string): Promise<ApiResponse<string[]>> {
    return request<string[]>(`/api/questions/${id}/validate`, {
      method: 'POST',
    });
  },

  async submitQuestion(id: string): Promise<ApiResponse<QuestionDto>> {
    return request<QuestionDto>(`/api/questions/${id}/submit`, {
      method: 'POST',
    });
  },

  async reviewQuestion(id: string, decision: 'Approved' | 'Rejected' | 'ChangesRequested', comments: string): Promise<ApiResponse<QuestionDto>> {
    return request<QuestionDto>(`/api/questions/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments }),
    });
  },

  async publishQuestion(id: string): Promise<ApiResponse<QuestionDto>> {
    return request<QuestionDto>(`/api/questions/${id}/publish`, {
      method: 'POST',
    });
  },

  async archiveQuestion(id: string): Promise<ApiResponse<QuestionDto>> {
    return request<QuestionDto>(`/api/questions/${id}/archive`, {
      method: 'POST',
    });
  },

  async createQuestionVersion(id: string): Promise<ApiResponse<QuestionDto>> {
    return request<QuestionDto>(`/api/questions/${id}/versions`, {
      method: 'POST',
    });
  },

  // Exams
  async getExams(params?: Record<string, any>): Promise<ApiResponse<PagedResult<ExamDto>>> {
    const query = new URLSearchParams(params || {}).toString();
    return request<PagedResult<ExamDto>>(`/api/exams${query ? `?${query}` : ''}`);
  },

  async getExamById(id: string): Promise<ApiResponse<ExamDto>> {
    return request<ExamDto>(`/api/exams/${id}`);
  },

  async createExam(payload: any): Promise<ApiResponse<ExamDto>> {
    return request<ExamDto>('/api/exams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async configureExam(id: string, payload: any): Promise<ApiResponse<ExamDto>> {
    return request<ExamDto>(`/api/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async validateExam(id: string): Promise<ApiResponse<string[]>> {
    return request<string[]>(`/api/exams/${id}/validate`, {
      method: 'POST',
    });
  },

  async submitExam(id: string): Promise<ApiResponse<ExamDto>> {
    return request<ExamDto>(`/api/exams/${id}/submit`, {
      method: 'POST',
    });
  },

  async approveExam(id: string, comments: string): Promise<ApiResponse<ExamDto>> {
    return request<ExamDto>(`/api/exams/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  },

  async publishExam(id: string): Promise<ApiResponse<ExamDto>> {
    return request<ExamDto>(`/api/exams/${id}/publish`, {
      method: 'POST',
    });
  },

  async archiveExam(id: string): Promise<ApiResponse<ExamDto>> {
    return request<ExamDto>(`/api/exams/${id}/archive`, {
      method: 'POST',
    });
  },

  async createExamVersion(id: string): Promise<ApiResponse<ExamDto>> {
    return request<ExamDto>(`/api/exams/${id}/versions`, {
      method: 'POST',
    });
  },

  // Audit Logs
  async getAuditLogs(params?: Record<string, any>): Promise<ApiResponse<PagedResult<any>>> {
    const query = new URLSearchParams(params || {}).toString();
    return request<PagedResult<any>>(`/api/audit-logs${query ? `?${query}` : ''}`);
  },

  // Exam Attempts (Learner Experience)
  async startAttempt(examId: string): Promise<ApiResponse<StartAttemptResultDto>> {
    return request<StartAttemptResultDto>(`/api/attempts/start/${examId}`, {
      method: 'POST',
    });
  },

  async getActiveAttempt(attemptId: string): Promise<ApiResponse<StartAttemptResultDto>> {
    return request<StartAttemptResultDto>(`/api/attempts/${attemptId}`);
  },

  async autosaveResponse(attemptId: string, payload: AutosaveResponseRequest): Promise<ApiResponse<AutosaveResultDto>> {
    return request<AutosaveResultDto>(`/api/attempts/${attemptId}/responses`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async submitAttempt(attemptId: string): Promise<ApiResponse<SubmittedExamResultDto>> {
    return request<SubmittedExamResultDto>(`/api/attempts/${attemptId}/submit`, {
      method: 'POST',
    });
  },

  async getAttemptReview(attemptId: string): Promise<ApiResponse<SubmittedExamResultDto>> {
    return request<SubmittedExamResultDto>(`/api/attempts/${attemptId}/review`);
  },

  async getAttemptHistory(): Promise<ApiResponse<ExamAttemptSummaryDto[]>> {
    return request<ExamAttemptSummaryDto[]>('/api/attempts/history');
  },
};
