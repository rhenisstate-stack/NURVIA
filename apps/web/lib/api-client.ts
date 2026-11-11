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
  AuthUserDto,
} from './api-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5055';
let csrfTokenPromise: Promise<string> | null = null;

function buildQuery(params?: Record<string, unknown>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  }
  return query.toString();
}

async function getCsrfToken(): Promise<string> {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${API_BASE}/api/auth/csrf`, {
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (response) => {
        const result = await response.json() as ApiResponse<string>;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || 'Unable to start a secure request.');
        }
        return result.data;
      })
      .catch((error: unknown) => {
        csrfTokenPromise = null;
        throw error;
      });
  }

  return csrfTokenPromise;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const method = (options.method || 'GET').toUpperCase();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      headers['X-CSRF-TOKEN'] = await getCsrfToken();
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      cache: 'no-store',
    });

    // HTTP 204 (and other empty-bodied responses) are legitimate: a 204 is a
    // success with no content, and some error responses carry no body either.
    // Never parse JSON from a bodyless response.
    const raw = await res.text();
    if (!raw) {
      if (res.ok) {
        return { success: true, message: '', statusCode: res.status } as ApiResponse<T>;
      }
      return {
        success: false,
        message: `Request failed (${res.status}).`,
        statusCode: res.status,
      };
    }

    let json: ApiResponse<T>;
    try {
      json = JSON.parse(raw) as ApiResponse<T>;
    } catch {
      return {
        success: false,
        message: `Request failed (${res.status}).`,
        statusCode: res.status,
      };
    }

    if (!res.ok && json.success) {
      return { success: false, message: `Request failed (${res.status}).`, statusCode: res.status };
    }
    return { ...json, statusCode: res.status };
  } catch (error: unknown) {
    // More specific error handling for network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        message: 'Network error connecting to NURVIA API',
        statusCode: 0,
        errors: ['Failed to connect to the server. Please check your internet connection.']
      };
    }
    
    const message = error instanceof Error ? error.message : 'Unknown network error';
    return {
      success: false,
      message: message || 'Network error connecting to NURVIA API',
      errors: [message],
    };
  }
}

export const nurviaApi = {
  // Authentication and learner profile
  async register(payload: { name: string; email: string; password: string }): Promise<ApiResponse<string>> {
    return request<string>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { email: string; password: string }): Promise<ApiResponse<AuthUserDto>> {
    return request<AuthUserDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCurrentUser(): Promise<ApiResponse<AuthUserDto>> {
    return request<AuthUserDto>('/api/auth/me');
  },

  async updateProfile(payload: { name: string }): Promise<ApiResponse<AuthUserDto>> {
    return request<AuthUserDto>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<ApiResponse<string>> {
    return request<string>('/api/auth/logout', { method: 'POST' });
  },

  // Questions
  async getQuestions(params?: Record<string, any>): Promise<ApiResponse<PagedResult<QuestionDto>>> {
    const query = buildQuery(params);
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
    const query = buildQuery(params);
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

  async releaseExamReview(id: string): Promise<ApiResponse<ExamDto>> {
    return request<ExamDto>(`/api/exams/${id}/release-review`, {
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
    const query = buildQuery(params);
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
