import {
  ApiResponse,
  PagedResult,
  QuestionDto,
  ExamDto,
  QuestionVersionDto,
  StartAttemptResultDto,
  ExamReviewContentDto,
  AutosaveResponseRequest,
  AutosaveResultDto,
  SubmittedExamResultDto,
  ExamAttemptSummaryDto,
  AuthUserDto,
  UserProfileDto,
  ExamLayout,
  LectureCatalogueItemDto,
  LectureContentDto,
  LectureManagementDto,
  CreateLectureRequest,
  UpdateLectureRequest,
  ReviewLectureRequest,
} from './api-types';
import { classifyError, isRetryableError, ErrorType } from './utils/error-utils';
import { parseApiResponse } from './api-response';
import { buildApiUrl, DEDICATED_AUTH_ROUTES } from './api-url.mjs';

function unprovisionedResponse<T>(featureName: string): ApiResponse<T> {
  return {
    success: false,
    statusCode: 501,
    errorCode: 'NOT_PROVISIONED',
    message: `${featureName} is not yet provisioned on the LexmaCasto backend for NURVIA.`,
  };
}

export { parseApiResponse, buildApiUrl, DEDICATED_AUTH_ROUTES };

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_IDEMPOTENT_RETRIES = 2;

function buildQuery(params?: Record<string, unknown>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  }
  return query.toString();
}

function createRequestSignal(callerSignal?: AbortSignal | null, timeoutMs = DEFAULT_TIMEOUT_MS): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new Error('Request timeout connecting to NURVIA API'));
  }, timeoutMs);

  const onCallerAbort = () => {
    controller.abort(callerSignal?.reason);
  };

  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort(callerSignal.reason);
    } else {
      callerSignal.addEventListener('abort', onCallerAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      callerSignal?.removeEventListener('abort', onCallerAbort);
    },
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);

  if (options.body instanceof FormData) {
    // Let the browser generate multipart/form-data and its boundary.
    headers.delete('Content-Type');
  } else if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const method = (options.method || 'GET').toUpperCase();
  const isIdempotent = method === 'GET' || method === 'HEAD';
  const maxAttempts = isIdempotent ? MAX_IDEMPOTENT_RETRIES + 1 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { signal, cleanup } = createRequestSignal(options.signal);
    try {
      const res = await fetch(buildApiUrl(endpoint), {
        ...options,
        headers,
        signal,
        credentials: 'include',
        cache: 'no-store',
      });

      // Retry idempotent requests only on transient 502/503/504 responses.
      if (isIdempotent && attempt < maxAttempts && [502, 503, 504].includes(res.status)) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
        continue;
      }

      return await parseApiResponse<T>(res);
    } catch (error: unknown) {
      const callerAborted = Boolean(options.signal?.aborted);
      if (!callerAborted && isIdempotent && attempt < maxAttempts && isRetryableError(error)) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
        continue;
      }

      const errorType = classifyError(error);

      if (errorType === ErrorType.NETWORK_ERROR) {
        return {
          success: false,
          message: 'Network error connecting to NURVIA API',
          statusCode: 0,
          errors: ['Failed to connect to the server. Please check your internet connection.'],
        };
      }

      const message = error instanceof Error ? error.message : 'Unknown network error';
      return {
        success: false,
        message: message || 'Network error connecting to NURVIA API',
        errors: [message],
      };
    } finally {
      cleanup();
    }
  }

  return {
    success: false,
    message: 'Network error connecting to NURVIA API',
    statusCode: 0,
  };
}

function isWebsiteTargetList(value: unknown): boolean {
  return typeof value === 'string' && /WEBSITE_\d+/i.test(value);
}

function inferExamPathway(item: Record<string, any>): string {
  if (typeof item.pathway === 'string' && item.pathway.trim() && !isWebsiteTargetList(item.pathway)) {
    return item.pathway.trim();
  }
  if (typeof item.target === 'string' && item.target.trim() && !isWebsiteTargetList(item.target)) {
    return item.target.trim();
  }
  const haystack = [item.assessmentName, item.programName, item.title, item.code]
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .join(' ')
    .toLowerCase();
  if (/\b(pn|lpn)\s*exit\b|pn_exit/.test(haystack)) return 'PN_Exit';
  if (/\brn\s*exit\b|rn_exit/.test(haystack)) return 'RN_Exit';
  if (/\b(pn|lpn|practical)\b|pn_lpn/.test(haystack)) return 'PN_LPN';
  return 'RN';
}

function matchesRequestedPathway(item: Record<string, any>, requestedPathway: string): boolean {
  const req = requestedPathway.trim().toLowerCase();
  const normalizedReq = req.replace(/[\s_-]+/g, '');
  const inferred = inferExamPathway(item).toLowerCase();
  const normalizedInferred = inferred.replace(/[\s_-]+/g, '');
  if (normalizedInferred === normalizedReq || normalizedInferred.includes(normalizedReq)) {
    return true;
  }
  const metaText = [item.pathway, item.assessmentName, item.programName, item.title]
    .filter((v): v is string => typeof v === 'string' && !isWebsiteTargetList(v))
    .join(' ')
    .toLowerCase();
  if (metaText.includes(req)) return true;
  if (normalizedReq === 'pnlpn' && /\b(pn|lpn|practical)\b/.test(metaText)) return true;
  return false;
}

export const nurviaApi = {
  // Authentication and learner profile
  async register(payload: {
    name?: string;
    username?: string;
    email: string;
    phone?: string;
    password?: string;
    passwordConfirmation?: string;
    pin?: string;
    pinConfirmation?: string;
    loginMethod?: string;
    agree?: boolean;
    dashboardName?: string;
    provider?: string;
    providerPayload?: string | Record<string, unknown>;
  }): Promise<ApiResponse<string>> {
    return request<string>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: {
    email: string;
    password?: string;
    pin?: string;
    loginMethod?: string;
    LoginProvider?: string;
    fingerprint?: string;
    dashboardName?: string;
    role?: string;
    rememberMe?: boolean;
  }): Promise<ApiResponse<AuthUserDto>> {
    return request<AuthUserDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCurrentUser(init: Pick<RequestInit, 'signal'> = {}): Promise<ApiResponse<AuthUserDto>> {
    return request<AuthUserDto>('/api/auth/me', init);
  },

  async logout(options?: { scope?: 'distinct' | 'relative'; target_dashboard?: string }): Promise<ApiResponse<string>> {
    return request<string>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  },

  // Verified LexmaCasto Academic Strata (with mandatory server-enforced fetchtype)
  async getStrata<T = import('./lexmacasto/contracts').StrataRecord>(
    resource: import('./lexmacasto/contracts').StrataResourceKey,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ApiResponse<import('./lexmacasto/contracts').StrataPagedData<T>>> {
    const query = buildQuery(params);
    return request(`/api/strata/${resource}${query ? `?${query}` : ''}`);
  },

  async updateProfile(payload: { name: string }): Promise<ApiResponse<AuthUserDto>> {
    return request<AuthUserDto>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getProfile(): Promise<ApiResponse<UserProfileDto>> {
    return request<UserProfileDto>('/api/profile');
  },

  async updateProfileDetails(payload: any): Promise<ApiResponse<{ profile: UserProfileDto; message: string }>> {
    return request<{ profile: UserProfileDto; message: string }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ storageKey: string; message: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return request<{ storageKey: string; message: string }>('/api/avatar', {
      method: 'POST',
      body: formData,
    });
  },

  async getAvatar(): Promise<ApiResponse<{ storageKey: string; url: string; uploadedAtUtc: string }>> {
    return request<{ storageKey: string; url: string; uploadedAtUtc: string }>('/api/avatar');
  },

  async removeAvatar(): Promise<ApiResponse<string>> {
    return request<string>('/api/avatar', {
      method: 'DELETE',
    });
  },

  async forgotPassword(payload: { email: string }): Promise<ApiResponse<string>> {
    return request<string>('/api/auth/recovery/password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resetPassword(payload: { token: string; newPassword: string }): Promise<ApiResponse<string>> {
    return request<string>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getUsers(params?: { search?: string; pageNumber?: number; pageSize?: number }): Promise<
    ApiResponse<
      PagedResult<{
        id: string;
        name: string;
        email: string;
        role: string;
        isActive: boolean;
        createdAtUtc: string;
      }>
    >
  > {
    const query = buildQuery(params);
    return request(`/api/auth/users${query ? `?${query}` : ''}`);
  },

  async assignRole(payload: { targetUserId: string; role: string }): Promise<ApiResponse<string>> {
    return request<string>('/api/auth/assign-role', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
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
    if (params?.status === 'Published') {
      const page = Number(params.pageNumber ?? params.page ?? 1) || 1;
      const rawPerPage = Number(params.pageSize ?? params.perPage ?? 20) || 20;
      const perPage = Math.max(1, Math.min(100, rawPerPage));
      const strataRes = await this.getStrata<Record<string, any>>('exams', {
        fetchtype: 'absolute',
        page,
        perPage,
        ...(typeof params.search === 'string' && params.search.trim()
          ? { search: params.search.trim() }
          : {}),
      });

      if (!strataRes.success || !strataRes.data) {
        return {
          success: false,
          message: strataRes.message,
          errorCode: strataRes.errorCode,
          errors: strataRes.errors,
          statusCode: strataRes.statusCode,
        };
      }

      const requestedPathway =
        typeof params.pathway === 'string' && params.pathway.trim()
          ? params.pathway.trim()
          : null;

      const mappedItems: ExamDto[] = strataRes.data.items
        .filter((item) => {
          const itemStatus = typeof item.status === 'string' ? item.status.trim().toLowerCase() : '';
          if (itemStatus && itemStatus !== 'published' && itemStatus !== 'active') {
            return false;
          }
          if (requestedPathway && !matchesRequestedPathway(item, requestedPathway)) {
            return false;
          }
          return true;
        })
        .map((item) => ({
          id: String(item.guidId ?? item.id ?? ''),
          code: String(item.code ?? item.guidId ?? item.id ?? ''),
          title: String(item.title ?? item.name ?? 'Untitled Exam'),
          description: String(item.description ?? ''),
          pathway: inferExamPathway(item) as ExamDto['pathway'],
          category: (typeof item.category === 'string' && item.category
            ? item.category
            : typeof item.type === 'string' && item.type
              ? item.type
              : typeof item.assessmentName === 'string' && item.assessmentName
                ? item.assessmentName
                : 'RegularCourse') as ExamDto['category'],
          modeAllowed: (typeof item.modeAllowed === 'string' && item.modeAllowed
            ? item.modeAllowed
            : 'Both') as ExamDto['modeAllowed'],
          timeLimitMinutes: Number(item.timeLimitMinutes ?? item.duration ?? 60),
          passingScorePercentage: Number(item.passingScorePercentage ?? item.passMark ?? 75),
          status: (typeof item.status === 'string' && item.status ? item.status : 'Published') as ExamDto['status'],
          totalQuestions: Number(item.totalQuestions ?? item.questionsCount ?? 0),
          concurrencyToken: String(item.concurrencyToken ?? ''),
          createdAtUtc: String(item.createdAtUtc ?? item.createdAt ?? new Date().toISOString()),
          createdBy: String(item.createdBy ?? ''),
        }))
        .filter((item) => Boolean(item.id));

      const totalCount = strataRes.data.skewTotal ?? mappedItems.length;
      const totalPages = strataRes.data.skewTotalPages ?? Math.max(1, Math.ceil(totalCount / perPage));

      return {
        success: true,
        message: strataRes.message || 'OK',
        statusCode: strataRes.statusCode,
        data: {
          items: mappedItems,
          totalCount,
          pageNumber: strataRes.data.skewPage ?? page,
          pageSize: strataRes.data.skewPerPage ?? perPage,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }

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
  async startAttempt(
    examId: string,
    options?: { deliveryMode?: 'Exam' | 'Tutor'; layoutMode?: ExamLayout | null }
  ): Promise<ApiResponse<StartAttemptResultDto>> {
    const body = options
      ? { deliveryMode: options.deliveryMode || 'Exam', layoutMode: options.layoutMode ?? null }
      : undefined;
    return request<StartAttemptResultDto>(`/api/attempts/start/${examId}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async getExamReviewContent(examId: string): Promise<ApiResponse<ExamReviewContentDto>> {
    return request<ExamReviewContentDto>(`/api/exams/${examId}/review-content`);
  },

  async getExamPreviewContent(examId: string): Promise<ApiResponse<ExamReviewContentDto>> {
    return request<ExamReviewContentDto>(`/api/exams/${examId}/preview`);
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

  // Mark K. Lecture Notes
  async getLectureCatalogue(): Promise<ApiResponse<LectureCatalogueItemDto[]>> {
    return request<LectureCatalogueItemDto[]>('/api/lectures');
  },

  async getLectureBySlug(slug: string): Promise<ApiResponse<LectureContentDto>> {
    return request<LectureContentDto>(`/api/lectures/${encodeURIComponent(slug)}`);
  },

  async getManagementLectures(): Promise<ApiResponse<LectureManagementDto[]>> {
    return request<LectureManagementDto[]>('/api/lectures/management');
  },

  async getManagementLecture(id: string): Promise<ApiResponse<LectureManagementDto>> {
    return request<LectureManagementDto>(`/api/lectures/management/${id}`);
  },

  async createLectureDraft(payload: CreateLectureRequest): Promise<ApiResponse<LectureManagementDto>> {
    return request<LectureManagementDto>('/api/lectures', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateLectureDraft(id: string, payload: UpdateLectureRequest): Promise<ApiResponse<LectureManagementDto>> {
    return request<LectureManagementDto>(`/api/lectures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async submitLectureForReview(id: string): Promise<ApiResponse<LectureManagementDto>> {
    return request<LectureManagementDto>(`/api/lectures/${id}/submit-for-review`, {
      method: 'POST',
    });
  },

  async reviewLecture(id: string, payload: ReviewLectureRequest): Promise<ApiResponse<LectureManagementDto>> {
    return request<LectureManagementDto>(`/api/lectures/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async publishLecture(id: string): Promise<ApiResponse<LectureManagementDto>> {
    return request<LectureManagementDto>(`/api/lectures/${id}/publish`, {
      method: 'POST',
    });
  },

  async archiveLecture(id: string): Promise<ApiResponse<LectureManagementDto>> {
    return request<LectureManagementDto>(`/api/lectures/${id}/archive`, {
      method: 'POST',
    });
  },

  // Study Library & Personal Library (backed by verified LexmaCasto Strata endpoints)
  async getStudyLibrary(params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<PagedResult<import('./api-types').StudySetCardDto>>> {
    if (params?.savedOnly === true || params?.savedOnly === 'true') {
      return unprovisionedResponse('Personal Saved Study Library');
    }

    const pageNumber = Math.max(1, Number(params?.pageNumber ?? params?.page ?? 1) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(params?.pageSize ?? params?.perPage ?? 12) || 12));
    const search = typeof params?.searchTerm === 'string' && params.searchTerm.trim()
      ? params.searchTerm.trim()
      : typeof params?.search === 'string' && params.search.trim()
        ? params.search.trim()
        : undefined;

    const strataRes = await this.getStrata<Record<string, any>>('exams', {
      fetchtype: 'absolute',
      page: pageNumber,
      perPage: pageSize,
      ...(search ? { search } : {}),
      ...(typeof params?.examId === 'string' && params.examId.trim() ? { examId: params.examId.trim() } : {}),
    });

    if (!strataRes.success || !strataRes.data) {
      return {
        success: false,
        message: strataRes.message || 'Unable to load published study sets.',
        errorCode: strataRes.errorCode,
        errors: strataRes.errors,
        statusCode: strataRes.statusCode,
      };
    }

    const reqPathway = typeof params?.pathway === 'string' && params.pathway.trim() ? params.pathway.trim().toLowerCase() : null;
    const reqCategory = typeof params?.category === 'string' && params.category.trim() ? params.category.trim().toLowerCase() : null;
    const reqSchool = typeof params?.school === 'string' && params.school.trim() ? params.school.trim().toLowerCase() : null;
    const reqSubject = typeof params?.subject === 'string' && params.subject.trim() ? params.subject.trim().toLowerCase() : null;
    const reqTopic = typeof params?.topic === 'string' && params.topic.trim() ? params.topic.trim().toLowerCase() : null;
    const reqDifficulty = typeof params?.difficulty === 'string' && params.difficulty.trim() ? params.difficulty.trim().toLowerCase() : null;
    const reqSeason = typeof params?.season === 'string' && params.season.trim() ? params.season.trim().toLowerCase() : null;
    const reqYear = params?.academicYear ? Number(params.academicYear) : null;

    const mappedItems: import('./api-types').StudySetCardDto[] = strataRes.data.items
      .filter((item) => {
        const itemStatus = typeof item.status === 'string' ? item.status.trim().toLowerCase() : '';
        if (itemStatus && itemStatus !== 'published' && itemStatus !== 'active') {
          return false;
        }
        if (reqPathway && !matchesRequestedPathway(item, reqPathway)) {
          return false;
        }
        if (reqCategory) {
          const itemCat = String(item.category ?? item.type ?? item.assessmentName ?? '').trim().toLowerCase();
          if (itemCat && !itemCat.includes(reqCategory)) return false;
        }
        if (reqSchool) {
          const itemSchool = String(item.school ?? item.schoolName ?? '').trim().toLowerCase();
          if (itemSchool !== reqSchool) return false;
        }
        if (reqSubject) {
          const itemSubject = String(item.subject ?? item.subjectName ?? '').trim().toLowerCase();
          if (itemSubject !== reqSubject) return false;
        }
        if (reqTopic) {
          const itemTopic = String(item.topic ?? item.topicName ?? '').trim().toLowerCase();
          if (itemTopic !== reqTopic) return false;
        }
        if (reqDifficulty) {
          const itemDiff = String(item.difficulty ?? '').trim().toLowerCase();
          if (itemDiff !== reqDifficulty) return false;
        }
        if (reqSeason) {
          const itemSeason = String(item.season ?? item.term ?? '').trim().toLowerCase();
          if (itemSeason !== reqSeason) return false;
        }
        if (reqYear) {
          const itemYear = Number(item.academicYear ?? item.year ?? 0);
          if (itemYear !== reqYear) return false;
        }
        return true;
      })
      .map((item) => ({
        id: String(item.guidId ?? item.id ?? ''),
        code: String(item.code ?? item.guidId ?? item.id ?? ''),
        title: String(item.title ?? item.name ?? 'Untitled Study Set'),
        description: String(item.description ?? ''),
        pathway: inferExamPathway(item) as import('./api-types').NursingPathway,
        category: (typeof item.category === 'string' && item.category
          ? item.category
          : typeof item.type === 'string' && item.type
            ? item.type
            : typeof item.assessmentName === 'string' && item.assessmentName
              ? item.assessmentName
              : 'RegularCourse') as import('./api-types').ExamCategory,
        totalQuestions: Number(item.totalQuestions ?? item.questionsCount ?? 0),
        timeLimitMinutes: Number(item.timeLimitMinutes ?? item.duration ?? 60),
        modeAllowed: (typeof item.modeAllowed === 'string' && item.modeAllowed
          ? item.modeAllowed
          : 'Both') as ExamDto['modeAllowed'],
        passingScorePercentage: Number(item.passingScorePercentage ?? item.passMark ?? 75),
        allowedLayouts: (typeof item.allowedLayouts === 'string' && item.allowedLayouts
          ? item.allowedLayouts
          : 'Any') as import('./api-types').ExamLayoutPolicy,
        defaultLayout: (typeof item.defaultLayout === 'string' && item.defaultLayout
          ? item.defaultLayout
          : 'Classic') as ExamLayout,
        school: typeof item.school === 'string' ? item.school : typeof item.schoolName === 'string' ? item.schoolName : null,
        academicYear: typeof item.academicYear === 'number' ? item.academicYear : typeof item.year === 'number' ? item.year : null,
        subject: typeof item.subject === 'string' ? item.subject : typeof item.subjectName === 'string' ? item.subjectName : null,
        season: typeof item.season === 'string' ? item.season : null,
        topic: typeof item.topic === 'string' ? item.topic : null,
        difficulty: (typeof item.difficulty === 'string' ? item.difficulty : null) as import('./api-types').DifficultyLevel | null,
        averageRating: typeof item.averageRating === 'number' ? item.averageRating : typeof item.rating === 'number' ? item.rating : null,
        reviewCount: Number(item.reviewCount ?? 0),
        featuredTestimonial: typeof item.featuredTestimonial === 'string' ? item.featuredTestimonial : null,
        isSaved: false,
      }))
      .filter((item) => Boolean(item.id));

    const hasLocalFilter = Boolean(
      reqPathway ||
      reqCategory ||
      reqSchool ||
      reqSubject ||
      reqTopic ||
      reqDifficulty ||
      reqSeason ||
      reqYear
    );
    const totalCount = hasLocalFilter
      ? mappedItems.length
      : (strataRes.data.skewTotal ?? mappedItems.length);
    const totalPages = hasLocalFilter
      ? Math.max(1, Math.ceil(totalCount / pageSize))
      : Math.max(1, strataRes.data.skewTotalPages ?? Math.ceil(totalCount / pageSize));

    return {
      success: true,
      message: strataRes.message || 'OK',
      statusCode: strataRes.statusCode,
      data: {
        items: mappedItems,
        totalCount,
        pageNumber: strataRes.data.skewPage ?? pageNumber,
        pageSize: strataRes.data.skewPerPage ?? pageSize,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    };
  },

  async getStudyLibraryFilters(): Promise<ApiResponse<import('./api-types').StudyLibraryFiltersDto>> {
    const [schoolsRes, subjectsRes, topicsRes, examsRes, sectionsRes] = await Promise.all([
      this.getStrata<Record<string, any>>('schools', { fetchtype: 'absolute', page: 1, perPage: 100 }),
      this.getStrata<Record<string, any>>('subjects', { fetchtype: 'absolute', page: 1, perPage: 100 }),
      this.getStrata<Record<string, any>>('topics', { fetchtype: 'absolute', page: 1, perPage: 100 }),
      this.getStrata<Record<string, any>>('exams', { fetchtype: 'absolute', page: 1, perPage: 100 }),
      this.getStrata<Record<string, any>>('sections', { fetchtype: 'absolute', page: 1, perPage: 100 }),
    ]);

    if (!schoolsRes.success && !subjectsRes.success && !topicsRes.success && !examsRes.success && !sectionsRes.success) {
      return {
        success: false,
        message: examsRes.message || 'Unable to load study library filters.',
        errorCode: examsRes.errorCode,
      };
    }

    const pickName = (r: Record<string, any>) =>
      String(r.name ?? r.title ?? r.slug ?? r.code ?? r.id ?? '').trim();
    const pickId = (r: Record<string, any>) =>
      String(r.guidId ?? r.id ?? r._id ?? r.slug ?? '').trim();

    const examItems = examsRes.success && examsRes.data ? examsRes.data.items : [];
    const sectionItems = sectionsRes.success && sectionsRes.data ? sectionsRes.data.items : [];

    const yearSet = new Set<number>();
    const seasonSet = new Set<string>();
    const difficultySet = new Set<string>();
    for (const rec of [...examItems, ...sectionItems]) {
      const y = rec.academicYear ?? rec.year;
      if (typeof y === 'number' && Number.isFinite(y)) yearSet.add(y);
      else if (typeof y === 'string' && /^\d{4}$/.test(y.trim())) yearSet.add(Number(y.trim()));
      const s = rec.season ?? rec.term;
      if (typeof s === 'string' && s.trim()) seasonSet.add(s.trim());
      if (typeof rec.difficulty === 'string' && rec.difficulty.trim()) difficultySet.add(rec.difficulty.trim());
    }

    return {
      success: true,
      message: 'OK',
      data: {
        pathways: [],
        categories: [],
        schools: (schoolsRes.data?.items ?? []).map(pickName).filter(Boolean),
        academicYears: Array.from(yearSet).sort((a, b) => b - a),
        subjects: (subjectsRes.data?.items ?? []).map(pickName).filter(Boolean),
        seasons: Array.from(seasonSet),
        exams: examItems
          .map((ex) => ({
            id: pickId(ex),
            code: typeof ex.code === 'string' && ex.code.trim() ? ex.code.trim() : pickId(ex),
            title: pickName(ex),
            pathway: typeof ex.pathway === 'string' ? ex.pathway : 'RN',
            category: typeof ex.category === 'string' ? ex.category : 'RegularCourse',
          }))
          .filter((ex) => ex.id && ex.title),
        topics: (topicsRes.data?.items ?? []).map(pickName).filter(Boolean),
        difficulties: Array.from(difficultySet) as import('./api-types').DifficultyLevel[],
        questionTypes: [],
      },
    };
  },

  async getStudyLibrarySummary(): Promise<ApiResponse<import('./api-types').StudyLibrarySummaryDto>> {
    const [examsRes, categoriesRes, questionsRes] = await Promise.all([
      this.getStrata<Record<string, any>>('exams', { fetchtype: 'absolute', page: 1, perPage: 1 }),
      this.getStrata<Record<string, any>>('categories', { fetchtype: 'absolute', page: 1, perPage: 1 }),
      this.getStrata<Record<string, any>>('questions', { fetchtype: 'absolute', page: 1, perPage: 1 }),
    ]);

    if (!examsRes.success && !categoriesRes.success && !questionsRes.success) {
      return {
        success: false,
        message: examsRes.message || 'Unable to load study library summary.',
        errorCode: examsRes.errorCode,
      };
    }

    return {
      success: true,
      message: 'OK',
      data: {
        totalPublishedStudySets: examsRes.data?.skewTotal ?? examsRes.data?.items.length ?? 0,
        totalAvailableQuestions: questionsRes.data?.skewTotal ?? questionsRes.data?.items.length ?? 0,
        totalCategories: categoriesRes.data?.skewTotal ?? categoriesRes.data?.items.length ?? 0,
        totalPathways: 0,
      },
    };
  },

  async getStudySetDetail(examId: string): Promise<ApiResponse<import('./api-types').StudySetDetailDto>> {
    return unprovisionedResponse(`Study set detail (${examId})`);
  },

  async getSavedStudySets(): Promise<ApiResponse<import('./api-types').StudySetCardDto[]>> {
    return unprovisionedResponse('Personal Saved Study Library');
  },

  async saveStudySet(_examId: string): Promise<ApiResponse<string>> {
    return unprovisionedResponse('Personal Saved Study Library');
  },

  async removeSavedStudySet(_examId: string): Promise<ApiResponse<string>> {
    return unprovisionedResponse('Personal Saved Study Library');
  },

  async getStudySetReviews(_examId: string, _pageNumber = 1, _pageSize = 10): Promise<ApiResponse<PagedResult<import('./api-types').ExamReviewDto>>> {
    return unprovisionedResponse('Study Set Reviews');
  },

  async submitStudySetReview(_examId: string, _payload: import('./api-types').SubmitExamReviewRequest): Promise<ApiResponse<import('./api-types').ExamReviewDto>> {
    return unprovisionedResponse('Study Set Reviews');
  },

  // Tutor Mode Progressive Guidance
  async requestTutorHint(
    attemptId: string,
    payload: { questionId: string; stage: import('./api-types').TutorStage }
  ): Promise<ApiResponse<import('./api-types').TutorHintResponseDto>> {
    return request(`/api/attempts/${attemptId}/tutor/hint`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async evaluateTutorAnswer(
    attemptId: string,
    payload: { questionId: string; responseJson: string }
  ): Promise<ApiResponse<import('./api-types').TutorEvaluateResponseDto>> {
    return request(`/api/attempts/${attemptId}/tutor/evaluate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Tutor session recovery: server-authoritative stage progression with
  // already-authorized evaluation content (never answer-bearing for stages 1-3).
  async getTutorSessionState(
    attemptId: string
  ): Promise<ApiResponse<import('./api-types').TutorSessionStateDto>> {
    return request(`/api/attempts/${attemptId}/tutor/session`, {
      method: 'GET',
    });
  },

  // Admin Dashboard & Operations
  async getAdminOverview(): Promise<ApiResponse<{
    totalQuestions: number;
    publishedQuestions: number;
    totalExams: number;
    publishedExams: number;
    totalLearners: number;
    activeLearners: number;
    clinicalCaseStudies: number;
    pipeline: { stage: string; count: number }[];
    recentQuestions: {
      id: string;
      stemPreview: string;
      category: string;
      questionType: string;
      status: string;
      createdAtUtc: string;
    }[];
  }>> {
    return request('/api/admin/overview');
  },

  async getAdminLearners(params?: { search?: string; pageNumber?: number; pageSize?: number }): Promise<ApiResponse<PagedResult<{
    id: string;
    name: string;
    email: string;
    pathway: string;
    isActive: boolean;
    completedExams: number;
    averageScorePercentage: number | null;
    createdAtUtc: string;
  }>>> {
    const query = buildQuery(params);
    return request(`/api/admin/learners${query ? `?${query}` : ''}`);
  },

  async getAdminQuestionTypes(): Promise<ApiResponse<{
    codeValue: number;
    code: string;
    name: string;
    gradingMode: string;
    description: string;
    questionCount: number;
  }[]>> {
    return request('/api/admin/question-types');
  },

  async getAdminAnalytics(): Promise<ApiResponse<{
    totalAttempts: number;
    completedAttempts: number;
    inProgressAttempts: number;
    meanScorePercentage: number | null;
    passRatePercentage: number | null;
    trackBreakdown: {
      pathway: string;
      attemptCount: number;
      completedCount: number;
      meanScorePercentage: number | null;
    }[];
  }>> {
    return request('/api/admin/analytics');
  },

  async getAdminTaxonomy(): Promise<ApiResponse<{
    totalQuestions: number;
    clientNeedsCategories: {
      category: string;
      questionCount: number;
      subjects: string[];
    }[];
    pathways: string[];
    subjects: string[];
    topics: string[];
  }>> {
    return request('/api/admin/taxonomy');
  },

  async getAdminSystemStatus(): Promise<ApiResponse<{
    environment: string;
    databaseStatus: string;
    pendingMigrationsCount: number;
    aiTutorProvider: string;
    emailDeliveryMode: string;
    checkedAtUtc: string;
  }>> {
    return request('/api/admin/system-status');
  },

  // Learner Saved Questions (not yet provisioned on LexmaCasto)
  async getSavedQuestions(): Promise<ApiResponse<{
    id: string;
    questionId: string;
    examId: string | null;
    stem: string;
    subject: string;
    topic: string;
    questionType: string;
    notes: string | null;
    savedAtUtc: string;
  }[]>> {
    return unprovisionedResponse('Saved Questions');
  },

  async saveQuestion(_questionId: string, _payload?: { examId?: string | null; notes?: string | null }): Promise<ApiResponse<{
    id: string;
    questionId: string;
    examId: string | null;
    stem: string;
    subject: string;
    topic: string;
    questionType: string;
    notes: string | null;
    savedAtUtc: string;
  }>> {
    return unprovisionedResponse('Saved Questions');
  },

  async removeSavedQuestion(_questionId: string): Promise<ApiResponse<string>> {
    return unprovisionedResponse('Saved Questions');
  },

  // Learner Study Planner (not yet provisioned on LexmaCasto)
  async getPlannerTasks(): Promise<ApiResponse<{
    id: string;
    title: string;
    scheduledForUtc: string;
    durationMinutes: number;
    examId: string | null;
    examTitle: string | null;
    isCompleted: boolean;
    completedAtUtc: string | null;
    createdAtUtc: string;
  }[]>> {
    return unprovisionedResponse('Study Planner');
  },

  async createPlannerTask(_payload: {
    title: string;
    scheduledForUtc: string;
    durationMinutes: number;
    examId?: string | null;
  }): Promise<ApiResponse<{
    id: string;
    title: string;
    scheduledForUtc: string;
    durationMinutes: number;
    examId: string | null;
    examTitle: string | null;
    isCompleted: boolean;
    completedAtUtc: string | null;
    createdAtUtc: string;
  }>> {
    return unprovisionedResponse('Study Planner');
  },

  async updatePlannerTask(_taskId: string, _payload: {
    title?: string;
    scheduledForUtc?: string;
    durationMinutes?: number;
    examId?: string | null;
    isCompleted?: boolean;
  }): Promise<ApiResponse<{
    id: string;
    title: string;
    scheduledForUtc: string;
    durationMinutes: number;
    examId: string | null;
    examTitle: string | null;
    isCompleted: boolean;
    completedAtUtc: string | null;
    createdAtUtc: string;
  }>> {
    return unprovisionedResponse('Study Planner');
  },

  async deletePlannerTask(_taskId: string): Promise<ApiResponse<string>> {
    return unprovisionedResponse('Study Planner');
  },

  // Flashcards & Spaced Repetition (not yet provisioned on LexmaCasto)
  async getFlashcards(_params?: { category?: string; dueOnly?: boolean }): Promise<ApiResponse<import('./api-types').FlashcardDto[]>> {
    return unprovisionedResponse('Spaced Repetition Flashcards');
  },

  async createFlashcard(_payload: {
    category: string;
    pathway: string;
    front: string;
    back: string;
    hint?: string;
  }): Promise<ApiResponse<import('./api-types').FlashcardDto>> {
    return unprovisionedResponse('Spaced Repetition Flashcards');
  },

  async deleteFlashcard(_id: string): Promise<ApiResponse<string>> {
    return unprovisionedResponse('Spaced Repetition Flashcards');
  },

  async reviewFlashcard(_id: string, _rating: 'Again' | 'Hard' | 'Good' | 'Easy'): Promise<ApiResponse<import('./api-types').FlashcardDto>> {
    return unprovisionedResponse('Spaced Repetition Flashcards');
  },

  // Care Plans (not yet provisioned on LexmaCasto)
  async getCarePlans(_params?: { specialty?: string; search?: string }): Promise<ApiResponse<import('./api-types').CarePlanDto[]>> {
    return unprovisionedResponse('Clinical Nursing Care Plans');
  },

  async createCarePlan(_payload: {
    title: string;
    specialty: string;
    diagnosis: string;
    relatedTo: string;
    outcomes: string[];
    interventions: string[];
    rationale: string;
  }): Promise<ApiResponse<import('./api-types').CarePlanDto>> {
    return unprovisionedResponse('Clinical Nursing Care Plans');
  },

  async deleteCarePlan(_id: string): Promise<ApiResponse<string>> {
    return unprovisionedResponse('Clinical Nursing Care Plans');
  },

  // Study Guides (not yet provisioned on LexmaCasto)
  async getStudyGuides(_params?: { category?: string; pathway?: string; search?: string }): Promise<ApiResponse<import('./api-types').StudyGuideSummaryDto[]>> {
    return unprovisionedResponse('Study Guides');
  },

  async getStudyGuideById(_id: string): Promise<ApiResponse<import('./api-types').StudyGuideDetailDto>> {
    return unprovisionedResponse('Study Guides');
  },

  async createStudyGuide(_payload: {
    title: string;
    category: string;
    pathway: string;
    summary: string;
    contentMarkdown: string;
    readingMinutes?: number;
    isPublished?: boolean;
  }): Promise<ApiResponse<import('./api-types').StudyGuideDetailDto>> {
    return unprovisionedResponse('Study Guides');
  },

  // Community (not yet provisioned on LexmaCasto)
  async getCommunityPosts(_params?: { channelId?: string; search?: string }): Promise<ApiResponse<import('./api-types').CommunityPostDto[]>> {
    return unprovisionedResponse('Community Discussions');
  },

  async getCommunityPost(_id: string): Promise<ApiResponse<import('./api-types').CommunityPostDto>> {
    return unprovisionedResponse('Community Discussions');
  },

  async createCommunityPost(_payload: {
    channelId: string;
    cohortLabel: string;
    title: string;
    content: string;
  }): Promise<ApiResponse<import('./api-types').CommunityPostDto>> {
    return unprovisionedResponse('Community Discussions');
  },

  async addCommunityReply(_postId: string, _content: string): Promise<ApiResponse<import('./api-types').CommunityReplyDto>> {
    return unprovisionedResponse('Community Discussions');
  },

  async toggleCommunityLike(_postId: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
    return unprovisionedResponse('Community Discussions');
  },

  async deleteCommunityPost(_postId: string): Promise<ApiResponse<string>> {
    return unprovisionedResponse('Community Discussions');
  },

  // AI Tutor Chat Sessions (not yet provisioned on LexmaCasto)
  async getTutorSessions(): Promise<ApiResponse<import('./api-types').TutorChatSessionDto[]>> {
    return unprovisionedResponse('AI Tutor Sessions');
  },

  async createTutorSession(_payload: { title?: string; pathway?: string; topic?: string }): Promise<ApiResponse<import('./api-types').TutorChatSessionDto>> {
    return unprovisionedResponse('AI Tutor Sessions');
  },

  async getTutorSession(_id: string): Promise<ApiResponse<import('./api-types').TutorChatSessionDto>> {
    return unprovisionedResponse('AI Tutor Sessions');
  },

  async sendTutorMessage(_id: string, _message: string): Promise<ApiResponse<import('./api-types').TutorChatSessionDto>> {
    return unprovisionedResponse('AI Tutor Sessions');
  },

  async deleteTutorSession(_id: string): Promise<ApiResponse<string>> {
    return unprovisionedResponse('AI Tutor Sessions');
  },

  // Subscriptions & Entitlements (not yet provisioned on LexmaCasto for NURVIA)
  async getSubscriptionPlans(): Promise<ApiResponse<import('./api-types').SubscriptionPlanDto[]>> {
    return unprovisionedResponse('Subscription Plans');
  },

  async getMySubscription(): Promise<ApiResponse<{
    activeSubscription: import('./api-types').UserSubscriptionDto | null;
    plans: import('./api-types').SubscriptionPlanDto[];
    paymentProviderConfigured: boolean;
  }>> {
    return unprovisionedResponse('Subscriptions');
  },

  async activateFreeTier(): Promise<ApiResponse<import('./api-types').UserSubscriptionDto>> {
    return unprovisionedResponse('Subscriptions');
  },

  async requestCheckout(_planId: string): Promise<ApiResponse<string>> {
    return unprovisionedResponse('Subscriptions');
  },

  async getAdminSubscriptions(): Promise<ApiResponse<import('./api-types').UserSubscriptionDto[]>> {
    return request('/api/admin/subscriptions');
  },

  async createSubscriptionPlan(payload: {
    code: string;
    name: string;
    description: string;
    monthlyPriceUsd: number;
    billingInterval: string;
    features: string[];
    isActive?: boolean;
  }): Promise<ApiResponse<import('./api-types').SubscriptionPlanDto>> {
    return request('/api/admin/plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async grantEntitlement(payload: {
    targetUserId: string;
    planId: string;
    durationDays: number;
    notes?: string;
  }): Promise<ApiResponse<import('./api-types').UserSubscriptionDto>> {
    return request('/api/admin/subscriptions/grant', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async revokeEntitlement(subscriptionId: string): Promise<ApiResponse<string>> {
    return request(`/api/admin/subscriptions/${subscriptionId}/revoke`, { method: 'POST' });
  },

  // Staff Invitations
  async getStaffInvitations(): Promise<ApiResponse<import('./api-types').StaffInvitationDto[]>> {
    return request('/api/auth/invitations');
  },

  async createStaffInvitation(payload: { email: string; role: string }): Promise<ApiResponse<{
    invitation: import('./api-types').StaffInvitationDto;
    devInviteToken?: string | null;
  }>> {
    return request('/api/auth/invitations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async revokeStaffInvitation(id: string): Promise<ApiResponse<string>> {
    return request(`/api/auth/invitations/${id}`, { method: 'DELETE' });
  },

  async acceptStaffInvitation(payload: { token: string; name: string; password: string }): Promise<ApiResponse<string>> {
    return request('/api/auth/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Qlex-Compatible Search (Seek)
  async seek(params: {
    query: string;
    fetchtype?: 'absolute' | 'distinct';
    scope?: string;
    mode?: string;
    sort?: string;
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    const qs = new URLSearchParams();
    qs.set('fetchtype', params.fetchtype || 'absolute');
    qs.set('query', params.query);
    if (params.scope) qs.set('scope', params.scope);
    if (params.mode) qs.set('mode', params.mode);
    if (params.sort) qs.set('sort', params.sort);
    if (params.page) qs.set('page', String(params.page));
    if (params.perPage) qs.set('perPage', String(params.perPage));
    return request(`/api/seek?${qs.toString()}`);
  },

  async seekSuggest(query: string): Promise<ApiResponse<unknown[]>> {
    const qs = new URLSearchParams({ fetchtype: 'suggest', query });
    return request(`/api/seek?${qs.toString()}`);
  },

  async getSeekHistory(): Promise<ApiResponse<unknown[]>> {
    return request('/api/seek?fetchtype=history');
  },

  async clearSeekHistory(): Promise<ApiResponse<string>> {
    return request('/api/seek?fetchtype=history', { method: 'DELETE' });
  },

  // DIY Custom Learning Exam
  async createDiyExam(payload: {
    title: string;
    totalQuestions: number;
    description?: string;
    courseId?: string;
    subjectId?: string;
    timeLimitMinutes?: number;
    [key: string]: unknown;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/exams/diy', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Authenticated Account Deletion & Support Token Validation
  async destroyAccount(reason: string): Promise<ApiResponse<string>> {
    return request('/api/auth/account/destroy', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async validateSupportToken(token: string, context: string): Promise<ApiResponse<Record<string, unknown>>> {
    const qs = new URLSearchParams({ token, context });
    return request(`/api/auth/validate?${qs.toString()}`);
  },

  // Staff Academic Strata CRUD
  async createStrataRecord(resource: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return request(`/api/strata/${resource}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStrataRecord(resource: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return request(`/api/strata/${resource}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteStrataRecord(resource: string, payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return request(`/api/strata/${resource}`, {
      method: 'DELETE',
      body: JSON.stringify(payload),
    });
  },

  // LexmaCasto Support, Security, Notifications (Heed) & Subscriptions
  async updateSupportAccount(payload: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/account', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async changeSupportPassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/account', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getTwoFactorStatus(): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/2fa?fetchtype=current');
  },

  async setupTwoFactor(): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/2fa', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async confirmTwoFactor(code: string): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/2fa', {
      method: 'PUT',
      body: JSON.stringify({ code }),
    });
  },

  async disableTwoFactor(code?: string): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/2fa', {
      method: 'DELETE',
      body: JSON.stringify(code ? { code } : {}),
    });
  },

  async sendEmailVerification(): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/email', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async confirmEmailVerification(code: string): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/email', {
      method: 'PUT',
      body: JSON.stringify({ code }),
    });
  },

  async getSupportMessages(params?: {
    fetchtype?: 'relative' | 'current';
    status?: string;
    search?: string;
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    const qs = new URLSearchParams();
    qs.set('fetchtype', params?.fetchtype ?? 'relative');
    if (params?.status) qs.set('clientStatus', params.status);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.perPage) qs.set('perPage', String(params.perPage));
    return request(`/api/auth/support/message?${qs.toString()}`);
  },

  async sendSupportMessage(payload: {
    subject: string;
    message: string;
    category?: string;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/message', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateSupportMessageStatus(payload: {
    id: string | number;
    clientReadStatus: 'Unread' | 'Read' | 'Later' | 'Bookmarked' | 'Flagged' | 'Pinned' | 'Starred';
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/auth/support/message', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getLexmaCastoSubscriptionPackages(): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/subscriptions/packages?fetchtype=discrete');
  },

  async getLexmaCastoSubscriptionItems(): Promise<ApiResponse<Record<string, unknown>>> {
    return request('/api/subscriptions/items?fetchtype=relative');
  },
};

